"use client";

import dynamic from "next/dynamic";
import { useCapability } from "@/lib/capability";

/**
 * Mount point for the hero's WebGL layer.
 *
 * This wrapper exists for two reasons, both load-bearing:
 *
 * 1. `ssr: false` is only legal inside a Client Component on the App Router.
 *    Calling it from app/page.tsx (a Server Component) is a build error, so the
 *    dynamic() call lives here behind "use client".
 *
 * 2. It keeps three.js out of the initial bundle. The import below is only
 *    evaluated once `capability` resolves on the client, so the ~160KB of
 *    three + fiber is fetched after the page is interactive - and never at all
 *    on hardware that cannot use it, or for visitors who asked for reduced
 *    motion.
 *
 * There is deliberately no loading placeholder: the CSS aurora already sits
 * behind this, so an empty canvas slot is the correct intermediate state.
 */

const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false }
);

export function HeroCanvas() {
  const capability = useCapability();

  // null while measuring (server render and first client render agree on this,
  // so there is no hydration mismatch), "off" on weak or motion-averse setups.
  if (!capability || capability.tier === "off") return null;

  return <HeroScene capability={capability} />;
}
