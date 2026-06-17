import * as yup from 'yup';

export const NICKNAME_REGEX = /^(?=(?:.*[a-zA-ZА-ЯҐЄІЇа-яґєії]){2})[a-zA-ZА-ЯҐЄІЇа-яґєії0-9 .]+$/;

export const NICKNAME_REQUIREMENTS_MESSAGE = 'Мін. 2 літери, без спецсимволів';

export const nicknameSchema = yup
  .string()
  .trim()
  .required("Обов'язкове поле")
  .matches(NICKNAME_REGEX, NICKNAME_REQUIREMENTS_MESSAGE);

export function getNicknameValidationError(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "Обов'язкове поле";

  if (trimmedValue.length < 2) return 'Мін. 2 літери';
  if (!NICKNAME_REGEX.test(trimmedValue)) return NICKNAME_REQUIREMENTS_MESSAGE;

  return null;
}
