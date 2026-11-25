export function isValidContact(name: string, phone: string): boolean {
  return Boolean(name.trim()) && /^\+?[\d\s()-]{7,}$/.test(phone.trim());
}
