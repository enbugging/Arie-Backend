/**
 * Routes in this API, by order
 * POST tasks : create new task
 * GET tasks/?idx= & count= : retrieve general info of number of tasks
 * (including custom parameters to search)
 * GET tasks/:taskID : retrieve details of a particular task
 * PATCH tasks/:taskID : edit existing task
 * DELETE tasks/:taskID?userID= : delete existing task
 * POST tasks/:taskID?userID= : subscribe to a task
 */

"use strict";

const express = require("express");
const database = require("../data/database.js");
const bodyParser = require("body-parser");

const router = express.Router();

router
    .route("/")
    .get(bodyParser.json(), (req, res) => {
        let { idx, count } = req.query,
            queryTask = req.body,
            searchTask = {};

        idx = Number(idx);
        count = Number(count);
        if (queryTask.name) searchTask.name = queryTask.name;
        if (queryTask.creator) searchTask.creator = queryTask.creator;
        if (queryTask.city) searchTask.city = queryTask.city;
        if (queryTask.country) searchTask.country = queryTask.country;
        if (queryTask.startTime) searchTask.startTime = queryTask.startTime;
        if (queryTask.endTime) searchTask.endTime = queryTask.endTime;

        if (isNaN(idx) || isNaN(count)) res.sendStatus(400);
        else {
            database.readAllTasks(idx, count, searchTask).then(
                docs => {
                    res.send(docs);
                },
                err => {
                    res.sendStatus(400);
                    console.log(err.message);
                }
            );
        }
    })
    .post(bodyParser.json(), (req, res) => {
        let task = req.body;
        database.createTask(task).then(() => {
            res.sendStatus(200);
        });
    });

// Get exact task by ID
router
    .route("/:taskID")
    .get((req, res) => {
        let taskID = req.params.taskID;

        if (taskID.length === 0) res.sendStatus(400);
        else {
            database.readOneTask(taskID).then(
                docs => {
                    res.send(docs);
                },
                err => {
                    res.sendStatus(400);
                    console.log(err.message);
                }
            );
        }
    })
    .patch(bodyParser.json(), (req, res) => {
        let task = req.body,
            taskID = req.params.taskID;

        if (taskID.length === 0) res.sendStatus(400);
        else
            database
                .editTask(taskID, task)
                .then(() => res.sendStatus(200), () => res.sendStatus(400));
    })
    .delete((req, res) => {
        let userID = req.query.userID,
            taskID = req.param.taskID;

        if (taskID.length === 0 || userID.length === 0) res.sendStatus(400);
        else
            database
                .deleteTask(taskID, userID)
                .then(() => res.sendStatus(200), () => res.sendStatus(400));
    })
    .post((req, res) => {
        let userID = req.query.userID,
            taskID = req.params.taskID;

        if (taskID.length === 0 || userID.length === 0) res.sendStatus(400);
        else
            database
                .subscribe(taskID, userID)
                .then(() => res.sendStatus(200), () => res.sendStatus(400));
    });

module.exports = router;