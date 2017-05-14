document.getElementById('submit_btn').addEventListener('click', handleFileSelect, false);

function writeTextFile(filepath, output) {
	var txtFile = new File([""], filepath);
	txtFile.open("w"); //
	txtFile.writeln(output);
	txtFile.close();
}

function getSloc (arr, name) {
    for(var k=0;k<arr.length;k++){
        if(name === arr[k].name)
            return arr[k].log_sloc;
    }
}

function isPresent(Parent, name){
    for(var p=0;p<Parent.children.length;p++){
        if(Parent.children[p].name === name){
            return Parent.children[p];
        }
    }
    return null;
}

function sortArray (arr) {
    var allDirs = [];
    var allFiles = [];
    for(var p=0;p<arr.length;p++){
        if(arr[p].isDir) 
            allDirs.push(arr[p]);
        else 
            allFiles.push(arr[p]);
    }
    
    //sort alphabetically
    allDirs.sort(function(a, b){
        var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
        if (nameA < nameB) //sort string ascending
            return -1 
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    });

    allFiles.sort(function(a, b){
        var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
        if (nameA < nameB) //sort string ascending
            return -1 
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    });

    arr = [];
    for(var p=0;p<allDirs.length;p++)
        arr.push(allDirs[p]);
    for(var p=0;p<allFiles.length;p++)
        arr.push(allFiles[p]);
    return arr;
}

function sort (root) {
    if(root.children.length === 0) return root;
    root.children = sortArray(root.children);
    for(var h=0;h<root.children.length;h++){
        root.children[h] = sort(root.children[h]);
    }
    return root;
}

function highestNumberOfChildren (root) {
    if(root.children.length === 0)
        return 0;
    var max = 0;
    for(var j=0;j<root.children.length;j++){
        var val = highestNumberOfChildren(root.children[j]);
        if(val>max)
            max = val;
    }
    return Math.max(root.children.length, max);
}

//consider inputting the legends file for more compatibility
//then remember to change in regex also
var concern_color_mapping = {
    "red": "graphics",
    "green": "gui",
    "blue": "io",
    "yellow": "networking",
    "chocolate2": "sound",
    "aquamarine": "sql",
    "black": "no_match",
};

function file () {
    this.name = "",
    this.parent_name = null,
    this.file_path = "",
    this.version = "",
    this.isInA = false,
    this.isDir = false,
    this.isFile = true,
    this.sloc = 0,
    this.file_size = 0,
    this.concern_color = "black",
    this.concern_name = "no_match",
    this.children = []
}

var all_files_2_2 = [];
var sloc_2_2 = [];
var apache_log4j;
var dot_content = "";
var total_outfile_content = "";
  
all_files_2_2 = [];
sloc_2_2 = [];
apache_log4j = new file();
apache_log4j.name = "apache_log4j";
apache_log4j.isDir = true;
apache_log4j.isFile = false;
apache_log4j.file_path = "apache_log4j";

function handleFileSelect() {
    var dot = document.getElementById('dot').files;
    var total_outfile = document.getElementById('total_outfile').files;
    console.log(dot.length);
    console.log(total_outfile.length);

    if(!dot.length || !total_outfile.length)
        alert('Please select both files');
    else {
        var correct_files=true;
        if(dot[0].name.indexOf(".dot") === -1){
            correct_files = false;
            alert('Please select a valid dot file');
        }
        if(total_outfile[0].name.indexOf(".txt") === -1){
            correct_files = false;
            alert('Please select a valid total_outfile file');   
        }
        if(correct_files){
            document.getElementById('file_submit_form').style.display = "none";
            document.getElementById('instructions').style.display = "block";
            var dot_reader = new FileReader();
            dot_reader.onload = function(e) {
                dot_content = dot_reader.result;
                var total_outfile_reader = new FileReader();
                total_outfile_reader.onload = function(e) {
                    total_outfile_content = total_outfile_reader.result;

                    //start the work

                    preProcessing();
                }
                total_outfile_reader.readAsText(total_outfile[0], "utf8");
            }
            dot_reader.readAsText(dot[0], "utf8");
        }
    }
    return false;
}

