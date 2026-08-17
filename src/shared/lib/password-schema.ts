import { z } from 'zod';

/** Human-readable hint for password fields (sign-up, reset password, etc.). */
export const PASSWORD_REQUIREMENTS_HINT =
  'Мінімум 8 символів, велика й мала літера, цифра та спецсимвол';

export const passwordSchema = z
  .string()
  .min(1, "Обов'язкове поле")
  .min(8, 'Пароль повинен бути не менше 8 символів')
  .regex(/[A-Z]/, 'Потрібна хоча б одна велика літера (A–Z)')
  .regex(/[a-z]/, 'Потрібна хоча б одна мала літера (a–z)')
  .regex(/\d/, 'Потрібна хоча б одна цифра')
  .regex(/[^A-Za-z0-9]/, 'Потрібен хоча б один спеціальний символ');
