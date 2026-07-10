export type EducationGuide = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  publishedAt: string;
  image: string;
  faqs?: { question: string; answer: string }[];
};
