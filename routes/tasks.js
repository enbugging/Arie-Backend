/**
 * Routes in this API, by order
 * - API for users
 * GET tasks/user : retrieve subscribed tasks' data of an user
 * POST tasks/user : login to database
 * PATCH tasks/user : update results
 * DELETE tasks/user : logout from database
 * GET tasks/user/mytasks : retrieve tasks having been created by that user
 *
 * - API for tasks
 * POST tasks : create new task
 * GET tasks/?idx= & count= : retrieve general info of number of tasks
 * (including custom parameters to search)
 * GET tasks/trending : retrieve top 5 trending tasks (or all tasks if there're less than 5)
 * GET tasks/:taskID : retrieve details of a particular task
 * PATCH tasks/:taskID : edit existing task
 * DELETE tasks/:taskID : delete existing task
 * POST tasks/:taskID : subscribe to a task
 * DELETE tasks/unsubscribe/:taskID : unsubscribe to a task
 */

"use strict";

const express = require("express"),
    database = require("../data/database.js"),
    bodyParser = require("body-parser");

const router = express.Router();

// API for users

router
    .route("/user")
    .get((req, res) => {
        let userID = req.session.token;

        if (userID === undefined || userID.length === 0) res.sendStatus(400);
        else {
            database.fetchResults(userID).then(
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
        let user = req.body;
        console.log(user);

        database.login(user).then(
            respond => {
                console.log(respond);
                req.session.token = respond;
                res.sendStatus(200);
            },
            err => {
                console.log(err.message);
                res.sendStatus(400);
            }
        );
    })
    .patch(bodyParser.json(), (req, res) => {
        let userID = req.session.token,
            results = body;

        if (userID.length === 0) res.sendStatus(400);
        else
            database.updateResults(userID, results).then(
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
        req.session.destroy(function(err) {
            if (err) {
                console.log(err.message);
                res.sendStatus(400);
            } else res.sendStatus(200);
        });
    });

router.route("/user/mytasks").get((req, res) => {
    let userID = req.session.token;
    console.log(userID);
    if (userID === undefined || userID.length === 0) res.sendStatus(400);
    else
        database.readMyTasks(userID).then(
            docs => {
                res.status(200).send(docs);
            },
            err => {
                console.log(err.message);
                res.sendStatus(400);
            }
        );
});

// API for tasks
router
    .route("/")
    .get((req, res) => {
        let { idx, count } = req.query,
            queryTask = JSON.parse(req.query.q || "{}"),
            searchTask = {};

        idx = Number(idx);
        count = Number(count);
        if (queryTask.name) searchTask.name = RegExp(queryTask.name, "i");
        if (queryTask.checkpoints)
            searchTask.checkpoints = RegExp(queryTask.checkpoints);
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
        task.creatorID = req.session.token;
        console.log(task.creatorID);
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

router.route("/trending").get((req, res) => {
    database.readTrendings().then(
        docs => {
            res.status(200).send(docs);
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
        let queryTask = req.body,
            updateTask = {},
            taskID = req.params.taskID,
            userID = req.session.token;

        if (queryTask.name) updateTask.name = queryTask.name;
        if (queryTask.description)
            updateTask.description = queryTask.description;
        if (queryTask.checkpoints)
            updateTask.checkpoints = queryTask.checkpoints;
        if (queryTask.startTime) updateTask.startTime = queryTask.startTime;
        if (queryTask.endTime) updateTask.endTime = queryTask.endTime;

        if (taskID.length === 0 || userID == undefined || userID.length === 0)
            res.sendStatus(400);
        else
            database.editTask(taskID, userID, updateTask).then(
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
        let userID = req.session.token,
            taskID = req.params.taskID;

        if (taskID.length === 0 || userID === undefined || userID.length === 0)
            res.sendStatus(400);
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
        let userID = req.session.token,
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

router.route("/unsubscribe/:taskID").delete((req, res) => {
    let userID = req.session.token,
        taskID = req.params.taskID;

    if (taskID.length === 0 || userID.length === 0) res.sendStatus(400);
    else
        database.unsubscribe(taskID, userID).then(
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
