/**
 * Routes in this API, by order (also the order of test cases)
 * POST tasks : create new task
 * GET tasks/?idx= & count= : retrieve general info of number of tasks
 * (including custom parameters to search)
 * GET tasks/:taskID : retrieve details of a particular task
 * PATCH tasks/:taskID?userID= : edit existing task
 * POST tasks/:taskID?userID= : subscribe to a task
 * DELETE tasks/:taskID?userID= : delete existing task
 */

"use strict";

const express = require("express"),
    database = require("../data/database.js"),
    bodyParser = require("body-parser");

const router = express.Router();

router
    .route("/")
    .get((req, res) => {
        let { idx, count } = req.query,
            queryTask = JSON.parse(req.query.q || "{}"),
            searchTask = {};

        idx = Number(idx);
        count = Number(count);
        if (queryTask.name) searchTask.name = RegExp(queryTask.name);
        if (queryTask.creator) searchTask.creator = RegExp(queryTask.creator);
        if (queryTask.city) searchTask.city = RegExp(queryTask.city);
        if (queryTask.country) searchTask.country = RegExp(queryTask.country);
        if (queryTask.startTime)
            searchTask.startTime = RegExp(queryTask.startTime);
        if (queryTask.endTime) searchTask.endTime = RegExp(queryTask.endTime);

        if (isNaN(idx) || isNaN(count)) res.sendStatus(400);
        else {
            database.readAllTasks(idx, count, searchTask).then(
                docs => {
                    res.status(200).send(docs);
                },
                err => {
                    console.log(err.message);
                    res.sendStatus(400);
                }
            );
        }
    })
    .post(bodyParser.json(), (req, res) => {
        let task = req.body;
        database.createTask(task).then(
            () => {
                res.sendStatus(200);
            },
            err => {
                console.log(err.message);
                res.sendStatus(400);
            }
        );
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
                    res.status(200).send(docs);
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
            taskID = req.params.taskID,
            userID = req.query.userID;

        if (taskID.length === 0 || userID.length === 0) res.sendStatus(400);
        else
            database.editTask(taskID, userID, task).then(
                () => {
                    res.sendStatus(200);
                },
                err => {
                    console.log(err.message);
                    res.sendStatus(400);
                }
            );
    })
    .delete((req, res) => {
        let userID = req.query.userID,
            taskID = req.params.taskID;

        if (taskID.length === 0 || userID.length === 0) res.sendStatus(400);
        else
            database.deleteTask(taskID, userID).then(
                () => {
                    res.sendStatus(200);
                },
                err => {
                    console.log(err.message);
                    res.sendStatus(400);
                }
            );
    })
    .post((req, res) => {
        let userID = req.query.userID,
            taskID = req.params.taskID;

        if (taskID.length === 0 || userID.length === 0) res.sendStatus(400);
        else
            database.subscribe(taskID, userID).then(
                () => {
                    res.sendStatus(200);
                },
                err => {
                    console.log(err.message);
                    res.sendStatus(400);
                }
            );
    });

module.exports = router;
