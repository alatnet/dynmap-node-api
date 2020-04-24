var config = require('./config');

var express = require('express'); //npm install express

//https://codeforgeek.com/manage-session-using-node-js-express-4/
//var session = require('express-session'); //npm install express-sessions

//https://codeforgeek.com/using-redis-to-handle-session-in-node-js/#installation
//var redis = require('redis');
//var redisStore = require('connect-redis')(session);
//var client  = redis.createClient();

var strstr = require('./strstr');
//var stristr = require('./stristr');
var rtrim = require('./rtrim');

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

var app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

/*app.use(session({
    secret: config.sessionSecret,
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: false
}));*/

//use guest for the moment to deal with authentication
var userid = '-guest-';

//deal with tiles
app.get(
    config.root + config.pages.tiles,
    (req, res) => {
        //todo: get userid from php session

        if ((typeof req.query.tile === 'undefined') || (strstr(req.query.tile, '..'))){
            res.status(500).send("Bad marker: " + req.query.tile);
            return;
        }

        var parts = req.query.tile.split('/');
        if (parts.length != 4){
            res.send('Location: ../images/blank.png');
            return;
        }

        $uid = '[' + userid + ']';

        var world = parts[0];

        //ignore? no idea where world access var is in php.
        /*if (worldaccess[world]) {
            var ss = stristr(worldaccess[world] , uid);
            if (ss === false) res.send('Location: ../images/blank.png');
        }*/

        var variant = 'STANDARD';

        var prefix = parts[1];
        var plen = prefix.length;

        if ((plen > 4) && prefix.substr(plen - 4) === "_day"){
            prefix = prefix.substr(0, plen - 4);
            variant = 'DAY';
        }

        var mapid = world + '.' + prefix;

        //ignore? no idea where world access var is in php.
        /*if (mapaccess[mapid]){
            ss = stristr(mapaccess[mapid], uid);
            if (ss === false) res.send('Location: ../images/blank.png');
        }*/

        var fparts = parts[3].split('_');
        var x = 0;
        var y = 0
        var zoom = 0;

        if (fparts.length == 3){ //zoom_x_y
             zoom = fparts[0].length;
             x = parseInt(fparts[1]);
             y = parseInt(fparts[2]);
        } else if (fparts.length == 2){ //x_y
            x = parseInt(fparts[0]);
            y = parseInt(fparts[1]);
        } else{
            res.send('Location: ../images/blank.png');
            return;
        }

        var sql = 
            'SELECT ' +
            'Tiles.Image,' +
            'Tiles.Format,' +
            'Tiles.HashCode,' +
            'Tiles.LastUpdate,' +
            'Tiles.ImageLen ' +
            'FROM Maps ' +
            'JOIN Tiles ' +
            'WHERE ' +
            'Maps.WorldID=\'' + world + '\' ' +
            'AND Maps.MapID=\'' + prefix + '\' ' +
            'AND Maps.Variant=\'' + variant + '\' ' +
            'AND Maps.ID=Tiles.MapID ' +
            'AND Tiles.x=\'' + x + '\' ' +
            'AND Tiles.y=\'' + y + '\' ' +
            'and Tiles.zoom=\'' + zoom + '\'';

        //get data
        db.get(
            sql,
            (err, row) => {
                if (typeof row !== 'undefined'){                
                    var contentType = 'image/jpeg';
                    if (row['Format'] == 0) contentType = 'image/png';
                    var content = '';
                    
                    if (row['ImageLen'] > 0){
                        content = row['Image'].subarray(0, row['ImageLen']);
                    } else {
                        content = rtrim(row['Image'], '\0');
                    }

                    res.set(
                        {
                            'Content-Type': contentType,
                            'ETag' : '\'' + row['HashCode'] + '\'',
                            'Last-Modified': new Date(row['LastUpdate']/1000).toISOString(),
                            'Content-Length' : content.length
                        }
                    );

                    res.send(content);
                } else {
                    res.send('Location: ../images/blank.png');
                    return;
                }
            }
        );
    }
);

//deal with markers
app.get(
    config.root + config.pages.markers,
    (req, res) => {
        //todo: get userid from php session

        if ((typeof req.query.marker === 'undefined') || (strstr(req.query.marker, '..'))){
            res.status(500).send("Bad marker: " + req.query.marker);
            return;
        }

        var parts = req.query.marker.split('/');
        if ((parts[0] != 'faces') && (parts[0] != '_markers_')){
            res.status(500).send("Bad marker: " + req.query.marker);
            return;
        }

        if (parts[0] == 'faces'){ //faces
            if (parts.length != 3) {
                res.status(500).send("Bad face: " + req.query.marker);
                return;
            }
            
            var ft = 0;

            switch(parts[1]){
                default:
                case '8x8':
                    ft = 0
                    break;
                case '16x16':
                    ft = 1
                    break;
                case '32x32':
                    ft = 2
                    break;
                case 'body':
                    ft = 3
                    break;
            }

            var pn = parts[2].split('.');

            var sql =
                'SELECT ' +
                'Image ' +
                'FROM ' +
                'Faces ' +
                'WHERE ' +
                'PlayerName=\''+ pn[0] +'\' ' +
                'AND TypeID=\''+ ft +'\'';

            db.get(
                sql,
                (err, row) => {
                    if (typeof row !== 'undefined'){
                        res.set({'Content-Type': 'image/png'});
                        res.send(row['Image']);
                    } else {
                        res.send('Location: ../images/blank.png');
                        return;
                    }
                }
            );
        } else { //_markers_
            var _in = parts[1].split('.');
            var name = _in.slice(0, _in.length -1).join('.');
            var ext = _in[_in.length - 1];

            if ((ext == 'json') && (name.indexOf('marker_') == 0)){
                var world = name.substr(7);

                var sql = 'SELECT Content from MarkerFiles WHERE FileName=\'' + world + '\'';
                
                db.get(
                    sql,
                    (err, row) => {
                        if (typeof row !== 'undefined'){
                            res.set({'Content-Type': 'application/json'});
                            res.send(row['Content']);
                            return;
                        } else {
                            res.send('{ }');
                            return;
                        }
                    }
                );
            } else {
                var sql = 'SELECT Image from MarkerIcons WHERE IconName=\'' + name + '\'';
                
                db.get(
                    sql,
                    (err, row) => {
                        if (typeof row !== 'undefined'){
                            res.set({'Content-Type': 'image/png'});
                            res.send(row['Image']);
                            return;
                        } else {
                            res.send('Location: ../images/blank.png');
                            return;
                        }
                    }
                );
            }
        }
    }
);

/*app.get(
    config.root + '/node_sendmsg',
    (req, res) => {
        res.send('{ \"error\" : \"none\" }');
    }
);
app.post(
    config.root + '/node_sendmsg',
    (req, res) => {
    }
);*/

/*app.(
    config.root + '',
    (req, res) => {
    }
);*/

app.listen(
	process.env.PORT || 3000,
	() => console.log("Express app running.")
);