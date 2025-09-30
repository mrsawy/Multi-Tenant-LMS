import { Course } from '@/types/course';
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter, CardHeader } from '@/components/atoms/card';
import { Badge } from "@/components/atoms/badge";
import { Progress } from '@/components/atoms/progress';
import { Star, Clock, Users, BookOpen, Play } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
}

export function CourseCard({ course, onEnroll, onContinue }: CourseCardProps) {
  const getStatusBadge = () => {
    if (!course.isEnrolled) return null;
    
    if (course.progress === 100) {
      return <Badge className="bg-completed text-white">Completed</Badge>;
    } else if (course.progress && course.progress > 0) {
      return <Badge className="bg-in-progress text-white">In Progress</Badge>;
    } else {
      return <Badge className="bg-enrolled text-white">Enrolled</Badge>;
    }
  };

  const getActionButton = () => {
    if (!course.isEnrolled) {
      return (
        <Button 
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300"
        >
          Enroll Now
        </Button>
      );
    }
    
    if (course.progress === 100) {
      return (
        <Button 
          variant="secondary" 
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          Review Course
        </Button>
      );
    }
    
    return (
      <Button 
        className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300"
      >
        <Play className="w-4 h-4 mr-2" />
        Continue Learning
      </Button>
    );
  };

  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
      <CardHeader className="p-0 relative">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary-glow/10 relative overflow-hidden">
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            {getStatusBadge()}
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              {course.level}
            </Badge>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium">{course.rating}</span>
            <span>({course.studentsCount.toLocaleString()})</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {course.description}
        </p>
        
        <div className="text-sm text-muted-foreground mb-3">
          by {course.instructor}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.lessonsCount} lessons
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {course.studentsCount.toLocaleString()}
          </div>
        </div>
        
        {course.isEnrolled && course.progress !== undefined && course.progress < 100 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">${course.price}</span>
              {course.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${course.originalPrice}
                </span>
              )}
            </div>
          </div>
          {getActionButton()}
        </div>
      </CardFooter>
    </Card>
  );
}