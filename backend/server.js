import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  PutCommand,
  paginateScan,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME || "Todos";
const PORT = process.env.PORT || 8080;

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const app = express();
app.use(cors());
app.use(express.json());

// List all todos, oldest first
app.get("/api/todos", async (req, res) => {
  const todos = [];
  for await (const page of paginateScan({ client: db }, { TableName: TABLE_NAME })) {
    todos.push(...page.Items);
  }
  todos.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  res.json(todos);
});

// Create a todo
app.post("/api/todos", async (req, res) => {
  const title = req.body?.title;
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const todo = {
    id: randomUUID(),
    title: title.trim(),
    createdAt: new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: TABLE_NAME, Item: todo }));
  res.status(201).json(todo);
});

// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id: req.params.id } }));
  res.status(204).end();
});

// Web Functions provide the address to bind; the fallback is for local runs
const [host, port] = (process.env.AWS_LAMBDA_HTTP_ENDPOINT || `0.0.0.0:${PORT}`).split(":");
app.listen(Number(port), host, () => console.log(`API listening on ${host}:${port}`));
