# Todo App

A public todo list with no users or auth: React on S3, Node on Lambda (via Lambda Web Adapter), and DynamoDB.

## API

| Method | Path         | Body                | Response                          |
| ------ | ------------ | ------------------- | --------------------------------- |
| GET    | /todos       |                     | 200 `[{ id, title, createdAt }]`  |
| POST   | /todos       | `{ "title": "..." }` | 201 `{ id, title, createdAt }`, 400 if no title |
| DELETE | /todos/:id   |                     | 204                               |
