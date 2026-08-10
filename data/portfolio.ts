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
  role: "Software Engineering Undergraduate",
  tagline:
    "I build data-driven applications and digital experiences — combining machine learning, web development and design.",
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
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
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
  "  role: 'SE Undergraduate',",
  "  passion: 'Building digital products',",
  "  focus: [",
  "    'Machine Learning',",
  "    'Web Development',",
  "    'Data Analysis'",
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
  { icon: "briefcase", value: "4+", label: "Years Experience" },
  { icon: "settings", value: "7+", label: "Projects Built" },
  { icon: "graduationCap", value: "BSc", label: "First Class Honours" },
];

export const aboutContent = {
  badge: "BSc (Hons) — First Class",
  heading: "Passionate about building impactful solutions",
  paragraphs: [
    "I'm a highly motivated and creative software engineering undergraduate who brings fast learning, strong problem-solving and analytical skills to every project. With a keen eye for detail and efficient time management, I thrive in collaborative team environments.",
    "My work spans machine learning and data analysis in Python, front-end development, and graphic design — a mix that lets me take an idea from raw data through to a polished interface.",
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
    category: "Programming",
    items: [
      { name: "Python", icon: "python" },
      { name: "Java", icon: "java" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
    ],
  },
  {
    category: "Data & Analysis",
    items: [
      { name: "Jupyter", icon: "jupyter" },
      { name: "pandas", icon: "pandas" },
      { name: "NumPy", icon: "numpy" },
      { name: "scikit-learn", icon: "scikitlearn" },
      { name: "Power BI", icon: "powerbi" },
    ],
  },
  {
    category: "Web",
    items: [
      { name: "HTML5", icon: "html5" },
      { name: "CSS3", icon: "css3" },
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "Firebase", icon: "firebase" },
    ],
  },
  {
    category: "Design & Tools",
    items: [
      { name: "Photoshop", icon: "photoshop" },
      { name: "Illustrator", icon: "illustrator" },
      { name: "InDesign", icon: "indesign" },
      { name: "Figma", icon: "figma" },
      { name: "Git", icon: "git" },
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
  /** Omitted when a project has no hosted demo — the link is hidden instead. */
  liveDemoUrl?: string;
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
      "A sentiment analysis model built with the VADER library in Python using a top-down approach. Trained, evaluated and fine-tuned to analyse customer responses, it is currently used for survey analysis and provides insight into customer feedback.",
    images: [
      asset("/images/project-ai-sentiment.svg"),
      asset("/images/project-ai-sentiment.svg"),
      asset("/images/project-ai-sentiment.svg"),
    ],
    featured: true,
    tech: ["python", "jupyter", "pandas"],
    sourceCodeUrl: "https://github.com/Banukajanith2/AI-Sentiment-Analysis",
  },
  {
    number: "03",
    title: "Wine Quality Prediction Model",
    description:
      "A machine learning model predicting wine quality from 10–15 dataset variables. Data was gathered, cleaned and visualised with confusion matrices, then trained and evaluated using regression analysis, a Random Forest Classifier and a Support Vector Classifier to optimise predictions.",
    images: [
      asset("/images/project-ml-prediction.svg"),
      asset("/images/project-ml-prediction.svg"),
      asset("/images/project-ml-prediction.svg"),
    ],
    featured: true,
    tech: ["python", "jupyter", "scikitlearn", "numpy"],
    sourceCodeUrl: "https://github.com/Banukajanith2/ML-Prediction-Model",
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
    title: "XAI-Integrated Fraud Detection",
    description:
      "Machine learning model for fraud detection with explainable AI integrated, built in Jupyter Notebook.",
    icon: "fileText",
    sourceCodeUrl: "https://github.com/Banukajanith2/XAI-Integrated-ML-Model-for-Fraud-Detection",
  },
  {
    title: "Genetic Algorithm in Python",
    description:
      "A genetic algorithm using binary chromosomes to evolve optimal solutions through selection, crossover and mutation.",
    icon: "cloud",
    sourceCodeUrl: "https://github.com/Banukajanith2/Python-Genetic-Algorithm",
  },
  {
    title: "To-Do List App",
    description: "A simple task manager for adding, completing and clearing daily to-dos.",
    icon: "globe",
    sourceCodeUrl: "https://github.com/Banukajanith2/To-Do-List-App",
  },
  {
    title: "HiveMicro Autoclicker",
    description: "A Python desktop utility that automates repetitive clicking tasks.",
    icon: "shoppingCart",
    sourceCodeUrl: "https://github.com/Banukajanith2/HiveMicro-Autoclicker",
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
    org: "SISKA Limited",
    date: "2025 - Present",
    bullets: [
      "Creating digital designs for social media and marketing.",
      "Managing and maintaining the company's online branding.",
      "Collaborating across the team to produce effective design solutions.",
    ],
  },
  {
    type: "work",
    role: "OGT Team Leader / Product Manager",
    org: "AIESEC Sri Lanka",
    date: "2022 - 2024",
    bullets: [
      "Led the team to achieve OGT targets.",
      "Facilitated international internship placements.",
      "Developed leadership and communication through stakeholder engagement.",
    ],
  },
  {
    type: "work",
    role: "IT Support Agent",
    org: "Kingsland Technologies",
    date: "2021 - 2022",
    bullets: [
      "Provided technical support and resolved customer issues.",
      "Handled complaints and conducted service improvement surveys.",
      "Built problem-solving and teamwork skills in an IT environment.",
    ],
  },
  {
    type: "work",
    role: "Customer Service Representative",
    org: "Metco Motors",
    date: "2020 - 2021",
    bullets: [
      "Managed customer inquiries and resolved complaints.",
      "Strengthened communication and customer relations skills.",
    ],
  },
  {
    type: "education",
    role: "BSc (Hons) in Business Information Systems",
    org: "Cardiff Metropolitan University, UK",
    date: "2025 - 2026",
    bullets: ["Graduated with First Class Honours."],
  },
  {
    type: "education",
    role: "HND in Software Engineering",
    org: "Canterbury Christ Church University, UK",
    date: "2022 - 2024",
    bullets: ["Graduated with an Overall Merit Award."],
  },
  {
    type: "education",
    role: "Diploma in Graphic Design",
    org: "School of Multimedia and Design",
    date: "2017 - 2018",
    bullets: ["Adobe Photoshop, Illustrator and InDesign."],
  },
];

export interface AchievementItem {
  primary: string;
  secondary?: string;
}

export interface AchievementGroup {
  icon: IconKey;
  title: string;
  items: AchievementItem[];
}

export const achievements: AchievementGroup[] = [
  {
    icon: "star",
    title: "Awards",
    items: [{ primary: "SAEGIS Code Pulse 2023", secondary: "Runners Up" }],
  },
  {
    icon: "globe",
    title: "Languages",
    items: [
      { primary: "English", secondary: "Professional proficiency" },
      { primary: "Sinhala", secondary: "Fluent" },
    ],
  },
  {
    icon: "users",
    title: "Activities",
    items: [
      { primary: "Rotaract Club, Saegis Campus", secondary: "2024 - 2025" },
      { primary: "ICT Club, Saegis Campus", secondary: "2024 - 2025" },
      { primary: "School Media Circle & ICT Society", secondary: "2014 - 2017" },
    ],
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
