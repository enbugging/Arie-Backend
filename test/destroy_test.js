const { request } = require("./test_helper.js"),
    database = require("../data/database.js");

var task;

require("./update_test.js");

describe("Deleting tasks", () => {
    before(function(done) {
        request.get(`/api/tasks?idx=0&count=1`).expect(200, function(err, res) {
            if (err) done(err);
            else {
                task = new database.Tasks(...res.body);
                done();
            }
        });
    });

    it("delete a non-existent task", function(done) {
        request
            .delete(`/api/tasks/abcdef?userID=Megumi%20Tadokoro`)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("unauthoriziedly attempt to delete a task", function(done) {
        request
            .delete(`/api/tasks/${task._id}?userID=megumitadokoro`)
            .expect(400, function(err) {
                if (err) done(err);
                else done();
            });
    });

    it("delete a task", function(done) {
        request
            .delete(`/api/tasks/${task._id}?userID=Megumi%20Tadokoro`)
            .expect(200, function(err) {
                if (err) done(err);
                else done();
            });
    });
});
