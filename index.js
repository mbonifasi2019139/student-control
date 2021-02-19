"use strict";

const mongoose = require("mongoose");
const app = require("./app");
const port = 3200;

mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);

mongoose
    .connect("mongodb://127.0.0.1:27017/studentcontrol", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("The server is loading...");
        app.listen(port, () => {
            console.log(`Server on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(`Error: ${err}`);
    });