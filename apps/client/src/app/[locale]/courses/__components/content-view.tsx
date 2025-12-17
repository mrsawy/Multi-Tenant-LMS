// mport { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Play, FileText, PenTool, HelpCircle, Clock } from "lucide-react";
// import { IContent } from "@/types/content.interface";
// import { CourseContentType } from "@/types/enums";

// interface ContentViewerProps {
//   content: IContent;
//   isCompleted?: boolean;
//   onStartContent: (contentId: string) => void;
// }

// export function ContentViewer({ content, isCompleted = false, onStartContent }: ContentViewerProps) {
//   const getContentIcon = (type: CourseContentType) => {
//     switch (type) {
//       case CourseContentType.VIDEO:
//         return <Play className="w-4 h-4" />;
//       case CourseContentType.ARTICLE:
//         return <FileText className="w-4 h-4" />;
//       case CourseContentType.ASSIGNMENT:
//         return <PenTool className="w-4 h-4" />;
//       case CourseContentType.QUIZ:
//         return <HelpCircle className="w-4 h-4" />;
//       default:
//         return <FileText className="w-4 h-4" />;
//     }
//   };

//   const getContentTypeColor = (type: CourseContentType) => {
//     switch (type) {
//       case CourseContentType.VIDEO:
//         return "bg-blue-500";
//       case CourseContentType.ARTICLE:
//         return "bg-green-500";
//       case CourseContentType.ASSIGNMENT:
//         return "bg-orange-500";
//       case CourseContentType.QUIZ:
//         return "bg-purple-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const formatDuration = (minutes?: number) => {
//     if (!minutes) return null;
//     return `${minutes} min`;
//   };

//   return (
//     <Card className={`hover:shadow-md transition-shadow ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-3">
//             <div className={`p-2 rounded-lg ${getContentTypeColor(content.type)} text-white`}>
//               {getContentIcon(content.type)}
//             </div>
//             <div>
//               <CardTitle className="text-base font-medium">
//                 {content.title}
//               </CardTitle>
//               {content.description && (
//                 <p className="text-sm text-muted-foreground mt-1">
//                   {content.description}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Badge variant="outline" className={getContentTypeColor(content.type).replace('bg-', 'border-')}>
//               {content.type}
//             </Badge>
//             {isCompleted && (
//               <Badge variant="secondary" className="bg-green-100 text-green-800">
//                 ✓ Completed
//               </Badge>
//             )}
//           </div>
//         </div>
//       </CardHeader>
      
//       <CardContent className="pt-0">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4 text-sm text-muted-foreground">
//             {content.quizDurationInMinutes && (
//               <div className="flex items-center gap-1">
//                 <Clock className="w-3 h-3" />
//                 <span>{formatDuration(content.quizDurationInMinutes)}</span>
//               </div>
//             )}
//             {content.maxPoints && (
//               <span>{content.maxPoints} points</span>
//             )}
//             {content.dueDate && (
//               <span>Due: {new Date(content.dueDate).toLocaleDateString()}</span>
//             )}
//           </div>
          
//           <Button 
//             variant={isCompleted ? "outline" : "default"}
//             size="sm"
//             onClick={() => onStartContent(content._id)}
//           >
//             {isCompleted ? "Review" : "Start"}
//           </Button>
//         </div>
        
//         {content.type === CourseContentType.QUIZ && content.questions && (
//           <div className="mt-3 text-sm text-muted-foreground">
//             {content.questions.length} question{content.questions.length !== 1 ? 's' : ''}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }



// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Play, FileText, PenTool, HelpCircle, Clock, CheckCircle } from "lucide-react";
// import { useState } from "react";
// import { IContent } from "@/types/content.interface";
// import { CourseContentType } from "@/types/enums";

// interface ContentModalProps {
//   content: IContent | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onComplete: (contentId: string) => void;
// }

// export function ContentModal({ content, isOpen, onClose, onComplete }: ContentModalProps) {
//   const [selectedAnswer, setSelectedAnswer] = useState<string>("");
//   const [assignmentText, setAssignmentText] = useState<string>("");
//   const [isCompleted, setIsCompleted] = useState(false);

//   if (!content) return null;

//   const getContentIcon = (type: CourseContentType) => {
//     switch (type) {
//       case CourseContentType.VIDEO:
//         return <Play className="w-5 h-5" />;
//       case CourseContentType.ARTICLE:
//         return <FileText className="w-5 h-5" />;
//       case CourseContentType.ASSIGNMENT:
//         return <PenTool className="w-5 h-5" />;
//       case CourseContentType.QUIZ:
//         return <HelpCircle className="w-5 h-5" />;
//       default:
//         return <FileText className="w-5 h-5" />;
//     }
//   };

//   const handleComplete = () => {
//     setIsCompleted(true);
//     onComplete(content._id);
//     setTimeout(() => {
//       onClose();
//       setIsCompleted(false);
//       setSelectedAnswer("");
//       setAssignmentText("");
//     }, 1500);
//   };

