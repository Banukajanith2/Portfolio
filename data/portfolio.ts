import type { TechIconKey } from "@/components/ui/TechIcon";
import type { SocialIconKey } from "@/components/ui/SocialIcon";
import type { IconKey } from "@/components/ui/Icon";
import { asset } from "@/lib/utils";

export interface SiteConfig {
  firstName: string;
  lastName: string;
  role: string;
  tagline: string;
  email: string;
  location: string;
  resumeUrl: string;
  github: string;
  linkedin: string;
}

export const siteConfig: SiteConfig = {
  firstName: "Banuka Janith",
  lastName: "Waduge",
  role: "Software Engineer & Web Developer",
  tagline:
    "I build scalable web applications and digital experiences with clean code and modern technologies.",
  email: "Banukajanith2@gmail.com",
  location: "Sri Lanka",
  resumeUrl: asset("/banuka-janith-cv.pdf"),
  github: "github.com/banukajanith2",
  linkedin: "linkedin.com/in/banuka-janith-waduge",
};

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export interface SocialLink {
  icon: SocialIconKey;
  href: string;
  label: string;
}

export const heroSocials: SocialLink[] = [
  { icon: "github", href: "https://github.com/banukajanith2", label: "GitHub" },
  { icon: "linkedin", href: "https://linkedin.com/in/banuka-janith-waduge", label: "LinkedIn" },
  { icon: "twitter", href: "https://twitter.com/banukajanith", label: "Twitter" },
  { icon: "instagram", href: "https://instagram.com/banukajanith", label: "Instagram" },
  { icon: "mail", href: "mailto:banukajanith2@gmail.com", label: "Email" },
];

export const heroCodeSnippet: string[] = [
  "const banuka = {",
  "  role: 'Software Engineer',",
  "  passion: 'Building digital products',",
  "  focus: [",
  "    'Web Development',",
  "    'Problem Solving',",
  "    'UI/UX'",
  "  ],",
  "  currently: 'Open to opportunities'",
  "}",
];

const marqueeTiles = [
  asset("/images/marquee/m1.svg"),
  asset("/images/marquee/m2.svg"),
  asset("/images/marquee/m3.svg"),
  asset("/images/marquee/m4.svg"),
  asset("/images/marquee/m5.svg"),
  asset("/images/marquee/m6.svg"),
  asset("/images/marquee/m7.svg"),
  asset("/images/marquee/m8.svg"),
];

export const marqueeRow1: string[] = Array.from({ length: 11 }, (_, i) => marqueeTiles[i % marqueeTiles.length]);
export const marqueeRow2: string[] = Array.from({ length: 10 }, (_, i) => marqueeTiles[(i + 4) % marqueeTiles.length]);

export interface Stat {
  icon: IconKey;
  value: string;
  label: string;
}

export const aboutStats: Stat[] = [
  { icon: "settings", value: "20+", label: "Projects Completed" },
  { icon: "users", value: "15+", label: "Happy Clients" },
  { icon: "star", value: "5+", label: "Technologies Mastered" },
];

export const aboutContent = {
  badge: "3+ Years Experience",
  heading: "Passionate about building impactful solutions",
  paragraphs: [
    "I'm a software engineer who loves turning ideas into real-world products. I specialize in full-stack development, building responsive web applications and solving complex problems with clean, efficient code.",
    "With a strong foundation in computer science and hands-on experience in modern technologies, I strive to deliver exceptional digital experiences.",
  ],
};

export interface TechStackItem {
  name: string;
  icon: TechIconKey;
}

export interface TechStackCategory {
  category: string;
  items: TechStackItem[];
}

export const techStack: TechStackCategory[] = [
  {
    category: "Frontend",
    items: [
      { name: "HTML5", icon: "html5" },
      { name: "CSS3", icon: "css3" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Tailwind CSS", icon: "tailwind" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", icon: "nodejs" },
      { name: "Express.js", icon: "express" },
      { name: "Python", icon: "python" },
    ],
  },
  {
    category: "Database",
    items: [
      { name: "MongoDB", icon: "mongodb" },
      { name: "Firebase", icon: "firebase" },
      { name: "MySQL", icon: "mysql" },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Figma", icon: "figma" },
      { name: "VS Code", icon: "vscode" },
    ],
  },
];

