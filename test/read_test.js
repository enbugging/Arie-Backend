// Testing creating functions in databse
const { request } = require("./test_helper.js"),
    database = require("../data/database.js");

var task;

require("./create_test.js");

describe("Reading tasks", () => {
    it("reads all tasks", done => {
        request.get(`/api/tasks?idx=0&count=1`).expect(200, function(err, res) {
            if (err) done(err);
            else {
                task = new database.Tasks(...res.body);
                done();
            }
        });
    });

    it("finds a task with query", done => {
        const query = {
            name : "a"
        };
        encodedQuery = encodeURIComponent(JSON.stringify(query));
        request.get(`/api/tasks?idx=0&count=1&q=${encodedQuery}`).expect(200, function(err) {
            done(err);
        });
    });

    it("reads a non-existent task", done => {
        request.get(`/api/tasks/abcdef`).expect(400, function(err, res) {
            if (err) done(err);
            else done();
        });
    });

    it("reads a specific task", done => {
        request.get(`/api/tasks/${task._id}`).expect(200, function(err, res) {
            if (err) done(err);
            else done();
        });
    });
});
