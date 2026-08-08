import { Mail, type LucideIcon } from "lucide-react";
import { SiGithub, SiInstagram, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";

export type SocialIconKey = "github" | "linkedin" | "twitter" | "instagram" | "mail";

const brandIconRegistry: Partial<Record<SocialIconKey, IconType>> = {
  github: SiGithub,
  linkedin: FaLinkedin,
  twitter: SiX,
  instagram: SiInstagram,
};

const lucideIconRegistry: Partial<Record<SocialIconKey, LucideIcon>> = {
  mail: Mail,
};

interface SocialIconProps {
  name: SocialIconKey;
  className?: string;
}

export function SocialIcon({ name, className }: SocialIconProps) {
  const BrandIcon = brandIconRegistry[name];
  if (BrandIcon) return <BrandIcon className={className} aria-hidden="true" />;

  const LucideIconComponent = lucideIconRegistry[name] as LucideIcon;
  return <LucideIconComponent className={className} aria-hidden="true" />;
}
