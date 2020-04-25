var config = require('../config');
var express = require('express');
var router = express.Router();

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

            //req.db.get(
            req.app.get('db').get(
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
                
                //req.db.get(
                req.app.get('db').get(
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
                
                //req.db.get(
                req.app.get('db').get(
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

module.exports = router;