
import { Article } from "src/course/entities/article.schema";
import { Assignment } from "src/course/entities/assignment.schema";
import { CourseContent } from "src/course/entities/course-content.entity";
import { Quiz } from "src/course/entities/quiz.schema";
import { Video } from "src/course/entities/video.schema";



export type CourseContentDocument =
  | (CourseContent & Quiz)
  | (CourseContent & Video)
  | (CourseContent & Article)
  | (CourseContent & Assignment);
