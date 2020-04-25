var config = require('../config');
var express = require('express');
var router = express.Router();

var fs = require('fs');

var strstr = require('../strstr');
//var stristr = require('../stristr');
var rtrim = require('../rtrim');

//use guest for the moment to deal with authentication
var userid = '-guest-';

//deal with markers
router.get(
    config.root + config.pages.markers,
    (req, res) => {
        //todo: get userid from php session

        if ((typeof req.query.marker === 'undefined') || (strstr(req.query.marker, '..'))){
            res.status(500).send("Bad marker: " + req.query.marker);
            return;
        }

        var fname = config.flatPaths.markers + req.query.marker;
        
        var parts = req.query.marker.split('/');
        if ((parts[0] != 'faces') && (parts[0] != '_markers_')){
            res.status(500).send("Bad marker: " + req.query.marker);
            return;
        }

        if (!fs.existsSync(fname))
            if (strstr(req.query.marker, '.jpg') || strstr(req.query.marker, 'png'))
                fname = config.flatPaths.blank;
            else{
                res.status(404).send("Not found: " + req.query.marker);
                return;
            }

        //set the content type if we arnt a png or jpg
        if (!strstr(req.query.marker, '.png') || !strstr(req.query.marker, '.jpg'))
            res.set({'Content-Type': 'application/text'});

        res.sendFile(fname);
    }
);

module.exports = router;