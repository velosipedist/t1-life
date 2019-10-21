const _ = require("lodash");

var exports = module.exports = {};

const WIDTH = 20;
const HEIGHT = 20;
const FRAMERATE = 2000;

let tick;

exports.start = (io, socket, state) => {
    socket.on('reset', () => {
        state.matrix = buildEmptyMatrix()
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
    return {matrix: buildEmptyMatrix()};
};

function buildEmptyMatrix() {
    let matrix = [];
    for (let [x, y] of walkMatrix()) {
        matrix[x] || matrix.push([]);
        let xRow = matrix[x];
        xRow.push({live: false, color: "#FFFFFF", neighbours: []});
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

function averageColor(neighbours) {
    const colorsAround = neighbours
        .filter(n => n.live)
        .reduce((components, n) => {
            const rgb = _.chunk(n.color.substr(1, 6), 2)
                .map(hex => {
                    return parseInt(hex.join(''), 16);
                })
            ;
            return components.concat([rgb]);
        }, []);
    return _.zip(colorsAround)
        .map(_.mean)
        .map(c => Number(c).toString(16)
        ).join('');
}

function nextStep(matrixPrev) {
    // console.table(stateMatrixPrev.map(c => c.map( c2 => `${c2.color}` )));
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
                newCell.color = `#${(averageColor(neighbours))}`;
            }
        }
    }
    return matrixNew;
}

function getNeighbours(matrix, x, y) {
    const
        xCoords = [x - 1, x, x + 1],
        yCoords = [y - 1, y, y + 1]
    ;

    return yCoords
        .reduce((all, _y) => {
            for (let _x of xCoords) {
                all.push([_x, _y]);
            }
            return all;
        }, [])
        .filter(pair => {
            const [_x, _y] = pair;
            return (matrix[_y] != undefined) &&
                (matrix[_y][_x] != undefined) &&
                !_.isEqual([x, y], [_x, _y]) &&
                matrix[_y][_x].live;
        }).map(pair => {
            const [_x, _y] = pair;
            return matrix[_y][_x];
        })
}


