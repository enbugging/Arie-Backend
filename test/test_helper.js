const supertest = require("supertest"),
    { app, db, serv } = require("../index.js"),
    request = supertest(app);

// Make sure that the server having been turned on before executing tests
before(function(done) {
    app.on("ready", function() {
        done();
    });
});

after(function(done) {
    db.close().then(() => {
        console.log("Database disconnected!");
        serv.close(() => {
            console.log(
                "Arie-chan is closed, but she'll still around. Watashi o chekku shite kurete arigatou~"
            );
            done();
        });
    });
});

module.exports = { request };
