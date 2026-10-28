/** The host users see for an app, taken from its first redirect URI. */
export const getClientDomain = (redirectUris: string[]) => {
  const [first] = redirectUris;
  if (!first) return null;

  try {
    return new URL(first).host;
  } catch {
    return null;
  }
};