function preProcessing(){
    //console.log(dot_content);
    //console.log(total_outfile_content);

    //working fine till here
    var outfile = total_outfile_content.toString();
    var lines = total_outfile_content.match(/.*?\.java/g);
    for(var j=0;j<lines.length;j++){
        //14 - file name
        //10 - logical sloc
        //11 - physical sloc
        //similarly any parameter can be extracted
        //sample array structure - ["20","0","|","19","0","|","1","0","0","|","1","1","|","CODE","/home/cs578user/Desktop/RecProjects/apache-log4j/apache-log4j-2.2-src/log4j-slf4j-impl/src/main/java/org/slf4j/impl/package-info.java"]

        var split_line = lines[j].trim().split(/[ \n\t\r]+/g);
        sloc_2_2.push({
            name: split_line[14].substring(70, split_line[14].length),
            log_sloc: split_line[10],
            phys_sloc: split_line[11]
        })  
    }

    var file_in_string = dot_content.toString();
    var matches = file_in_string.match(/\"[a-zA-Z0-9\-/\.\_]+?\.java\"\[.*?>>\];/g);

    for(var i=0;i<matches.length;i++){
        var file_path = (matches[i]).match(/\"[a-zA-Z0-9\-/\.\_]+?\.java\"/g);
        var abs_file_path = file_path[0].substring(1, file_path[0].length-1).toString();
        var matches_for_square_brackets = (matches[i]).match(/\[.*?>>\]/g);
        var concern = (matches_for_square_brackets[0]).match(/\<td bgcolor\=\".*?\"\>1\<\/td\>/g);
        var concern_color = (concern[0]).match(/(red|green|yellow|blue|chocolate2|aquamarine|black)/g);
        var file_size = (matches_for_square_brackets[0]).match(/\<td port\=\".*?\"\>[0-9]+?\<\/td\>/g);
        var file_size_bytes = file_size[0].match(/[0-9]+/g);
        var file_name = (matches_for_square_brackets[0]).match(/\<td colspan\=\".*?\"\>.*?\<\/td\>/g);
        var file_name_text = (file_name[0]).match(/[a-zA-Z0-9\-/\.\_]+/g);
        var java_file_name = file_name_text[3]+'.java';
        var concern_name = concern_color_mapping[concern_color[0]];

        var new_file = new file();
        new_file.name = java_file_name;
        new_file.file_path = abs_file_path;
        new_file.isDir = false;
        new_file.isFile = true;
        new_file.sloc = getSloc(sloc_2_2, abs_file_path);
        new_file.file_size = file_size_bytes[1];
        new_file.version = "2.2";
        new_file.isInA = true;
        new_file.concern_color = concern_color[0];
        new_file.concern_name = concern_name;
        new_file.children = [];
        new_file.parent_name = abs_file_path.split("/")[abs_file_path.split("/").length-2];
        all_files_2_2.push(new_file);
    }

    //construct the tree

    for(var q=0;q<all_files_2_2.length;q++){
        var abs_path = all_files_2_2[q].file_path;
        var abs_path_arr = abs_path.trim().split("/");
        var Parent = apache_log4j;
        var pathsofar = "";
        for(var m=0;m<abs_path_arr.length-1;m++){
            pathsofar = (pathsofar === "") ? abs_path_arr[m] : pathsofar+'/'+abs_path_arr[m];
            if(isPresent(Parent, abs_path_arr[m])){
                Parent = isPresent(Parent, abs_path_arr[m]);
                Parent.isInA = true;
            }
            else {
                var new_file = new file();
                new_file.name = abs_path_arr[m];
                new_file.isDir = true;
                new_file.isFile = false;
                new_file.version = "2.2";
                new_file.isInA = true;
                new_file.parent_name = Parent.name;
                new_file.file_path = Parent.parent_name!=null ? (Parent.file_path+'/'+abs_path_arr[m]) : abs_path_arr[m];
                Parent.children.push(new_file);
                Parent = new_file;
            }
        }
        Parent.children.push(all_files_2_2[q]);
    }

    console.log(highestNumberOfChildren(apache_log4j));

    //writeTextFile('apache_log4j_2_2.json', JSON.stringify(apache_log4j));

    produceVisualization();
}

function produceVisualization(){
    
    function getColor (node, parent) {
        if(node.children && !node.children.length && node.isinA) return "#555";
        var isInA = false;
        for(var i=0;i<parent.children.length;i++){
            if(parent.children[i].name === node.name){
            if(parent.children[i].isInA) isInA = true;
            }
        }
        if(isInA && isInB) return "steelblue";//or #00f
        else return "#ccc";
        //pending - some parent/child issue while assigning colors - undefined references and trying to access its length

        //OR better - preprocess the color, and store it as a parameter in the file structure itself
    }

    function down(d, i) {
        if (!d.children || this.__transition__) return;
        
        // var t=this;
        // d3.select("#back").selectAll("input").remove();
        // d3.select("#back")
        //     .append("input")
        //     .attr("type", "button")
        //     .attr("name", "back")
        //     .attr("value", "Back")
        //     .on("click", function () {
        //         //up.bind(t, d);
        // });

        //change pie chart
        var pie_json = [
                {label:"red", value: getPieValue("red", d)},
                {label:"green", value:getPieValue("green", d)},
                {label:"blue", value:getPieValue("blue", d)},
                {label:"yellow", value:getPieValue("yellow", d)},
                {label:"chocolate2", value:getPieValue("chocolate2", d)},
                {label:"aquamarine", value:getPieValue("aquamarine", d)},
                {label:"black", value:getPieValue("black", d)},
        ];
        change(pie_json, pie_svg, pie_color);

        d3.selectAll(".abs_path")
        .text(d.file_path);

        var op = [];
        for(var j=0;j<d.children.length;j++)
            if(d.children[j].isDir)
                op.push(d.children[j]);
        d3.select("#dropDown").selectAll("select").remove();
        d3.select("#dropDown")
            .append("select")
            .on("change", function() {
                down(this.options[this.selectedIndex].__data__, 0);
            })
            .selectAll("option")
            .data(op).enter()
            .append("option")
            .text(function(d) {
                return d.name;
            });

        var end = duration + d.children.length * delay;

        // Mark any currently-displayed bars as exiting.
        var exit = svg.selectAll(".enter")
            .attr("class", "exit");

        // Entering nodes immediately obscure the clicked-on bar, so hide it.
        exit.selectAll("rect").filter(function(p) { return p === d; })
            .style("fill-opacity", 1e-6);

        // Enter the new bars for the clicked-on data.
        // Per above, entering bars are immediately visible.
        var enter = bar(d)
            .attr("transform", stack(i))
            .style("opacity", 1);

        // Have the text fade-in, even though the bars are visible.
        // Color the bars as parents; they will fade to children if appropriate.
        enter.select("text").style("fill-opacity", 1e-6);
        enter.select("rect").style("fill", function(d) { 
                //return getColor(d, d.parent);
                return color(!!d.children); 
            });

        // Update the x-scale domain.
        x.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice();

        // Update the x-axis.
        svg.selectAll(".x.axis").transition()
            .duration(duration)
            .call(xAxis);

        // Transition entering bars to their new position.
        var enterTransition = enter.transition()
            .duration(duration)
            .delay(function(d, i) { return i * delay; })
            .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; });

        // Transition entering text.
        enterTransition.select("text")
            .style("fill-opacity", 1);

        // Transition entering rects to the new x-scale.
        enterTransition.select("rect")
            .attr("width", function(d) { return x(d.value); })
            .style("fill", function(d) { 
                //return getColor(d, d.parent);
                return color(!!d.children); 
            });

        // Transition exiting bars to fade out.
        var exitTransition = exit.transition()
            .duration(duration)
            .style("opacity", 1e-6)
            .remove();

        // Transition exiting bars to the new x-scale.
        exitTransition.selectAll("rect")
            .attr("width", function(d) { return x(d.value); });

        // Rebind the current node to the background.
        svg.select(".background")
            .datum(d)
            .transition()
            .duration(end);

        d.index = i;
    }

    function up(d) {
        if (!d.parent || this.__transition__) return;
        
        // var t=this;
        // d3.select("#back").selectAll("input").remove();
        // d3.select("#back")
        //     .append("input")
        //     .attr("type", "button")
        //     .attr("name", "back")
        //     .attr("value", "Back")
        //     .on("click", function () {
        //         //up.bind(t, d);
        // });

        //change pie chart
        var pie_json = [
                {label:"red", value: getPieValue("red", d.parent)},
                {label:"green", value:getPieValue("green", d.parent)},
                {label:"blue", value:getPieValue("blue", d.parent)},
                {label:"yellow", value:getPieValue("yellow", d.parent)},
                {label:"chocolate2", value:getPieValue("chocolate2", d.parent)},
                {label:"aquamarine", value:getPieValue("aquamarine", d.parent)},
                {label:"black", value:getPieValue("black", d.parent)},
        ];
        change(pie_json, pie_svg, pie_color);
            
            d3.selectAll(".abs_path")
                .text(d.parent.file_path);

            var op = []; 
        for(var j=0;j<d.parent.children.length;j++)
            if(d.parent.children[j].isDir)
                op.push(d.parent.children[j]);
    
        d3.select("#dropDown").selectAll("select").remove();
        d3.select("#dropDown")
            .append("select")
            .on("change", function() {
                down(this.options[this.selectedIndex].__data__, 0);
            })
            .selectAll("option")
            .data(op).enter()
            .append("option")
            .text(function(d) {
                return d.name;
            });

        var end = duration + d.children.length * delay;

        // Mark any currently-displayed bars as exiting.
        var exit = svg.selectAll(".enter")
            .attr("class", "exit");

        // Enter the new bars for the clicked-on data's parent.
        var enter = bar(d.parent)
            .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; })
            .style("opacity", 1e-6);

        /// Color the bars as appropriate.
        // Exiting nodes will obscure the parent bar, so hide it.
        enter.select("rect")
            .style("fill", function(d) { 
                //return getColor(d, d.parent);
                return color(!!d.children); 
            })
            .filter(function(p) { return p === d; })
            .style("fill-opacity", 1e-6);

        // Update the x-scale domain.
        x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

        // Update the x-axis.
        svg.selectAll(".x.axis").transition()
            .duration(duration)
            .call(xAxis);

        // Transition entering bars to fade in over the full duration.
        var enterTransition = enter.transition()
            .duration(end)
            .style("opacity", 1);

        // Transition entering rects to the new x-scale.
        // When the entering parent rect is done, make it visible!
        enterTransition.select("rect")
            .attr("width", function(d) { return x(d.value); })
            .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

        // Transition exiting bars to the parent's position.
        var exitTransition = exit.selectAll("g").transition()
            .duration(duration)
            .delay(function(d, i) { return i * delay; })
            .attr("transform", stack(d.index));

        // Transition exiting text to fade out.
        exitTransition.select("text")
            .style("fill-opacity", 1e-6);

        // Transition exiting rects to the new scale and fade to parent color.
        exitTransition.select("rect")
            .attr("width", function(d) { return x(d.value); })
            .style("fill", function(d) { 
                //return getColor(d, d.parent);
                return color(!!d.children); 
            });

        // Remove exiting nodes when the last child has finished transitioning.
        exit.transition()
            .duration(end)
            .remove();

        // Rebind the current parent to the background.
        svg.select(".background")
            .datum(d.parent)
            .transition()
            .duration(end);
    }

    // Creates a set of bars for the given data node, at the specified index.
    function bar(d) {
        var bar = svg.insert("g", ".y.axis")
            .attr("class", "enter")
            .attr("transform", "translate(0,5)")
            .selectAll("g")
            .data(d.children)
            .enter().append("g")
            .style("cursor", function(d) { return !d.children ? null : "pointer"; })
            .on("click", down);

        bar.append("text")
            .attr("x", -6)
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d.name; });

        bar.append("rect")
      .attr("width", function(d) { return x(d.value); })
      .attr("height", barHeight)//;
      .on("mouseover", function(d){  //Mouse event
            // d3.select(this)
            //     .transition()
            //     .duration(500)
            //     .attr("x", function(d) { return x(d.cocoa) - 30; })
            //     .style("cursor", "pointer")
            //     .attr("width", 60)
            if(d.isFile){
                myTool
                    .transition()  //Opacity transition when the tooltip appears
                    .duration(1000)
                    .style("opacity", "1")                           
                    .style("display", "block")  //The tooltip appears

                myTool
                    .html(d.name + "<br>" + d.concern_name + "<br>sloc: "+d.sloc)
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY) + "px")
                    .style("transform", "translate(-50%, -200%)")
            }
            else{
                myTool
                    .transition()  //Opacity transition when the tooltip appears
                    .duration(1000)
                    .style("opacity", "1")                           
                    .style("display", "block")  //The tooltip appears

                myTool
                    .html(
                    "" + "Click to navigate" + "")
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY) + "px")
                    .style("transform", "translate(-50%, -200%)")
            }
                
            })
            .on("mouseout", function(d){  //Mouse event
                // d3.select(this)
                //     .transition()
                //     .duration(500)
                //     .attr("x", function(d) { return x(d.cocoa) - 20; })
                //     .style("cursor", "normal")
                //     .attr("width", 40)
                    myTool
                        .transition()  //Opacity transition when the tooltip disappears
                        .duration(500)
                        .style("opacity", "0")            
                        .style("display", "none")  //The tooltip disappears
            });

            return bar;
    }

    // A stateful closure for stacking bars horizontally.
    function stack(i) {
        var x0 = 0;
        return function(d) {
            var tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
            x0 += x(d.value);
            return tx;
        };
    }

    function getPieValue(color, root){
        if(root.isFile){
            if(root.concern_color === color)
                return 1;
            else return 0;
        }
        else {
            var count=0;
            for(var i=0;i<root.children.length;i++){
                count+=getPieValue(color, root.children[i]);
            }
            return count;
        }
    }

    function change(data, pie_svg, color) {

            /* ------- PIE SLICES -------*/
            var slice = pie_svg.select(".slices").selectAll("path.slice")
                .data(pie(data), function(d){ return d.data.label });

            slice.enter()
                .insert("path")
                .style("fill", function(d) { 
                    //return color(d.data.label); 
                    return getPieColor(d.data.label);
                })
                .attr("class", "slice");

            slice
                .transition().duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                })
            slice
                .on("mousemove", function(d){
                    div.style("left", d3.event.pageX+10+"px");
                    div.style("top", d3.event.pageY-25+"px");
                    div.style("display", "inline-block");
                    div.html((concern_color_mapping[d.data.label])+"<br>"+(d.data.value));
                });
            slice
                .on("mouseout", function(d){
                    div.style("display", "none");
                });

            slice.exit()
                .remove();

            var legend = pie_svg.selectAll('.legend')
                .data(pie_color.domain())
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function(d, i) {
                    var height = legendRectSize + legendSpacing;
                    var offset =  height * pie_color.domain().length / 2;
                    var horz = -3 * legendRectSize;
                    var vert = i * height - offset;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', pie_color)
                .style('stroke', pie_color);

            legend.append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function(d) { return d; });

            /* ------- TEXT LABELS -------*/

            var text = pie_svg.select(".labelName").selectAll("text")
                .data(pie(data), function(d){ return d.data.label });

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(function(d) {
                    return (concern_color_mapping[d.data.label]+": "+d.value);
                });

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            text
                .transition().duration(1000)
                .attrTween("transform", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return "translate("+ pos +")";
                    };
                })
                .styleTween("text-anchor", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start":"end";
                    };
                })
                .text(function(d) {
                    return (concern_color_mapping[d.data.label]+": "+d.value);
                });


            text.exit()
                .remove();

            /* ------- SLICE TO TEXT POLYLINES -------*/

            var polyline = pie_svg.select(".lines").selectAll("polyline")
                .data(pie(data), function(d){ return d.data.label });

            polyline.enter()
                .append("polyline");

            polyline.transition().duration(1000)
                .attrTween("points", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit()
                .remove();
    }
    
    var margin = {top: 60, right: 120, bottom: 0, left: 200},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var barHeight = 20;

    var color = d3.scale.ordinal()
        .range(["steelblue", "#ccc"]);

    var duration = 500,
        delay = 25;

    var partition = d3.layout.partition()
        .value(function(d) { return d.sloc; });

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", up);

    svg.append("g")
        .attr("class", "x axis");

    svg.append("g")
        .attr("class", "y axis")
    .append("line")
        .attr("y1", "100%");

    var myTool = d3.select("body")
                    .append("div")
                    .attr("class", "mytooltip")
                    .style("opacity", "0")
                    .style("display", "none");

    //Initialize Pie Chart
    var pie_svg = d3.select("body")
            .append("svg")
            .append("g")

    pie_svg.append("g")
        .attr("class", "slices");
    pie_svg.append("g")
        .attr("class", "labelName");
    pie_svg.append("g")
        .attr("class", "labelValue");
    pie_svg.append("g")
        .attr("class", "lines");

    var pie_width = 1000,
        pie_height = 500,
        radius = Math.min(pie_width, pie_height) / 2;
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    var legendRectSize = (radius * 0.05);
    var legendSpacing = radius * 0.02;


    var div = d3.select("body").append("div").attr("class", "toolTip");

    pie_svg.attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");

    var colorRange = d3.scale.category20();
    // var pie_color = d3.scale.ordinal()
    //     .range(colorRange.range());

    //construct pie domain dynamically so that changing color concern would reflect changes
    var pie_domain = [];
    var pie_color = d3.scale.ordinal()
        .domain([concern_color_mapping["red"], concern_color_mapping["green"], concern_color_mapping["blue"], concern_color_mapping["yellow"], concern_color_mapping["chocolate2"], concern_color_mapping["aquamarine"], concern_color_mapping["black"]])
        .range(["red", "green", "blue", "yellow", "brown", "lightblue", "black"]);
    function getPieColor(label){
        if(label === "red") return "red";
        if(label === "green") return "green";
        if(label === "blue") return "blue";
        if(label === "yellow") return "yellow";
        if(label === "chocolate2") return "brown";
        if(label === "aquamarine") return "lightblue";
        if(label === "black") return "black";
    }
    
    root = apache_log4j;
    //d3.json("/apache_log4j_2_2.json", function(error, root) {
      //  if (error) throw error;
        //root = root.children[0];
        partition.nodes(root);
        x.domain([0, root.value]).nice();
        down(root, 0);
    //});
}

