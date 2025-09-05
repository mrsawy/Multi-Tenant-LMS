import { getModule } from "@/lib/actions/courses/modules.action";
import { notFound } from "next/navigation";
import EditModuleForm from "./__components/edit-module-form";

interface PageProps {
  params: {
    id: string;
    moduleId: string;
  };
}

export default async function EditModulePage({ params }: PageProps) {
  const { id: courseId, moduleId } = params;

  try {
    const module = await getModule(moduleId);
    
    if (!module) {
      notFound();
    }

    return (
      <div className="container mx-auto py-6">
        <EditModuleForm 
          module={module} 
          courseId={courseId} 
          moduleId={moduleId} 
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching module:", error);
    notFound();
  }
}
