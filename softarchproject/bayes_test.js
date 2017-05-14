var BayesClassifier = require('bayes-classifier');
var classifier = new BayesClassifier();
var readfiles = require('node-readfiles');
var iqr = require( 'compute-iqr' );
var stats = require("stats-analysis");
var esprima = require('esprima');

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);

    fs.writeFile(path, contents, cb);
  });
}

function getLength(x){
  var count=0;
  for(var key in x){
    if(x.hasOwnProperty(key))
      count++;
  }
  return count++;
}

var global_concern_values = {};
var global_concern_threshold = {};
var global_concerns = [];
var js_files = 0;
var smells_iqr = {};
var smells_mad = {};
function updateConcerns(root){
    if (root.isFile) {
        root.concerns = classifier.getClassifications(root.content);
        for(var i=0;i<root.concerns.length;i++)
            global_concern_values.push(root.concerns[i].value);
        return;
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            updateConcerns(root.children[i]);
        }
        return;
    }
}   

function startClassification(path, root){
    readfiles(path, {}, function (err, filename, content) {
	    
        //console.log('File ' + filename + ':');
        var folder = filename.split("/")[0];
        //console.log(folder)
        classifier.addDocument(content.toString(), folder.toString());
        //console.log(content.length);

	}).then(function (files) {
	
        console.log('Read ' + files.length + ' training file(s)');
        classifier.train();
        console.log("Classifier tranied");
        //console.log(classifier.getClassifications('fs.readFileSync()'));

        //do work
        var input_path = "test";
        readfiles('./input/'+input_path+'/', {}, function (err, filename, content) {
	    
            console.log('File ' + filename + ':');
            //console.log(esprima.parse(content, {sourceType: 'module'}));
            //console.log(content.length);
            if (err) {
                //console.log('File ' + filename + ': '+err.toString());
            }
            
            if(!err && filename.toString().indexOf(".js")===filename.toString().length-3){
                js_files++;
                try{
                    esprima.parse(content, {sourceType: 'module'});
                } catch(err) { 
                    //console.log('File ' + filename + ': '+err.toString());
                    return;
                }
                var cs = classifier.getClassifications(content);
                //console.log(cs);
                global_concerns.push({
                    file: filename,
                    concerns: cs
                });
                for(var i=0;i<cs.length;i++)
                    if(global_concern_values[cs[i].label])
                        global_concern_values[cs[i].label].push(cs[i].value);
                    else{
                        global_concern_values[cs[i].label] = [];
                        global_concern_values[cs[i].label].push(cs[i].value);
                    }
            }

        }).then(function (files) {
        
            console.log('Read ' + files.length + ' project file(s)');
            for(var key in global_concern_values){
                global_concern_threshold[key] = {
                    iqr: 1.5*iqr(global_concern_values[key]),
                    mad: 2*stats.MAD(global_concern_values[key])
                }
            }
            console.log(global_concern_threshold);
            for(var i=0;i<global_concerns.length;i++){
                for(var j=0;j<global_concerns[i].concerns.length;j++){
                    if(global_concerns[i].concerns[j].value > global_concern_threshold[global_concerns[i].concerns[j].label].iqr){
                        if(smells_iqr[global_concerns[i].concerns[j].label])
                            smells_iqr[global_concerns[i].concerns[j].label].push(global_concerns[i].file)
                        else {
                            smells_iqr[global_concerns[i].concerns[j].label] = [];
                            smells_iqr[global_concerns[i].concerns[j].label].push(global_concerns[i].file)
                        }
                    }
                        
                    if(global_concerns[i].concerns[j].value > global_concern_threshold[global_concerns[i].concerns[j].label].mad){
                        if(smells_mad[global_concerns[i].concerns[j].label])
                            smells_mad[global_concerns[i].concerns[j].label].push(global_concerns[i].file)
                        else {
                            smells_mad[global_concerns[i].concerns[j].label] = [];
                            smells_mad[global_concerns[i].concerns[j].label].push(global_concerns[i].file)
                        }
                    }
                }
            }
            console.log("IQR smells: ---------------------------------------------------------------------------")
            console.log(smells_iqr)
            console.log("IQR smells: ---------------------------------------------------------------------------")
            console.log("")
            console.log("")
            console.log("")
            console.log("MAD smells: ---------------------------------------------------------------------------")
            console.log(smells_mad)
            console.log("MAD smells: ---------------------------------------------------------------------------")
        
        }).catch(function (err) {
            console.log('Error reading files:', err.message);
        });

        //updateConcerns(root);
        var iqr_value = 1.5*iqr(global_concern_values);
        var mad_value = 2*stats.MAD(global_concern_values);

        console.log("iqr_value: "+iqr_value)
        console.log("mad_value: "+mad_value)


    
	}).catch(function (err) {
	    console.log('Error reading files:', err.message);
	});
}


if(!(process.argv[2]))
  console.log("Please specify an appropriate input path");
else
  if(!process.argv[2].length)
    console.log("Please specify an appropriate input path");
  else
    startClassification('./skv_concerns/');

//module.exports = startClassification;