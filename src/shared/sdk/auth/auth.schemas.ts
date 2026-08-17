import { z } from 'zod';
import { UserSchema, type User } from '../users/users.schemas';

export const SignUpDtoSchema = z.object({
  email: z.string(),
  password: z.string(),
  nickname: z.string(),
});
export type SignUpDto = z.infer<typeof SignUpDtoSchema>;

export const ForgotPasswordDtoSchema = z.object({
  email: z.string(),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;

export const ResetPasswordDtoSchema = z.object({
  token: z.string(),
  newPassword: z.string(),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;

/** @deprecated Use ResetPasswordDto */
export type ConfirmForgotPasswordDto = ResetPasswordDto;
export const ConfirmForgotPasswordDtoSchema = ResetPasswordDtoSchema;

export const SessionLoginDtoSchema = z.object({
  emailOrNickname: z.string(),
  password: z.string(),
  device: z.string().optional(),
});
export type SessionLoginDto = z.infer<typeof SessionLoginDtoSchema>;

export const UserSessionSchema = z
  .object({
    id: z.string(),
    device: z.string().nullable().optional(),
    ip: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    lastActiveAt: z.string().optional(),
    isCurrent: z.boolean().optional(),
  })
  .passthrough();
export type UserSession = z.infer<typeof UserSessionSchema>;

/** @deprecated Use LoginUserDto (emailOrNickname + password) */
export const LoginDtoSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const LoginUserDtoSchema = z.object({
  emailOrNickname: z.string(),
  password: z.string(),
});
export type LoginUserDto = z.infer<typeof LoginUserDtoSchema>;

/** @deprecated Session auth no longer returns tokens */
export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

export const SessionLoginResponseSchema = z.union([
  z.object({ user: UserSchema }),
  z.object({
    requiresTwoFactor: z.literal(true),
    twoFactorToken: z.string(),
  }),
]);
export type SessionLoginResponse = z.infer<typeof SessionLoginResponseSchema>;

export const TwoFactorSetupResponseSchema = z.object({
  otpauthUrl: z.string(),
  qrCodeDataUrl: z.string(),
  secret: z.string(),
});
export type TwoFactorSetupResponse = z.infer<typeof TwoFactorSetupResponseSchema>;

export const TwoFactorStatusResponseSchema = z.object({
  enabled: z.boolean(),
});
export type TwoFactorStatusResponse = z.infer<typeof TwoFactorStatusResponseSchema>;

export const EnableTwoFactorDtoSchema = z.object({
  code: z.string(),
});
export type EnableTwoFactorDto = z.infer<typeof EnableTwoFactorDtoSchema>;

export const DisableTwoFactorDtoSchema = z.object({
  password: z.string(),
  code: z.string().optional(),
  recoveryCode: z.string().optional(),
});
export type DisableTwoFactorDto = z.infer<typeof DisableTwoFactorDtoSchema>;

export const VerifyTwoFactorLoginDtoSchema = z.object({
  twoFactorToken: z.string(),
  code: z.string().optional(),
  recoveryCode: z.string().optional(),
});
export type VerifyTwoFactorLoginDto = z.infer<typeof VerifyTwoFactorLoginDtoSchema>;

export const EnableTwoFactorResponseSchema = z.object({
  recoveryCodes: z.array(z.string()),
});
export type EnableTwoFactorResponse = z.infer<typeof EnableTwoFactorResponseSchema>;

/** @deprecated Session auth no longer returns tokens */
export const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
  refreshToken: z.string(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const ChangePasswordDtoSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;

// re-export for auth consumers that need User
export type { User };
