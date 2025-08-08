export function getLocalCookie(name: string) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]!) : null;
}

export function getLocalCookieParsed(name: string): unknown {
  try {
    return JSON.parse(getLocalCookie(name) ?? '{}');
  } catch {
    return null;
  }
}
