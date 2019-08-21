const { request, fakeRequest } = require("./test_helper.js"),
    database = require("../data/database.js"),
    lodash = require("lodash");

require("./read_test.js");

var task;

describe("Updating tasks", () => {
    before(function(done) {
        request.get(`/api/tasks?idx=0&count=1`).expect(200, function(err, res) {
            if (err) done(err);
            else {
                task = new database.Tasks(...res.body);
                done();
            }
        });
    });

    it("unauthorizedly attempt to update a task", function(done) {
        fakeRequest
            .patch(`/api/tasks/${task._id}`)
            .set("Cookie", "abcdef")
            .send(task)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("update a non-existent task", function(done) {
        request
            .patch(`/api/tasks/abcdef`)
            .send(task)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("update invalid start/end time", function(done) {
        let newTask = lodash.cloneDeep(task),
            temp = newTask.startTime;
        newTask.startTime = newTask.endTime;
        newTask.endTime = temp;

        request
            .patch(`/api/tasks/${task._id}`)
            .send(newTask)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("update a task to force it begins before present", function(done) {
        let newTask = lodash.cloneDeep(task);
        newTask.startTime = "2019-08-05T08:34:00+07:00";

        request
            .patch(`/api/tasks/${task._id}`)
            .send(newTask)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("update a task", function(done) {
        request
            .patch(`/api/tasks/${task._id}`)
            .send(task)
            .expect(200, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("read trending tasks", function(done) {
        request.get(`/api/tasks/trending`).expect(200, function(err, res) {
            console.log(res.body);
            if (err) done(err);
            else done();
        });
    });

    it("subscribe to a task", function(done) {
        request.post(`/api/tasks/${task._id}`).expect(200, function(err) {
            if (err) done(err);
            else done();
        });
    });

    it("unsubscribe to a task", function(done) {
        request
            .delete(`/api/tasks/unsubscribe/${task._id}`)
            .expect(200, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("read trending tasks", function(done) {
        request.get(`/api/tasks/trending`).expect(200, function(err, res) {
            console.log(res.body);
            if (err) done(err);
            else done();
        });
    });
});
