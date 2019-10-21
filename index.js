const express = require("express");
const app = express();
const socket = require('socket.io');
const port = process.env.APP_PORT || 3333;

let game = require("./game.js");

app.use(express.static('public'));

const server = app.listen(port, () => {
    console.log(`Started at port ${port}`)
});
const io = socket(server);

let $gameState = game.initState();
io.on('connection', socket => game.start(io, socket, $gameState));