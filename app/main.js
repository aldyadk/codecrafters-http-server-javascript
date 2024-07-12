const net = require("net");
const fs = require('fs');

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {

  socket.on("close", () => {
    socket.end();
  });

  socket.on('data', (data) => {
    const directory = process.argv[3]
    const [request, ...rest] = data.toString().split('\r\n');
    const [method, path, version] = request.split(' ');
    const [_, pathA, pathB] = path.split('/');
    const emptyLineIndex = rest.indexOf('');
    const headers = rest.slice(0, emptyLineIndex);
    const body = rest.slice(emptyLineIndex);
    const splitheaders = headers.map(header => header.split(': '));

    if (method === 'GET' && path === '/') {
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
    } else if (method === 'GET' && pathA === 'echo' && !!pathB) {
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${pathB.length}\r\n\r\n${pathB}`)
    } else if (method === 'GET' && path === '/user-agent') {
      const headerValue = splitheaders.find(header => header[0] === 'User-Agent')[1];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${headerValue.length}\r\n\r\n${headerValue}`)
    } else if (method === 'GET' && pathA === 'files' && !!pathB) {
      const filePath = `${directory}/${pathB}`;
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error reading stat:', err);
          return socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        }
        fs.readFile(filePath, 'utf8', (err, content) => {
          if (err) {
            console.error('Error reading file:', err);
            return socket.write('HTTP/1.1 404 Not Found\r\n\r\n');;
          }
          socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${stats.size}\r\n\r\n${content}`)
        });
      });
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    }
  });
});

server.listen(4221, "localhost");
