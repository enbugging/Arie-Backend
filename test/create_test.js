// Testing creating functions in databse
const database = require("../data/database.js"),
    { request } = require("./test_helper.js");

describe("Creating new tasks", () => {
    it("creates a new task", done => {
        const checkpoint = {
            title: "First checkpoint",
            description: "Testing",
            lable: "abcdef",
            type: "test",
            latitude: 20.991732,
            longitude: 105.796381
        };

        const task = new database.Tasks({
            name: "Test task",
            creator: "Megumi Tadokoro",
            description: "This is a testing task",
            checkpoints: [checkpoint],
            startTime: "2019-08-05T08:34:00+07:00",
            endTime: "2019-08-12T08:34:00+07:00"
        });

        request
            .post(`/api/tasks`)
            .send(task)
            .expect(200, function(err) {
                done(err);
            });
    });
});
