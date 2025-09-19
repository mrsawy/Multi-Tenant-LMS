import ContentDataTable from "../../../../__components/content-data-table";

export default async function ModuleContentPage({ 
  params 
}: { 
  params: Promise<{ id: string; moduleId: string; locale: string }> 
}) {
  const { id: courseId, moduleId } = await params;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Module Content</h1>
      <ContentDataTable courseId={courseId} moduleId={moduleId} />
    </div>
  );
}
