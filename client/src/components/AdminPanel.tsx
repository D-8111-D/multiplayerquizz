import { useEffect, useState } from "react";
import type { Question } from "../data-access/model/types";

const API = "http://localhost:5000/api/questions";

export default function AdminPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 🔥 NEW: Question Set State
  const [displayQuestionSetForm, setDisplayQuestionSetForm] =
    useState<boolean>(true);
  const [questionSetId, setQuestionSetId] = useState<string>("");
  const [title, setTitle] = useState("");

  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_index: 1,
  });

  // hardcoded user
  const userId = "user123";
  const userName = "Deepshikha";
  const createdById = "Admin123";
  const role = "ADMIN";

  // -------- load ----------
  const loadQuestions = async () => {
    try {
      if (!questionSetId) return; // 🔥 only load if set is created
      setLoading(true);
      const res = await fetch(`${API}/${questionSetId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError("Backend not reachable. Start Flask server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const startNewSet = () => {
    if (!title) return alert("Enter set title (e.g. Fruits)");

    const id = `SET_${Date.now()}`; // 🔥 unique ID
    setQuestionSetId(id);

    // alert(`New Question Set Created: ${title}`);
    setDisplayQuestionSetForm(false);
  };

  // -------- update option ----------
  const updateOption = (i: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[i] = value;
    setForm({ ...form, options: newOptions });
  };

  // -------- create ----------
  const createQuestion = async () => {
    if (!form.question) return alert("Enter question");

    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        question_set_id: questionSetId, // 🔥 NEW
        title: title,
        created_by: userName,
        user_id: userId,
        created_by_role: role,
        created_by_id: createdById,
      }),
    });

    setForm({
      question: "",
      options: ["", "", "", ""],
      correct_index: 1,
    });

    loadQuestions();
  };

  // -------- delete ----------
  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;

    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, created_by_role: role }),
    });

    loadQuestions();
  };

  return (
    <div
      style={styles.page}
      className="bg-gradient-to-r from-[#1007a1] to-[#280349]"
    >
      <h2 style={styles.heading}>🎯 Admin Question Panel</h2>

      {/* -------- QUESTION SET -------- */}

      {!displayQuestionSetForm && (
        <div className="w-[100%] rounded-xl p-4 mb-6 shadow">
          <h2 className="text-gray-900 ">
            <b>Question Set : {title}</b>
          </h2>
        </div>
      )}

      <div className="flex justify-between gap-2">
        {/* -------- FORM CARD -------- */}
        {displayQuestionSetForm && (
          <div
            style={styles.card}
            className="bg-gradient-to-r from-[#0f0516] to-[#807add]"
          >
            <h2 style={styles.cardTitle}>📦 Create Question Set</h2>

            <input
              style={styles.input}
              placeholder="Enter Set Title (e.g. Fruits)"
              value={title}
              className="w-24 p-2 rounded bg-black/40 border border-gray-600"
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex justify-end">
              <button style={styles.primaryBtn} onClick={startNewSet}>
                ➕ Start New Set
              </button>
            </div>
          </div>
        )}
        {!displayQuestionSetForm && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Create New Question</h2>

            <label style={styles.label}>Question</label>
            <input
              style={styles.input}
              value={form.question}
              placeholder="Enter question text"
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />

            <label style={styles.label}>Options</label>
            <div style={styles.optionGrid}>
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  style={styles.input}
                  value={opt}
                  placeholder={`Option ${i + 1}`}
                  onChange={(e) => updateOption(i, e.target.value)}
                />
              ))}
            </div>

            <label style={styles.label}>Correct Option Index (1-4)</label>
            <input
              style={styles.input}
              type="number"
              min={1}
              max={4}
              value={form.correct_index}
              onChange={(e) =>
                setForm({ ...form, correct_index: Number(e.target.value) })
              }
            />

            <button style={styles.primaryBtn} onClick={createQuestion}>
              ➕ Create Question
            </button>
          </div>
        )}

        {/* -------- LIST CARD -------- */}
        <div
          style={styles.card}
          className="bg-gradient-to-r from-[#0f0516] to-[#807add]"
        >
          <h2 style={styles.cardTitle}>📋 Question List</h2>

          {loading && <p>Loading questions...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {questions.length === 0 && !loading && <p>No questions found</p>}

          {questions.map((q) => (
            <div key={q._id} style={styles.questionItem}>
              <div>
                <h3 style={{ margin: 0 }}>{q.question}</h3>
                <p style={{ margin: "5px 0" }}>
                  Options: {q.options.join(" | ")}
                </p>
                <small>
                  Correct: {q.options[q.correct_index - 1]} | By: {q.created_by}
                </small>
              </div>

              {/* <button
                style={styles.deleteBtn}
                onClick={() => deleteQuestion(q._id)}
              >
                🗑 Delete
              </button> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------- STYLES --------
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
    width: "50%",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
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
