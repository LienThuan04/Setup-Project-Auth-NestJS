import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { OtpService } from '@/auth/services/otp.service';
import { comparePassword } from '@/lib/bcrypt/bcrypt';
import { ConflictException, ValidationException } from '@/common/exceptions/app.exception';
import { RequestUpdateUserOtpDto } from '@/users/dto/update-user.dto';
import { toUserEntity } from '@/users/helpers/toUserEntity.helper';
import type { IUserUpdateOtpService, IUserUpdateOtpRequestResult } from '@/auth/interfaces/auth.interface';
import ms from 'ms';

@Injectable()
export class UserUpdateOtpService implements IUserUpdateOtpService {
    private readonly otpLength: number;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly otpService: OtpService,
    ) {
        this.otpLength = Number(this.configService.get('OTP_LENGTH'));
    }

    /**
     * Bước 1: Nhận yêu cầu update, phân tích thay đổi và gửi OTP phù hợp.
     * 
     * Luồng xử lý:
     * - Chỉ description thay đổi → cập nhật ngay, không OTP
     * - Email thay đổi → gửi OTP đến EMAIL MỚI
     * - Chỉ username thay đổi → gửi OTP đến EMAIL CŨ
     * 
     * @returns { changedFields, targetEmail } - thông tin để frontend hiển thị
     */
    async requestUpdate(userId: string, dto: RequestUpdateUserOtpDto): Promise<IUserUpdateOtpRequestResult> {
        // Lấy thông tin user hiện tại
        const currentUser = await this.prismaService.user.findUnique({
            where: { id: userId },
        });
        if (!currentUser) {
            throw new ValidationException('User not found');
        }

        // Phân tích xem có gì thay đổi
        const newEmail = dto.email !== undefined ? dto.email : undefined;
        const newUserName = dto.userName !== undefined ? dto.userName : undefined;
        const newDescription = dto.description !== undefined ? dto.description : undefined;

        // Google account: không cho đổi email và username
        if (currentUser.accountType === 'google' || currentUser.googleId) {
            if (newEmail && newEmail !== currentUser.email) {
                throw new ConflictException('Email cannot be changed for Google-authenticated accounts.');
            }
            if (newUserName && newUserName !== currentUser.userName) {
                throw new ConflictException('Username cannot be changed for Google-authenticated accounts.');
            }
        }

        const emailChanged = newEmail !== undefined && newEmail !== currentUser.email;
        const userNameChanged = newUserName !== undefined && newUserName !== currentUser.userName;
        const descriptionChanged = newDescription !== undefined && newDescription !== currentUser.description;

        const changes: string[] = [];
        if (emailChanged) changes.push(`Email: ${currentUser.email} → ${newEmail}`);
        if (userNameChanged) changes.push(`Username: ${currentUser.userName} → ${newUserName}`);
        if (descriptionChanged) changes.push('Description/Bio updated');

        // === TRƯỜNG HỢP 1: Chỉ description thay đổi → cập nhật ngay ===
        if (!emailChanged && !userNameChanged && descriptionChanged) {
            const updatedUser = await this.prismaService.user.update({
                where: { id: userId },
                data: { description: newDescription },
                include: { role: { select: { roleName: true } } },
            });
            return {
                skipOtp: true,
                message: 'Description updated successfully',
                data: toUserEntity(updatedUser),
            };
        }

        // === TRƯỜNG HỢP 2 & 3: Cần OTP ===
        if (!emailChanged && !userNameChanged && !descriptionChanged) {
            throw new ValidationException('No changes detected. Please provide at least one field to update.');
        }

        // Kiểm tra uniqueness nếu email hoặc username thay đổi
        if (emailChanged && newEmail) {
            const emailExists = await this.prismaService.user.findUnique({ where: { email: newEmail } });
            if (emailExists) {
                throw new ConflictException('Email already exists');
            }
        }
        if (userNameChanged && newUserName) {
            const usernameExists = await this.prismaService.user.findUnique({ where: { userName: newUserName } });
            if (usernameExists) {
                throw new ConflictException('Username already exists');
            }
        }

        if (emailChanged && currentUser.accountType === 'google') {
            throw new ConflictException('Email cannot be changed for Google-authenticated accounts.');
        }

        // Xác định email đích để gửi OTP:
        // - Nếu email thay đổi → gửi OTP đến EMAIL MỚI
        // - Nếu chỉ username thay đổi → gửi OTP đến EMAIL CŨ
        const targetEmail = emailChanged ? newEmail! : currentUser.email;

        // Kiểm tra cooldown (nếu có pending update cũ)
        const now = new Date();
        const existingPending = await this.prismaService.pendingUserUpdate.findUnique({
            where: { userId },
        });
        if (existingPending) {
            if (existingPending.resendAfter && existingPending.resendAfter > now) {
                const remainingSeconds = Math.ceil((existingPending.resendAfter.getTime() - now.getTime()) / 1000);
                throw new ConflictException(`Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
            }
            // Xóa pending cũ nếu đã hết cooldown
            await this.prismaService.pendingUserUpdate.delete({ where: { userId } });
        }

        // Tạo OTP mới
        const { otp, otpHash, otpExpiresAt, resendAfter } = await this.otpService.generate();

        // Lưu pending update
        await this.prismaService.pendingUserUpdate.create({
            data: {
                userId,
                newEmail: emailChanged ? newEmail : undefined,
                newUserName: userNameChanged ? newUserName : undefined,
                newDescription: descriptionChanged ? newDescription : undefined,
                otpHash,
                otpExpiresAt,
                resendAfter,
            },
        });

        // Gửi OTP email
        const expireMs = ms(this.configService.get('OTP_EXPIRE')! as ms.StringValue);
        const expireText = `${Math.ceil(expireMs / 60000)} minute(s)`;

        await this.emailService.sendUpdateProfileOtp(
            targetEmail,
            currentUser.userName,
            otp,
            expireText,
            changes,
        );

        // Mask email for response
        const maskedEmail = targetEmail.replace(/(.{2}).*(@.*)/, '$1***$2');

        return {
            skipOtp: false,
            message: `OTP has been sent to ${maskedEmail}. Please verify to complete the update.`,
            data: {
                targetEmail: maskedEmail,
                changes,
            },
        };
    }

    /**
     * Bước 2: Xác nhận OTP và áp dụng thay đổi
     */
    async verifyAndApplyUpdate(userId: string, otp: string) {
        if (otp.length !== this.otpLength) {
            throw new ValidationException(`OTP must be exactly ${this.otpLength} digits`);
        }

        // Lấy pending update
        const pending = await this.prismaService.pendingUserUpdate.findUnique({
            where: { userId },
        });

        if (!pending) {
            throw new ValidationException('No pending update found. Please request an update first.');
        }

        if (pending.otpExpiresAt <= new Date()) {
            await this.prismaService.pendingUserUpdate.delete({ where: { userId } });
            throw new ValidationException('OTP has expired. Please request a new update.');
        }

        // Verify OTP
        const isValid = await comparePassword(otp, pending.otpHash);
        if (!isValid) {
            const updated = await this.prismaService.pendingUserUpdate.update({
                where: { userId },
                data: { attemptCount: { increment: 1 } },
            });

            const maxAttempts = Number(this.configService.get('OTP_MAX_ATTEMPTS') || '5');
            const remainingAttempts = maxAttempts - updated.attemptCount;
            if (remainingAttempts <= 0) {
                await this.prismaService.pendingUserUpdate.delete({ where: { userId } });
                throw new ValidationException('Too many incorrect attempts. Please request a new update.');
            }
            throw new ValidationException(`Invalid OTP. You have ${remainingAttempts} attempt(s) remaining.`);
        }

        // OTP đúng → áp dụng thay đổi
        const updateData: Record<string, string> = {};
        if (pending.newEmail) updateData.email = pending.newEmail;
        if (pending.newUserName) updateData.userName = pending.newUserName;
        if (pending.newDescription) updateData.description = pending.newDescription;

        const updatedUser = await this.prismaService.user.update({
            where: { id: userId },
            data: updateData,
            include: { role: { select: { roleName: true } } },
        });

        // Xóa pending update
        await this.prismaService.pendingUserUpdate.delete({ where: { userId } });

        return {
            message: 'Profile updated successfully',
            data: toUserEntity(updatedUser),
        };
    }
}
