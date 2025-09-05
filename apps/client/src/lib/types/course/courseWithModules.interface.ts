import { ICourse } from "./course.interface";
import { IModule } from "./modules.interface";

export interface ICourseWithModules extends ICourse {
    modules: IModule[]
}