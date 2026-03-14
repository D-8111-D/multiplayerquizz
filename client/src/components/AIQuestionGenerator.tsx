import { useState, type JSX } from "react";
import type { QuizQuestion } from "../data-access/model/quizz-question";

const BACKEND = "http://localhost:5000/api/questions";
const userId = "user123";
const userName = "Deepshikha";
const createdById = "Admin123";
const role = "ADMIN";
const AiQuestionGenerator = (): JSX.Element => {
  const [prompt, setPrompt] = useState<string>("");
  const [count, setCount] = useState<number>(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const generateQuestions = async (): Promise<void> => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND}/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          count,
          created_by: userName,
          user_id: userId,
          created_by_role: role,
          created_by_id: createdById,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate questions");
      }

      const data: QuizQuestion[] = await res.json();
      setQuestions(data);
    } catch (err) {
      setError("AI question generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl text-white">
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">
        AI Quiz Question Generator
      </h2>

      {/* Prompt */}
      <textarea
        className="w-full p-3 rounded bg-gray-800 mb-3"
        rows={4}
        placeholder="Enter topic, paragraph or prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {/* Controls */}
      <div className="flex items-center gap-4 mb-4">
        <label className="text-gray-300">Questions:</label>

        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 p-2 rounded bg-gray-800"
        />

        <button
          onClick={generateQuestions}
          disabled={loading}
          className="bg-pink-600 px-6 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-400">{error}</p>}

      {/* Result */}
      {questions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold text-green-400 mb-3">
            Generated Questions
          </h3>

          {questions.map((q, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
              <p className="font-semibold mb-2">
                Q{index + 1}. {q.question}
              </p>

              <ul className="space-y-1">
                {q.options.map((opt, i) => (
                  <li
                    key={i}
                    className={`p-2 rounded ${
                      i === q.correct_index ? "bg-green-700" : "bg-gray-700"
                    }`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>

              {/* Media preview (future ready) */}
              {q.media?.image && (
                <img
                  src={q.media.image}
                  alt="question"
                  className="mt-2 rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiQuestionGenerator;
