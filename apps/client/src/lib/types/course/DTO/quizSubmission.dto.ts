export interface SubmittedAnswerDto {
    questionIndex: number;
    selectedOption: number;
}

export interface SubmitQuizDto {
    quizId: string;
    answers: SubmittedAnswerDto[];
    timeTakenInSeconds?: number;
    enrollmentId: string;
}

export interface SubmitQuizResponse {
    message: string;
    result: {
        score: number;
        correctAnswers: number;
        totalQuestions: number;
        attemptNumber: number;
        attemptsLeft: number;
        feedback: string;
        submittedAt: Date;
        timeTakenInSeconds?: number;
        detailedAnswers: any[];
    };
    success: boolean;
    error?: string;
}