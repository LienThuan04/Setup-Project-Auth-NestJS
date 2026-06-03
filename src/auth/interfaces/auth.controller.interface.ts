import type { Request, Response } from 'express';
import type { IApiResponse } from '@/common/interceptors/transform.interceptor';
import type {
  ISanitizedUser,
  IGoogleUser,
  ILoginResult,
  IRegisterDto,
  IVerifyRegisterOtpDto,
  IResendRegisterOtpDto,
  ILoginDto,
  IVerifyEmailDto,
  IChangePasswordVerifyDto,
  IResetPasswordDto,
  IPasswordResetResult,
} from '@/auth/interfaces/auth.types';

export interface IAuthController {
  register(dto: IRegisterDto): Promise<IApiResponse<{ otpExpire: string }>>;
  verifyRegisterOtp(dto: IVerifyRegisterOtpDto): Promise<IApiResponse<ISanitizedUser>>;
  resendRegisterOtp(dto: IResendRegisterOtpDto): Promise<IApiResponse<{ otpExpire: string }>>;
  login(res: Response, user: ISanitizedUser, dto: ILoginDto, deviceId: string): Promise<IApiResponse<ILoginResult>>;
  refreshToken(res: Response, req: Request): Promise<IApiResponse<ILoginResult>>;
  getProfile(user: ISanitizedUser): Promise<IApiResponse<{ user: ISanitizedUser }>>;
  changePasswordWithOtp(dto: IVerifyEmailDto): Promise<IApiResponse<{ otpExpire: string }>>;
  verifyChangePasswordOtp(res: Response, dto: IChangePasswordVerifyDto): Promise<IApiResponse<IPasswordResetResult>>;
  resetPassword(req: Request, res: Response, dto: IResetPasswordDto): Promise<IApiResponse<ISanitizedUser>>;
  logout(res: Response, req: Request, user: ISanitizedUser): Promise<IApiResponse<{ result: boolean }>>;
  logoutAll(res: Response, user: ISanitizedUser): Promise<IApiResponse<{ result: boolean }>>;
  googleAuth(): void;
  googleAuthRedirect(googleUser: IGoogleUser, deviceId: string, res: Response): Promise<void | IApiResponse<ILoginResult>>;
}
