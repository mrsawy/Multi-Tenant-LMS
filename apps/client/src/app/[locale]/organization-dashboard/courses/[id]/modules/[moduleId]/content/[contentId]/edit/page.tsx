import CreateContentForm from "@/app/[locale]/organization-dashboard/courses/__components/create-content-form";
import { getContent } from "@/lib/actions/courses/content.action";


interface PageParams {
  id: string;
  moduleId: string;
  contentId: string;
  locale: string;
}

export default async function EditContentPage({ params }: { params: Promise<PageParams> }) {
  const { id: courseId, moduleId, contentId } = await params;

  const existingContent = await getContent(contentId);

  return (
    <div className="min-h-screen">
      <CreateContentForm
        courseId={courseId}
        moduleId={moduleId}
        mode="edit"
        initialContent={existingContent as any}
      />
    </div>
  );
}


