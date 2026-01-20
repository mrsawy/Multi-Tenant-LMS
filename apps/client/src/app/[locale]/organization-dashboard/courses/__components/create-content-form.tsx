"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { courseContentCreationSchemaDiscriminated, CourseContentFormData } from "@/lib/schema/content.schema";
import { createContent, updateContent } from "@/lib/actions/courses/content.action";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { ArrowLeft, Save, FileText, Video, HelpCircle, FileCheck, Lightbulb } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "@/i18n/navigation";
import useGeneralStore from "@/lib/store/generalStore";


import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import { VideoType } from "@/lib/types/course/enum/VideoType.enum";
import { uploadFileToS3 } from "@/lib/actions/file/uploadFile";
import { getAuthUser } from "@/lib/actions/user/user.action";
import { IContent } from "@/lib/types/course/content.interface";

import { useRouter as useNextRouter } from 'next/navigation';
import ArticleContentForm from "./article-content-form";
import VideoContentForm from "./video-content-form";
import QuizContentForm from "./quiz-content-form";
import { useCreateContent } from "@/lib/hooks/course/useContent";

interface CreateContentFormProps {
  courseId: string;
  moduleId: string;
  mode?: "create" | "edit";
  initialContent?: IContent | null;
}

export default function CreateContentForm({ courseId, moduleId, mode = "create", initialContent = null }: CreateContentFormProps) {
  const [contentType, setContentType] = useState<CourseContentType>(initialContent?.type ?? CourseContentType.ARTICLE);
  const createContentsMutation = useCreateContent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(courseContentCreationSchemaDiscriminated),
    defaultValues: initialContent
      ? {
        _id: initialContent._id,
        type: initialContent.type,
        title: initialContent.title,
        description: initialContent.description ?? "",
        content:
          initialContent.type === CourseContentType.ARTICLE
            ? { body: initialContent.body ?? "" }
            : initialContent.type === CourseContentType.VIDEO
              ? {
                videoType: initialContent.videoType ?? VideoType.URL,
                videoUrl: initialContent.videoUrl ?? "",
                fileKey: initialContent.fileKey ?? "",
              }
              : initialContent.type === CourseContentType.QUIZ
                ? {
                  questions: initialContent.questions ?? [],
                  quizStartDate: initialContent.quizStartDate ? new Date(initialContent.quizStartDate) : undefined,
                  quizEndDate: initialContent.quizEndDate ? new Date(initialContent.quizEndDate) : undefined,
                  quizDurationInMinutes: initialContent.quizDurationInMinutes ?? 30,
                }
                : {},
      }
      : {
        type: CourseContentType.ARTICLE,
        content: {
          videoType: VideoType.URL,
        },
      },
  });


  useEffect(() => { console.log({ errors }) }, [errors])

  const onSubmit = async (values: CourseContentFormData) => {
    console.log({ values })
    try {
      useGeneralStore.setState({ generalIsLoading: true });

      const contentData = { ...values, type: contentType };

      if (
        contentData.type === CourseContentType.VIDEO &&
        'videoType' in contentData.content &&
        contentData.content.videoType === VideoType.UPLOAD &&
        'videoFile' in contentData.content &&
        contentData.content.videoFile instanceof File
      ) {
        const videoFile = contentData.content.videoFile;
        const user = await getAuthUser();

        const fileKey = await uploadFileToS3({
          file: videoFile,
          customPath: `${user?.organization?.slug}/courses/${courseId}/course-materials`,
          isPublic: false,
        });

        contentData.content.videoFile = undefined;
        contentData.content.fileKey = fileKey;
      }

      const fileKey = contentData.type === CourseContentType.VIDEO &&
        'fileKey' in contentData.content ? contentData.content.fileKey : undefined;

      // In edit mode, call update action (to be implemented) – for now, reuse create action signature if available
      if (mode === "edit" && initialContent?._id) {
        console.log({ moduleId, courseId, contentData: { _id: initialContent._id, ...contentData }, fileKey })
        // if (typeof (contentData.content as any).fileKey === 'string' && initialContent.fileKey && initialContent.fileKey !== (contentData.content as any).fileKey) {
        //   await deleteS3File(initialContent.fileKey)
        // }
        // const result = await updateContent(initialContent._id, { ...contentData, ...contentData.content, content: undefined } as Partial<IContent>)
        // toast.success("Content Updated")
        // if (result.fileKey) window.location.reload()
        // console.log({ result })
        return
      }
      return createContentsMutation.mutate({ moduleId, courseId, contentData, fileKey })

    } catch (error: any) {
      toast.error(error.message || "Something went wrong, please try again later");
    } finally {
      useGeneralStore.setState({ generalIsLoading: false });
    }
  };


  const getContentTypeIcon = (type: CourseContentType) => {
    switch (type) {
      case CourseContentType.ARTICLE:
        return <FileText className="h-4 w-4" />;
      case CourseContentType.VIDEO:
        return <Video className="h-4 w-4" />;
      case CourseContentType.QUIZ:
        return <HelpCircle className="h-4 w-4" />;
      case CourseContentType.ASSIGNMENT:
        return <FileCheck className="h-4 w-4" />;
      // case "resource":
      //   return <FolderOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: CourseContentType) => {
    switch (type) {
      case CourseContentType.ARTICLE:
        return "bg-green-50 text-green-700 border-green-200";
      case CourseContentType.VIDEO:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case CourseContentType.QUIZ:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case CourseContentType.ASSIGNMENT:
        return "bg-orange-50 text-orange-700 border-orange-200";
      // case "resource":
      //   return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/organization-dashboard/courses/${courseId}/modules/${moduleId}/content`}
                className="flex items-center  cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Module
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              {/* <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button> */}
              <Button
                onClick={handleSubmit(onSubmit)}
                size="sm"
                className=""
              >
                <Save className="h-4 w-4 mr-2" />
                Save Content
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
              <div className="flex items-center space-x-3 mb-2">
                {getContentTypeIcon(contentType)}
                <h1 className="text-3xl font-bold ">
                  {mode === "edit" ? "Edit" : "Create"} {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                </h1>
              </div>
              <p className="">Add engaging content to your module.</p>
            </div>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className=" w-full grid-cols-3 flex justify-center">
                <TabsTrigger value="content">Content</TabsTrigger>
                {/* <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger> */}
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Essential details about your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Content Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium ">
                        Content Type *
                      </label>
                      <Select
                        value={contentType}
                        onValueChange={(value: CourseContentType) => {
                          if (mode === "edit") return;
                          setContentType(value);
                          setValue("type", value);
                        }}
                      >
                        <SelectTrigger className="w-full" disabled={mode === "edit"}>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CourseContentType.ARTICLE}>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>Article</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={CourseContentType.VIDEO}>
                            <div className="flex items-center space-x-2">
                              <Video className="h-4 w-4" />
                              <span>Video</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={CourseContentType.QUIZ}>
                            <div className="flex items-center space-x-2">
                              <HelpCircle className="h-4 w-4" />
                              <span>Quiz</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={CourseContentType.ASSIGNMENT}>
                            <div className="flex items-center space-x-2">
                              <FileCheck className="h-4 w-4" />
                              <span>Assignment</span>
                            </div>
                          </SelectItem>
                          {/* <SelectItem value="resource">
                            <div className="flex items-center space-x-2">
                              <FolderOpen className="h-4 w-4" />
                              <span>Resource</span>
                            </div>
                          </SelectItem> */}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Content Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium   ">
                        Content Title *
                      </label>
                      <Input
                        {...register("title")}
                        placeholder="Enter content title"
                        className="w-full"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium   ">
                        Description *
                      </label>
                      <Textarea
                        {...register("description")}
                        placeholder="Describe what students will learn from this content"
                        rows={3}
                        className="w-full"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Estimated Duration */}
                    {/* <div className="space-y-2">
                      <label className="text-sm font-medium   ">
                        Estimated Duration
                      </label>
                      <Input
                        {...register("estimatedDuration")}
                        placeholder="e.g., 15 minutes, 1 hour"
                        className="w-full"
                      />
                    </div> */}
                  </CardContent>
                </Card>

                {/* Content Type Specific Forms */}
                {contentType === CourseContentType.ARTICLE && (
                  <ArticleContentForm register={register} errors={errors} />
                )}

                {contentType === CourseContentType.VIDEO && (
                  <VideoContentForm
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    initialValues={initialContent ? { videoType: initialContent.videoType, videoUrl: initialContent.videoUrl, fileKey: initialContent.fileKey } : undefined}
                    mode={mode}
                  />
                )}

                {contentType === CourseContentType.QUIZ && (
                  <QuizContentForm
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                    initialValues={
                      initialContent ?
                        { questions: initialContent.questions, quizStartDate: initialContent.quizStartDate, quizEndDate: initialContent.quizEndDate, quizDurationInMinutes: initialContent.quizDurationInMinutes }
                        : undefined}
                  />
                )}

                {contentType === CourseContentType.ASSIGNMENT && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileCheck className="h-5 w-5 mr-2" />
                        Assignment Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <p className="  ">Assignment creation coming soon...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* {contentType === "resource" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FolderOpen className="h-5 w-5 mr-2" />
                        Resource Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <p className="  ">Resource creation coming soon...</p>
                      </div>
                    </CardContent>
                  </Card>
                )} */}
              </TabsContent>

              {/* <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Settings</CardTitle>
                    <CardDescription>
                      Configure content preferences and requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium   ">
                          Required Content
                        </label>
                        <p className="text-xs   ">
                          Students must complete this content to progress
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={isRequired ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsRequired(!isRequired)}
                      >
                        {isRequired ? "Required" : "Optional"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Preview</CardTitle>
                    <CardDescription>
                      See how your content will appear to students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="  ">Preview coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Content Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm   ">Type</span>
                  <Badge className={getContentTypeColor(contentType)}>
                    {contentType}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Content
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Student View
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
              </CardContent>
            </Card> */}

            {/* Content Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Content Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm   ">
                  {contentType === CourseContentType.ARTICLE && (
                    <>
                      <li>• Use headings to structure your content</li>
                      <li>• Include images and examples</li>
                      <li>• Keep paragraphs short and scannable</li>
                    </>
                  )}
                  {contentType === CourseContentType.VIDEO && (
                    <>
                      <li>• Keep videos under 10 minutes for better engagement</li>
                      <li>• Add captions for accessibility</li>
                      <li>• Use custom thumbnails to attract attention</li>
                    </>
                  )}
                  {contentType === CourseContentType.QUIZ && (
                    <>
                      <li>• Write clear, concise questions</li>
                      <li>• Provide immediate feedback</li>
                      <li>• Mix question types for variety</li>
                    </>
                  )}
                  {contentType === CourseContentType.ASSIGNMENT && (
                    <>
                      <li>• Provide clear instructions</li>
                      <li>• Set realistic deadlines</li>
                      <li>• Include rubrics for grading</li>
                    </>
                  )}
                  {/* {contentType === "resource" && (
                    <>
                      <li>• Use descriptive file names</li>
                      <li>• Provide context for the resource</li>
                      <li>• Keep file sizes reasonable</li>
                    </>
                  )} */}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}