export interface FeaturedProject {
  number: string;
  title: string;
  description: string;
  images: [string, string, string];
  featured: boolean;
  tech: TechIconKey[];
  liveDemoUrl: string;
  sourceCodeUrl: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    number: "01",
    title: "EZ Movies App",
    description:
      "A fast and responsive movie browsing application with search, trending, pagination and real-time data using the TMDB API.",
    images: [asset("/images/project-ezmovies.svg"), asset("/images/project-ezmovies.svg"), asset("/images/project-ezmovies.svg")],
    featured: true,
    tech: ["javascript", "firebase", "tailwind"],
    liveDemoUrl: "https://banukajanith2.github.io/Movies-App/",
    sourceCodeUrl: "https://github.com/Banukajanith2/Movies-App",
  },
  {
    number: "02",
    title: "AI Sentiment Analysis Model",
    description:
      "ML model that analyses text data and predicts sentiment using various machine learning algorithms.",
    images: [
      asset("/images/project-ai-sentiment.svg"),
      asset("/images/project-ai-sentiment.svg"),
      asset("/images/project-ai-sentiment.svg"),
    ],
    featured: true,
    tech: ["python", "scikitlearn", "pandas"],
    liveDemoUrl: "https://ai-sentiment.example.com",
    sourceCodeUrl: "https://github.com/banukajanith2/ai-sentiment-analysis",
  },
  {
    number: "03",
    title: "Machine Learning Prediction Algorithm",
    description:
      "A machine learning project that predicts outcomes using classification algorithms and data visualisation.",
    images: [
      asset("/images/project-ml-prediction.svg"),
      asset("/images/project-ml-prediction.svg"),
      asset("/images/project-ml-prediction.svg"),
    ],
    featured: true,
    tech: ["python", "matplotlib", "numpy"],
    liveDemoUrl: "https://ml-prediction.example.com",
    sourceCodeUrl: "https://github.com/banukajanith2/ml-prediction-algorithm",
  },
];

export interface OtherProject {
  title: string;
  description: string;
  icon: "globe" | "cloud" | "fileText" | "shoppingCart";
  sourceCodeUrl: string;
}

export const otherProjects: OtherProject[] = [
  {
    title: "Portfolio Website",
    description: "Personal portfolio website built with Next.js, Tailwind CSS and Framer Motion.",
    icon: "globe",
    sourceCodeUrl: "https://github.com/banukajanith2/portfolio-website",
  },
  {
    title: "Weather App",
    description: "Weather application that shows real-time weather using the OpenWeather API.",
    icon: "cloud",
    sourceCodeUrl: "https://github.com/banukajanith2/weather-app",
  },
  {
    title: "Blog Platform",
    description: "A full-stack blog platform with authentication and CRUD operations.",
    icon: "fileText",
    sourceCodeUrl: "https://github.com/banukajanith2/blog-platform",
  },
  {
    title: "E-commerce UI",
    description: "Modern e-commerce frontend UI built with React and Tailwind CSS.",
    icon: "shoppingCart",
    sourceCodeUrl: "https://github.com/banukajanith2/ecommerce-ui",
  },
];

export interface ExperienceItem {
  type: "work" | "education";
  role: string;
  org: string;
  date: string;
  bullets: string[];
}

export const experience: ExperienceItem[] = [
  {
    type: "work",
    role: "Digital Designer",
    org: "SISKA Private Limited",
    date: "May 2023 - Present",
    bullets: [
      "Designing digital content and managing social media campaigns.",
      "Creating marketing content and video content.",
      "Providing IT support and managing systems.",
    ],
  },
  {
    type: "work",
    role: "IT Support Agent",
    org: "Kingsland",
    date: "Jan 2022 - Apr 2023",
    bullets: [
      "Provided technical support for hardware and software issues.",
      "Assisted customers and resolved technical problems.",
      "Gained strong communication and problem-solving skills.",
    ],
  },
  {
    type: "education",
    role: "BSc (Hons) in Software Engineering",
    org: "Saegis Campus",
    date: "2021 - 2024",
    bullets: [
      "Focused on software development and system design.",
      "Completed multiple academic and industry projects.",
      "Actively participated in tech communities and events.",
    ],
  },
  {
    type: "education",
    role: "Diploma in Software Engineering",
    org: "Saegis Campus",
    date: "2019 - 2021",
    bullets: [
      "Built a strong foundation in programming and software principles.",
      "Completed projects in web development and algorithms.",
      "Graduated with distinction.",
    ],
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Banuka is a talented developer who consistently delivers high-quality work. His problem-solving skills and dedication are truly impressive.",
    name: "Chaminda Perera",
    role: "CEO, SISKA",
    avatar: asset("/images/avatar-1.svg"),
    rating: 5,
  },
  {
    quote:
      "Working with Banuka was a great experience. He's proactive, efficient, and always goes the extra mile to deliver.",
    name: "Nimesh Fernando",
    role: "Project Manager, Kingsland",
    avatar: asset("/images/avatar-2.svg"),
    rating: 5,
  },
  {
    quote:
      "Banuka has a strong technical foundation and a great eye for design. He brings ideas to life with clean and maintainable code.",
    name: "Tharindu Madushan",
    role: "Lead Developer",
    avatar: asset("/images/avatar-3.svg"),
    rating: 5,
  },
];

export interface ContactInfoItem {
  icon: IconKey;
  label: string;
  value: string;
  href: string;
}

export const contactInfo: ContactInfoItem[] = [
  { icon: "mail", label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { icon: "mapPin", label: "Location", value: siteConfig.location, href: "#" },
  { icon: "linkedin", label: "LinkedIn", value: siteConfig.linkedin, href: `https://${siteConfig.linkedin}` },
  { icon: "github", label: "GitHub", value: siteConfig.github, href: `https://${siteConfig.github}` },
];

export const footerContent = {
  copyright: `${new Date().getFullYear()} ${siteConfig.firstName} ${siteConfig.lastName}.`,
};
