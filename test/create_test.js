// Testing creating functions in databse
const database = require("../data/database.js"),
    { request } = require("./test_helper.js");

describe("Creating new tasks", () => {
    it("creates a new task", done => {
        const arr = new Array();
        arr.push("Hanoi, Vietnam");

        const task = new database.Tasks({
            name: "Test task",
            creator: "Megumi Tadokoro",
            description: "This is a testing task",
            places: arr,
            createTime: Date.now(),
            startTime: "2019-08-05T08:34:00+07:00",
            endTime: "2019-08-12T08:34:00+07:00",
            participantIDs: new Array()
        });

        request
            .post(`/api/tasks`)
            .send(task)
            .expect(200, function(err) {
                done(err);
            });
    });
});
