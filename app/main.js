const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', (data) => {
    const [request,headers,body] = data.toString().split('\r\n');
    const [method, path, version] = request.split(' ');
    const [headerName, headerValue] = headers.split(': ');
    // console.log(`Received request: ${request}`);
    // console.log(`headers: ${headers}`);
    // console.log(`Received body: ${body}`);
    if(method === 'GET' && path === '/') {
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    }
  });
});

server.listen(4221, "localhost");
