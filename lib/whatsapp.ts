/** wa.me — só dígitos: DDI + DDD + número. */
export const WHATSAPP_NUMBER = "5511999999999";

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function whatsappSkinUrl(skinName: string): string {
  return whatsappUrl(`Olá! Quero a skin ${skinName}.`);
}

export function whatsappStoreEmptyUrl(): string {
  return whatsappUrl("Olá! Vim pela loja da DR Black Skins.");
}
