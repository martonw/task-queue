# Task queue

Task queue is a simple node.js library that is able to run tasks in a controlled
way, more precisely it can be adjusted how many concurrent Tasks can run at the
same time (limit concurrency). Furthermore, you can specify a 'sleep' time that
should be wait before the next task is being executed.

This is very similar to thread pools in multi threaded environment, where you
can set a sleep() on each thread between 2 actions. This is particularly useful
when you need to limit the use of external/internal resources, ie. you do not
want to call a service URL too frequently to avoid service overload.

## Installation

```
npm install task-queue-async
```

## Usage

In fact, tasks in this library are single functions that have an (async)
callback. Let's consider this fairly simple piece of code that reads a file
 (in an async way):
```
fs.readFile(fileName, function (err, data) {
    // this is your reguar callback function
    if (err) {
        console.log("ERROR: " + err);
    }else{
        console.log("File read with length: " + data.toString().length);
    }
});
```

Now you can do the same with this lib in the following way:
```
var TaskQueue = require('task-queue');
var taskQueue = new TaskQueue();

taskQueue.addTask(function () {
    fs.readFile(fileName, this.wrapCallback(function (err, data) {
        if (err) {
            console.log("ERROR: " + err);
        }else{
            console.log("File read with length: " + data.toString().length);
        }
    }));
});
```

Note that the task itself is passed as a simple anonymous function, and it was
added to the queue using the `taskQueue.addTask()` call.

One important thing to recognise that the original callback code (the second
argument of fs.readfile) is wrapped into a function called `this.wrapCallback`.
(The `this` keyword is actually pointing into the wrapping Task object that is
hidden by the `addTask()` call.)

### Example
A bit more complex example where we add 10 tasks to the queue and we want to
limit the parallelism to 3, and waiting 2 seconds before starting the next task
in the given 'thread'.

```
var taskQueue2 = new TaskQueue({'sleepBetweenTasks': 2000, 'concurrency': 3});
for (var i = 0; i < 10; i++) {
    taskQueue2.addTask(myCreateTask(i));
}

function myCreateTask(i) {
    return function () {
        console.log("Task " + i);
        setTimeout(
            this.wrapCallback(function () {
                console.log("Task " + i + " done | queue length: " + taskQueue2.length());
            }), 1000);
    };
}
```
In the code above, `myCreateTask()` is just a simple way to simulate any aysnc
task that will return in 1 sec. In the real world, this could be a bunch of file
operations or a series of API calls.

## API
To create a new task queue, you will need to initialite a new instance of the
TaskQueue class.

### new TaskQueue([options])
Where options is an object. Valid keys are:
* `concurrency` - Defines how many concurrent tasks are allowed to run at the
same time. Default is 1.
* `sleepBetweenTasks` - Defines how many milliseconds should the thread sleep
between the execution of 2 tasks.

### addTask(function)
Adds a new task to the queue. The function will be called with zero arguments.
It is _always_ expected that the function has a callback that is wrapped into
a `this.wrapCallback()` call. See examples above.

### length()
To check the length of the queue, you can always call taskQueue.length().
