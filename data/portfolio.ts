import type { TechIconKey } from "@/components/ui/TechIcon";
import type { SocialIconKey } from "@/components/ui/SocialIcon";
import type { IconKey } from "@/components/ui/Icon";
import { asset } from "@/lib/utils";

export interface SiteConfig {
  firstName: string;
  lastName: string;
  role: string;
  tagline: string;
  /**
   * Deliberately absent. The address is base64-encoded in lib/email.ts and only
   * decoded on the client, so it never lands in the static HTML for harvesters
   * to scrape. Read it with useRevealedEmail().
   */
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
    "I build data-driven applications and digital experiences - combining machine learning, web development and design.",
  location: "Sri Lanka",
  resumeUrl: asset("/banuka-janith-cv.pdf"),
  github: "github.com/banukajanith2",
  linkedin: "linkedin.com/in/banuka-janith-waduge",
};

/** Availability pill in the hero. Flip `open` when that changes. */
export const availability = {
  open: true,
  label: "Open to opportunities",
};

/**
 * The hero's rotating role line. Kept short - each one has to fit on a single
 * line at the mobile breakpoint.
 */
export const heroRoles: string[] = [
  "Machine Learning",
  "Full-Stack Web",
  "Data Analysis",
  "Product Design",
];

/** Mono metadata strip under the hero heading. */
export const heroMeta: { key: string; value: string }[] = [
  { key: "BASED", value: "Sri Lanka" },
  { key: "FOCUS", value: "ML · Web · Data" },
  { key: "DEGREE", value: "BSc (Hons) - First Class" },
];

/** Words for the kinetic ticker that separates the hero from the page body. */
export const tickerWords: string[] = [
  "Machine Learning",
  "Next.js",
  "Python",
  "Data Analysis",
  "TypeScript",
  "Explainable AI",
  "React",
  "Interface Design",
];

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
  // Points at the contact section rather than a mailto: a raw mailto href is
  // exactly what address harvesters scrape the HTML for.
  { icon: "mail", href: "#contact", label: "Email" },
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

/**
 * Numeric stats for the about bento. Split from `aboutStats` because these
 * animate with a count-up and so need the value as a number, not a string.
 */
export interface CountStat {
  value: number;
  suffix: string;
  label: string;
  caption: string;
}

export const countStats: CountStat[] = [
  { value: 4, suffix: "+", label: "Years", caption: "building and shipping" },
  { value: 7, suffix: "+", label: "Projects", caption: "shipped end to end" },
  { value: 3, suffix: "", label: "Qualifications", caption: "SE, BIS and design" },
];

export const aboutContent = {
  badge: "BSc (Hons) - First Class",
  heading: "Data in. Interfaces out.",
  paragraphs: [
    "I'm a highly motivated and creative software engineering undergraduate who brings fast learning, strong problem-solving and analytical skills to every project. With a keen eye for detail and efficient time management, I thrive in collaborative team environments.",
    "My work spans machine learning and data analysis in Python, front-end development, and graphic design - a mix that lets me take an idea from raw data through to a polished interface.",
  ],
};

/** Short "what I'm doing now" lines for the about bento's status tile. */
export const currentFocus: { label: string; value: string }[] = [
  { label: "Building", value: "Explainable ML pipelines" },
  { label: "Learning", value: "Systems design & Next.js internals" },
  { label: "Reading", value: "Designing Data-Intensive Applications" },
];

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
  /** One-line positioning statement shown large, above the prose. */
  summary: string;
  description: string;
  cover: string;
  year: string;
  /** Short domain label, e.g. "Machine Learning". */
  category: string;
  tech: TechIconKey[];
  /**
   * Two or three concrete facts about the build. These replace the fake
   * screenshot collage: what a reviewer wants is what it does and how, not
   * three copies of the same placeholder image.
   */
  highlights: { label: string; value: string }[];
  /** Omitted when a project has no hosted demo - the link is hidden instead. */
  liveDemoUrl?: string;
  sourceCodeUrl: string;
  /**
   * Names an interactive demo to mount inside the project's detail dialog.
   * A key rather than a component so this file stays free of JSX imports and
   * the demo itself can be code-split at the point of use.
   */
  demo?: "semantic-search";
}

