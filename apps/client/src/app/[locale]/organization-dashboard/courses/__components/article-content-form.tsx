"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { FileText } from "lucide-react";

interface ArticleContentFormProps {
  register: any;
  errors: any;
}

export default function ArticleContentForm({ register, errors }: ArticleContentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Article Content
        </CardTitle>
        <CardDescription>
          Write your article content using markdown formatting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Article Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Article Content *
          </label>
          <Textarea
            {...register("content.body")}
            placeholder="Write your article content here..."
            rows={12}
            className="w-full font-mono text-sm"
          />
          {errors.content && (
            <p className="text-sm text-red-600">{errors.content.body.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Tip: Use markdown formatting for better presentation
          </p>
        </div>

        {/* Estimated Reading Time */}
        {/* <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Estimated Reading Time
          </label>
          <Input
            {...register("estimatedReadingTime")}
            placeholder="e.g., 5 minutes"
            className="w-full"
          />
        </div> */}
      </CardContent>
    </Card>
  );
}
