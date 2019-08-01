const express = require("express");

const app = express();

const tasks = require('./routes/tasks');

//API
app.all("/api", (req, res) => {
    res.sendStatus(204);
});

app.use("/api/tasks", tasks);

app.all("/api/*", (req, res) => {
    res.sendStatus(404);
});

const PORT = 3000;

// main part
let serv = app
    .listen(PORT, () => {
        console.log(`Arye is serving at ${PORT}`);
    })
    .on("error", () => {
        serv = app.listen(0, () => {
            console.log(
                `[Warning] Cannot host on port ${PORT}! Using random port.`
            );
            console.log(
                `Arye is serving at ${
                    serv.address().port
                }`
            );
        });
    });