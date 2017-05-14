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

function repairPathForDependencyGraph(node_path, module_path) {
    //console.log("node_path: "+node_path)
    //console.log("module_path: "+module_path)
    var split_node_path = node_path.split("/");
    split_node_path.pop(); //to remove node file name - it is useless, parent's path is what is left
    var split_module_path = module_path.split("/");
    // if(split_module_path.length === 1)
    //     return split_module_path[0]; //for npm dependencies
    // if (split_module_path.length === 1 || (split_module_path[split_module_path.length-1].indexOf(".")!==-1 && split_module_path[split_module_path.length-1].substring(split_module_path[split_module_path.length-1].indexOf("."), split_module_path[split_module_path.length-1].length)!==".js"))
    //     return false; //for npm dependencies
    if (split_module_path.length === 1)
        return "project_home/"+split_module_path[0];
    

    var final_path = split_node_path.join("/");
    var split_final_path = final_path.split("/");
    for (var i = 0; i < split_module_path.length; i++) {
        if (split_module_path[i] === ".") {
            //do nothing, skip it coz it is in the current directory only
        } else if (split_module_path[i] === "..") {
            split_final_path.pop(); //removed last directory to go to parent
        } else {
            var file_name = split_module_path[i];
            // if(i===split_module_path.length-1 && file_name.indexOf(".js")!==-1)
            //     file_name = file_name.substring(0, file_name.indexOf(".js"));
            split_final_path.push(file_name);
        }
    }
    return split_final_path.join("/");
}

function repairPath(node_path, module_path) {
    //console.log("node_path: "+node_path)
    //console.log("module_path: "+module_path)
    var split_node_path = node_path.split("/");
    split_node_path.pop(); //to remove node file name - it is useless, parent's path is what is left
    var split_module_path = module_path.split("/");
    // if(split_module_path.length === 1)
    //     return split_module_path[0]; //for npm dependencies
    if (split_module_path.length === 1 || (split_module_path[split_module_path.length-1].indexOf(".")!==-1 && split_module_path[split_module_path.length-1].substring(split_module_path[split_module_path.length-1].indexOf("."), split_module_path[split_module_path.length-1].length)!==".js"))
        return false; //for npm dependencies
    //if (split_module_path.length === 1)
    

    var final_path = split_node_path.join("/");
    var split_final_path = final_path.split("/");
    for (var i = 0; i < split_module_path.length; i++) {
        if (split_module_path[i] === ".") {
            //do nothing, skip it coz it is in the current directory only
        } else if (split_module_path[i] === "..") {
            split_final_path.pop(); //removed last directory to go to parent
        } else {
            var file_name = split_module_path[i];
            
            if(i===split_module_path.length-1 && file_name.indexOf(".js")!==-1)
                file_name = file_name.substring(0, file_name.indexOf(".js"));

            //instead of removing, insert if not present, so that we can match it with actual file_paths
            //has to be last element, to be a file/module - so i===split_module_path.length-1
            // if(i===split_module_path.length-1 && file_name.indexOf(".js")===-1)
            //     file_name = file_name+".js";

            split_final_path.push(file_name);
        }
    }
    return split_final_path.join("/");
}

