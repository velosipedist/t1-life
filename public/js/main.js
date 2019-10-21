const $socket = io();
const $field = $('#life');

class Cell {
    live = false;
    color;
    neighbours = [];

    constructor(cellState) {
        this.color = cellState.color || '#FFFFFF';
        this.live = cellState.live || false;
        this.neighbours = cellState.neighbours || [];
    }

    cssClass() {
        return this.live ? "cell live" : "cell dead";
    }

    style() {
        return this.live ? `background-color: ${this.color}` : "";
    }
}

const redraw = matrix => {
    $field.empty();
    const debug = $('#debug-check').prop('checked');

    for (let [cell, x, y] of walk(matrix)) {
        let neighbours = cell.neighbours;
        let node = $("<div></div>", {
            "class": cell.cssClass(),
            "style": cell.style()
        });

        if (debug && neighbours.length) {
            node.text(neighbours.length)
        }

        node
            .appendTo($field)
            .on('click', target => {
                $(target)
                    .removeClass("dead live")
                    .addClass(cell.cssClass())
                ;
                $socket.emit('click', {cells: [[x, y]], color: $myColor});
            })
        ;
    }
};

function* walk(matrix) {
    for (let y of matrix.keys()) {
        for (let x of matrix[y].keys()) {
            yield [new Cell(matrix[y][x]), x, y];
        }
    }
}

$('#oscillator-btn').on('click', () => {
    drawFigure(
        '-x-',
        '-x-',
        '-x-'
    );
});
$('#glider-btn').on('click', () => {
    drawFigure(
        '-x-',
        '--x',
        'xxx',
    );
});
$('#static-btn').on('click', () => {
    drawFigure(
        '-xx-',
        'x--x',
        'x--x',
        '-xx-',
    );
});
$('#reset-btn').on('click', () => {
    $socket.emit('reset');
});

function drawFigure(...rows) {
    let dx = _.random(2, 17);
    let dy = _.random(2, 17);
    const cells = rows
        .reduce(
            (carry, line, y) => {
                let drawPoints = line
                    .split('')
                    .map((c, x) => (c == 'x' ? [x + dx, y + dy] : false))
                    .filter(Boolean)
                ;
                return carry.concat(drawPoints);
            },
            []
        )
    ;
    $socket.emit('click', {cells, color: $myColor});
}

function generateNewColor() {
    return ['R', 'G', 'B'].reduce(
        (rgb) => rgb + _.random(90, 220).toString(16),
        '#'
    );
}

// bootstrap app
let $myColor = generateNewColor();
document.body.style.backgroundColor = $myColor;
$socket.on('update', ({state}) => {
    redraw(state.matrix);
});
