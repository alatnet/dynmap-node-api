var config = require('./config');

var express = require('express'); //npm install express
var session = require('express-session'); //npm install express-session
var SQLiteStore = require('connect-sqlite3')(session); //npm install connect-sqlite3

//https://codeforgeek.com/manage-session-using-node-js-express-4/
//var session = require('express-session'); //npm install express-sessions

//https://codeforgeek.com/using-redis-to-handle-session-in-node-js/#installation
//var redis = require('redis');
//var redisStore = require('connect-redis')(session);
//var client  = redis.createClient();

var strstr = require('./strstr');
//var stristr = require('./stristr');
var rtrim = require('./rtrim');

var app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

/*app.use(express.cookieParser());
app.use(
    session(
        {
            store: new SQLiteStore(
                {
                    table='dynmap',
                    dir=config.db
                }
            ),
            secret: config.sessionSecret,
            cookie: {
                secure: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        }
    )
);*/

if (config.dbType == 0) { //flat files
    var flat_tiles = require('./routers/flat-tiles');
    var flat_markers = require('./routers/flat-markers');

    app.use(flat_tiles);
    app.use(flat_markers);
} else if (config.dbType == 1) { //sqlite database
    var sqlite3 = require('sqlite3'); //.verbose(); //npm install sqlite3

    var db = new sqlite3.Database(
        config.db,
        sqlite3.OPEN_READONLY,
        (err) => {
            if (err) {
            console.error(err.message);
            return;
            }
            console.log('Connected to the dynmap database.');
        }
    );

    //pass the db to the routers.
    app.set('db', db);
    // app.use(
    //     (req, res, next) => {
    //         req.db = db;
    //         next();
    //     }
    // );

    var sqlite_tiles = require('./routers/sqlite-tiles');
    var sqlite_markers = require('./routers/sqlite-markers');

    app.use(sqlite_tiles);
    app.use(sqlite_markers);
} else if (config.dbType == 2){ //mysql database
}

/*app.(
    config.root + config.pages.,
    (req, res) => {
    }
);*/

app.listen(
	process.env.PORT || 3000,
	() => console.log("Express app running.")
);