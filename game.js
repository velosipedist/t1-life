const _ = require("lodash");

var exports = module.exports = {};

const WIDTH = 20;
const HEIGHT = 20;
const FRAMERATE = 2000;

let tick;

exports.start = (io, socket, state) => {
    socket.on('join', ({color}) => {
        state.players.push(color);
        io.emit('update', {state});
    });
    socket.on('reset', () => {
        state.matrix = buildEmptyMatrix();
        state.players = [];
        socket.broadcast.emit('reset');
    });
    socket.on('click', ({cells, color}) => {
        for (let [x, y] of cells) {
            state.matrix[y][x].color = color;
            state.matrix[y][x].live = true;
            state.matrix[y][x].neighbours = getNeighbours(state.matrix, x, y);
        }
        io.emit('update', {state});
    });

    if (tick !== undefined) {
        return;
    }
    tick = setInterval(
        () => {
            state.matrix = nextStep(state.matrix);
            io.emit('update', {state});
        },
        FRAMERATE
    );
};

exports.initState = () => {
    return {matrix: buildEmptyMatrix(), players: []};
};

function buildEmptyMatrix() {
    let matrix = [];
    for (let [x, y] of walkMatrix()) {
        matrix[x] || matrix.push([]);
        let xRow = matrix[x];
        xRow.push({live: false, color: '#666666', neighbours: []});
    }
    return matrix;
}


function* walkMatrix() {
    const xTicks = _.range(0, WIDTH);
    const yTicks = _.range(0, HEIGHT);
    for (let y of yTicks) {
        for (let x of xTicks) {
            yield [x, y];
        }
    }
}

function nextStep(matrixPrev) {
    let matrixNew = buildEmptyMatrix();

    for (let [x, y] of walkMatrix()) {
        let neighbours = getNeighbours(matrixPrev, x, y),
            newCell = matrixNew[y][x],
            prevCell = matrixPrev[y][x]
        ;
        newCell.neighbours = neighbours;
        newCell.color = prevCell.color;
        if (prevCell.live) {
            // check whether cell have to die
            newCell.live = !((neighbours.length < 2) || (neighbours.length > 3));
        } else {
            // produce new live cell with average color
            if (neighbours.length == 3) {
                newCell.live = true;
                // newCell.color = matrixPrev[neighbours[0][1]][neighbours[0][0]].color;
                newCell.color = `#${(averageColor(neighbours, matrixPrev))}`;
            }
        }
    }
    return matrixNew;
}

function averageColor(neighbours, matrix) {
    const colorsAround = neighbours
        .map(pair => {
            const [x, y] = pair;
            return matrix[y][x];
        })
        .filter(n => n.live)
        .reduce((components, n) => {
            const rgb = _.chunk(n.color.substr(1, 6), 2)
                .map(hex => {
                    return parseInt(hex.join(''), 16);
                })
            ;
            components.push(rgb);
            return components;
        }, []);
    let c = _.zip(...colorsAround)
        .map(_.mean)
        .map(c => Number(Math.round(c)).toString(16))
        .join('');
    return c;
}

function getNeighbours(matrix, x, y) {
    const
        xRange = [x - 1, x, x + 1],
        yRange = [y - 1, y, y + 1]
    ;

    let liveCells = yRange
        .reduce((all, _y) => {
            for (let _x of xRange) {
                all.push([_x, _y]);
            }
            return all;
        }, []);

    let b = liveCells
        .filter(pair => {
            const [_x, _y] = pair;
            return (matrix[_y] != undefined) &&
                (matrix[_y][_x] != undefined) &&
                !_.isEqual([x, y], [_x, _y]) &&
                matrix[_y][_x].live;
        });
    return b
}

exports.averageColor = averageColor;
exports.getNeighbours = getNeighbours;
