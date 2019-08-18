require("dotenv").config(
    process.env.NODE_ENV === "test" ? { path: "./.env.test" } : {}
);
const http = require("https"),
    express = require("express"),
    morgan = require("morgan"),
    mongoose = require("mongoose"),
    path = require("path");

const app = express();
app.use(morgan("dev"));

const tasks = require("./routes/tasks");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

var serv = http.createServer(app);

app.on("ready", function() {
    const PORT = process.env.PORT || 3000;

    // main part
    serv = app
        .listen(PORT, () => {
            console.log("Database connnected!");
            console.log(`Arie-chan is serving at ${PORT}`);
        })
        .on("error", () => {
            serv = app.listen(0, () => {
                console.log(
                    `[Warning] Cannot host on port ${PORT}! Using random port.`
                );
                console.log(`Arie-chan is serving at ${serv.address().port}`);
            });
        });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    // we're connected! All OK - fire (emit) a ready event.
    app.emit("ready");
});

//API
app.all("/api", (req, res) => {
    res.sendStatus(204);
});

app.use("/api/tasks", tasks);

app.all("/api/*", (req, res) => {
    res.sendStatus(404);
});

module.exports = { app, db, serv };
