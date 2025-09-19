// content.dto.ts

import { CourseContentType } from "./enum/CourseContentType.enum";
import { VideoType } from "./enum/VideoType.enum";

export interface Question {
  options: string[];
  correctOption: number;
  questionText: string;
}

export interface IContent {
  _id: string;
  courseId: string;
  moduleId: string;
  organizationId?: string;
  createdBy?: string;
  title: string;
  description?: string;
  type: CourseContentType;

  // Video-specific
  videoType?: VideoType;
  videoUrl?: string;
  fileKey?: string; //not just videos

  // Article-specific
  body?: string;
  summary?: string;

  // Assignment-specific
  dueDate?: Date;
  maxPoints?: number;
  instructions?: string;

  authorization?: string;

  // Quiz-specific
  questions?: Question[];
  quizStartDate?: string;
  quizEndDate?: string;
  quizDurationInMinutes?: number;

  createdAt: Date | string

  content?: any
}
