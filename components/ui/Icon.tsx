import {
  Settings,
  Users,
  Star,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  Cloud,
  FileText,
  Film,
  ShoppingCart,
  FlaskConical,
  ChartLine,
  type LucideIcon,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";

export type IconKey =
  | "settings"
  | "users"
  | "star"
  | "mail"
  | "mapPin"
  | "linkedin"
  | "github"
  | "briefcase"
  | "graduationCap"
  | "globe"
  | "cloud"
  | "fileText"
  | "film"
  | "shoppingCart"
  | "flaskConical"
  | "chartLine";

const lucideIconRegistry: Partial<Record<IconKey, LucideIcon>> = {
  settings: Settings,
  users: Users,
  star: Star,
  mail: Mail,
  mapPin: MapPin,
  briefcase: Briefcase,
  graduationCap: GraduationCap,
  globe: Globe,
  cloud: Cloud,
  fileText: FileText,
  film: Film,
  shoppingCart: ShoppingCart,
  flaskConical: FlaskConical,
  chartLine: ChartLine,
};

const brandIconRegistry: Partial<Record<IconKey, IconType>> = {
  linkedin: FaLinkedin,
  github: SiGithub,
};

interface IconProps {
  name: IconKey;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const BrandIcon = brandIconRegistry[name];
  if (BrandIcon) return <BrandIcon className={className} aria-hidden="true" />;

  const LucideIconComponent = lucideIconRegistry[name] as LucideIcon;
  return <LucideIconComponent className={className} aria-hidden="true" />;
}
