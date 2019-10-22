# Life Game for Terminal1 assessment

A Conway's Game of Life multiplayer version. Allows to play Game of Life in browser with other people.
Eventually may produce really nice patterns and palettes.

Players join by just opening the game URL. A random color is assigned to every new player.
On page reload player will get a new random color reassigned while previous one will just keep evolving with its color onward.
Clicking on the field players add their colored cells.

Players can:
* Add a new live cell by clicking anywhere on the field
* Add pre-configured figures using buttons in the sidebar
* Reset game state by Reset button
* Visualise neighbors detection with Debug checkbox


## Libraries used

* Socket.IO – as a websocket layer to communicate between players
* Express.js – for simplify static content sharing and I/O server creation
* Lodash – improves code readability
* jQuery – improves DOM manipulations readability
* jest – most well-known test library for making tests as readable as possible

Besides these libraries, all the code is written by me.

## Local installation & development

Make sure you have [node.js](https://nodejs.org/en/download/) and [Yarn](https://yarnpkg.com/lang/en/docs/install/) installed.

Clone the repo:

`git clone git@github.com:velosipedist/t1-life.git`

Install dependencies:

`yarn`

### Run tests

`yarn test`

### Run the app

`node index.js` or `yarn nodemon index.js`

Open two tabs in your browser(s) at http://localhost:3333/

> Works at least with Chrome and Firefox. Other browsers might fail to run the game as the code uses ES6 features.

See the game panels:

![Game screen](/docs/main_screen.jpg?raw=true "Game screen")

Now you can play from behalf of two players and see both fields are updated in realtime.

## Deploying to Heroku

You will need the [Heroku command line tool](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).

Run following:

```
heroku create
heroku ps:scale web=1
heroku open
```

If you wish to try a deployed instance there is a [Heroku dyno](https://salty-inlet-22246.herokuapp.com/) running.

# Technical review

Most of solutions were made having prototype delivery speed in mind.

There are only few modules, for backend and frontend entrypoints and game logic. Separating for small modules were deliberately skipped.
Of course I would be happy to break down the code to modules, but it would cost me time.

Code contains ES6 features for sake of readability and further scalability.
Even sacrificing compatibility with non-mainstream browsers, like Safari, mobile Samsung Internet etc.

Be there more time, I would enable Babel transpiler for having maximum compatibility.

Despite the main functions consist of many lines of code, they are separated with meaningful variables and comments.
They are good points for extracting into separate functions. But this rather makes sense when having modules separated well.
I considered vars and comments as an acceptable trade-off against following SRP thoroughly.

Having more time, I would enable Require.js at frontend and Webpack-ed all the libs to optimize required frontend libs.
Also, libraries like Lodash play well with Webpack treeshaking. jQuery might be separated to DOM-related functions.
But optimization reasons are left aside deliberately.

As for jQuery, I think I could just get rid of it after prototyping, vanilla events and properties API would be enough.
No AJAX, animations, complicated selectors here so far.

One of the scalability points is the Cell class which might have more complicated behavior – hover effects, including neighbors rendering.
I see that it would be better to repaint the field not by re-filling it with nodes but just reassigning events and styles to them.
That would make hover effect fairly smooth and debug would be much easier as well.

Tests are made for most crucial and hard-to-debug algorithms: neighbours seeking and average color calculation.
Having more time and strict system scalability priority, I would start from few functional tests:
- start game once
- start another game in parallel as player #2
- check main interaction steps and results from both players, using customizable framerate parameters and socket mocks

Yet I would like to add more fancy patterns and illustrated them with icons instead of text buttons.
Design was made just on the go, I skipped any design considerations – palette, cell size and quantity, buttons, clicks debouncing, progress indicators.
I would add a limit of players to avoid users list overflow.