function storeImports(root, g, g1) {
    g.addNode(root.file_path);
    g1.addNode(root.file_path);
    //console.log(root.file_path);
    var imports_list = []; //each item is an object - {local: string, import_path: string}
    //main logic of traversing and finding imports
    var objarr = [];
    estraverse.traverse(root.AST, {
        enter: function (node) {
            if (node.type == "ImportDeclaration")
                if (node.specifiers.length == 0) {
                    //no components are uploaded along with file
                    //console.log(node.source.value);
                    g1.addNode(repairPathForDependencyGraph(root.file_path, node.source.value));
                    g.addNode( repairPathForDependencyGraph(root.file_path, node.source.value), {"color" : "white"} ).set( "style", "filled");
                    g1.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value));
                    g.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value)).set( "color", "red" );
                    if (repairPath(root.file_path, node.source.value))
                        objarr.push({
                            "module": repairPath(root.file_path, node.source.value),
                            "local": ""
                        });

                }
            else {
                for (var j = 0; j < node.specifiers.length; j++) {
                    if (node.specifiers[j].type == "ImportNamespaceSpecifier") {
                        //This is the case where: import * from mymodule;
                        //console.log(node.source.value);
                        g1.addNode(repairPathForDependencyGraph(root.file_path, node.source.value));
                        g.addNode(repairPathForDependencyGraph(root.file_path, node.source.value), {"color" : "white"} ).set( "style", "filled");
                        g1.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value));
                        g.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value)).set( "color", "red" );
                        if (node.specifiers[j].local.name) {
                            if (repairPath(root.file_path, node.source.value))
                                objarr.push({
                                    "module": repairPath(root.file_path, node.source.value),
                                    "local": node.specifiers[j].local.name
                                });
                        } else {
                            if (repairPath(root.file_path, node.source.value))
                                objarr.push({
                                    "module": repairPath(root.file_path, node.source.value),
                                    "local": ""
                                });
                        }
                    } else if (node.specifiers[j].type == "ImportDefaultSpecifier") {
                        //This is the case where: import sqrt from 'math.js';
                        //console.log(node.source.value + "." + node.specifiers[j].local.name);
                        if (node.specifiers[j].local.name) {
                            g1.addNode(repairPathForDependencyGraph(root.file_path, node.source.value));
                            g.addNode(repairPathForDependencyGraph(root.file_path, node.source.value), {"color" : "white"} ).set( "style", "filled");
                            g1.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value));
                            g.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value)).set( "color", "red" );
                            if (repairPath(root.file_path, node.source.value))
                                objarr.push({
                                    "module": repairPath(root.file_path, node.source.value)+ "." + node.specifiers[j].local.name,
                                    "local": node.specifiers[j].local.name
                                });
                        }
                    } else if (node.specifiers[j].type == "ImportSpecifier") {
                        //This is the case where: import {foo,bar} from 'dog.js'; 
                        //console.log(node.source.value + "." + node.specifiers[j].imported.name);
                        if (node.specifiers[j].local.name) {
                            g1.addNode(repairPathForDependencyGraph(root.file_path, node.source.value));
                            g.addNode(repairPathForDependencyGraph(root.file_path, node.source.value), {"color" : "white"} ).set( "style", "filled");
                            g1.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value));
                            g.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.source.value)).set( "color", "red" );
                            if (repairPath(root.file_path, node.source.value))
                                objarr.push({
                                    "module": repairPath(root.file_path, node.source.value) + "." + node.specifiers[j].imported.name,
                                    "local": node.specifiers[j].local.name
                                });
                        }
                    }
                }
            }

            
            
            // if (node.type == "MemberExpression") {
            //     if (node.object)
            //         if(node.object.type === "CallExpression")
            //             if (node.object.callee)
            //                 if (node.object.callee.name === "require") {
            //                     //console.log(JSON.stringify(node, null ,4))
            //                     sub_module_var = node.property.name;
            //                     //console.log(sub_module_var)
            //                     if (node.arguments) {
            //                         module_var = node.arguments[0].value;
            //                     }
            //                     if (node.object) {
            //                         module_var = node.object.arguments[0].value;
            //                     }
            //                     if (module_var.length && sub_module_var.length && repairPath(root.file_path, module_var))
            //                         objarr.push({
            //                             "module": repairPath(root.file_path, module_var) + "." + sub_module_var,
            //                             "local": local_var
            //                         });
            //                 }
            // }

                        ///old code from here

            if (node.type == "ExpressionStatement") {
                if (node.expression.type == "CallExpression") {
                    if (node.expression.callee.name == "require") {
                        //console.log(node.expression.arguments[0].value);
                        if(node.expression.arguments[0].type === "Literal"){
                            g1.addNode(repairPathForDependencyGraph(root.file_path, node.expression.arguments[0].value));
                            g.addNode(repairPathForDependencyGraph(root.file_path, node.expression.arguments[0].value), {"color" : "white"} ).set( "style", "filled");
                            g1.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.expression.arguments[0].value));
                            g.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, node.expression.arguments[0].value)).set( "color", "red" );
                            if (repairPath(root.file_path, node.expression.arguments[0].value))
                            objarr.push({
                                "module": repairPath(root.file_path, node.expression.arguments[0].value),
                                "local": ""
                            });
                        }
                    }
                }
            } else if (node.type == "VariableDeclaration") {
                var local_var = "";
                var module_var = "";
                var sub_module_var = "";
                for (var q = 0; q < node.declarations.length; q++) {
                    var local_var = "";
                    if (node.declarations[q].id)
                        if (node.declarations[q].id.name) {
                            local_var = node.declarations[q].id.name;
                            //console.log(local_var)
                        }

                    if (node.declarations[q].init) {

                        if (node.declarations[q].init.type == "CallExpression") {
                            if (node.declarations[q].init.callee.name == "require") {
                                if(node.declarations[q].init.arguments[0].type === "Literal"){
                                    module_var = node.declarations[q].init.arguments[0].value;
                                    if(module_var.length){
                                        g1.addNode(repairPathForDependencyGraph(root.file_path, module_var));
                                        g.addNode(repairPathForDependencyGraph(root.file_path, module_var), {"color" : "white"} ).set( "style", "filled");
                                        g1.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, module_var));
                                        g.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, module_var)).set( "color", "red" );
                                    }
                                    if (module_var.length && repairPath(root.file_path, module_var))
                                        objarr.push({
                                            "module": repairPath(root.file_path, module_var),
                                            "local": local_var
                                        });
                                    //console.log(node.declarations[q].init.arguments[q].value);
                                }
                            }
                        }
                        if (node.declarations[q].init.type == "MemberExpression") {
                            if (node.declarations[q].init.object)
                                if (node.declarations[q].init.object.callee)
                                    if (node.declarations[q].init.object.callee.name === "require") {
                                        //console.log(JSON.stringify(node, null ,4))
                                        if(node.declarations[q].init.property.type === "Identifier"){
                                            sub_module_var = node.declarations[q].init.property.name;
                                            //console.log(sub_module_var)
                                            if (node.declarations[q].init.arguments) {
                                                if(node.declarations[q].init.arguments[0].type === "Literal")
                                                    module_var = node.declarations[q].init.arguments[0].value;
                                            }
                                            if (node.declarations[q].init.object) {
                                                if(node.declarations[q].init.object.arguments[0].type === "Literal")
                                                    module_var = node.declarations[q].init.object.arguments[0].value;
                                            }
                                            if(module_var.length){
                                                g1.addNode(repairPathForDependencyGraph(root.file_path, module_var));
                                                g.addNode(repairPathForDependencyGraph(root.file_path, module_var), {"color" : "white"} ).set( "style", "filled");
                                                g1.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, module_var));
                                                g.addEdge(root.file_path, repairPathForDependencyGraph(root.file_path, module_var)).set( "color", "red" );
                                            }
                                            if (module_var.length && sub_module_var.length && repairPath(root.file_path, module_var))
                                                objarr.push({
                                                    "module": repairPath(root.file_path, module_var) + "." + sub_module_var,
                                                    "local": local_var
                                                });
                                        }
                                        
                                    }
                        }
                    }
                }
            }
        }
    });
    root.imports_list = objarr;
    return root;
}

function updateImports(root, g, g1) {
    if (root.isFile) {
        return storeImports(root, g, g1);
        //return root;
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            root.children[i] = updateImports(root.children[i], g, g1);
        }
        return root;
    }
}

module.exports = updateImports;