
import { DialogFooter } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { useForm } from "react-hook-form";
import { createModuleSchema, CreateModuleSchema } from "@/lib/schema/module.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useCreateModule } from "@/lib/hooks/course/useModules";


function CreateModuleForm({ courseId, setOpen }: {
    courseId: string,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [learningObjectives, setLearningObjectives] = useState<string[]>([""]);
    const createModuleMutation = useCreateModule();

    const {
        register, handleSubmit, reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(createModuleSchema),
        defaultValues: {
            title: "",
            description: ""
        }
    });

    async function onCreateModule(values: any) {
        const filteredObjectives = learningObjectives.filter(obj => obj && obj.trim() !== "");
        const moduleData = {
            ...values,
            learningObjectives: filteredObjectives
        };

        createModuleMutation.mutate(
            { courseId, moduleData },
            {
                onSuccess: (data) => {
                    console.log({ data })
                    // The handleDataChange will be handled by the parent component's useEffect
                    reset();
                    setLearningObjectives([""]);
                    setOpen(false);
                }
            }
        );
    }

    const addObjective = () => {
        setLearningObjectives([...learningObjectives, ""]);
    };

    const removeObjective = (index: number) => {
        if (learningObjectives.length > 1) {
            setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
        }
    };

    const updateObjective = (index: number, value: string) => {
        const updated = [...learningObjectives];
        updated[index] = value;
        setLearningObjectives(updated);
    };

    return (
        <div><form className="space-y-3" onSubmit={handleSubmit(onCreateModule)}>
            <div className="space-y-1">
                <label className="text-sm">Title</label>
                <Input {...register("title", { required: "Title is required" })} />
                {errors.title && (
                    <p className="text-left text-sm text-red-400">
                        {errors.title?.message}
                    </p>
                )}
            </div>
            <div className="space-y-1">
                <label className="text-sm">Description</label>
                <Input {...register("description")} />
                {errors.description && (
                    <p className="text-left text-sm text-red-400">
                        {errors.description?.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm">Learning Objectives</label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addObjective}
                        className="flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Add Objective
                    </Button>
                </div>

                {learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            value={objective}
                            onChange={(e) => updateObjective(index, e.target.value)}
                            placeholder={`Learning objective ${index + 1}`}
                            className="flex-1"
                        />
                        {learningObjectives.length > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeObjective(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}


            </div>
            <DialogFooter>
                <Button type="submit" disabled={createModuleMutation.isPending}>
                    {createModuleMutation.isPending ? "Creating..." : "Create"}
                </Button>
            </DialogFooter>
        </form></div>
    )
}

export default CreateModuleForm