export const featuredProjects: FeaturedProject[] = [
  {
    number: "01",
    title: "Scaffold Website Builder",
    summary: "Compose a landing page from blocks, then export it as standalone HTML.",
    description:
      "A drag-and-drop website builder. Blocks are added from a picker, reordered on a live canvas with dnd-kit and edited in a property panel, while a debounced auto-save writes the page to Firestore under the signed-in account. The page model is a discriminated union, so adding a block type fails the build anywhere a renderer or schema is missing, and the export step generates a standalone HTML file with escaping applied to every value that came from the editor.",
    cover: asset("/images/project-scaffold.svg"),
    year: "2026",
    category: "Web Application",
    tech: ["nextjs", "typescript", "firebase", "tailwind"],
    highlights: [
      { label: "Editing", value: "dnd-kit · undo/redo history" },
      { label: "Persistence", value: "Firestore · 1.5s debounced auto-save" },
      { label: "Export", value: "Standalone HTML, no server" },
    ],
    liveDemoUrl: "https://scaffold-website-builder.vercel.app/",
    sourceCodeUrl: "https://github.com/Banukajanith2/Scaffold-Website-Builder-App",
  },
  {
    number: "02",
    title: "AI Sentiment Analysis Model",
    summary: "Turning open-ended survey responses into a signal teams can act on.",
    description:
      "A sentiment analysis model built with the VADER library in Python using a top-down approach. Trained, evaluated and fine-tuned to analyse customer responses, it is currently used for survey analysis and provides insight into customer feedback.",
    cover: asset("/images/project-ai-sentiment.svg"),
    year: "2024",
    category: "Machine Learning",
    tech: ["python", "jupyter", "pandas"],
    highlights: [
      { label: "Approach", value: "VADER · top-down" },
      { label: "Applied to", value: "Live customer surveys" },
      { label: "Output", value: "Scored feedback insight" },
    ],
    sourceCodeUrl: "https://github.com/Banukajanith2/AI-Sentiment-Analysis",
  },
  {
    number: "03",
    title: "Semantic Job Search Engine",
    summary: "Search 3,000 job postings by meaning rather than by keyword.",
    description:
      "Job postings are embedded with the all-MiniLM-L6-v2 sentence transformer and retrieved by vector similarity, so a query matches on intent even when none of its words appear in the posting. The original engine indexes with FAISS behind a FastAPI endpoint; the demo here ports that corpus to the browser, running the same model in WebAssembly against pre-computed embeddings with no server in the loop.",
    cover: asset("/images/project-semantic-search.svg"),
    year: "2025",
    category: "Machine Learning",
    tech: ["python", "numpy", "typescript", "react"],
    highlights: [
      { label: "Corpus", value: "3,000 postings · 384-dim vectors" },
      { label: "Model", value: "all-MiniLM-L6-v2" },
      { label: "Retrieval", value: "FAISS · cosine similarity" },
    ],
    sourceCodeUrl: "https://github.com/Banukajanith2/Semantic-Job-Search-Engine",
    demo: "semantic-search",
  },
];

export interface OtherProject {
  title: string;
  description: string;
  icon: "globe" | "cloud" | "fileText" | "film" | "shoppingCart" | "flaskConical";
  year: string;
  /** Primary language/tool, shown in the list's right-hand meta column. */
  stack: string;
  sourceCodeUrl: string;
}

export const otherProjects: OtherProject[] = [
  {
    title: "Wine Quality Prediction Model",
    description:
      "Regression, a Random Forest Classifier and an SVC benchmarked against each other on the same 10-15 variable set, evaluated with confusion matrices.",
    icon: "flaskConical",
    year: "2023",
    stack: "Python · scikit-learn",
    sourceCodeUrl: "https://github.com/Banukajanith2/ML-Prediction-Model",
  },
  {
    title: "XAI-Integrated Fraud Detection",
    description:
      "Machine learning model for fraud detection with explainable AI integrated, built in Jupyter Notebook.",
    icon: "fileText",
    year: "2025",
    stack: "Python · Jupyter",
    sourceCodeUrl: "https://github.com/Banukajanith2/XAI-Integrated-ML-Model-for-Fraud-Detection",
  },
  {
    title: "Genetic Algorithm in Python",
    description:
      "A genetic algorithm using binary chromosomes to evolve optimal solutions through selection, crossover and mutation.",
    icon: "cloud",
    year: "2024",
    stack: "Python",
    sourceCodeUrl: "https://github.com/Banukajanith2/Python-Genetic-Algorithm",
  },
  {
    title: "EZ Movies App",
    description:
      "A responsive movie browser on the TMDB API, with search, trending and pagination against live data.",
    icon: "film",
    year: "2024",
    stack: "JavaScript · TMDB API",
    sourceCodeUrl: "https://github.com/Banukajanith2/Movies-App",
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

/**
 * The email row is not in this list: it is rendered separately in Contact.tsx
 * so the address can be resolved on the client only. See lib/email.ts.
 */
export const contactInfo: ContactInfoItem[] = [
  { icon: "mapPin", label: "Location", value: siteConfig.location, href: "#" },
  { icon: "linkedin", label: "LinkedIn", value: siteConfig.linkedin, href: `https://${siteConfig.linkedin}` },
  { icon: "github", label: "GitHub", value: siteConfig.github, href: `https://${siteConfig.github}` },
];

export const footerContent = {
  copyright: `${new Date().getFullYear()} ${siteConfig.firstName} ${siteConfig.lastName}.`,
};

/**
 * Scripted session for the hero terminal. `out` lines print instantly after
 * their command finishes typing; an `accent` line is highlighted in lime.
 */
export interface TerminalStep {
  command: string;
  out: { text: string; accent?: boolean }[];
}

export const terminalSession: TerminalStep[] = [
  {
    command: "whoami",
    out: [{ text: "banuka-janith-waduge" }, { text: "software engineering undergraduate" }],
  },
  {
    command: "cat focus.json",
    out: [
      { text: "{" },
      { text: '  "ml":  ["scikit-learn", "pandas", "XAI"],' },
      { text: '  "web": ["next.js", "react", "typescript"],' },
      { text: '  "design": ["figma", "adobe cc"]' },
      { text: "}" },
    ],
  },
  {
    command: "git log --oneline -3",
    out: [
      { text: "a1f9c2e  feat: explainable fraud detection" },
      { text: "7d3b810  feat: sentiment scoring for surveys" },
      { text: "3e0c47a  feat: wine quality classifier" },
    ],
  },
  {
    command: "./status",
    out: [{ text: "● available for opportunities", accent: true }],
  },
];
