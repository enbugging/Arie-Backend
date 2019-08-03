"use strict";
// template part
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    // we're connected!
});
var Schema = mongoose.Schema;

/**
 * Definition of a Task
 * @param {String} name : name of the task
 * @param {String} creator : ID of the creator
 * @param {String} description : description of the task
 * @param {Array} places : tasks' description and places where the task will take place
 * @param {Date} createTime : timestamp of task's creation
 * @param {Date} startTime : when the task will begin
 * @param {Date} endTime : when the task will end
 * @param {Array} participantIDs : the list of participants' ID
 */
var task = new Schema({
    name: String,
    creator: String,
    description: String,
    places: Array,
    createTime: Date,
    startTime: Date,
    endTime: Date,
    participantIDs: Array
});

var Tasks = mongoose.model("Tasks", task);

/**
 * Get the general information of 'count' tasks from IDX-th task
 * @param {Number} IDX : index of the first task of 'count' task in the scoreboard
 * @param {Number} count : number of tasks being queried
 * @param {Task} task : the description of tasks being searched (leaved empty if not searching)
 */
async function readAllTasks(IDX, count, task) {
    let res;
    try {
        if (count !== 0)
            res = await Tasks.find(task)
                .sort({ createTime: 1 })
                .skip(Math.max(IDX - 1, 0))
                .limit(count);
    } catch (err) {
        throw err;
    }

    return res;
}

/**
 * Get all information of a particular task
 * @param {String} taskID : ID of queried task
 */
async function readOneTask(taskID) {
    let res;
    try {
        res = await Tasks.findById(taskID);
    } catch (err) {
        throw err;
    }

    return res;
}

/**
 * Create a new task
 * @param {Task} task : new task being added to the database
 */
async function createTask(task) {
    var newTask = new Tasks({
        name: task.name,
        creator: task.creator,
        description: task.description,
        places: task.places,
        createTime: Date.now(),
        startTime: task.startTime,
        endTime: task.endTime,
        participantIDs: new Array()
    });

    newTask.save(function(err) {
        if (err) throw err;
    });
}

/**
 * Edit an existing task
 * @param {String} taskID: id of task being edited
 * @param {Task} task: a task containing new information
 */
async function editTask(taskID, task) {
    try {
        await Tasks.updateOne(
            { _id: taskID },
            {
                name: task.name,
                description: task.description,
                places: task.places,
                startTime: task.endTime,
                endTime: task.endTime
            }
        );
    } catch (err) {
        throw err;
    }
}

/**
 * Delete an existing task
 * @param {String} taskID 
 * @param {String} userID 
 */
async function deleteTask(taskID, userID) {
    try {
        await Tasks.deleteOne({ _id : taskID, creator : userID });
    } catch(err) {
        throw err;
    }
}

/**
 * Subscribe an user to a task
 * @param {String} taskID : id of the task
 * @param {String} userID : id of the participant
 */
async function subscribe(taskID, userID) {
    let participants;
    try {
        await Tasks.findById(taskID, "participantIDs").then(
            docs => {
                participants = docs.participantIDs;
            },
            err => {
                res.status(400).json(err.message);
            }
        );
        participants.push(userID);
        await Tasks.updateOne(
            { _id: taskID },
            {
                participantIDs: participants
            }
        );
    } catch (err) {
        throw err;
    }
}

module.exports = {
    readAllTasks,
    readOneTask,
    createTask,
    editTask,
    deleteTask, 
    subscribe
};
