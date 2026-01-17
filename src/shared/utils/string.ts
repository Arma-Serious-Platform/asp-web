export const getUniqueStrings = (strings: string[]): string[] => {
  return [...new Set(strings)];
};

export const isNumeric = (str: string | number = '') => {
  return /^[0-9]+$/.test(String(str));
};

export const formatNumericValue = (
  initialValue: string,
  min?: number | string,
  max?: number | string,
  canBeZeroAtTheStart?: boolean,
  float?: number,
) => {
  let value = initialValue.replace(float ? /[^0-9.,]/g : /[^0-9]/g, '');

  if (value.includes('-') || !value) {
    value = '';
  }

  // Handle float numbers
  if (float !== undefined) {
    // Replace all commas with dots
    value = value.replace(/,/g, '.');

    // Keep only the first decimal point
    const parts = value.split('.');

    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places
    if (parts.length > 1) {
      value = parts[0] + '.' + parts[1].slice(0, float);
    }
  }

  if (max && Number(value) > Number(max) && value !== '') {
    value = String(max);
  }

  if (min && Number(value) < Number(min) && value !== '') {
    value = String(min);
  }

  if (!canBeZeroAtTheStart && value.length > 1 && value.startsWith('0')) {
    value = value.slice(1) || '';
  }

  if (float && value.startsWith('.')) {
    value = '';
  }

  return value;
};
