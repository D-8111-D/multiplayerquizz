export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  media?: {
    image?: string | null;
    audio?: string | null;
    video?: string | null;
  };
}
