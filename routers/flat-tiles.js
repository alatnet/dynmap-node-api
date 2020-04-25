var config = require('../config');
var express = require('express');
var router = express.Router();
var fs = require('fs');

var strstr = require('../strstr');
//var stristr = require('../stristr');
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

        var fname = config.flatPaths.tiles + req.query.tile;

        var parts = req.query.tile.split('/');

        var uid = '[' + userid.toLowerCase() + ']';

        var world = parts[0];

        if (parts.length > 2) {
            var prefix = parts[1];
            var plen = prefix.length;
            
            if ((plen > 4) && prefix.substr(plen - 4) === "_day")
                prefix = prefix.substr(0, plen - 4);

            mapid = world + '.' + prefix;
            //ignore? no idea where map access var is in php.
            /*if (mapaccess[mapid]){
                ss = stristr(mapaccess[mapid], uid);
                if (ss === false) fname = config.flatPaths.blank;
            }*/
        }

        if (!fs.existsSync(fname)){
            if(strstr(config.flatPaths.tiles, ".jpg") || strstr(config.flatPaths.tiles, ".png"))
                $fname = config.flatPaths.blank;
            else {
                res.send("{ \"result\": \"bad-tile\" }");
                return;
            }
        }

        //set the content type if we arnt a png or jpg
        if (!strstr(config.flatPaths.tiles, ".jpg") || !strstr(config.flatPaths.tiles, ".png"))
            res.set({ 'Content-Type': 'application/text', });

        res.sendFile(fname);
    }
);

module.exports = router;