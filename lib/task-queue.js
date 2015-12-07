'use strict';

var TaskQueue = function (options) {

    var self = this;
    self.options = options;
    var _queue = [];
    var _currentConcurrentTasks = 0;
    var _threadBusyVector = [0];
    var _lastTaskId = 0;
    var _taskToThreadMap = {};

    // check options and add defaults
    if (!self.options) {
        self.options = {};
    }
    if(self.options.concurrency){
        if (self.options.concurrency !== parseInt(self.options.concurrency, 10) || self.options.concurrency < 1) {
            throw new Error("concurrency must be a positive integer");
        }
    } else {
        self.options.concurrency = 1;
    }
    if(self.options.sleepBetweenTasks){

        if (self.options.sleepBetweenTasks !== parseInt(self.options.sleepBetweenTasks, 10) || self.options.sleepBetweenTasks < 0) {
            throw new Error("sleepBetweenTasks must be a non-negative integer");
        }
    } else {
        self.options.sleepBetweenTasks = 0;
    }
    _threadBusyVector = new Array(self.options.concurrency);

    self.addTask = function (taskFunction) {

        _queue.push(new Task(_lastTaskId++, taskFunction, self));
        setTimeout(scheduleTasks, 0);
    };

    self.wrapCallback = function (task, taskCallback) {

        return function(){
            taskCallback.apply(this, arguments);

            // free up 'resources'
            var threadId = _taskToThreadMap[task._task.taskId];
            //console.log("> going to free up resources for thread %s (task %s)", threadId, task._task.taskId);
            setTimeout(function () {
                _threadBusyVector[threadId] = 0;
                _currentConcurrentTasks--;
                setTimeout(scheduleTasks, 0);
            }, self.options.sleepBetweenTasks);

        };
    };

    self.length = function () {
        return _queue.length;
    }

    var scheduleTasks = function () {
        if (_queue.length) { // we have tasks to schedule
            if (_currentConcurrentTasks < self.options.concurrency) { // we got free 'threads' to schedule a task for
                var threadId = -1;

                // find a free thread
                for (var i = 0; i < _threadBusyVector.length; i++) {
                    if(!_threadBusyVector[i]){
                        threadId = i;
                        break;
                    }
                }
                if (threadId > -1) {
                    var task = _queue.shift();
                    _threadBusyVector[threadId] = 1;
                    _taskToThreadMap[task._task.taskId] = threadId;
                    _currentConcurrentTasks++;
                    setTimeout(function () {
                        task.run();
                    },0);
                }
            }
        }
    };
};

var Task = function (taskId, actionFunc, taskQueue) {
    this._task = {
        'taskId': taskId,
        'taskQueue': taskQueue
    };
    this.run = actionFunc;
    this.wrapCallback = function (taskCallback) {
        return taskQueue.wrapCallback(this, taskCallback);
    }
}

module.exports = TaskQueue;
