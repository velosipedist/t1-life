const _ = require("lodash");

var exports = module.exports = {};

const WIDTH = 20;
const HEIGHT = 20;
const FRAMERATE = 1000;

let $tick;

function sendUpdate(io, state) {
    io.emit('update', {state});
}

exports.start = (io, socket, state) => {
    // new player joined
    socket.on('join', ({color}) => {
        state.players.push(color);
        sendUpdate(io, state);
    });

    // reset is clicked
    socket.on('reset', () => {
        state.matrix = buildEmptyMatrix();
        state.players = [];
        // acknowledging everyone else
        socket.broadcast.emit('reset');
    });

    // some player clicked the cell or drawn predefined pattern
    socket.on('click', ({cells, color}) => {
        for (let [x, y] of cells) {
            state.matrix[y][x] = {
                ...state.matrix[y][x],
                color,
                live: true,
                neighbours: getNeighboursCoords(state.matrix, x, y)
            };
        }
        sendUpdate(io, state);
    });

    if ($tick !== undefined) {
        return;
    }
    $tick = setInterval(
        () => {
            state.matrix = nextStep(state.matrix);
            sendUpdate(io, state);
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
        let neighbours = getNeighboursCoords(matrixPrev, x, y),
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
                newCell.color = averageColor(neighbours, matrixPrev);
            }
        }
    }

    return matrixNew;
}

function averageColor(neighbours, matrix) {
    const colorsAround = neighbours
        // pick cell states from matrix
        .map(pair => {
            const [x, y] = pair;
            return matrix[y][x];
        })
        // only live cells
        .filter(n => n.live)
        // collect RGB sets
        .reduce((components, n) => {
            // split for RGB int components from hex string
            let hexColorValue = n.color.substr(1, 6);
            const rgb = _.chunk(hexColorValue, 2)
                .map(hex => {
                    return parseInt(hex.join(''), 16);
                })
            ;
            components.push(rgb);
            return components;
        }, []);

    // back to HEX
    let colorAveraged = _.zip(...colorsAround)
        .map(_.mean)
        .map(c => Number(Math.round(c)).toString(16))
        .join('');

    return '#' + colorAveraged;
}

function getNeighboursCoords(matrix, x, y) {
    const
        xRange = [x - 1, x, x + 1],
        yRange = [y - 1, y, y + 1]
    ;

    let cellsInRange = yRange
        .reduce((all, _y) => {
            for (let _x of xRange) {
                all.push([_x, _y]);
            }
            return all;
        }, []);

    let liveNeighbours = cellsInRange
        .filter(coords => {
            const [cellX, cellY] = coords;
            const cellState = _.get(matrix, [cellY, cellX]);
            return (
                cellState != undefined
                && !_.isEqual([x, y], coords)
                && cellState.live
            );
        });

    return liveNeighbours;
}

exports.averageColor = averageColor;
exports.getNeighboursCoords = getNeighboursCoords;
