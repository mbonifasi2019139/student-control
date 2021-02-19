"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let competitorSchema = Schema({
    username: String,
    role: String,
    name: String,
    lastname: String,
});

module.exports = mongoose.model("competitor", competitorSchema);