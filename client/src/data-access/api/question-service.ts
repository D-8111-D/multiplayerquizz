const API = "http://localhost:5000/api/questions";

export const fetchQuestions = async (role: string, userId: string) => {
  const res = await fetch(`${API}?role=${role}&user_id=${userId}`);
  return res.json();
};

export const createQuestionApi = async (body: any) => {
  await fetch(API + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

export const deleteQuestionApi = async (
  id: string,
  userId: string,
  role: string,
) => {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, role }),
  });
};
