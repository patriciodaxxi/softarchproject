And finally, here is our JavaScript file. This is where it gets interesting!
js/script.js

// Mixing jQuery and Node.js code in the same file? Yes please!

$(function(){


	// Display some statistic about this computer, using node's os module.

	var os = require('os');
	var prettyBytes = require('pretty-bytes');

	$('.stats').append('Number of cpu cores: <span>' + os.cpus().length + '</span>');
	$('.stats').append('Free memory: <span>' + prettyBytes(os.freemem())+ '</span>');

	// Node webkit's native UI library. We will need it for later
	var gui = require('nw.gui');


	// Fetch the recent posts on Tutorialzine

	var ul = $('.flipster ul');

	// The same-origin security policy doesn't apply to node-webkit, so we can
	// send ajax request to other sites. Let's fetch Tutorialzine's rss feed:

	$.get('http://feeds.feedburner.com/Tutorialzine', function(response){

		var rss = $(response);

		// Find all articles in the RSS feed:

		rss.find('item').each(function(){
			var item = $(this);
			
			var content = item.find('encoded').html().split('</a></div>')[0]+'</a></div>';
			var urlRegex = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g;

			// Fetch the first image of the article
			var imageSource = content.match(urlRegex)[1];


			// Create a li item for every article, and append it to the unordered list

			var li = $('<li><img /><a target="_blank"></a></li>');

			li.find('a')
				.attr('href', item.find('link').text())
				.text(item.find("title").text());

			li.find('img').attr('src', imageSource);

			li.appendTo(ul);

		});

		// Initialize the flipster plugin

		$('.flipster').flipster({
			style: 'carousel'
		});

		// When an article is clicked, open the page in the system default browser.
		// Otherwise it would open it in the node-webkit window which is not what we want.

		$('.flipster').on('click', 'a', function (e) {

			e.preventDefault();
			
			// Open URL with default browser.
			gui.Shell.openExternal(e.target.href);

		});

	});

});

Notice that we are accessing Tutorialzine’s RSS feed directly with jQuery, even though it is on a different domain. This is not possible in a browser, but Node-WebKit removes this limitation to make development of desktop applications easier.

Here are the node modules we’ve used:

    Shell – A node webkit module that provides a collection of APIs that do desktop related jobs.
    OS – The built-in Node.js OS module, which has a method that returns the amount of free system memory in bytes.
    Pretty Bytes – Convert bytes to a human readable string: 1337 → 1.34 kB.

Our project also includes jQuery and the jQuery-flipster plugin, and that’s pretty much it!
Packaging and Distribution

You most certainly don’t want your users to go through the same steps in order to run you application. You wan’t to package it in a standalone program, and open it by simply double clicking it.

Packaging node-webkit apps for multiple operating systems takes a lot of work to do manually. But there are libraries that do this for you. We tried this npm module – https://github.com/mllrsohn/node-webkit-builder, and it worked pretty well.

The only disadvantage is that the executable files have a large size (they can easily hit 40-50mb) , because they pack a stripped down webkit browser and node.js together with your code and assets. This makes it rather impractical for small desktop apps (such as ours), but for larger apps it is worth a look.
Conclusion

Node-webkit is a powerful tool that opens a lot of doors to web developers. With it, you can easily create companion apps for your web services and build desktop clients which have full access to the users’s computer.

You can read more about node-webkit on their wiki.
