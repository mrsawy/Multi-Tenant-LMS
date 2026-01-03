import { CourseDiscussion } from "../entities/course-discussion.entity";
import { ModuleDiscussion } from "../entities/module-discussion.entity";
import { ContentDiscussion } from "../entities/content-discussion.entity";

enum DiscussionType {
  COURSE = 'CourseDiscussion',
  MODULE = 'ModuleDiscussion',
  CONTENT = 'ContentDiscussion',
}


export default DiscussionType;
