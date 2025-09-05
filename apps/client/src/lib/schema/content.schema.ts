import * as yup from 'yup';
import { CourseContentType } from '../types/course/enum/CourseContentType.enum';
import { VideoType } from '../types/course/enum/VideoType.enum';

// Base schema for common CourseContent fields
const baseCourseContentSchema = yup.object({
  // courseId: yup
  //   .string()
  //   .required('Course ID is required')
  //   .matches(/^[0-9a-fA-F]{24}$/, 'Course ID must be a valid ObjectId'),

  // organizationId: yup
  //   .string()
  //   .required('Organization ID is required')
  //   .matches(/^[0-9a-fA-F]{24}$/, 'Organization ID must be a valid ObjectId'),

  // moduleId: yup
  //   .string()
  //   .required('Module ID is required')
  //   .matches(/^[0-9a-fA-F]{24}$/, 'Module ID must be a valid ObjectId'),

  // createdBy: yup
  //   .string()
  //   .required('Created by is required')
  //   .min(3, 'Username must be at least 3 characters')
  //   .max(50, 'Username must not exceed 50 characters'),

  type: yup
    .string()
    .oneOf(Object.values(CourseContentType), 'Invalid course type')
    .required('Content type is required'),

  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),

  description: yup
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional()
});

// Article content schema
const articleContentSchema = yup.object({
  body: yup
    .string()
    .required('Article body is required')
    .min(10, 'Article body must be at least 10 characters')
    .max(50000, 'Article body must not exceed 50,000 characters')
});

// Video content schema with conditional validation
const videoContentSchema = yup.object({
  videoType: yup
    .string()
    .oneOf(Object.values(VideoType), 'Invalid video type')
    .required('Video type is required'),

  videoUrl: yup
    .string()
    .when('videoType', {
      is: VideoType.URL,
      then: (schema) => schema
        .required('Video URL is required when video type is URL')
        .url('Please provide a valid URL')
        .min(1, 'Video URL cannot be empty'),
      otherwise: (schema) => schema.optional()
    }),

  fileKey: yup
    .string()
    .when('videoType', {
      is: VideoType.UPLOAD,
      then: (schema) => schema
        .required('File key is required when video type is UPLOAD')
        .min(1, 'File key cannot be empty'),
      otherwise: (schema) => schema.optional()
    }),

  videoFile: yup
    .mixed()
    .when('videoType', {
      is: VideoType.UPLOAD,
      then: (schema) => schema
        .required('Video file is required when video type is UPLOAD')
        .test('is-file', 'Video file must be a valid file', (value) => {
          return value instanceof File;
        })
        .test('file-size', 'Video file size must not exceed 50MB', (value) => {
          if (value instanceof File) {
            return value.size <= 500 * 1024 * 1024;
          }
          return true;
        }),
      otherwise: (schema) => schema.optional()
    }),
    
});

// Quiz content schema
const questionSchema = yup.object({
  questionText: yup
    .string()
    .required('Question text is required')
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must not exceed 500 characters')
    .trim(),

  options: yup
    .array()
    .of(
      yup
        .string()
        .required('Option cannot be empty')
        .min(1, 'Option must have at least 1 character')
        .max(200, 'Option must not exceed 200 characters')
        .trim()
    )
    .min(2, 'Must have at least 2 options')
    .max(6, 'Cannot have more than 6 options')
    .required('Options are required'),

  correctOption: yup
    .number()
    .integer('Correct option must be an integer')
    .min(0, 'Correct option index must be at least 0')
    .required('Correct option is required')
    .test('valid-option-index', 'Correct option index must be within the options array', function (value) {
      const { options } = this.parent;
      return value < options.length;
    })
    .test('valid-option-selected', 'Please select a correct answer', function (value) {
      const { options } = this.parent;
      return value >= 0 && value < options.length && options[value]?.trim() !== '';
    })
});

const quizContentSchema = yup.object({
  questions: yup
    .array()
    .of(questionSchema)
    .min(1, 'Quiz must have at least 1 question')
    .max(50, 'Quiz cannot have more than 50 questions')
    .required('Questions are required')
    .test('valid-questions', 'All questions must be properly filled', function (questions) {
      if (!questions || questions.length === 0) return false;
      
      return questions.every(question => 
        question.questionText?.trim() !== '' &&
        question.options?.length >= 2 &&
        question.options.every(option => option?.trim() !== '') &&
        question.correctOption >= 0 &&
        question.correctOption < question.options.length
      );
    }),

  quizStartDate: yup
    .date()
    .required('Quiz start date is required')
    .min(new Date(), 'Quiz start date must be in the future'),

  quizEndDate: yup
    .date()
    .required('Quiz end date is required')
    .min(yup.ref('quizStartDate'), 'Quiz end date must be after start date'),

  quizDurationInMinutes: yup
    .number()
    .required('Quiz duration is required')
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)')
    .integer('Duration must be a whole number')
});

// Assignment content schema
const assignmentContentSchema = yup.object({
  dueDate: yup
    .date()
    .required('Due date is required')
    .min(new Date(), 'Due date must be in the future'),

  maxPoints: yup
    .number()
    .positive('Max points must be positive')
    .integer('Max points must be an integer')
    .min(1, 'Max points must be at least 1')
    .max(1000, 'Max points cannot exceed 1000')
    .default(100)
    .optional(),

  fileKey: yup
    .string()
    .required('Assignment file key is required')
    .min(1, 'File key cannot be empty')
});

// Main discriminated union schema based on content type
export const courseContentCreationSchema = yup.object().shape({
  ...baseCourseContentSchema.fields,
  content: yup.lazy((_, context) => {
    const type = context?.parent?.type;
    switch (type) {
      case CourseContentType.ARTICLE:
        return articleContentSchema.required('Article content is required');
      case CourseContentType.VIDEO:
        return videoContentSchema.required('Video content is required');
      case CourseContentType.QUIZ:
        return quizContentSchema.required('Quiz content is required');
      case CourseContentType.ASSIGNMENT:
        return assignmentContentSchema.required('Assignment content is required');
      default:
        return yup.mixed().required('Content is required');
    }
  })
});

// Alternative approach using discriminated unions (more modern Yup approach)
export const courseContentCreationSchemaDiscriminated = yup.object({
  ...baseCourseContentSchema.fields,
  content: yup.lazy((value, context) => {
    const type = context?.parent?.type;
    switch (type) {
      case CourseContentType.ARTICLE:
        return articleContentSchema;
      case CourseContentType.VIDEO:
        return videoContentSchema;
      case CourseContentType.QUIZ:
        return quizContentSchema;
      case CourseContentType.ASSIGNMENT:
        return assignmentContentSchema;
      default:
        return yup.mixed().required('Content is required');
    }
  })
});

// Type definitions for TypeScript (optional but recommended)
export type CourseContentFormData = yup.InferType<typeof courseContentCreationSchema>;

// Example usage with form libraries like Formik or React Hook Form:
/*
import { useFormik } from 'formik';

const formik = useFormik({
  initialValues: {
    courseId: '',
    organizationId: '',
    moduleId: '',
    createdBy: '',
    type: '',
    title: '',
    description: '',
    content: {}
  },
  validationSchema: courseContentCreationSchema,
  onSubmit: (values) => {
    console.log(values);
  },
});
*/