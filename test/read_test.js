// Testing creating functions in databse
const { request } = require("./test_helper.js"),
    database = require("../data/database.js"),
    { user } = require("../test/create_test.js");

var task;

require("./create_test.js");

describe("Reading tasks", () => {
    it("read all tasks", done => {
        request.get(`/api/tasks?idx=0&count=1`).expect(200, function(err, res) {
            if (err) done(err);
            else {
                task = new database.Tasks(...res.body);
                done();
            }
        });
    });

    it("find a task with query", done => {
        const query = {
            name: "test task"
        };
        encodedQuery = encodeURIComponent(JSON.stringify(query));
        request
            .get(`/api/tasks?idx=0&count=1&q=${encodedQuery}`)
            .expect(200, function(err) {
                done(err);
            });
    });

    it("read a non-existent task", done => {
        request.get(`/api/tasks/abcdef`).expect(400, function(err, res) {
            if (err) done(err);
            else done();
        });
    });

    it("read tasks created by a non-existent user", done => {
        request
            .get(`/api/tasks/user/mytasks/MegumiTadokoro`)
            .expect(400, function(err, res) {
                if (err) done(err);
                else done();
            });
    });

    it("read tasks created by an user", done => {
        request
            .get(`/api/tasks/user/mytasks/${user._id}`)
            .expect(200, function(err, res) {
                if (err) done(err);
                else done();
            });
    });

    it("read tasks' results of a non-existent user", done => {
        request
            .get(`/api/tasks/user/MegumiTadokoro`)
            .expect(400, function(err, res) {
                if (err) done(err);
                else done();
            });
    });

    it("read tasks' results of an user", done => {
        request
            .get(`/api/tasks/user/${user._id}`)
            .expect(200, function(err, res) {
                if (err) done(err);
                else done();
            });
    });

    it("read a specific task", done => {
        request.get(`/api/tasks/${task._id}`).expect(200, function(err, res) {
            if (err) done(err);
            else done();
        });
    });
});
