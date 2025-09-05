import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";

export interface IContent {
  _id: string;
  title: string;
  description: string;
  type: CourseContentType;
  estimatedDuration?: string;
  content?: string; // For articles
  videoUrl?: string; // For videos
  thumbnailUrl?: string; // For videos
  isRequired: boolean;
  order: number;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArticleContent extends IContent {
  type: CourseContentType.ARTICLE;
  content: string;
  estimatedReadingTime?: string;
}

export interface IVideoContent extends IContent {
  type: CourseContentType.VIDEO;
  videoUrl: string;
  thumbnailUrl?: string;
  videoFile?: File;
}

export interface IQuizContent extends IContent {
  type: CourseContentType.QUIZ;
  questions: IQuestion[];
  passingScore: number;
}

export interface IAssignmentContent extends IContent {
  type: CourseContentType.ASSIGNMENT;
  instructions: string;
  dueDate?: Date;
  maxPoints: number;
}

// export interface IResourceContent extends IContent {
//   type: "resource";
//   fileUrl: string;
//   fileName: string;
//   fileSize: number;
// }

export interface IQuestion {
  _id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}
