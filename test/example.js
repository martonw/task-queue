var TaskQueue = require('../index.js');
var fs = require('fs');
var fileName = __filename;


// Test case 1
var d1, d2;
fs.readFile(fileName, function (err, data) {
    if (err) {
        console.log("ERROR: " + err);
    }else{
        d1 = (data.toString());
        console.log("File read with length: " + d1.length);
    }

});

var taskQueue = new TaskQueue();

taskQueue.addTask(function () {
    fs.readFile(fileName, this.wrapCallback(function (err, data) {
        if (err) {
            console.log("ERROR: " + err);
        }else{
            d2 = (data.toString());
            console.log("File read with length: " + d2.length);
        }
    }));
});
console.log("Task queue length after adding 1 task: " + taskQueue.length());


// Test case 2
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