//   const handleQuizSubmit = () => {
//     if (!selectedAnswer) return;
//     handleComplete();
//   };

//   const handleAssignmentSubmit = () => {
//     if (!assignmentText.trim()) return;
//     handleComplete();
//   };

//   const renderContent = () => {
//     switch (content.type) {
//       case CourseContentType.VIDEO:
//         return (
//           <div className="space-y-4">
//             <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
//               <div className="text-center">
//                 <Play className="w-16 h-16 text-gray-400 mx-auto mb-2" />
//                 <p className="text-gray-600">Video Player</p>
//                 <p className="text-sm text-gray-500">{content.videoUrl || "Sample video content"}</p>
//               </div>
//             </div>
//             <div className="flex justify-center">
//               <Button onClick={handleComplete}>
//                 Mark as Watched
//               </Button>
//             </div>
//           </div>
//         );

//       case CourseContentType.ARTICLE:
//         return (
//           <div className="space-y-4">
//             <div className="prose max-w-none">
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="font-semibold mb-2">Article Content</h3>
//                 <p className="text-gray-700 leading-relaxed">
//                   {content.body || content.summary || "This is a sample article content. In a real implementation, this would contain the full article text with proper formatting, images, and interactive elements."}
//                 </p>
//               </div>
//             </div>
//             <div className="flex justify-center">
//               <Button onClick={handleComplete}>
//                 Mark as Read
//               </Button>
//             </div>
//           </div>
//         );

//       case CourseContentType.QUIZ:
//         return (
//           <div className="space-y-4">
//             {content.questions && content.questions.length > 0 ? (
//               <div className="space-y-4">
//                 {content.questions.map((question, index) => (
//                   <Card key={index}>
//                     <CardHeader>
//                       <CardTitle className="text-lg">
//                         Question {index + 1}: {question.questionText}
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
//                         {question.options.map((option, optionIndex) => (
//                           <div key={optionIndex} className="flex items-center space-x-2">
//                             <RadioGroupItem value={optionIndex.toString()} id={`option-${optionIndex}`} />
//                             <Label htmlFor={`option-${optionIndex}`}>{option}</Label>
//                           </div>
//                         ))}
//                       </RadioGroup>
//                     </CardContent>
//                   </Card>
//                 ))}
//                 <div className="flex justify-center">
//                   <Button 
//                     onClick={handleQuizSubmit}
//                     disabled={!selectedAnswer}
//                   >
//                     Submit Quiz
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-2" />
//                 <p className="text-gray-600">Sample Quiz Content</p>
//                 <Button onClick={handleComplete} className="mt-4">
//                   Complete Quiz
//                 </Button>
//               </div>
//             )}
//           </div>
//         );

//       case CourseContentType.ASSIGNMENT:
//         return (
//           <div className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Assignment Instructions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 mb-4">
//                   {content.instructions || "Complete this assignment by following the given requirements and submit your work below."}
//                 </p>
//                 {content.maxPoints && (
//                   <Badge variant="outline">Max Points: {content.maxPoints}</Badge>
//                 )}
//                 {content.dueDate && (
//                   <Badge variant="outline" className="ml-2">
//                     Due: {new Date(content.dueDate).toLocaleDateString()}
//                   </Badge>
//                 )}
//               </CardContent>
//             </Card>
            
//             <Card>
//               <CardHeader>
//                 <CardTitle>Your Submission</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <Textarea
//                   placeholder="Enter your assignment submission here..."
//                   value={assignmentText}
//                   onChange={(e) => setAssignmentText(e.target.value)}
//                   className="min-h-32"
//                 />
//                 <div className="flex justify-center mt-4">
//                   <Button 
//                     onClick={handleAssignmentSubmit}
//                     disabled={!assignmentText.trim()}
//                   >
//                     Submit Assignment
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         );

//       default:
//         return (
//           <div className="text-center py-8">
//             <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
//             <p className="text-gray-600">Content not available</p>
//           </div>
//         );
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
//               {getContentIcon(content.type)}
//             </div>
//             <div>
//               <DialogTitle className="text-xl">{content.title}</DialogTitle>
//               {content.description && (
//                 <p className="text-sm text-muted-foreground mt-1">
//                   {content.description}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div className="flex items-center gap-2 mt-2">
//             <Badge variant="outline">{content.type}</Badge>
//             {content.quizDurationInMinutes && (
//               <Badge variant="outline" className="flex items-center gap-1">
//                 <Clock className="w-3 h-3" />
//                 {content.quizDurationInMinutes} min
//               </Badge>
//             )}
//           </div>
//         </DialogHeader>
        
//         <div className="mt-6">
//           {isCompleted ? (
//             <div className="text-center py-8">
//               <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-green-700 mb-2">
//                 Content Completed!
//               </h3>
//               <p className="text-gray-600">Great job! Moving to the next item...</p>
//             </div>
//           ) : (
//             renderContent()
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }