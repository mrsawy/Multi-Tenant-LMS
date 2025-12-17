"use client";

import { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/radio-group";
import { Label } from "@/components/atoms/label";
import {
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle,
  Circle,
  GripVertical,
  AlertCircle,
  Calendar,
  Clock
} from "lucide-react";
import { CourseContentFormData } from "@/lib/schema/content.schema";
import Calendar05 from "@/components/molecules/calendar-05";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { v7 } from "uuid";

interface QuizContentFormProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  initialValues?: { questions?: { questionText: string; options: string[]; correctOption: number }[]; quizStartDate?: string | Date; quizEndDate?: string | Date; quizDurationInMinutes?: number };
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
}

export default function QuizContentForm({ register, errors, setValue, watch, initialValues }: QuizContentFormProps) {
  const [questions, setQuestions] = useState<Question[]>(
    initialValues?.questions?.length
      ? initialValues.questions.map((q, idx) => ({ id: String(idx + 1), ...q }))
      : [{ id: "1", questionText: "", options: ["", ""], correctOption: 0 }]
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = initialValues?.quizStartDate ? new Date(initialValues.quizStartDate) : undefined;
    const to = initialValues?.quizEndDate ? new Date(initialValues.quizEndDate) : undefined;
    return from || to ? { from, to } : undefined;
  });
  const [quizDuration, setQuizDuration] = useState<number>(initialValues?.quizDurationInMinutes ?? 30);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: v7(),
      questionText: "",
      options: ["", ""],
      correctOption: 0
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      updateFormData(updatedQuestions);
    }
  };

  const updateQuestionText = (questionId: string, text: string) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, questionText: text } : q
    );
    setQuestions(updatedQuestions);
    updateFormData(updatedQuestions);
  };

  const addOption = (questionId: string) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...q.options, ""] }
        : q
    );
    setQuestions(updatedQuestions);
    updateFormData(updatedQuestions);
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        const newCorrectOption = q.correctOption >= optionIndex
          ? Math.max(0, q.correctOption - 1)
          : q.correctOption;
        return {
          ...q,
          options: newOptions,
          correctOption: newCorrectOption
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    updateFormData(updatedQuestions);
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
        }
        : q
    );
    setQuestions(updatedQuestions);
    updateFormData(updatedQuestions);
  };

  const updateCorrectOption = (questionId: string, correctIndex: number) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? { ...q, correctOption: correctIndex }
        : q
    );
    setQuestions(updatedQuestions);
    updateFormData(updatedQuestions);
  };

  const updateFormData = (updatedQuestions: Question[]) => {
    const quizData = {
      questions: updatedQuestions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption
      })),
      quizStartDate: dateRange?.from,
      quizEndDate: dateRange?.to,
      quizDurationInMinutes: quizDuration
    };
    setValue("content", quizData);
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    
    if (newDateRange?.to) {
      console.log("content.quizEndDate", newDateRange.to);
      setValue("content.quizEndDate", newDateRange.to);
    }

    if (newDateRange?.from) {
      console.log("content.quizStartDate", newDateRange.from);
      setValue("content.quizStartDate", newDateRange.from);
    }
    // Update form data with new date range
    // updateFormData(questions);
  };

  const handleDurationChange = (duration: number) => {
    console.log("Duration changed:", duration);
    setQuizDuration(duration);
    setValue("content.quizDurationInMinutes", duration);
    // Update form data with new duration
    updateFormData(questions);
  };

  const getQuestionError = (questionIndex: number) => {
    const contentErrors = errors.content as any;
    if (contentErrors?.questions?.[questionIndex]) {
      return contentErrors.questions[questionIndex];
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HelpCircle className="h-5 w-5 mr-2" />
          Quiz Questions
        </CardTitle>
        <CardDescription>
          Create multiple choice questions for your quiz. Add as many questions and answer options as needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Settings */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2" />
              Quiz Settings
            </CardTitle>
            <CardDescription>
              Configure when the quiz will be available and how long students have to complete it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Quiz Date Range *
              </Label>
              <div className="border rounded-lg p-4 flex justify-center">
                <Calendar05
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Start:</span> {dateRange?.from ? format(dateRange.from, "MMM dd, yyyy") : "Not selected"}
                </div>
                <div>
                  <span className="font-medium">End:</span> {dateRange?.to ? format(dateRange.to, "MMM dd, yyyy") : "Not selected"}
                </div>
              </div>
              {(errors.content?.quizStartDate || errors.content?.quizEndDate) && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.content?.quizStartDate?.message || errors.content?.quizEndDate?.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Quiz Duration (minutes) *
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={quizDuration}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                  min="1"
                  max="480"
                  className="w-32"
                  placeholder="30"
                />
                <span className="text-sm ">minutes</span>
              </div>
              <p className="text-xs ">
                Duration: {Math.floor(quizDuration / 60)}h {quizDuration % 60}m
              </p>
              {errors.content?.quizDurationInMinutes && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.content.quizDurationInMinutes.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Quiz Questions</h3>
            <Badge variant="outline">{questions.length} question{questions.length !== 1 ? 's' : ''}</Badge>
          </div>

          {questions.map((question, questionIndex) => {
            const questionError = getQuestionError(questionIndex);

            return (
              <Card key={question.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 " />
                      <Badge variant="outline">Question {questionIndex + 1}</Badge>
                    </div>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Question Text *
                    </Label>
                    <Textarea
                      value={question.questionText}
                      onChange={(e) => updateQuestionText(question.id, e.target.value)}
                      placeholder="Enter your question here..."
                      rows={3}
                      className="w-full"
                    />
                    {questionError?.questionText && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {questionError.questionText.message}
                      </p>
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Answer Options *
                    </Label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <RadioGroup
                            value={question.correctOption.toString()}
                            onValueChange={(value) => updateCorrectOption(question.id, parseInt(value))}
                            className="flex items-center"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={optionIndex.toString()}
                                id={`${question.id}-${optionIndex}`}
                              />
                              <Label
                                htmlFor={`${question.id}-${optionIndex}`}
                                className="cursor-pointer"
                              >
                                {question.correctOption === optionIndex ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4 " />
                                )}
                              </Label>
                            </div>
                          </RadioGroup>

                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1"
                          />

                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(question.id, optionIndex)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {question.options.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}

                    {questionError?.options && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {questionError.options.message}
                      </p>
                    )}

                    {questionError?.correctOption && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {questionError.correctOption.message}
                      </p>
                    )}
                  </div>

                  {/* Correct Answer Indicator */}
                  {question.correctOption >= 0 && question.options[question.correctOption] && (
                    <div className="p-3  border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Correct Answer:</strong> {question.options[question.correctOption]}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Question Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>

        {/* Quiz Summary */}
        <div className="p-4  rounded-lg">
          <h4 className="font-medium  mb-2">Quiz Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ">
            <div>
              <span className="font-medium">Total Questions:</span> {questions.length}
            </div>
            <div>
              <span className="font-medium">Total Options:</span> {questions.reduce((acc, q) => acc + q.options.length, 0)}
            </div>
            <div>
              <span className="font-medium">Start Date:</span> {dateRange?.from ? format(dateRange.from, "MMM dd, yyyy") : "Not set"}
            </div>
            <div>
              <span className="font-medium">End Date:</span> {dateRange?.to ? format(dateRange.to, "MMM dd, yyyy") : "Not set"}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {Math.floor(quizDuration / 60)}h {quizDuration % 60}m
            </div>
            <div>
              <span className="font-medium">Max Points:</span> {questions.length} point{questions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Hidden inputs for form registration */}
        <input
          type="hidden"
          {...register("content.questions")}
          value={JSON.stringify(questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption
          })))}
        />
        <input
          type="hidden"
          {...register("content.quizStartDate")}
          value={dateRange?.from?.toISOString() || ""}
        />
        <input
          type="hidden"
          {...register("content.quizEndDate")}
          value={dateRange?.to?.toISOString() || ""}
        />
        <input
          type="hidden"
          {...register("content.quizDurationInMinutes")}
          value={quizDuration}
        />
      </CardContent>
    </Card>
  );
}
