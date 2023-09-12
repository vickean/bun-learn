import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

interface ExportObject {
  port: string | number
  fetch: any // need to fix this at some point. 
}

const app = new Hono()

// components
const Layout = (props: { children?: any }) => {
  return (
    <html>
      <head>
        <title>Bun Learn</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
      </head>
      <body>{props.children}</body>
    </html>
  )
}

const Greet = (props: { messages: string[] } ) => {
  return (
    <Layout>
      <h1>Hello there!</h1>
      <ul>
        {
          props.messages.map((msg) => {
            return <li>{msg}</li>
          })
        }
      </ul>
    </Layout>
  )
}

// paths
app.get('/', (c) => {
  const messages = ["Good Morning", "Good Afternoon", "Good Night"]
  const page = <Greet messages={messages} />

  return c.html(page)
})
app.use('/favicon.ico', serveStatic({ path: './src/public/favicon.ico' }))

const port = process.env.PORT || 7788

const exportObject: ExportObject = {
  port,
  fetch: app.fetch,
}

console.log(`Listening on localhost:${port}`)

export default exportObject