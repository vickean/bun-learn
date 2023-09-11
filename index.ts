const server = Bun.serve({
  port: 7788,
  fetch(request) {
    return new Response("Welcome to Bun! Fluff says Hi!");
  },
});

console.log(`Listening on localhost:${server.port}`);
