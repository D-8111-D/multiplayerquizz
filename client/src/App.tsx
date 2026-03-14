import { useState } from "react";
import "./App.css";
import AiQuestionGenerator from "./components/AIQuestionGenerator";
import { Route, Routes } from "react-router-dom";
import QuizzApp from "./components/QuizzApp";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      <Route path="/" element={<QuizzApp />} />
      <Route path="/admin/ai-generator" element={<AiQuestionGenerator />} />
      <Route path="/admin/questions" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;
