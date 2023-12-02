const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndserver = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndserver();
const requestQueries = async (request, response, next) => {
  const { search_q, priority, category, status, date } = request.query;
  const { todoId } = request.params;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryIsInArray = categoryArray.includes(category);
    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }
  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArray.includes(category);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }
  if (status !== undefined) {
    const statusArray = ["TODO", "IN PROGRESS", "DONE"];
    const statusIsInArray = categoryArray.includes(category);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }
  if (dueDate !== undefined) {
    try {
      myDate = new Date(dueDate);
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate);
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth()}+1-${myDate.getDate()}`
        )
      );
      console.log(result, "r");
      console.log(new Date(), "new");
      const IsValidDate = await isValid(result);
      console.log(isValidDate, "V");
      if (isValidDate === true) {
        request.date = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.todoId = todoId;
  request.search_q = search_q;
  next();
};
const CheckrequestBody = (request, response, next) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  const todoId = request.params;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryIsInArray = categoryArray.includes(category);
    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }
  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityIsInArray = priorityArray.includes(category);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }
  if (status !== undefined) {
    const statusArray = ["TODO", "IN PROGRESS", "DONE"];
    const statusIsInArray = categoryArray.includes(category);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }
  if (dueDate !== undefined) {
    try {
      myDate = new Date(dueDate);
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate);
      const result = toDate(new Date(formatedDate));
      const isValidDate = isValid(result);
      console.log(isValidDate);
      console.log(isValidDate);
      if (isValidDate === true) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.todo = todo;
  request.id = id;
  request.todoId = todoId;
  next();
};

app.get("/todos/", requestQueries, async (request, response) => {
  const { search_q = "", priority = "", status = "", category = "" } = request;
  console.log(search_q, priority, status, category);
  const gettodosQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE todo LIKE '%${search_q}%' AND status LIKE '%${status}%' AND priority LIKE '%${priority}%' category LIKE '%${category}%';`;
  const data = await db.all(gettodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", requestQueries, async (request, response) => {
  const { todoId } = request;
  const gettodoquery = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE id=${todoid};`;
  const todo = await db.get(gettodoquery);
  response.send(todo);
});
app.get("agenda/", requestQueries, async (request, response) => {
  const { date } = request;
  console.log(date, "a");
  const selectDueDateQuery = `SELECT id,todo,priority,category,status,due_date AS dueDate FROM todo WHERE due_date='${date}';`;
  const result = await db.all(selectDueDateQuery);
  if (result === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    response.send(result);
  }
});
app.post("/todos/", requestQueries, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request;
  const posttodoQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date) VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate});`;
  const postresult = await db.run(posttodoQuery);
  console.log(postresult);
  response.send("Todo Successfully Added");
});
app.put("/todos/:todoId/", requestQueries, async (request, response) => {
  const { todoId } = request;
  const { priority, status, category, dueDate, todo } = request;
  let updateTodoquery = null;
  console.log(priority, todo, status, category, dueDate);
  switch (true) {
    case status !== undefined:
      updateTodoquery = `UPDATE todo SET status='${status}' WHERE id='${todoId}';`;
      await db.run(updateTodoquery);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      updateTodoquery = `UPDATE todo SET priority='${priority}' WHERE id='${todoId}';`;
      await db.run(updateTodoquery);
      response.send("Priority Updated");
      break;
    case todo !== undefined:
      updateTodoquery = `UPDATE todo SET todo='${todo}' WHERE id='${todoId}';`;
      await db.run(updateTodoquery);
      response.send("Todo Updated");
      break;
    case category !== undefined:
      updateTodoquery = `UPDATE todo SET category='${category}' WHERE id='${todoId}';`;
      await db.run(updateTodoquery);
      response.send("Category Updated");
      break;
    case dueDate !== undefined:
      updateTodoquery = `UPDATE todo SET due_date='${dueDate}' WHERE id='${todoId}';`;
      await db.run(updateTodoquery);
      response.send("Due Date Updated");
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletetodo = `DELETE FROM todo WHERE id='${todoId}';`;
  const deltodo = await db.run(deletetodo);
  response.send("Todo Deleted");
});
module.exports = app;
