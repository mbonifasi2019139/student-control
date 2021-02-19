"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    username: String,
    password: String,
    // Role "ROL ALUMNO" for default
    role: { type: String, default: "ROL_ALUMNO" },
    name: String,
    lastname: String,
    phone: Number,
});

module.exports = mongoose.model("user", userSchema);