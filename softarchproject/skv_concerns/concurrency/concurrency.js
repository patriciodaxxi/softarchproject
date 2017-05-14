Parallel vs Concurrent in Node.js
Share on Twitter, Facebook, LinkedIn, Google+

In a heated debate over technicalities on the internet you may have heard the argument "Yeah, that may be concurrent but not parallel computing." You're wondering what do they mean anyways? What's the difference? Most importantly, should I care?

As it turns out, Node.js can be can be categorized into one of these. On the general level though, as long as you keep in mind that the CPU is pretty much always keeping several balls in the air you're all good.
More work than there are resources

Let's assume that there is more work to be done than there are resources for doing them. That there are multiple threads or sequences of operations to step through. With only one thread or operation sequence there isn't much to discuss in terms of concurrency or parallelism.
Concurrent

Concurrent operation means that two computations can both make progress and advance regardless of the other. If there are two threads, for example, then both make progress independently. The second computation doesn't need to wait for the first one to complete before it can be advanced.
Diagram
Figure 1. Pre-emptive multithreading is one way to achieve concurrency.

If computation is said to be concurrent, then it doesn't necessarily dictate how the concurrency is achieved under the hood. In single-core setup it is possible that the computations take turns in execution. The CPU might run few instructions from the other thread, then suspend it and switch over to the second and run few steps from it and so on. This is also called pre-emptive multithreading. It may also be possible that there are more cores available that can be used to run both at the same time. This, in fact, is parallel computation as we'll see next.
Parallel
Diagram
Figure 2. Parallel computation advances simultaneously.

Parallel operation means that two computations are literally running simultaneously - at the same time. At one point in time both computations are advanced. There is no taking turns, they are advanced at the same time. Naturally this is not possible with single-core CPU, but multiple-core architecture is required instead.

It can be said that if computation is parallel it is also concurrent - since parallel computation also fulfills the definition of concurrent computation.
Node.js perspective

At the high level Node.js falls into the category of concurrent computation. This is a direct result of the single-threaded event loop being the backbone of a Node.js application. The event-loop repeatedly takes an event and fires any event handlers listening to that event one at a time. No JavaScript code is ever executed in parallel.

As long as the event handlers are small and frequently wait for yet more events themselves, all computations (for example fulfilling and serving a HTTP request) can be thought as advancing one small step at a time - concurrently. This is beneficial in web applications where the majority of the time is spent waiting for I/O to complete. It allows single Node.js process to handle huge amounts of requests.

To make Node.js operate the way it does, there is little magic under the hood. Some lower level operations are performed in parallel in separate worker threads. Parallelism at the JavaScript level can be achieved by starting multiple Node.js processes or child processes to occupy all processor cores. In the next article, we'll take a birds eye view into what event loop looks like.
