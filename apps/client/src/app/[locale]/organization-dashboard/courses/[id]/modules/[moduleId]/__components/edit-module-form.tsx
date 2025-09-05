"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateModuleSchema, UpdateModuleSchema } from "@/lib/schema/module.schema";
import { updateModule } from "@/lib/actions/courses/modules.action";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Plus, X, Eye, Save, ArrowLeft, Lightbulb, Users, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import useGeneralStore from "@/lib/store/generalStore";
import { IModule } from "@/lib/types/course/modules.interface";
import { Link } from "@/i18n/navigation";

interface EditModuleFormProps {
  module: IModule;
  courseId: string;
  moduleId: string;
}

export default function EditModuleForm({ module, courseId, moduleId }: EditModuleFormProps) {
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    module.learningObjectives || [""]
  );
  const [tags, setTags] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm
      ({
        resolver: yupResolver(updateModuleSchema),
        defaultValues: {
          title: module.title || "",
          description: module.description || "",
        }
      });

  const watchedTitle = watch("title");
  const watchedDescription = watch("description");

  useEffect(() => {
    // Update learning objectives when module changes
    if (module.learningObjectives && module.learningObjectives.length > 0) {
      setLearningObjectives(module.learningObjectives);
    }
  }, [module]);

  const onSubmit = async (values: UpdateModuleSchema) => {
    try {
      useGeneralStore.setState({ generalIsLoading: true });

      const filteredObjectives = learningObjectives.filter(obj => obj && obj.trim() !== "");
      const moduleData = {
        ...values,
        learningObjectives: filteredObjectives
      };

      await updateModule(moduleId, moduleData);
      toast.success("Module updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong, please try again later");
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  };

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

  const addTag = () => {
    if (tags.trim()) {
      // Handle tag addition logic here
      setTags("");
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/organization-dashboard/courses/${courseId}/modules`}
                className="flex items-center "
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Course
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                size="sm"
                className=""
              >
                <Save className="h-4 w-4 mr-2" />
                Save Module
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Edit Module</h1>
              <p className=" mt-2">Build engaging learning modules for your course.</p>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Module Details</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Module Information</CardTitle>
                    <CardDescription>
                      Basic information about your module
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Module Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium ">
                        Module Title *
                      </label>
                      <Input
                        {...register("title")}
                        placeholder="Enter module title"
                        className="w-full"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Module Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium ">
                        Module Description *
                      </label>
                      <Textarea
                        {...register("description")}
                        placeholder="Describe what students will learn in this module"
                        rows={4}
                        className="w-full"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Learning Objectives */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium ">
                          Learning Objectives
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addObjective}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Learning Objective
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {learningObjectives.map((objective, index) => (
                          <div key={index} className="flex items-center gap-3">
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
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium ">
                        Tags (comma-separated)
                      </label>
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g., javascript, programming, web development"
                        className="w-full"
                      />
                      <p className="text-xs ">
                        Help students find your module with relevant tags.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Module Content</CardTitle>
                    <CardDescription>
                      Add and organize your module content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="">Content management coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Module Settings</CardTitle>
                    <CardDescription>
                      Configure module preferences and requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="">Settings coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Items</span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Difficulty</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    beginner
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="">
                <Link href={`/organization-dashboard/courses/${courseId}/modules/${module._id}/content/add-new`} className="">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start my-3">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Module
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Student Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Keep modules focused on 2-3 key learning objectives</li>
                  <li>• Mix different content types for better engagement</li>
                  <li>• Add clear prerequisites to help students prepare</li>
                  <li>• Use descriptive titles that explain the value</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
