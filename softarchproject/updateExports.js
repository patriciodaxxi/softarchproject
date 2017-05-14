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

function removeDuplicates(list) {
    var hash = {},
        final_list = [];
    for (var i = 0; i < list.length; i++)
        if (!hash[list[i]]) {
            hash[list[i]] = 1;
            final_list.push(list[i]);
        }
    return final_list;
}

function storeExports(node) {
    var exports_list = [];
    estraverse.traverse(node.AST, {
        enter: function (node) {
            if (node.type === "ExpressionStatement")
                if (node.expression.type === "AssignmentExpression")
                    if (node.expression.left.type === "MemberExpression") {
                        //for exports
                        if (node.expression.left.object && node.expression.left.object.name === "exports")
                            if (node.expression.left.property)
                                if(node.expression.left.property.name)
                                    exports_list.push(node.expression.left.property.name);
                            else
                                exports_list.push("default");
                        else {
                            if (node.expression.left.name === "exports") {
                                exports_list.push("default");
                                if (node.expression.right.properties && node.expression.right.type === "ObjectExpression") {
                                    for (var m = 0; m < node.expression.right.properties.length; m++) {
                                        if (node.expression.right.properties[m].type === "Property")
                                            if(node.expression.right.properties[m].key)
                                                if(node.expression.right.properties[m].key.name)
                                                    exports_list.push(node.expression.right.properties[m].key.name);
                                    }
                                }
                            }
                        }

                        //for module.exports
                        if (node.expression.left.object.name && node.expression.left.object.name === "module" && node.expression.left.property.name === "exports") {
                            exports_list.push("default");
                            if (node.expression.right.properties && node.expression.right.type === "ObjectExpression") {
                                for (var m = 0; m < node.expression.right.properties.length; m++) {
                                    if (node.expression.right.properties[m].type === "Property")
                                        if(node.expression.right.properties[m].key)
                                            if(node.expression.right.properties[m].key.name)
                                                exports_list.push(node.expression.right.properties[m].key.name);
                                }
                            }
                        } else {
                            var lparent = node.expression;
                            var l = node.expression.left;
                            while (l.object.object) {
                                lparent = l;
                                l = l.object;
                            }

                            if (l.object.name === "module" && l.property.name === "exports")
                                if(lparent.property)
                                    if(lparent.property.name)
                                        exports_list.push(lparent.property.name);
                        }
                    }

            //for es6 type
            if (node.type === "ExportNamedDeclaration") {
                if (node.declaration != null) {
                    if (node.declaration.type === "VariableDeclaration") {
                        for (var i = 0; i < node.declaration.declarations.length; i++)
                            exports_list.push(node.declaration.declarations[i].id.name)
                    }
                    if (node.declaration.type === "FunctionDeclaration") {
                        exports_list.push(node.declaration.id.name)
                    }
                    if (node.declaration.type === "ClassDeclaration") {
                        exports_list.push(node.declaration.id.name)
                    }
                } else {
                    for (var i = 0; i < node.specifiers.length; i++)
                        if (node.specifiers[i].type === "ExportSpecifier")
                            if (node.source != null)
                                exports_list.push(node.source.value + "." + node.specifiers[i].exported.name);
                            else
                                exports_list.push(node.specifiers[i].exported.name);
                }

            }

            //figure out how do we import the "named default" - then modify
            //not handled case - export { name1 as default, … };
            if (node.type === "ExportDefaultDeclaration") {
                if (node.declaration != null) {
                    if (node.declaration.type != "Identifier" && node.declaration.type != "Literal" && node.declaration.type != "FunctionDeclaration" && node.declaration.type != "ClassDeclaration") {
                        exports_list.push("default");
                        //console.log("coudnt figure out for " + JSON.stringify(node, null, 4));
                    }
                    if (node.declaration.type === "Identifier") {
                        exports_list.push(node.declaration.name);
                    }
                    if (node.declaration.type === "Literal") {
                        exports_list.push(node.declaration.value);
                    }
                    if (node.declaration.type === "FunctionDeclaration") {
                        if (node.declaration.id)
                            exports_list.push(node.declaration.id.name)
                        else
                            exports_list.push("default");
                    }
                    if (node.declaration.type === "ClassDeclaration") {
                        if (node.declaration.id)
                            exports_list.push(node.declaration.id.name)
                        else
                            exports_list.push("default");
                    }
                } else {
                    exports_list.push("default");
                    //console.log("declaration null for " + JSON.stringify(node, null, 4));
                }

            }

            if (node.type === "ExportAllDeclaration") {
                exports_list.push(node.source.value); //value might be absolute or relative path - so resolve it
            }
        }
    });
    //CONSIDER REMOVING DUPLICATES IF ANY EXIST, AND FIND WHY THEY EXIST
    //node.exports_list = exports_list;
    node.exports_list = removeDuplicates(exports_list);
    return node;
}

function updateExports(root) {
    if (root.isFile) {
        return storeExports(root);
        //return root;
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            root.children[i] = updateExports(root.children[i]);
        }
        return root;
    }
}

module.exports = updateExports;