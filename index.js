const express = require("express");
const app = express();
const socket = require('socket.io');
const port = process.env.PORT || 3333;

let game = require("./backend/game");

app.use(express.static('public'));

const server = app.listen(port, () => {
    console.log(`Started at port ${port}`)
});
const io = socket(server);

let $gameState = game.initState();
io.on('connection', socket => game.start(io, socket, $gameState));