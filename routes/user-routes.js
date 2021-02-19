"use strict";

const express = require("express");
const app = require("../app");
const userController = require("../controllers/user-controller");

const api = express.Router();

// User requests
api.post("/login", userController.login);
api.post("/register", userController.register);
api.put("/updateUser/:id", userController.updateUser);
api.get("/getUsers", userController.getUsers);
api.delete("/removeUser/:id", userController.removeUser);

// Course requests
api.put("/saveCourse/:id", userController.saveCourse);
api.get("/getCourses/:id", userController.getCourses);
api.put("/:idU/updateCourse/:idC", userController.updateCourse);
api.delete("/:idU/removeCourse/:idC", userController.removeCourse);

module.exports = api;