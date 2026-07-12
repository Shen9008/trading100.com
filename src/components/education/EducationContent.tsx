import { MarkdownContent } from "@/components/content/MarkdownContent";

type EducationContentProps = {
  content: string;
};

export function EducationContent({ content }: EducationContentProps) {
  return <MarkdownContent content={content} className="prose-education" />;
}
