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

function stack(){
    this.elements = [];
    this.push = function(source){
        this.elements.push(source)
    };
    
    this.pop = function(){
        return this.elements.pop();
    };
    this.peek = function(){
        return this.elements[this.elements.length-1];
    };
    this.contains = function(x){
        for(var i=0;i<this.elements.length;i++){
            if(this.elements[i]===x)
                return true;
        }
        return false;
    };
    this.length = function(){
        return this.elements.length;
    };
    this.clear = function(){
        this.elements = [];
    };
    this.getPosition = function(ele){
        for(var i=0;i<this.elements.length;i++){
            if(this.elements[i]===ele)
                return i;
        }
        return -1;
    }
}

module.exports = stack;