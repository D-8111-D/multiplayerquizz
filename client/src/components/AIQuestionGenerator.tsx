import { useState, type JSX } from "react";
import type { QuizQuestion } from "../data-access/model/quizz-question";
import QuestionListPanel from "./QuestionListPanel";
import type { Question } from "../data-access/model/types";

const BACKEND = "http://localhost:5000/api/questions";

const AiQuestionGenerator = (): JSX.Element => {
  const [prompt, setPrompt] = useState<string>("");
  const [count, setCount] = useState<number>(5);
  const [questionSetId, setQuestionSetId] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [title, setTitle] = useState("");
  const userId = "user123";
  const userName = "Deepshikha";
  const createdById = "Admin123";
  const role = "ADMIN";
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [displayQuestionSetForm, setDisplayQuestionSetForm] =
    useState<boolean>(true);
  const startNewSet = () => {
    if (!title) return alert("Enter set title (e.g. Fruits)");

    const id = `SET_${Date.now()}`; // 🔥 unique ID
    setQuestionSetId(id);

    // alert(`New Question Set Created: ${title}`);
    setDisplayQuestionSetForm(false);
  };

  const generateQuestions = async (): Promise<void> => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          count,
          question_set_id: questionSetId,
          title,
          created_by: userName,
          user_id: userId,
          created_by_role: role,
          created_by_id: createdById,
        }),
      });

      if (!res.ok) throw new Error();

      const data: QuizQuestion[] = await res.json();
      setQuestions(data);
    } catch {
      setError("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh_-_75px)] p-6 text-white flex flex-col md:flex-row gap-6">
      <div className="w-[40%] space-y-6">
        {/* Header */}
        <h1 className="text-4xl font-bold text-yellow-400">
          AI Quiz Generator
        </h1>
        {!displayQuestionSetForm && (
          <div className="w-[100%] bg-white rounded-xl p-4 mb-6 shadow">
            <h2 className="text-gray-900 ">
              <b>Question Set : {title}</b>
            </h2>
          </div>
        )}
        {displayQuestionSetForm && (
          <div
            style={styles.card}
            className="bg-gradient-to-r from-[#0f0516] to-[#807add] p-6 rounded-2xl shadow-lg space-y-4"
          >
            <h2 style={styles.cardTitle}>📦 Create Question Set</h2>

            <input
              style={styles.input}
              placeholder="Enter Set Title (e.g. Fruits)"
              className="w-24 p-2 rounded bg-black/40 border border-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex justify-end">
              <button style={styles.primaryBtn} onClick={startNewSet}>
                ➕ Start New Set
              </button>
            </div>
          </div>
        )}
        {/* Input Section */}
        <div className="bg-gradient-to-r from-[#0f0516] to-[#807add]  p-6 rounded-2xl shadow-lg space-y-4">
          <textarea
            className="w-full p-4 rounded-xl bg-black/40 border border-gray-600 focus:outline-none"
            rows={4}
            placeholder="Enter topic, paragraph or prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24 p-2 rounded bg-black/40 border border-gray-600"
            />

            <button
              onClick={generateQuestions}
              disabled={loading}
              className="bg-pink-600 px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {error && <p className="text-red-400">{error}</p>}
        </div>

        {/* Questions Grid */}
        {questions.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {questions.map((q, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition"
              >
                <h3 className="font-semibold text-lg mb-3 text-green-400">
                  Q{index + 1}. {q.question}
                </h3>

                <ul className="space-y-2">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`p-2 rounded-lg text-sm ${
                        i === q.correct_index
                          ? "bg-green-600/70"
                          : "bg-gray-700/60"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>

                {q.media?.image && (
                  <img
                    src={q.media.image}
                    alt="question"
                    className="mt-3 rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* -------- LIST CARD -------- */}
      <div className="w-[60%]">
        <QuestionListPanel
          onSelectionChange={(q) => setSelectedQuestions(q)}
          isActionable={false}
        />
      </div>
    </div>
  );
};

export default AiQuestionGenerator;

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    height: "calc(100vh - 75px)",
  },
  heading: {
    textAlign: "center",
    color: "#fff",
    marginBottom: "30px",
    fontSize: "28px",
  },
  card: {
    width: "100%",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px",
  },
  cardTitle: {
    marginBottom: "15px",
  },
  label: {
    fontWeight: 600,
    marginTop: "10px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  primaryBtn: {
    marginTop: "10px",
    padding: "10px 15px",
    border: "none",
    borderRadius: "6px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  questionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
  deleteBtn: {
    background: "#ff4d4f",
    border: "none",
    color: "white",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

// import { useState, type JSX } from "react";
// import type { QuizQuestion } from "../data-access/model/quizz-question";

// const BACKEND = "http://localhost:5000/api/questions";
// const userId = "user123";
// const userName = "Deepshikha";
// const createdById = "Admin123";
// const role = "ADMIN";
// const AiQuestionGenerator = (): JSX.Element => {
//   const [prompt, setPrompt] = useState<string>("");
//   const [count, setCount] = useState<number>(5);
//   const [questions, setQuestions] = useState<QuizQuestion[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   const generateQuestions = async (): Promise<void> => {
//     if (!prompt.trim()) return;

//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch(`${BACKEND}/ai/generate`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           prompt,
//           count,
//           created_by: userName,
//           user_id: userId,
//           created_by_role: role,
//           created_by_id: createdById,
//         }),
//       });

//       if (!res.ok) {
//         throw new Error("Failed to generate questions");
//       }

//       const data: QuizQuestion[] = await res.json();
//       setQuestions(data);
//     } catch (err) {
//       setError("AI question generation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-[100%]  p-6 bg-gradient-to-r from-[#1007a1] to-[#280349] h-[calc(100%-70px)] rounded-xl text-white">
//       <h2 className="text-3xl font-bold text-yellow-400 mb-4">
//         AI Quiz Question Generator
//       </h2>

//       {/* Prompt */}
//       <textarea
//         className="w-full p-3 rounded bg-gray-800 mb-3"
//         rows={4}
//         placeholder="Enter topic, paragraph or prompt..."
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//       />

//       {/* Controls */}
//       <div className="flex items-center gap-4 mb-4">
//         <label className="text-gray-300">Questions:</label>

//         <input
//           type="number"
//           min={1}
//           max={20}
//           value={count}
//           onChange={(e) => setCount(Number(e.target.value))}
//           className="w-20 p-2 rounded bg-gray-800"
//         />

//         <button
//           onClick={generateQuestions}
//           disabled={loading}
//           className="bg-pink-600 px-6 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
//         >
//           {loading ? "Generating..." : "Generate"}
//         </button>
//       </div>

//       {/* Error */}
//       {error && <p className="text-red-400">{error}</p>}

//       {/* Result */}
//       {questions.length > 0 && (
//         <div className="mt-6">
//           <h3 className="text-xl font-bold text-green-400 mb-3">
//             Generated Questions
//           </h3>

//           {questions.map((q, index) => (
//             <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
//               <p className="font-semibold mb-2">
//                 Q{index + 1}. {q.question}
//               </p>

//               <ul className="space-y-1">
//                 {q.options.map((opt, i) => (
//                   <li
//                     key={i}
//                     className={`p-2 rounded ${
//                       i === q.correct_index ? "bg-green-700" : "bg-gray-700"
//                     }`}
//                   >
//                     {opt}
//                   </li>
//                 ))}
//               </ul>

//               {/* Media preview (future ready) */}
//               {q.media?.image && (
//                 <img
//                   src={q.media.image}
//                   alt="question"
//                   className="mt-2 rounded"
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AiQuestionGenerator;
