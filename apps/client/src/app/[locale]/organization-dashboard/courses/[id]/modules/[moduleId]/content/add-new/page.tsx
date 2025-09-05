import CreateContentForm from "./__components/create-content-form";

interface PageProps {
  id: string;
  moduleId: string;
}

export default async function CreateContentPage({ params }: { params: Promise<PageProps> }) {
  const { id: courseId, moduleId } = (await params);

  return (
    <div className="min-h-screen">
      <CreateContentForm
        courseId={courseId}
        moduleId={moduleId}
      />
    </div>
  );
}