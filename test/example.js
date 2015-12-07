var TaskQueue = require('../index.js');
var fs = require('fs');
var fileName = __filename;

/*
// Test case 1
var d1, d2;
fs.readFile(fileName, function (err, data) {
    if (err) {
        console.log("ERROR: " + err);
    }else{
        d1 = (data.toString());
    }

});

var taskQueue = new TaskQueue();

taskQueue.addTask(function () {
    fs.readFile(fileName, taskQueue.wrapCallback(function (err, data) {
        if (err) {
            console.log("ERROR: " + err);
        }else{
            d2 = (data.toString());
        }
    }));
});
*/

// Test case 2
var taskQueue2 = new TaskQueue({'sleepBetweenTasks': 700, 'concurrency': 2});
for (var i = 0; i < 10; i++) {
    taskQueue2.addTask(myCreateTask(i));
}

function myCreateTask(i) {
    return function () {
        console.log("Task " + i);
        setTimeout(
            taskQueue2.wrapCallback(function () {
                console.log("Task " + i + " done");
            }), 300);
    };
}
