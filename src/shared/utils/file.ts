export const base64ToFile = async (base64: string, fileName: string) => {
  const res = await fetch(base64);

  const blob = await res.blob();
  const file = new File([blob], fileName, { type: blob.type });

  return file;
};
