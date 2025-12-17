// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import { ChevronDown, ChevronRight, BookOpen, CheckCircle } from "lucide-react";
// import { useState } from "react";
// import { IModuleWithContents } from "@/types/module.interface";
// import { ContentViewer } from "./ContentViewer";

// interface CourseModulesProps {
//   modules: IModuleWithContents[];
//   completedModules: string[];
//   completedLessons: string[];
//   onStartContent: (contentId: string) => void;
// }

// export function CourseModules({ 
//   modules, 
//   completedModules, 
//   completedLessons, 
//   onStartContent 
// }: CourseModulesProps) {
//   const [openModules, setOpenModules] = useState<string[]>([modules[0]?._id || ""]);

//   const toggleModule = (moduleId: string) => {
//     setOpenModules(prev => 
//       prev.includes(moduleId) 
//         ? prev.filter(id => id !== moduleId)
//         : [...prev, moduleId]
//     );
//   };

//   const getModuleProgress = (module: IModuleWithContents) => {
//     const totalContents = module.contents.length;
//     const completedContents = module.contents.filter(content => 
//       completedLessons.includes(content._id)
//     ).length;
//     return totalContents > 0 ? (completedContents / totalContents) * 100 : 0;
//   };

//   const isModuleCompleted = (moduleId: string) => {
//     return completedModules.includes(moduleId);
//   };

//   return (
//     <div className="space-y-4">
//       {modules.map((module, index) => {
//         const isCompleted = isModuleCompleted(module._id);
//         const progress = getModuleProgress(module);
//         const isOpen = openModules.includes(module._id);

//         return (
//           <Card key={module._id} className={isCompleted ? 'border-green-200' : ''}>
//             <Collapsible open={isOpen} onOpenChange={() => toggleModule(module._id)}>
//               <CollapsibleTrigger asChild>
//                 <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="flex items-center gap-2">
//                         {isOpen ? (
//                           <ChevronDown className="w-4 h-4" />
//                         ) : (
//                           <ChevronRight className="w-4 h-4" />
//                         )}
//                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
//                           isCompleted 
//                             ? 'bg-green-500 text-white' 
//                             : 'bg-gray-200 text-gray-600'
//                         }`}>
//                           {isCompleted ? (
//                             <CheckCircle className="w-4 h-4" />
//                           ) : (
//                             index + 1
//                           )}
//                         </div>
//                       </div>
//                       <div>
//                         <CardTitle className="text-lg font-semibold">
//                           {module.title}
//                         </CardTitle>
//                         {module.description && (
//                           <p className="text-sm text-muted-foreground mt-1">
//                             {module.description}
//                           </p>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-3">
//                       <Badge variant="outline" className="flex items-center gap-1">
//                         <BookOpen className="w-3 h-3" />
//                         {module.contents.length} items
//                       </Badge>
//                       {isCompleted && (
//                         <Badge className="bg-green-500">
//                           Completed
//                         </Badge>
//                       )}
//                     </div>
//                   </div>
                  
//                   {!isCompleted && progress > 0 && (
//                     <div className="mt-3 space-y-1">
//                       <div className="flex justify-between text-sm">
//                         <span>Progress</span>
//                         <span>{Math.round(progress)}%</span>
//                       </div>
//                       <Progress value={progress} className="h-2" />
//                     </div>
//                   )}
//                 </CardHeader>
//               </CollapsibleTrigger>
              
//               <CollapsibleContent>
//                 <CardContent className="pt-0">
//                   {module.learningObjectives.length > 0 && (
//                     <div className="mb-4 p-3 bg-blue-50 rounded-lg">
//                       <h4 className="font-medium text-sm mb-2">Learning Objectives:</h4>
//                       <ul className="text-sm text-muted-foreground space-y-1">
//                         {module.learningObjectives.map((objective, idx) => (
//                           <li key={idx} className="flex items-start gap-2">
//                             <span className="text-blue-500 mt-1">•</span>
//                             <span>{objective}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
                  
//                   <div className="space-y-3">
//                     {module.contents.map((content) => (
//                       <ContentViewer
//                         key={content._id}
//                         content={content}
//                         isCompleted={completedLessons.includes(content._id)}
//                         onStartContent={onStartContent}
//                       />
//                     ))}
//                   </div>
//                 </CardContent>
//               </CollapsibleContent>
//             </Collapsible>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }