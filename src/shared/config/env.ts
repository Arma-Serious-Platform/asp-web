const monobankJar = {
  id: process.env.NEXT_PUBLIC_MONOBANK_JAR_ID,
  url: process.env.NEXT_PUBLIC_MONOBANK_JAR_URL,
};

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  isLanding: process.env.NEXT_PUBLIC_LANDING === 'true',
  monobankJar,
  isMonobankJarEnabled: Boolean(monobankJar.id && monobankJar.url),
};
