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

function storeCdegree(node, allFiles){
    //iterate through all files to find to find if any file has imports which matches this file's exports
    //if so, then calculate the number of occurrences belonging to this file's exports, total
    //then divide by total_count and store in this node's cdegree object as {"/path/of/imported/file": cdegree_value, .....}
    var cdegree = {};
    var interface_usage = {};
    for(var q=0;q<node.exports_list.length;q++)
        interface_usage[node.exports_list[q]] = 0;
    //console.log("----------------------------------------------------------------------------------------")
    //console.log("File with exports: "+node.file_path);
    //console.log("exports: "+node.exports_list)
    for(var f=0;f<allFiles.length;f++){
        var reference_count=0;
        if(allFiles[f].file_path!==node.file_path){
            //console.log("entered: "+allFiles[f].file_path+" ---------------------------------------")
                    
            for(var key_module in allFiles[f].occurrences){
                if(key_module == "total_count")
                    continue;
                //console.log(key_module+" ?==? "+node.file_path.substring(0, node.file_path.length-3));
                if(key_module.indexOf(node.file_path.substring(0, node.file_path.length-3))!==-1) {
                    var component = key_module.split("/")[key_module.split("/").length-1];
                    //console.log("extracted component: "+component)
                    var split_component = component.split(".");
                    if(split_component.length===1){
                        //console.log("came here 1")
                        var done = 0;
                        //just 1 component
                        for(var i=0;!done && i<node.exports_list.length;i++){
                            //console.log("i: "+i)
                            //console.log("node.exports_list[i]: "+node.exports_list[i])
                            if(node.exports_list[i] === split_component[0]){
                                //console.log(JSON.stringify(allFiles[f].imports_list, null, 4));
                                //console.log("used "+split_component[0]+" in "+allFiles[f].file_path)
                                interface_usage[split_component[0]]+=allFiles[f].occurrences[key_module];
                                reference_count+=allFiles[f].occurrences[key_module];
                                done=1;
                                //console.log(split_component[0]+"++");
                                //console.log("reference count = "+reference_count)
                            } 
                            // else {
                            //     //console.log("used "+split_component[0]+" in "+allFiles[f].file_path)
                            //     //console.log(JSON.stringify(allFiles[f].imports_list, null, 4));
                            //     //interface_usage["default"]++;
                            //     reference_count++;
                            //     done=1;
                            //     console.log("reference count = "+reference_count)
                            // }
                        }
                        if(!done) {
                            if(interface_usage["default"])
                                interface_usage["default"]+=allFiles[f].occurrences[key_module];
                            reference_count+=allFiles[f].occurrences[key_module];
                        }
                    } else {
                        //console.log("came here 2")
                        //there exists a subcomponent
                        var sub_component = split_component[split_component.length-1];
                        //console.log("sub_component: "+sub_component)
                        var done = 0;
                        for(var i=0;!done && i<node.exports_list.length;i++){
                            //console.log("i: "+i)
                            //console.log("node.exports_list[i]: "+node.exports_list[i])
                            //console.log(node.exports_list[i] + " ?==? " + sub_component)
                            if(node.exports_list[i] === sub_component){
                                //console.log("used "+split_component[0]+" in "+allFiles[f].file_path)
                                //console.log(JSON.stringify(allFiles[f].imports_list, null, 4));
                                interface_usage[sub_component]+=allFiles[f].occurrences[key_module];
                                reference_count+=allFiles[f].occurrences[key_module];
                                done=1;
                                //console.log(sub_component+"++");
                                //console.log("reference count = "+reference_count)
                            } 
                            // else {
                            //     //console.log("used "+split_component[0]+" in "+allFiles[f].file_path)
                            //     //console.log(JSON.stringify(allFiles[f].imports_list, null, 4));
                            //     //interface_usage["default"]++;
                            //     reference_count++;
                            //     done=1;
                            //     console.log("reference count = "+reference_count)
                            // }
                        }
                        if(!done) {
                            if(interface_usage["default"])
                                interface_usage["default"]+=allFiles[f].occurrences[key_module];
                            reference_count+=allFiles[f].occurrences[key_module];
                        }
                    }
                }
            }
        }
        
        //console.log("final "+reference_count + " "+ allFiles[f].occurrences.total_count)
        if(reference_count>allFiles[f].occurrences.total_count){
            console.log("")
            console.log("anamoly found: ")
            console.log(reference_count)
            console.log(allFiles[f].occurrences)
            console.log(node.exports_list)
            console.log("")
        }
        if(reference_count)
            cdegree[allFiles[f].file_path] = (reference_count*1.0/allFiles[f].occurrences.total_count*1.0);
        else 
            cdegree[allFiles[f].file_path] = 0;
    }
    //console.log("----------------------------------------------------------------------------------------")
    node.cdegree = cdegree;
    node.interface_usage = interface_usage;
    return node;
}

function calculateCdegree(root, allFiles){
    if (root.isFile) {
        //console.log("");
        //console.log("begin file: "+root.file_path);
        return storeCdegree(root, allFiles);
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            root.children[i] = calculateCdegree(root.children[i], allFiles);
        }
        return root;
    }
}

module.exports = calculateCdegree;