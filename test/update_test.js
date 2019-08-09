const { request } = require("./test_helper.js"),
    database = require("../data/database.js");

var task;

require("./read_test.js");

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
        request
            .patch(`/api/tasks/${task._id}?userID=megumitadokoro`)
            .send(task)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("update a non-existent task", function(done) {
        request
            .patch(`/api/tasks/abcdef?userID=Megumi%20Tadokoro`)
            .send(task)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("updates a task", function(done) {
        request
            .patch(`/api/tasks/${task._id}?userID=Megumi%20Tadokoro`)
            .send(task)
            .expect(200, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("subscribe to a task", function(done) {
        request.post(`/api/tasks/${task._id}?userID=megumitadokoro`)
        .expect(200, function(err) {
            if(err) done(err);
            else done();
        })
    })
});
