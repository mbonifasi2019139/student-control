"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let courseSchema = Schema({
    name: String,
    participants: [{
        username: String,
        role: { type: String, default: "ROL_ALUMNO" },
        name: String,
        lastname: String,
    }, ],
});

module.exports = mongoose.model("course", courseSchema);