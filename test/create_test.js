// Testing creating functions in databse
const database = require("../data/database.js"),
    { request, fakeRequest } = require("./test_helper.js");

const user = new database.Users({
    name: "Megumi Tadokoro",
    gmailAddress: "abc.def@gmail.com"
});

const checkpoint = {
    title: "First checkpoint",
    description: "Testing",
    label: "abcdef",
    type: "test",
    latitude: 20.991732,
    longitude: 105.796381
};

describe("Creating new tasks", () => {
    it("login", done => {
        const token = new Object({
            accessToken:
                "ya29.GltqBxJKtnzWS1BOM1DAH_33PS8nAsJ4k-Xy-w899NjIEllaWWNJ-SVzgflij0S8Qz24zvFM06ILVxEexKNVqqRBdvvrjSz9PRVr68WkbvkDEFplk8XxYkL8GH2s"
        });

        request
            .post(`/api/tasks/user`)
            .send(token)
            .expect(200, function(err) {
                if (err) done(err);
                else {
                    done();
                }
            });
    });

    it("create a task with non-existent creator", done => {
        let now = new Date(Date.now()),
            later = new Date(Date.now());
        now.setFullYear(now.getFullYear() + 1);
        later.setFullYear(later.getFullYear() + 1);
        later.setMonth(later.getMonth() + 1);

        const task = new database.Tasks({
            name: "Test task",
            description: "This is a testing task",
            checkpoints: [checkpoint],
            startTime: now.toString(),
            endTime: later.toString()
        });

        fakeRequest
            .post(`/api/tasks`)
            .send(task)
            .expect(400, function(err) {
                done(err);
            });
    });

    it("create a new task with invalid coordinate(s)", done => {
        let now = new Date(Date.now()),
            later = new Date(Date.now());
        now.setFullYear(now.getFullYear() + 1);
        later.setFullYear(later.getFullYear() + 1);
        later.setMonth(later.getMonth() + 1);

        const false_checkpoint = {
            title: "First checkpoint",
            description: "Testing",
            label: "abcdef",
            type: "test",
            latitude: 20.991732,
            longitude: 185.796381
        };

        const task = new database.Tasks({
            name: "Test task",
            description: "This is a testing task",
            checkpoints: [false_checkpoint],
            startTime: now.toString(),
            endTime: later.toString()
        });

        request
            .post(`/api/tasks`)
            .send(task)
            .expect(400, function(err) {
                done(err);
            });
    });

    it("create a new task with invalid start/end time", done => {
        const task = new database.Tasks({
            name: "Test task",
            description: "This is a testing task",
            checkpoints: [checkpoint],
            startTime: "2019-08-12T08:34:00+07:00",
            endTime: "2019-08-05T08:34:00+07:00"
        });

        request
            .post(`/api/tasks`)
            .send(task)
            .expect(400, function(err) {
                done(err);
            });
    });

    it("create a new task having already began", done => {
        let now = new Date(Date.now());
        now.setFullYear(now.getFullYear() + 1);

        const task = new database.Tasks({
            name: "Test task",
            description: "This is a testing task",
            checkpoints: [checkpoint],
            startTime: "2019-08-05T08:34:00+07:00",
            endTime: now.toString()
        });

        request
            .post(`/api/tasks`)
            .send(task)
            .expect(400, function(err) {
                done(err);
            });
    });

    it("create a new task having already ended", done => {
        const task = new database.Tasks({
            name: "Test task",
            description: "This is a testing task",
            checkpoints: [checkpoint],
            startTime: "2019-08-05T08:34:00+07:00",
            endTime: "2019-08-12T08:34:00+07:00"
        });

        request
            .post(`/api/tasks`)
            .send(task)
            .expect(400, function(err) {
                done(err);
            });
    });

    it("create a new task", done => {
        let now = new Date(Date.now()),
            later = new Date(Date.now());
        now.setFullYear(now.getFullYear() + 1);
        later.setFullYear(later.getFullYear() + 1);
        later.setMonth(later.getMonth() + 1);

        const task = new database.Tasks({
            name: "Test task",
            description: "This is a testing task",
            checkpoints: [checkpoint],
            startTime: now.toString(),
            endTime: later.toString()
        });

        request
            .post(`/api/tasks`)
            .send(task)
            .expect(200, function(err) {
                done(err);
            });
    });
});

module.exports = { user };
