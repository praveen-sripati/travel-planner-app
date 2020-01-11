const app = require('./server_app');

// Setup Server
const port = 8000;

const server = app.listen(port, listening);

function listening() {
  console.log('server is running...')
  console.log(`port is ${port}`);
}