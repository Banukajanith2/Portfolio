"use client";

import { useEffect, useState } from "react";

/**
 * Keeps the contact address out of the served HTML.
 *
 * Email harvesters overwhelmingly work by fetching a page and regexing the
 * markup for `something@something.tld` or `mailto:` hrefs. This site is a
 * static export, so every address written into JSX ends up sitting in
 * `index.html` as plain text - previously seven times over.
 *
 * Storing it base64-encoded means the string never appears in the prerendered
 * HTML, and the decode only runs in an effect (never during render), so the
 * address is absent from the server-rendered pass too.
 *
 * This is deliberately obfuscation, not security: anyone reading the JS bundle
 * can decode it in a second. It defeats the automated bulk scrapers that cause
 * the spam, which is the actual threat here. Real secrets never belong in
 * client code.
 */

// The contact address, base64-encoded. The encoded form contains no "@" and no
// provider name, so it does not match the patterns harvesters scan for.
// To change it: node -e "console.log(Buffer.from('new@address.com').toString('base64'))"
const ENCODED_EMAIL = "QmFudWthamFuaXRoMkBnbWFpbC5jb20=";

export function decodeEmail(): string {
  return atob(ENCODED_EMAIL);
}

/**
 * Returns the address only after the component has mounted on the client.
 *
 * `null` on the server and on the first client render, which is what keeps the
 * static HTML clean and also avoids a hydration mismatch - both passes agree on
 * the placeholder, and the real value arrives on the effect that follows.
 */
export function useRevealedEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(decodeEmail());
  }, []);

  return email;
}

/** Safe href for a mail link: falls back to the contact section pre-hydration. */
export function mailHref(email: string | null): string {
  return email ? `mailto:${email}` : "#contact";
}
