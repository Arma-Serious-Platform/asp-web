import * as yup from 'yup';

/** Human-readable hint for password fields (sign-up, reset password, etc.). */
export const PASSWORD_REQUIREMENTS_HINT =
  'Мінімум 8 символів, велика й мала літера, цифра та спецсимвол';

export const passwordSchema = yup
  .string()
  .required("Обов'язкове поле")
  .min(8, 'Пароль повинен бути не менше 8 символів')
  .matches(/[A-Z]/, 'Потрібна хоча б одна велика літера (A–Z)')
  .matches(/[a-z]/, 'Потрібна хоча б одна мала літера (a–z)')
  .matches(/\d/, 'Потрібна хоча б одна цифра')
  .matches(/[^A-Za-z0-9]/, 'Потрібен хоча б один спеціальний символ');
