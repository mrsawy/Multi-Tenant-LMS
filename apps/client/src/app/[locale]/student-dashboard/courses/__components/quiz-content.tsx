import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Label } from '@/components/atoms/label';
import { Progress } from '@/components/atoms/progress';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { submitQuizAction } from '@/lib/actions/courses/content.action';
import { IContent } from '@/lib/types/course/content.interface';
import { ChevronLeft, ChevronRight, Clock, HelpCircle, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useQuizTimer } from '@/lib/hooks/course/useQuizTimer.hook';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import useGeneralStore from '@/lib/store/generalStore';
import { useLocale, useTranslations } from 'next-intl';

interface QuizContentProps {
    content: IContent;
    isComplete: boolean;
    enrollmentId: string
}

const QuizContent: React.FC<QuizContentProps> = ({ isComplete, content, enrollmentId }) => {
    const t = useTranslations('StudentCourses.quizContent');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [completed, setCompleted] = useState(isComplete);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const locale = useLocale()
    const isRTL = locale === 'ar'
    // Initialize timer hook
    const {
        timeRemaining,
        hasStarted,
        isExpired,
        startTimer,
        getElapsedSeconds,
        clearTimer
    } = useQuizTimer(
        content._id,
        content.quizDurationInMinutes || 0
    );

    // Start timer when component mounts (if quiz has duration)
    useEffect(() => {
        if (content.quizDurationInMinutes && !isComplete) {
            startTimer();
        }
    }, [content.quizDurationInMinutes, isComplete, startTimer]);

    // Auto-submit when time expires
    useEffect(() => {
        if (isExpired && !completed && !isSubmitting) {
            handleAutoSubmit();
        }
    }, [isExpired, completed, isSubmitting]);

    const handleAutoSubmit = async () => {
        toast.warning(t('timeExpired'));
        await handleQuizSubmit();
    };

    const getQuestionStatus = (index: number) => {
        return answers[index] !== undefined ? 'answered' : 'unanswered';
    };

    const goToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const nextQuestion = () => {
        if (content.questions && currentQuestionIndex < content.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleQuizSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            useGeneralStore.setState({ generalIsLoading: true })

            if (!content.questions || Object.keys(answers).length < content.questions.length) {
                toast.error(t('pleaseAnswerAll'));
                return;
            }

            // Convert answers to the required format
            const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
                questionIndex: parseInt(questionIndex),
                selectedOption: selectedOption
            }));

            const submissionData = {
                quizId: content._id,
                answers: formattedAnswers,
                timeTakenInSeconds: getElapsedSeconds(),
                enrollmentId
            };

            const result = await submitQuizAction(submissionData);

            if (result.success) {
                setCompleted(true);
                clearTimer(); // Clear timer from storage after successful submission
                toast.success(t('quizSubmitted'));
            } else {
                throw new Error(result.error || t('failedToSubmit'));
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('failedToSubmit'));
        } finally {
            setIsSubmitting(false);
            useGeneralStore.setState({ generalIsLoading: false })

        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}${t('minutesShort')} ${secs}${t('secondsShort')}`;
        }
        return `${secs}${t('secondsShort')}`;
    };

    const currentQuestion = content?.questions?.[currentQuestionIndex];
    const totalQuestions = content?.questions?.length;
    const answeredQuestions = Object.keys(answers).length;

    if (!currentQuestion || !totalQuestions) {
        return (
            <div className="text-center py-12">
                <HelpCircle className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">{t('noQuestionsAvailable')}</h3>
                <p className="text-gray-600 mb-4">{t('noQuestionsDescription')}</p>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('quizCompleted')}</h3>
                <p className="text-gray-600">{t('alreadySubmitted')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Time Warning */}
            {content.quizDurationInMinutes && timeRemaining <= 300 && timeRemaining > 0 && (
                <Alert className="mb-6 border-orange-300 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        {t('onlyRemaining', { time: formatTime(timeRemaining) })}
                    </AlertDescription>
                </Alert>
            )}

            {/* Quiz Progress */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{t('quizProgress')}</CardTitle>
                        <div className="flex items-center gap-4">
                            {content.quizDurationInMinutes && (
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 ${timeRemaining <= 300 ? 'border-orange-400 text-orange-700' : ''
                                        }`}
                                >
                                    <Clock className="w-3 h-3" />
                                    {formatTime(timeRemaining)}
                                </Badge>
                            )}
                            <Badge variant="outline">
                                {answeredQuestions} {t('ofAnswered', { total: totalQuestions })}
                            </Badge>
                        </div>
                    </div>
                    <Progress value={(answeredQuestions / totalQuestions) * 100} className="h-2" />
                </CardHeader>
            </Card>

            {/* Question Numbers Navigation */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-sm">{t('questions')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(content.questions) && content.questions.map((_, index) => (
                            <Button
                                key={index}
                                variant={currentQuestionIndex === index ? "default" : "outline"}
                                size="sm"
                                className={`w-10 h-10 ${getQuestionStatus(index) === 'answered'
                                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                                    : ''
                                    }`}
                                onClick={() => goToQuestion(index)}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Current Question */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                            {t('questionOf', { current: currentQuestionIndex + 1, total: totalQuestions })}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-semibold mb-6">{currentQuestion.questionText}</h3>
                    <RadioGroup
                        value={answers[currentQuestionIndex]?.toString() || ""}
                        onValueChange={(value) =>
                            setAnswers(prev => ({ ...prev, [currentQuestionIndex]: parseInt(value) }))
                        }
                    >
                        {currentQuestion.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-3 p-3 rounded-lg rtl:flex-row-reverse rtl:gap-4  ">
                                <RadioGroupItem value={optionIndex.toString()} id={`option-${optionIndex}`} />
                                <Label htmlFor={`option-${optionIndex}`} className="text-base cursor-pointer rtl:text-end ">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                    className='flex flex-row!'
                >
                    {!isRTL ? <ChevronLeft className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                    {t('previous')}
                </Button>

                <div className="flex gap-4">
                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <Button
                            onClick={handleQuizSubmit}
                            size="lg"
                            disabled={isSubmitting || Object.keys(answers).length < totalQuestions}
                        >
                            {isSubmitting ? t('submitting') : t('submitQuiz')}
                        </Button>
                    ) : (
                        <Button onClick={nextQuestion} disabled={isSubmitting} className='flex flex-row!'>
                            {t('next')}
                            {isRTL ? <ChevronLeft className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizContent;