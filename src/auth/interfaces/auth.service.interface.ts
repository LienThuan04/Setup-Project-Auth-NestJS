import type { Response } from 'express';
import type { RequestUpdateUserOtpDto } from '@/users/dto/update-user.dto';
import type { IUserEntity } from '@/users/interfaces/users.types';
import type {
  ISanitizedUser,
  IGoogleUser,
  ILoginResult,
  IRegisterResult,
  ILocalValidateResult,
  IOtpGenerationResult,
  IOtpVerifyResult,
  IUserUpdateOtpRequestResult,
  IRegisterDto,
  IVerifyRegisterOtpDto,
  IResendRegisterOtpDto,
  IVerifyEmailDto,
  IChangePasswordVerifyDto,
} from '@/auth/interfaces/auth.types';

export interface IAuthService {
  registerWithOTP(dto: IRegisterDto): Promise<IRegisterResult>;
  verifyRegisterOtp(dto: IVerifyRegisterOtpDto): Promise<ISanitizedUser>;
  resendRegisterOtp(dto: IResendRegisterOtpDto): Promise<IRegisterResult>;
  sendChangePasswordOtp(dto: IVerifyEmailDto): Promise<IRegisterResult>;
  verifyChangePasswordOtp(dto: IChangePasswordVerifyDto): Promise<ISanitizedUser>;
  validateUser(userNameOrEmail: string, password: string): Promise<ILocalValidateResult | null>;
  login(user: ISanitizedUser, res: Response, deviceId: string): Promise<ILoginResult>;
  refreshToken(oldCookieRefreshToken: string, res: Response): Promise<ILoginResult>;
  googleLogin(googleUser: IGoogleUser, res: Response, deviceId: string): Promise<ILoginResult>;
  logout(user: ISanitizedUser, oldCookieRefreshToken: string, res: Response): Promise<boolean>;
  logoutAll(user: ISanitizedUser, res: Response): Promise<boolean>;
}

export interface ITokenService {
  login(user: ISanitizedUser, res: Response, deviceId: string): Promise<ILoginResult>;
  logout(userId: string, refreshToken: string, res: Response): Promise<boolean>;
  logoutAll(userId: string, res: Response): Promise<boolean>;
}

export interface IOtpService {
  generate(): Promise<IOtpGenerationResult>;
  checkCooldown(email: string): Promise<void>;
  getValidPending(email: string, purpose: string): Promise<IOtpVerifyResult>;
  verify(email: string, otp: string, purpose: string): Promise<IOtpVerifyResult>;
}

export interface IRegisterService {
  register(dto: IRegisterDto): Promise<IRegisterResult>;
  verifyOtp(dto: IVerifyRegisterOtpDto): Promise<ISanitizedUser>;
  resendOtp(email: string): Promise<IRegisterResult>;
}

export interface IPasswordService {
  sendOtp(dto: IVerifyEmailDto): Promise<IRegisterResult>;
  verifyAndChange(dto: IChangePasswordVerifyDto): Promise<ISanitizedUser>;
}

export interface IGoogleService {
  login(googleUser: IGoogleUser, res: Response, deviceId: string): Promise<ILoginResult>;
}

export interface IUserUpdateOtpService {
  requestUpdate(userId: string, dto: RequestUpdateUserOtpDto): Promise<IUserUpdateOtpRequestResult>;
  verifyAndApplyUpdate(userId: string, otp: string): Promise<{ message: string; data: IUserEntity }>;
}
