"use strict";
// template part
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Definitinon of a Checkpoint
 * @param {String} title : name of the checkpoint
 * @param {String} description : description of the checkpoint
 * @param {String} label : the Hash code of the label being compared
 * @param {String} type : type of the label
 * @param {Number} longitude : longitutde of the checkpoint
 * @param {Number} latitude : latitude of the checkpoint
 */

var checkpoint = new Schema({
    title: String,
    description: String,
    label: String,
    type: String,
    latitude: Number,
    longitude: Number
});

var Checkpoints = mongoose.model("Checkpoints", checkpoint);

/**
 * Definition of a Task
 * @param {String} name : name of the task
 * @param {String} creator : ID of the creator
 * @param {String} description : description of the task
 * @param {Array} checkpoints : checkpoints where the task will take place
 * @param {Date} createTime : timestamp of task's creation
 * @param {Date} startTime : when the task will begin
 * @param {Date} endTime : when the task will end
 * @param {Array} participantIDs : the list of participants' ID
 */
var task = new Schema({
    name: String,
    creator: String,
    description: String,
    checkpoints: [checkpoint],
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
    try {
        let start = new Date(task.startTime),
            end = new Date(task.endTime),
            now = Date.now();

        if (start.getTime() > end.getTime())
            throw new Error("Invalid start/end time");
        else if (now > end.getTime())
            throw new Error("Cannot create a task having ended");
        else if (now > start.getTime())
            throw new Error("Cannot create a task having began");

        for (let i = 0; i < task.checkpoints.length; i++) {
            let lat = task.checkpoints[i].latitude,
                lon = task.checkpoints[i].longitude;
            if (-90 > lat || lat > 90 || -180 > lon || lon > 180)
                throw new Error(
                    `Invalid coordinate(s) of the checkpoint numbered ${i + 1}`
                );
        }

        var newTask = new Tasks({
            name: task.name,
            creator: task.creator,
            description: task.description,
            checkpoints: task.checkpoints.map(doc => new Checkpoints(doc)),
            createTime: now,
            startTime: start,
            endTime: end,
            participantIDs: new Array()
        });

        newTask.save(function(err) {
            if (err) throw err;
        });
    } catch (err) {
        throw err;
    }
}

/**
 * Edit an existing task
 * @param {String} taskID: id of task being edited
 * @param {Task} task: a task containing new information
 */
async function editTask(taskID, userID, task) {
    let res;
    try {
        let start = new Date(task.startTime),
            end = new Date(task.endTime),
            now = Date.now();

        for (let i = 0; i < task.checkpoints.length; i++) {
            let lat = task.checkpoints[i].latitude,
                lon = task.checkpoints[i].longitude;
            if (-90 > lat || lat > 90 || -180 > lon || lon > 180)
                throw new Error(
                    `Invalid coordinate(s) of the checkpoint numbered ${i + 1}`
                );
        }

        res = await Tasks.findById(taskID);

        if (res.creator === userID) {
            let oldStart = new Date(res.startTime).getTime(),
                oldEnd = new Date(res.endTime).getTime();
            if (oldStart > now) {
                if (start.getTime() > end.getTime())
                    throw new Error("Invalid start/end time");
                if (start.getTime() < now)
                    throw new Error(
                        "Cannot edit a task to start it before present"
                    );
            } else if (now > oldEnd)
                throw new Error("Cannot edit a task having ended");
            else {
                if (oldStart !== start.getTime())
                    throw new Error(
                        "Cannot edit the start time of a task having started earlier"
                    );
                else if (oldEnd > end.getTime())
                    throw new Error(
                        "Cannont edit the end time of a task to end it sooner than initial setup"
                    );
            }

            await Tasks.updateOne(
                { _id: taskID },
                {
                    name: task.name,
                    description: task.description,
                    checkpoints: task.checkpoints.map(
                        doc => new Checkpoints(doc)
                    ),
                    startTime: start,
                    endTime: end
                }
            );
        } else throw new Error("Unauthorized attempt to edit tasks!");
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
    let res;
    try {
        res = await Tasks.findById(taskID);
        if (res.creator === userID) await Tasks.deleteOne({ _id: taskID });
        else throw new Error("Unauthorized attempt to delete tasks!");
    } catch (err) {
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
    Checkpoints,
    Tasks,
    readAllTasks,
    readOneTask,
    createTask,
    editTask,
    deleteTask,
    subscribe
};
