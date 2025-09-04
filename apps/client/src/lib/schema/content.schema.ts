import { z } from "zod";
import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import { VideoType } from "@/lib/types/course/enum/VideoType.enum";

const baseContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.nativeEnum(CourseContentType),
});

const textContentSchema = z.object({
  body: z.string().min(1, "Body is required"),
});

const videoContentSchema = z.object({
  videoUrl: z.string().optional(),
  fileKey: z.string().optional(),
  videoType: z.nativeEnum(VideoType),
});

const quizContentSchema = z.object({
  questions: z.array(
    z.object({
      questionText: z.string().min(1, "Question text is required"),
      options: z.array(z.string()).min(2, "At least 2 options required"),
      correctOption: z.number(),
    })
  ).min(1, "At least one question is required"),
});

export const courseContentSchema = z.object({
  ...baseContentSchema.shape,
  content: z.discriminatedUnion("type", [
    z.object({ type: z.literal(CourseContentType.TEXT), ...textContentSchema.shape }),
    z.object({ type: z.literal(CourseContentType.VIDEO), ...videoContentSchema.shape }),
    z.object({ type: z.literal(CourseContentType.QUIZ), ...quizContentSchema.shape }),
  ]),
});

export type CourseContentFormData = z.infer<typeof courseContentSchema>;