var config = require('../config');
var express = require('express');
var router = express.Router();

var strstr = require('../strstr');
//var stristr = require('./stristr');
var rtrim = require('../rtrim');

//use guest for the moment to deal with authentication
var userid = '-guest-';

//deal with tiles
router.get(
    config.root + config.pages.tiles,
    (req, res) => {
        //todo: get userid from php session

        if ((typeof req.query.tile === 'undefined') || (strstr(req.query.tile, '..'))){
            res.status(500).send("Bad marker: " + req.query.tile);
            return;
        }

        var parts = req.query.tile.split('/');
        if (parts.length != 4){
            res.location('../images/blank.png');
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
            if (ss === false) res.location('../images/blank.png');
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
            res.location('../images/blank.png');
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
        //req.db.get(
        req.app.get('db').get(
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
                    res.location('../images/blank.png');
                    return;
                }
            }
        );
    }
);

module.exports = router;