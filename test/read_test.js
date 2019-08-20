// Testing creating functions in databse
const { request, fakeRequest } = require("./test_helper.js"),
    database = require("../data/database.js");

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
        fakeRequest
            .get(`/api/tasks/user/mytasks`)
            .set("Cookie", "abcdef")
            .expect(400, function(err, res) {
                if (err) done(err);
                else done();
            });
    });

    it("read tasks created by an user", done => {
        request.get(`/api/tasks/user/mytasks`).expect(200, function(err, res) {
            if (err) done(err);
            else done();
        });
    });

    it("read tasks' results of a non-existent user", done => {
        fakeRequest
            .get(`/api/tasks/user`)
            .set("Cookie", "abcdef")
            .expect(400, function(err, res) {
                if (err) done(err);
                else done();
            });
    });

    it("read tasks' results of an user", done => {
        request.get(`/api/tasks/user`).expect(200, function(err, res) {
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
