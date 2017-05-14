var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var esprima = require('esprima');
var estraverse = require('estraverse');
var readfiles = require('node-readfiles');
var getTree = require('./index');
var graphviz = require('graphviz');
var graph=require('graph-data-structure');
var iqr = require( 'compute-iqr' );
var stats = require("stats-analysis");

function updateUnusedInterfaces(root, unused_interfaces_global){
    if (root.isFile) {
        var obj = {
            module: root.file_path,
            unused_interfaces: []
        };
        //console.log(root.file_path)
        //console.log(root.interface_usage)
        for(var key in root.interface_usage){
            if(root.interface_usage[key] === 0 && key!="default")
                obj.unused_interfaces.push(key);
        }
        if(obj.unused_interfaces.length)
            unused_interfaces_global.push(obj);
        return;
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            updateUnusedInterfaces(root.children[i], unused_interfaces_global);
        }
        return;
    }
}

module.exports = updateUnusedInterfaces;