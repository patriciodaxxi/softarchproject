var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');
var readfiles = require('node-readfiles');
var getTree = require('./index');

//call the other script and get the directory object
getTree('./input/test/', handleTree);

//store exports from a file into its structure
//PENDING - make sure to handle absolute and relative paths extraction
function storeExports(node){
    var exports_list = [];
    estraverse.traverse(node.AST, {
        enter: function(node){
            //for module.exports.....for now not handling just exports
            if(node.type === "ExpressionStatement")
                if(node.expression.type === "AssignmentExpression")
                    if(node.expression.left.type === "MemberExpression"){
                        //for exports
                        if(node.expression.left.object && node.expression.left.object.name==="exports")
                            if(node.expression.left.property)
                                exports_list.push(node.expression.left.property.name);
                            else 
                                exports_list.push("default");
                        else {
                            if(node.expression.left.name==="exports")
                                exports_list.push("default");
                        }

                        //for module.exports
                        if(node.expression.left.object.name === "module" && node.expression.left.property.name === "exports")
                            exports_list.push("default");
                        else {
                            var lparent = node.expression;
                            var l = node.expression.left;
                            while(l.object.object){
                                lparent = l;
                                l = l.object;
                            }
                                
                            if(l.object.name === "module" && l.property.name === "exports")
                                exports_list.push(lparent.property.name);
                        }
                    }

                        

            //for es6 type
            if(node.type === "ExportNamedDeclaration"){
                if(node.declaration != null){
                    if(node.declaration.type === "VariableDeclaration"){
                        for(var i=0;i<node.declaration.declarations.length;i++)
                            exports_list.push(node.declaration.declarations[i].id.name)
                    }
                    if(node.declaration.type === "FunctionDeclaration"){
                        exports_list.push(node.declaration.id.name)
                    }
                    if(node.declaration.type === "ClassDeclaration"){
                        exports_list.push(node.declaration.id.name)
                    }
                }
                else {
                    for(var i=0;i<node.specifiers.length;i++)
                        if(node.specifiers[i].type === "ExportSpecifier")
                            if(node.source!=null)
                                exports_list.push(node.source.value + "." + node.specifiers[i].exported.name);
                            else 
                                exports_list.push(node.specifiers[i].exported.name);
                }
                
            }

            //figure out how do we import the "named default" - then modify
            //not handled case - export { name1 as default, … };
            if(node.type === "ExportDefaultDeclaration"){
                if(node.declaration != null){
                    if(node.declaration.type!="Identifier" && node.declaration.type!="Literal" && node.declaration.type!="FunctionDeclaration" && node.declaration.type!="ClassDeclaration"){
                            exports_list.push("default");
                            console.log("coudnt figure out for "+JSON.stringify(node, null, 4));
                        }
                    if(node.declaration.type === "Identifier"){
                        exports_list.push(node.declaration.name);
                    }
                    if(node.declaration.type === "Literal"){
                        exports_list.push(node.declaration.value);
                    }
                    if(node.declaration.type === "FunctionDeclaration"){
                        if(node.declaration.id)
                            exports_list.push(node.declaration.id.name)
                        else
                            exports_list.push("default");
                    }
                    if(node.declaration.type === "ClassDeclaration"){
                        if(node.declaration.id)
                            exports_list.push(node.declaration.id.name)
                        else
                            exports_list.push("default");
                    }
                }
                else {
                    exports_list.push("default");
                    console.log("declaration null for "+JSON.stringify(node, null, 4));
                }

            }

            if(node.type === "ExportAllDeclaration") {
                exports_list.push(node.source.value); //value might be absolute or relative path - so resolve it
            }
        }
    });
    //CONSIDER REMOVING DUPLICATES IF ANY EXIST, AND FIND WHY THEY EXIST
    node.exports_list = exports_list;
    return node;
}

function updateExports(root){
    if(root.isFile){
        return storeExports(root);
    }
    if(root.isDir){
        for(var i=0;i<root.children.length;i++){
            root.children[i] = updateExports(root.children[i]);
        }
        return root;
    }
}

function printAllExports (root) {
	if(!root) return;
	console.log(root.file_path)
    if(root.isFile)
        console.log(root.exports_list);
	for(var i=0; i<root.children.length;i++)
		printAllExports(root.children[i]);
}

function handleTree(root){
    //your code goes here
    
    //extract exports and store them
    updateExports(root);
    printAllExports(root);
    
    //next task of extracting imports, storing them
    
    //find occurrences

    //calculate cdegree
}

//http://esprima.org/demo/parse.html?code=new%20Button%0Anew%20Button()%0Anew%20new%20foo%0Anew%20new%20foo()%0Anew%20foo().bar()%0Anew%20foo%5Bbar%5D%0Anew%20foo.bar()%0A(%20new%20foo).bar()%0Afoo(bar%2C%20baz)%0A(%20%20%20%20foo%20%20)()%0Auniverse.milkyway%0Auniverse.milkyway.solarsystem%0Auniverse.milkyway.solarsystem.Earth%0Auniverse%5BgalaxyName%2C%20otherUselessName%5D%0Auniverse%5BgalaxyName%5D%0Auniverse%5B42%5D.galaxies%0Auniverse(42).galaxies%0Auniverse(42).galaxies(14%2C%203%2C%2077).milkyway%0Aearth.asia.Indonesia.prepareForElection(2014)%0Auniverse.if%0Auniverse.true%0Auniverse.false%0Auniverse%0A%0Aexports.version%20%3D%20require('.%2Fpackage.json').version%3B