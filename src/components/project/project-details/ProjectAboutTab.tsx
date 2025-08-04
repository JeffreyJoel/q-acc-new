import RichTextViewer from "@/components/project/common/RichTextViewer";

interface ProjectAboutTabProps {
  description: string;
}

export default function ProjectAboutTab({ description }: ProjectAboutTabProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <RichTextViewer description={description} />
    </div>
  );
}