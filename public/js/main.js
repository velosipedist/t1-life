const $socket = io();
const $field = $('#life');
const $players = $('#players');

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

const redraw = ({matrix, players}) => {
    $players.empty();
    $players.append(
        players.map(color =>
            $(`<div class="player ${color === $myColor ? 'me' : ''}">☺︎</div>`)
                .css({backgroundColor: color})
        )
    );

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
    $socket.emit('reset', {sender: $myColor});
    $socket.emit('join', {color: $myColor});
});

function drawFigure(...rows) {
    const dx = _.random(2, 15);
    const dy = _.random(2, 15);
    const cells = rows
        .reduce(
            (canvas, line, y) => {
                let linePoints = line
                    .split('')
                    .map((c, x) => (c == 'x' ? [x + dx, y + dy] : false))
                    .filter(Boolean)
                ;
                return canvas.concat(linePoints);
            },
            []
        )
    ;
    $socket.emit('click', {cells, color: $myColor});
}

function generateNewColor() {
    let rgbRanges = _.shuffle([
        [80,160],
        [100,250],
        [20,80],
    ]);
    return ['R', 'G', 'B'].reduce(
        (rgb, $1, i) => rgb + _.random(...rgbRanges[i]).toString(16),
        '#'
    );
}

// bootstrap the app
let $myColor = generateNewColor();
document.getElementById('controls').style.border = `1px solid ${$myColor}`;

$socket.emit('join', {color: $myColor});

$socket.on('reset', () => {
    $myColor = generateNewColor();
    $socket.emit('join', {color: $myColor});
});

$socket.on('update', ({state}) => {
    redraw(state);
});
