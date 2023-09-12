import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { type ServeOptions } from 'bun'
import { Database } from 'bun:sqlite'
import { DangerScript } from './components/DangerScript'

interface Todo {
  id: number;
  todo: string;
}

const app = new Hono()

// DB setup
const db = new Database("bunlearn.sqlite", { create: true })

// create table if not existing
const create = db.query(`CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, todo TEXT);`)
create.run()

// components
const Layout = (props: { children?: any }) => {
  return (
    <html>
      <head>
        <title>Bun Learn</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
        <link rel="stylesheet" type="text/css" href="styles.css" />
      </head>
      <body>{props.children}</body>
    </html>
  )
}

const Greet = (props: { messages: Todo[] } ) => {
  function createNewTodos() {
    console.log("POST!!")
    // @ts-ignore
    const newTodo = document.getElementById("new_todo").value.trim()

    if (newTodo === "") {
      alert("Please type in a new todo to add")
      return
    }

    fetch("/todo/new", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        todo: newTodo,
      })
    })
    .then((response) => response.json())
    .then((json) => {
      console.log(json)
      // @ts-ignore
      window.location.reload()
    });
  }

  function clearAllTodos() {
    console.log("CLEAR ALL TODOS!!")
    fetch("/todo/delete/all", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      // body: JSON.stringify({
      //   name: myName,
      //   password: myPassword
      // })
    })
    .then((response) => response.json())
    .then((json) => {
      console.log(json)
      // @ts-ignore
      window.location.reload()
    });
  }

  return (
    <Layout>
      <div class={["content_container"]}>
        <h1>Hello there!</h1>
        <ul>
          {
            props.messages.map((msg) => {
              return <li>{msg.todo}</li>
            })
          }
        </ul>
        <div class={["button_container"]}>
          <input type="text" name="new_todo" id="new_todo" />
          <button class={["interaction_button"]} onclick="createNewTodos()" >ADD NEW TODO</button>
          <DangerScript function={createNewTodos} />
          <button class={["interaction_button"]} onclick="clearAllTodos()" >CLEAR ALL TODOS</button>
          <DangerScript function={clearAllTodos} />
        </div>
      </div>
    </Layout>
  )
}

// paths
app.get('/', (c) => {
  // get data from db
  const todosQuery = db.query("SELECT * FROM todos;")
  const results = todosQuery.all() as Todo[]

  const page = <Greet messages={results} />

  return c.html(page)
})
app.use('/favicon.ico', serveStatic({ path: './src/public/favicon.ico' }))
app.use('/styles.css', serveStatic({ path: './src/public/styles.css' }))
app.post("/todo/new", async (c) => {
  const {todo}: {todo: string} = await c.req.json()

  if (todo === "") {
    return c.json({ message: `todo cannot be empty string`}, 400)
  }

  const insert = db.prepare("INSERT INTO todos (todo) VALUES ($todo)")
  const insertTodos = db.transaction(todos => {
    for (const todo of todos) insert.run(todo)
    return todos.length
  })

  const count = insertTodos([
    {$todo: todo},
  ])

  return c.json({ message: `${count} new todos added`})
})
app.post("/todo/delete/all", (c) => {
  const deleteCall = db.query("DELETE FROM todos")
  deleteCall.run()

  return c.json({ message: "todos deleted"})
})


// port settings
const port = process.env.PORT || 7788

console.log(`Listening on localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
} as ServeOptions