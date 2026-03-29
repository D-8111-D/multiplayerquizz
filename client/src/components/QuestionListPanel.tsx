import { useEffect, useState } from "react";
import type { Question } from "../data-access/model/types";

const API = "http://localhost:5000/api/questions";

type Props = {
  onSelectionChange: (questions: Question[]) => void;
  isActionable: boolean;
};

export default function QuestionListPanel({
  onSelectionChange,
  isActionable,
}: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionBatch, setQuestionBatch] = useState<Question[]>([]);

  const loadQuestions = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const toggleQuestion = (questionId: string) => {
    let updated: string[];

    if (selected.includes(questionId)) {
      updated = selected.filter((i) => i !== questionId);
    } else {
      updated = [...selected, questionId];
    }

    setSelected(updated);
    onSelectionChange(
      updated
        .map((i) => questions.find((q) => q._id === i)!)
        .filter((q) => q !== undefined),
    );
  };

  return (
    <div className="bg-gradient-to-r from-[#807add] to-[#0f0516]  p-6 border border-gray-700 h-[calc(100%-70px)]">
      <div className="flex justify-between item-center">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
          {isActionable ? " Select Questions" : "Questions"}
        </h2>

        <h2 className="text-xl text-gray-400 mb-4 flex justify-start items-center gap-2 ">
          {isActionable ? "Selected" : "Total Questions"}:{" "}
          {isActionable ? selected.length : questions.length}
        </h2>
      </div>

      {loading && <p>Loading questions...</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto h-[calc(100%-70px)]">
        {questions.map((q, index) => {
          const isSelected = selected.includes(q._id);

          return (
            <div
              key={q._id}
              onClick={() => isActionable && toggleQuestion(q._id)}
              className={`cursor-pointer p-4 rounded-lg border transition
                ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-900/40"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                }`}
            >
              <h3 className="font-semibold mb-2 text-white flex justify-start item-center gap-2">
                Q{index + 1}{" "}
                <p className="text-gray-300 line-clamp-3">{q.question}</p>
              </h3>

              {q.options.map((opt, index) => (
                <span
                  className={`text-sm text-gray-300 line-clamp-3 p-1 pl-3 m-2 border rounded-2xl ${
                    index == q.correct_index - 1
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {opt}
                </span>
              ))}

              {isSelected && (
                <div className="text-indigo-400 text-base mt-2">✓ Selected</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import type { Question } from "../data-access/model/types";

// const API = "http://localhost:5000/api/questions";
// export default function QuestionListPanel() {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const selectedQuestion = questions[selectedIndex];

//   const loadQuestions = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(API, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//       });
//       const data = await res.json();
//       setQuestions(data);
//     } catch (err) {
//       setError("Backend not reachable. Start Flask server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadQuestions();
//   }, []);

//   return (
//     <div className="flex h-[500px] bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
//       {loading && <p>Loading questions...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {questions.length === 0 && !loading && <p>No questions found</p>}
//       {/* LEFT SIDEBAR */}
//       <div className="w-24 bg-gray-800 border-r border-gray-700 overflow-y-auto">
//         {questions.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => setSelectedIndex(index)}
//             className={`w-full py-4 text-center font-bold transition
//               ${
//                 selectedIndex === index
//                   ? "bg-green-600 text-white"
//                   : "text-gray-400 hover:bg-gray-700"
//               }`}
//           >
//             Q{index + 1}
//           </button>
//         ))}
//       </div>

//       {/* RIGHT CONTENT */}
//       <div className="flex-1 p-8 overflow-y-auto">
//         <h2 className="text-2xl font-bold text-white mb-6">
//           Question {selectedIndex + 1}
//         </h2>

//         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
//           <p className="text-lg text-gray-200">{selectedQuestion?.question}</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {selectedQuestion?.options.map((option, i) => (
//             <div
//               key={i}
//               className={`p-4 rounded-lg text-center font-medium transition
//                 ${
//                   i === selectedQuestion.correct_index
//                     ? "bg-green-600 text-white"
//                     : "bg-gray-700 text-gray-300"
//                 }`}
//             >
//               {option}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
