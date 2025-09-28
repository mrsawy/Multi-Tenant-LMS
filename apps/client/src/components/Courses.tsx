'use client'
import React from 'react';
import { findCourses } from '@/lib/actions/courses/getCourses.action';
import { useState, useMemo } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { courses, categories } from '@/data/courses';
import { Course } from '@/types/course';
import { GraduationCap, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/card';
const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {selectedCategory === 'all'
                ? 'All Courses'
                : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-muted-foreground">
              {courses.length} course
              {courses.length !== 1 ? 's' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse different categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
