import { useEffect, useState } from "react";
import type { Question } from "../data-access/model/types";

const API = "http://localhost:5000/api/questions";

export default function AdminPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_index: 0,
  });

  // hardcoded user
  const userId = "user123";
  const userName = "Deepshikha";
  const createdById = "Admin123";
  const role = "ADMIN";

  // -------- load ----------
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(API, {
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
        created_by: userName,
        user_id: userId,
        created_by_role: role,
        created_by_id: createdById,
      }),
    });

    setForm({
      question: "",
      options: ["", "", "", ""],
      correct_index: 0,
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
    <div style={styles.page}>
      <h1 style={styles.heading}>🎯 Admin Question Panel</h1>

      {/* -------- FORM CARD -------- */}
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

        <label style={styles.label}>Correct Option Index (0–3)</label>
        <input
          style={styles.input}
          type="number"
          min={0}
          max={3}
          value={form.correct_index}
          onChange={(e) =>
            setForm({ ...form, correct_index: Number(e.target.value) })
          }
        />

        <button style={styles.primaryBtn} onClick={createQuestion}>
          ➕ Create Question
        </button>
      </div>

      {/* -------- LIST CARD -------- */}
      <div style={styles.card}>
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
                Correct: {q.correct_index} | By: {q.created_by}
              </small>
            </div>

            <button
              style={styles.deleteBtn}
              onClick={() => deleteQuestion(q._id)}
            >
              🗑 Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- STYLES --------
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
  },
  card: {
    background: "#fff",
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
