export type Player = {
  id: string;
  name: string;
  score: number;
  answers: {
    [key: number]: {
      answer: number;
      time_taken: number;
      correct: boolean;
      score: number;
    };
  };
  joined_at: number;
};

export type Question = {
  _id: string;
  question: string;
  options: string[];
  correct_index: number;
  question_set_id: string;
  title: string;
  media?: {
    image?: string | null;
    audio?: string | null;
    video?: string | null;
  };
  created_by: string;
  created_by_id: string;
  created_by_role: string;
  createdAt: string;
};
export type QuestionSocket = {
  question: string;
  options: string[];
  correct_index: number;
};

export type Room = {
  code: string;
  host_sid: string;
  status: "LOBBY" | "IN_GAME" | "ENDED";
  current_question_index: number;
  current_question_start_time: number | null;
  questions: QuestionSocket[];
  max_time: number;
};

export type View = "HOME" | "HOST_SETUP" | "LOBBY" | "GAME" | "RESULTS";

export type AnswerStatus = {
  qIndex: number;
  status: "pending" | "received";
};
// // Define the shape of player data received for the leaderboard
// export interface PlayerScore {
//   username: string;
//   score: number;
// }

// // Define the shape of a question broadcasted by the server
// export interface QuestionData {
//   q_num: number;
//   question: string;
//   options: string[];
// }

// // Define the shape of the private feedback received after submitting an answer
// export interface AnswerFeedback {
//   correct: boolean;
//   your_answer: string;
//   correct_answer: string;
// }

// // Define the shape of the status when trying to join the game
// export interface JoinStatus {
//     success: boolean;
//     username?: string;
//     message: string;
// }
