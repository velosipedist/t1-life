let game = require("./game");
let _ = require("lodash");

test("Calculates average color", () => {
    const matrix = [
        [
            {live: true, color: "#abddfe"},
            {live: true, color: "#000000"},
        ],
        [
            {live: true, color: "#FFFFFF"},
            {live: true, color: "#abddfe"},
        ],
    ];
    let color = game.averageColor([
        [0, 1],
        [1, 0],
    ], matrix);

    // in between of #FFFFFF & #000000
    expect(color).toEqual('#808080')
});

test("Finds neighbours around", () => {
    // sample field:
    // x x x
    // - - -
    // x x x
    const matrix = [
        _.times(3, _.constant({live: true})),
        _.times(3, _.constant({live: false})),
        _.times(3, _.constant({live: true})),
    ];

    expect(game.getNeighboursCoords(matrix, 0, 0))
        .toEqual([
            [1, 0]
        ])
    ;

    expect(game.getNeighboursCoords(matrix, 1, 0))
        .toEqual([
            [0, 0],
            [2, 0],
        ])
    ;

    expect(game.getNeighboursCoords(matrix, 0, 1))
        .toEqual([
            [0, 0],
            [1, 0],
            [0, 2],
            [1, 2],
        ])
    ;
});