import { useEffect, useState } from "react";

// Strip any trailing slash: Lambda Function URLs end with one
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/todos`)
      .then((res) => res.json())
      .then(setTodos)
      .catch(() => setError("Could not load todos"));
  }, []);

  async function addTodo(event) {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      const todo = await res.json();
      setTodos([...todos, todo]);
      setTitle("");
    } catch {
      setError("Could not add todo");
    }
  }

  async function deleteTodo(id) {
    setError("");
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch {
      setError("Could not delete todo");
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Todos</h1>

      <form onSubmit={addTodo} style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          required
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}
          >
            {todo.title}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
