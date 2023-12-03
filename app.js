const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());
let db;
const initializeDbAndserver = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error is ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndserver();
const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.Priority !== undefined;
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityAndCategoryProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};
const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const convertdbobject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let gettodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          gettodosQuery = `SELECT * FROM todo WHERE status='${status}' AND priority='${priority}';`;
          data = await db.all(gettodosQuery);
          response.send(data.map((eachItem) => convertdbobject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryAndStatusProperty(request.query):
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          gettodosQuery = `SELECT * FROM todo WHERE category='${category}' AND status='${status}';`;
          data = await db.all(gettodosQuery);
          response.send(data.map((eachItem) => convertdbobject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriorityProperty(request.query):
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          gettodosQuery = `SELECT * FROM todo WHERE category='${category}' AND priority='${priority}';`;
          data = await db.all(gettodosQuery);
          response.send(data.map((eachItem) => convertdbobject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        gettodosQuery = `SELECT * FROM todo WHERE priority='${priority}';`;
        data = await db.all(gettodosQuery);
        response.send(data.map((eachItem) => convertdbobject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        gettodosQuery = `SELECT * FROM todo WHERE status='${status}';`;
        data = await db.all(gettodosQuery);
        response.send(data.map((eachItem) => convertdbobject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasSearchProperty(request.query):
      gettodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      data = await db.all(gettodosQuery);
      response.send(data.map((eachItem) => convertdbobject(eachItem)));
      break;
    case hasCategoryProperty(request.query):
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        gettodosQuery = `SELECT * FROM todo WHERE category='${category}';`;
        data = await db.all(gettodosQuery);
        response.send(data.map((eachItem) => convertdbobject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      gettodosQuery = `SELECT * FROM todo;`;
      data = await db.all(gettodosQuery);
      response.send(data.map((eachItem) => convertdbobject(dbObject)));
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettodoquery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todo = await db.get(gettodoquery);
  response.send(convertdbobject(todo));
});
app.get("agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newdate = format(new Date(date), "yyyy-MM-date");
    console.log(newdate);
    const getdate = `SELECT * FROM todo WHERE due_date='${newdate}';`;
    const result = await db.all(getdate);
    response.send(result.map((eachItem) => convertdbobject(eachItem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (sattatus === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postnewdate = format(new Date(dueDate), "yyyy-MM-dd");
          posttodoQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date) VALUES (${id},'${todo}','${priority}','${status}','${category}','${postnewdate}';`;
          const postresult = await db.run(posttodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updatecolumn = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const previoustodo = await db.get(previousQuery);
  const {
    todo = previoustodo.todo,
    priority = previoustodo.priority,
    status = previoustodo.status,
    category = previoustodo.category,
    dueDate = previoustodo.dueDate,
  } = request.body;
  let updateTodoQuery;
  switch (true) {
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}' WHERE id='${todoId}';`;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}' WHERE id='${todoId}';`;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case requestBody.category !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}' WHERE id='${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case requestBody.todo !== undefined:
      updateTodoQuery = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}' WHERE id='${todoId}';`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        const updateNewdate = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',due_date='${dueDate}' WHERE id='${todoId}';`;
        await db.run(updateNewdate);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
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
