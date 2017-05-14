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
var Stack = require("./stack");

var stack = new Stack();
var objarr=[];
var visited = {};
var objcycle = [];

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);

    fs.writeFile(path, contents, cb);
});
}

function findDFS(g1, input_path){
    var graphNodes = g1.nodes();
    //console.log(graphNodes)
    for(var i=0;i<graphNodes.length;i++){
        visited = {};
        stack.clear();
        //console.log("visited.length: "+Object.keys(visited).length)
        //console.log("stack.length: "+stack.length())
        dfs(g1, graphNodes[i]);
    }
    
    //console.log(objcycle);
    writeFile(path.join(__dirname, "./output/"+input_path+"/dependency_result.txt"), JSON.stringify(objcycle,null,2), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("Dependency File was saved");
    });
}

function dfs(graph, source){
    visited[source] = 1;
    //console.log("entered: "+source)
    //if(!stack.contains(source))
    stack.push(source);
    var cycle=[];
    var i=0;
    var adjacents = graph.adjacent(source);
    for(var i=0;i<adjacents.length;i++){
        //console.log("processing adjacent: "+adjacents[i])
        if(visited[adjacents[i]] && stack.contains(adjacents[i])){
            var position = stack.getPosition(adjacents[i]);
            //console.log("start: " + source)
            //console.log("stack contents: "+stack.elements)
            
            while(position!=stack.length()-1){
                //console.log("part of cycle: "+stack.elements[position]);
                cycle.push(stack.elements[position]);  
                position++;
                
            }
            //console.log("part of cycle: "+stack.elements[stack.length()-1]);
            cycle.push(stack.elements[stack.length()-1]);
            objcycle.push({"cycle":cycle});
            
            
            //console.log("")
        }
        if(!visited[adjacents[i]]){
            //console.log("going to visit "+adjacents[i]+" from "+source)
            dfs(graph, adjacents[i]);
        }
        
    }
    stack.pop();
}

function adjacent1(x){
    var result = g1.adjacent(x);
    return result;
    //console.log(result);
}

module.exports = findDFS;