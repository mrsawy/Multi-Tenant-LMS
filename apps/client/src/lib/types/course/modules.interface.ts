import { IContent } from "./content.interface"

export interface IModule {
    _id: string,
    title: string,
    description?: string
    learningObjectives: string[]
    contentsIds: string[],
    createdBy: string
    // contents: [];
}


export interface IModuleWithContents extends IModule  {
    contents: IContent[]
}
