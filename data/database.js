"use strict";
// template part
const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Big = require("big.js"),
    fetch = require("node-fetch");

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
 * @param {Map} participantIDs : the list of participants' ID
 */
var task = new Schema({
    name: String,
    creator: String,
    description: String,
    checkpoints: [checkpoint],
    createTime: Date,
    startTime: Date,
    endTime: Date,
    participantIDs: Map
});

var Tasks = mongoose.model("Tasks", task);

/**
 * Definition of an user
 * @param {String} name : name of user
 * @param {String} gmailAddress : Gmail address of user
 * @param {Map} results : a map contains many small maps, each map corresponds with id of a task
 * storing id of finished checkpoints
 * @param {Map} sessions : a map contains existing sessions
 */
var user = new Schema({
    name: String,
    gmailAddress: String,
    results: Map, 
    sessions : Map
});

var Users = mongoose.model("Users", user);

/**
 * A data structure to update and retrieve trending tasks
 * from continuous data stream
 * @param {Number} alp : the time decaying factor (0 < alp < 1)
 * @param {Number} MAX_TREND : the number of counters
 */
const alp = new Big(0.989),
    MAX_TREND = 5;
var Trend = new Map(), // TODO : save into db
    lastStep = 0, 
    last = new Date("2001-07-08T09:00:00+0700").getTime();

/**
 * Login to database
 * @param {Users} user
 */
async function login(user) {
    let query;
    try {
        fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo`, {
            header: {
                Authorization: user.accessToken
            }
        }).then(res => {
            if (!res.ok) throw new Error("Non-existent Gmail account");
        });

        query = await Users.findOne({ gmailAddress: user.gmailAddress });
        if (query) {
            // existed user => update name if necessary
            if (query.name !== user.name) {
                // update name
                Users.updateOne(
                    { _id: query._id },
                    {
                        name: user.name
                    }
                );
            }
        } else {
            // new user => create new one
            var newUser = new Users({
                name: user.name,
                gmailAddress: user.gmailAddress,
                results: new Map()
            });

            newUser.save(function(err) {
                if (err) throw err;
            });
        }
    } catch (err) {
        throw err;
    }
}

/**
 * Save new results into database
 * @param {String} userID
 * @param {Map} newrResults
 */
async function updateResults(userID, newResults) {
    let oldResults;
    try {
        // retrieve old results
        await Users.findById(userID, "results").then(
            docs => {
                oldResults = docs.results;
            },
            err => {
                res.status(400).json(err.message);
            }
        );

        // update with new results
        let combinedResults = new Map(newResults, oldResults);

        // save into database
        await Users.updateOne(
            { _id: userId },
            {
                results: combinedResults
            }
        );
    } catch (err) {
        throw err;
    }
}

/**
 * Fetch data from database, using userID
 * @param {String} userID
 */
async function fetchResults(userID) {
    let query;
    try {
        query = await Users.findById(userID);
    } catch (err) {
        throw err;
    }

    return query;
}

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

async function readTrendings() {
    let res = new Array(...Trend.keys());
    if (res.length === 0) await readAllTasks(0, MAX_TREND, {});
    console.log(res);
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
            now = Date.now(),
            creator = await Users.findById(task.creator);

        if (!creator) throw new Error("Non-existent creator");

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
            participantIDs: new Map()
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
 * Update trending score of a task
 * Side note: The algorithm was retrieved as Algorithm 2 from
 * Lim, Yongsub & Kang, U. (2017).
 * "Time-weighted counting for recently frequent pattern
 * mining in data streams. Knowledge and Information Systems".
 * p. 11, 53. 10.1007/s10115-017-1045-1.
 * (https://yongsub.me/resources/papers/kais17.pdf)
 * @param {String} taskID : id of the task
 */
function updateTrend(taskID) {
    let cur = Date.now(),
        delta = cur - last;
    delta = delta / 1000; // convert to seconds
    delta = delta / 20; // convert to time step of 20s
    delta = Math.ceil(delta); // round up

    // update tasks in Trend
    if (delta > 4320 + lastStep)
        // being out of 24-hour window, which is too small to be worth considering
        // 0.989^4320 ~ 1.75e-21
        Trend.forEach((value, key) => {
            Trend.set(key, new Big(0));
        });
    else if (delta > lastStep) {
        // different window than the last one, making it necessary to multiply the time decaying factor
        let decay = new Big(alp).pow(delta);
        Trend.forEach((value, key) => {
            Trend.set(key, value.times(decay));
        });
    }

    // update time counter
    last = cur;
    lastStep = delta;

    // update Trend
    if (Trend.has(taskID)) Trend.set(taskID, Trend.get(taskID) + 1);
    else if (Trend.size < MAX_TREND) Trend.set(taskID, 1);
    else {
        let outdateTask_Counter = new Big(-1),
            outdateTask_id;
        Trend.forEach((value, key) => {
            if (outdateTask_Counter.eq(-1) || outdateTask_Counter.gt(value))
                (outdateTask_id = key), (outdateTask_Counter = value);
        });

        if (outdateTask_Counter.lt(1)) {
            Trend.delete(outdateTask_id);
            Trend.set(taskID, 1);
        }
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
        if (!participants.has(userID)) {
            updateTrend(taskID);
            participants.set(userID, userID);
        }
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

/**
 * Unsubscribe an user to a task
 * @param {String} taskID : id of the task
 * @param {String} userID : id of the participant
 */
async function unsubscribe(taskID, userID) {
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
        participants.delete(userID);
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

module.exports = {
    Checkpoints,
    Tasks,
    Users,
    login,
    updateResults,
    fetchResults,
    readAllTasks,
    readTrendings,
    readOneTask,
    createTask,
    editTask,
    deleteTask,
    subscribe,
    unsubscribe
};
