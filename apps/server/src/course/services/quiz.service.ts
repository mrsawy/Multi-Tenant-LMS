import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CourseContent } from '../entities/course-content.entity';
import { ContentType } from '../enum/contentType.enum';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SubmitQuizDto } from '../../enrollment/dto/quiz-submission.dto';
import { Quiz } from '../entities/quiz.schema';
import { SubmittedAnswer } from '../entities/quizSubmission.entity';



interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
}

interface QuizSubmissionRecord {
  studentId: mongoose.Types.ObjectId;
  score: number;
  submittedAt: Date;
  attemptNumber: number;
  timeTakenInSeconds?: number;
  feedback: string;
  answers: SubmittedAnswer[];
}

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(CourseContent.name)
    private readonly courseContentModel: Model<CourseContent>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async getQuizAttemptsLeft(
    contentId: string,
    studentId: string,
  ): Promise<{
    attemptsLeft: number;
    maxAttempts: number;
    attemptsTaken: number;
  }> {
    const content = await this.courseContentModel.findById(contentId);

    if (!content) {
      throw new NotFoundException('Quiz not found');
    }

    if ((content as any).type !== ContentType.QUIZ) {
      throw new BadRequestException('Content is not a quiz');
    }

    const quiz = content as any;
    const maxAttempts = quiz.maxAttempts || 1;

    // Count how many attempts this student has made
    const studentSubmissions =
      quiz.quizSubmissions?.filter(
        (sub: any) => sub.studentId.toString() === studentId,
      ) || [];

    const attemptsTaken = studentSubmissions.length;
    const attemptsLeft = Math.max(0, maxAttempts - attemptsTaken);

    return {
      attemptsLeft,
      maxAttempts,
      attemptsTaken,
    };
  }

  async submitQuiz(submission: SubmitQuizDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const {
        quizId: contentId,
        studentId,
        answers,
        timeTakenInSeconds,
      } = submission;

      // Fetch the quiz content
      const content = await this.courseContentModel
        .findById(contentId)
        .session(session);

      if (!content) {
        throw new NotFoundException('Quiz not found');
      }

      if ((content as any).type !== ContentType.QUIZ) {
        throw new BadRequestException('Content is not a quiz');
      }

      const quiz = content as unknown as CourseContent & Quiz;

      // Check if quiz is within the allowed time window
      const now = new Date();
      if (quiz.quizStartDate && now < new Date(quiz.quizStartDate)) {
        throw new BadRequestException('Quiz has not started yet');
      }
      if (quiz.quizEndDate && now > new Date(quiz.quizEndDate)) {
        throw new BadRequestException('Quiz has ended');
      }

      // Validate time taken doesn't exceed quiz duration
      if (quiz.quizDurationInMinutes && timeTakenInSeconds) {
        const maxAllowedSeconds = quiz.quizDurationInMinutes * 60;
        const bufferSeconds = 10; // 10 second buffer for network latency

        if (timeTakenInSeconds > maxAllowedSeconds + bufferSeconds) {
          throw new BadRequestException(
            `Time exceeded: Quiz must be completed within ${quiz.quizDurationInMinutes} minutes`,
          );
        }
      }

      // Check attempts left
      const studentSubmissions =
        quiz.quizSubmissions?.filter(
          (sub: any) => sub.studentId.toString() === studentId,
        ) || [];

      const maxAttempts = quiz.maxAttempts || 1;
      const attemptsTaken = studentSubmissions.length;

      if (attemptsTaken >= maxAttempts) {
        throw new BadRequestException(
          `Maximum attempts (${maxAttempts}) reached for this quiz`,
        );
      }

      // Validate that all questions are answered
      if (answers.length !== quiz.questions.length) {
        throw new BadRequestException(
          `Expected ${quiz.questions.length} answers, but received ${answers.length}`,
        );
      }

      // Calculate score and build detailed answers array
      let correctAnswers = 0;
      const totalQuestions = quiz.questions.length;
      const detailedAnswers: SubmittedAnswer[] = [];

      quiz.questions.forEach((question: QuizQuestion, index: number) => {
        const submittedAnswer = answers.find((a) => a.questionIndex === index);

        if (!submittedAnswer) {
          throw new BadRequestException(
            `Missing answer for question at index ${index}`,
          );
        }

        const isCorrect = submittedAnswer.selectedOption === question.correctOption;

        if (isCorrect) {
          correctAnswers++;
        }

        // Store full question and answer details
        detailedAnswers.push({
          questionIndex: index,
          questionText: question.questionText,
          options: question.options,
          correctOption: question.correctOption,
          selectedOption: submittedAnswer.selectedOption,
          isCorrect,
        });
      });

      const score = Number(
        ((correctAnswers / totalQuestions) * 100).toFixed(2),
      );
      const nextAttemptNumber = attemptsTaken + 1;

      // Create submission record with detailed answers
      let timeMessage = '';
      if (timeTakenInSeconds) {
        const minutes = Math.floor(timeTakenInSeconds / 60);
        const seconds = timeTakenInSeconds % 60;
        timeMessage = ` Completed in ${minutes}m ${seconds}s.`;
      }

      const quizSubmission: QuizSubmissionRecord = {
        studentId: new mongoose.Types.ObjectId(studentId),
        score,
        submittedAt: now,
        attemptNumber: nextAttemptNumber,
        timeTakenInSeconds,
        answers: detailedAnswers,
        feedback: `You answered ${correctAnswers} out of ${totalQuestions} questions correctly.${timeMessage}`,
      };

      // Add submission to quiz
      const foundedContent = await this.courseContentModel.findOneAndUpdate(
        {
          _id: contentId,
          type: ContentType.QUIZ,
          // Ensure this submission doesn't already exist
          quizSubmissions: {
            $not: {
              $elemMatch: {
                studentId: quizSubmission.studentId,
                attemptNumber: quizSubmission.attemptNumber,
              },
            },
          },
        },
        {
          $push: { quizSubmissions: quizSubmission },
        },
        { session, new: true },
      );

      console.dir(foundedContent?.toObject(), { depth: null });

      if (!foundedContent) {
        throw new NotFoundException('Content not found or duplicate submission');
      }

      await session.commitTransaction();

      return {
        score,
        correctAnswers,
        totalQuestions,
        attemptNumber: nextAttemptNumber,
        attemptsLeft: maxAttempts - nextAttemptNumber,
        feedback: quizSubmission.feedback,
        submittedAt: quizSubmission.submittedAt,
        timeTakenInSeconds,
        detailedAnswers, // Include detailed answers in response
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}