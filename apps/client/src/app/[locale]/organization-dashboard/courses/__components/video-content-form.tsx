"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Video, Upload, Image as ImageIcon } from "lucide-react";
import DropzoneWithPreview from "@/components/molecules/dropzone-preview";
import { VideoType } from "@/lib/types/course/enum/VideoType.enum";
import { UseFormSetValue } from "react-hook-form";
import { getFileFullUrl } from "@/lib/utils/getFileFullUrl";
import { getFileUrl } from "@/lib/actions/file/getPreSignedUrl";

interface VideoContentFormProps {
  register: any;
  errors: any;
  setValue: UseFormSetValue<any>;
  initialValues?: { videoType?: VideoType; videoUrl?: string; fileKey?: string };
  mode?: "create" | "edit";
}

export default function VideoContentForm({ register, errors, setValue, initialValues, mode = "edit" }: VideoContentFormProps) {
  const [videoFiles, setVideoFiles] = useState<File[] | undefined>();
  const [videoPreview, setVideoPreview] = useState<string | undefined>();
  const [preSignedVideoUrl, setPreSignedVideoUrl] = useState<string | undefined>();

  useEffect(() => {
    if (initialValues?.fileKey?.length && initialValues?.fileKey?.length > 0) {
      (async () => {
        const response = await getFileUrl({ fileKey: initialValues.fileKey ?? "" })
        setPreSignedVideoUrl(response)
        console.log("video url response", { response })

        const file = new File([], initialValues.fileKey ?? 'placeholder.mp4', {
          type: 'video/mp4',
          lastModified: Date.now(),
        });

        setValue("content.videoFile", file)
      })()


    }

  }, [])



  const handleVideoDrop = (files: File[]) => {
    console.log("Video files dropped:", files);
    if (files.length > 0) {
      const file = files[0]
      setVideoFiles(files);

      setValue("content.videoType", VideoType.UPLOAD)
      setValue("content.fileKey", file.name)
      setValue("content.videoFile", file)


      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setVideoPreview(e.target?.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="h-5 w-5 mr-2" />
          Video Content
        </CardTitle>
        <CardDescription>
          Add video content to your module
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue={initialValues?.videoType ?? VideoType.URL} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={VideoType.URL} className="flex items-center space-x-2" onClick={() => { setValue("content.videoType", VideoType.URL) }} disabled={mode == "edit"}>
              <Video className="h-4 w-4" />
              <span>Video URL</span>
            </TabsTrigger>
            <TabsTrigger value={VideoType.UPLOAD} className="flex items-center space-x-2" onClick={() => { setValue("content.videoType", VideoType.UPLOAD) }}>
              <Upload className="h-4 w-4" />
              <span>Upload Video</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={VideoType.URL} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Video URL *
              </label>
              <Input
                {...register("content.videoUrl")}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                className="w-full"
              />
              {errors?.content?.videoUrl && (
                <p className="text-sm text-red-600">{errors?.content?.videoUrl?.message}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value={VideoType.UPLOAD} className="space-y-4">

            {preSignedVideoUrl && (
              <video
                src={preSignedVideoUrl}
                controls
                className="w-full rounded-lg mb-3"
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Upload Video File *
              </label>

              <DropzoneWithPreview
                files={videoFiles}
                setFiles={setVideoFiles}
                handleDrop={handleVideoDrop}
                filePreview={videoPreview}
                setFilePreview={setVideoPreview}
                className="min-h-[200px]"
                maxFiles={1}
                accept={{ 'video/*': [] }}
              />
              <p className="text-xs text-gray-500">
                Supported formats: MP4, AVI, MOV, WMV up to 500MB
              </p>
            </div>

            {errors?.content?.fileKey && !errors?.content?.videoFile && (
              <p className="text-sm text-red-600">{errors?.content?.fileKey?.message}</p>
            )}
            {errors?.content?.videoFile && (
              <p className="text-sm text-red-600">{errors?.content?.videoFile?.message}</p>
            )}
          </TabsContent>
        </Tabs>


      </CardContent>
    </Card>
  );
}
