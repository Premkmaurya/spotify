const app = require("./src/app");
const connectDB = require("./src/db/db");
const http = require('http')
const initServer = require("./src/sockets/socket.server")


connectDB();

const httpServer = http.createServer(app)

initServer(httpServer)

httpServer.listen(3001, () => {
    console.log('Music service is running on port 3001');
});