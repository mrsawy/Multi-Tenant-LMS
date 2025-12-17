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
