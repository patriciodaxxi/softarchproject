

It is useful to understand how node and V8 interact. Node handles waiting for I/O or timers from the operating system. When node wakes up from I/O or a timer, it generally has some JavaScript callbacks to invoke. When node runs these callbacks, control is passed into V8 until V8 returns back to node.

So, if you do var ii = 1; ii++;, you will never find that ii is anything other than 2. All JavaScript runs until completion, and then control is passed back to node. If you do doSomething(); doSomething(); that will always run doSomething twice, and it will not return to node's event loop until the second invocation of doSomething returns. This means you can completely lock up node from a simple error like this:

for (var i=0 ; i >= 0 ; i++) {}

It doesn't mater how many I/O callbacks you have registered, timers set to go off, or sockets waiting to be read. Until V8 returns from that infinite loop, node does no more work.

This is part of what makes programming in node so nice. You never have to worry about locking. There are no race conditions or critical sections. There is only one thread where your JavaScript code runs.
shareedit
	
answered Mar 3 '11 at 7:18
Matt Ranney
1,444912
	
2 	 
	
I had a stupid moment and for a second didn't realize why that was an infinite loop. For anybody slow like me, remember that the second condition in the for loop is the condition for continuation, not termination. I.e. the standard for loop that terminates is "for (var i = 0; i < 0; i++) {}" – everybody Jan 16 '15 at 14:13
3 	 
	
is it really infinite? won't i wrap around at some point and become negative? – stu Feb 6 '15 at 13:39
2 	 
	
Try this: 9007199254740992 + 1 – maletor Mar 18 '15 at 17:12
   	 
	
@stu, all numbers in JavaScript are double precision floating point type. They can't do this by definition. – nekavally Aug 21 '15 at 10:19
2 	 
	
"You never have to worry about locking. There are no race conditions or critical sections." I hear this a lot about Node. Just because it's single threaded doesn't mean you can't have the above problems. The classic "bank account example" where two requests do balance += 10 could just as easily fail in a single-threaded asynchronous environment if the two requests happen to result in database operations being called in the order "read, read, write, write". – JHH Aug 22 '16 at 8:06
add a comment
up vote
4
down vote
	

A good article that explains what is, and is not, asynchronous in node.js is Understanding the node.js Event Loop. If you can understand that you will be able to identify where your application has async behavior and where it doesn't. By understanding this you can explicitly write sequential code when you need it. EventEmitters are key.

Singlethreadedness sounds at odds with the idea that node.js is high performance and scalable so have a look at this article from Yahoo on Multicore.
