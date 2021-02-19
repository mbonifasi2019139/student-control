"use strict";

const User = require("../models/user-model");
const Course = require("../models/course-model");
const bcrypt = require("bcrypt-nodejs");
const { updateMany } = require("../models/user-model");

// Login and register
/* If the user does not enter the role, it will be ROL_ALUMNO by default */
function login(req, res) {
    let params = req.body;
    let role = params.role ? params.role : "ROL_ALUMNO";

    if (params.username && params.password) {
        // ROL_AlUMNO default
        User.findOne({ username: params.username, role: role },
            (err, usernameFound) => {
                if (err) {
                    res.status().send({ message: "General error" });
                } else if (usernameFound) {
                    bcrypt.compare(
                        params.password,
                        usernameFound.password,
                        (err, passwordMatch) => {
                            if (err) {
                                res
                                    .status(500)
                                    .send({ message: "Failed to compare the password" });
                            } else if (passwordMatch) {
                                res.status(200).send({ message: "Login success" });
                            } else {
                                res.status(200).send({ message: "Password no match" });
                            }
                        }
                    );
                } else {
                    res
                        .status(404)
                        .send({ message: "Username does not exists or role no match" });
                }
            }
        );
    } else {
        res.status(200).send({ message: "Please, enter all data" });
    }
}

/* If the user does not enter the role, it will be ROL_ALUMNO by default */
function register(req, res) {
    let user = User();
    let params = req.body;

    if (
        params.name &&
        params.lastname &&
        params.phone &&
        params.username &&
        params.password
    ) {
        User.findOne({ username: params.username }, (err, usernameFound) => {
            if (err) {
                res.status(500).send({ message: "General error" });
            } else if (usernameFound) {
                res.status(200).send("Username exists, please enter another name");
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordHashed) => {
                    if (err) {
                        res
                            .status(500)
                            .send({ message: "Error when trying to encrypt password" });
                    } else if (passwordHashed) {
                        user.username = params.username;
                        user.password = passwordHashed;
                        if (
                            params.role === "ROL_ALUMNO" ||
                            params.role === "ROL_PROFESOR"
                        ) {
                            /* In mongoose schema I set by default that que role will be ROL_ALUMNO if the user does not enter the correctly role */
                            user.role = params.role;
                        }
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.phone = params.phone;

                        user.save((err, userSaved) => {
                            if (err) {
                                res
                                    .status(500)
                                    .send({ message: "Error when trying to save a user" });
                            } else if (userSaved) {
                                res.status(200).send({ meesage: "User saved" });
                            }
                        });
                    } else {
                        res.status(404).send({ message: "An error has occurred" });
                    }
                });
            }
        });
    } else {
        res.status(200).send({ message: "Pleado enter all data" });
    }
}

function getUsers(req, res) {
    User.find({}, (err, users) => {
        if (err) {
            res.status(500).send({ message: "General Error" });
        } else if (users) {
            res.status(200).send({ message: "Users found", users });
        } else {
            res.status(200).send({ message: "No users" });
        }
    });
}

// USER (delete and update)
function updateUser(req, res) {
    let userId = req.params.id;
    let update = req.body;

    if (update.username) {
        User.findOne({ username: update.username }, (err, usernameFound) => {
            if (err) {
                res.status(500).send({ message: "General error" });
            } else if (usernameFound) {
                res.status(200).send({
                    message: "Username already exists, please enter another username",
                });
            } else {
                if (!update.password && !update.role) {
                    User.findOneAndUpdate({ _id: userId, role: "ROL_ALUMNO" },
                        update, { new: true },
                        (err, userUpdated) => {
                            if (err) {
                                res
                                    .status(500)
                                    .send({ message: "Error when trying to update a user" });
                            } else if (userUpdated) {
                                res.status(200).send({ message: "User updated", userUpdated });
                            } else {
                                res
                                    .status(200)
                                    .send({ message: "No user to update or is not a student" });
                            }
                        }
                    );
                } else {
                    res.status(200).send({
                        message: "You cannot update the password and role.",
                    });
                }
            }
        });
    } else {
        if (!update.password && !update.role) {
            User.findOneAndUpdate({ _id: userId, role: "ROL_ALUMNO" },
                update, { new: true },
                (err, userUpdated) => {
                    if (err) {
                        res
                            .status(500)
                            .send({ message: "Error when trying to update a user" });
                    } else if (userUpdated) {
                        res.status(200).send({ message: "User updated", userUpdated });
                    } else {
                        res
                            .status(200)
                            .send({ message: "No user to update or is not a student" });
                    }
                }
            );
        } else {
            res.status(200).send({
                message: "You cannot update the password and role.",
            });
        }
    }
}

function removeUser(req, res) {
    let userId = req.params.id;
    User.findOne({ _id: userId, role: "ROL_ALUMNO" }, (err, userFound) => {
        if (err) {
            res.status(500).send({ message: "General error" });
        } else if (userFound) {
            User.findByIdAndRemove(userId, (err, userRemoved) => {
                if (err) {
                    res.status(500).send({ message: "General error" });
                } else if (userRemoved) {
                    res.status(200).send({ message: "User removed" });
                } else {
                    res.status(200).send({ message: "User does not exists" });
                }
            });
        } else {
            res
                .status(200)
                .send({ message: "User does not exists or is not a student" });
        }
    });
}

// Courses CRUD
function saveCourse(req, res) {
    let userId = req.params.id;
    let paramsCourse = req.body;
    let course = Course();

    User.findById(userId, (err, userFound) => {
        if (err) {
            res.status(500).send({ message: "General error" });
        } else if (userFound && userFound.role === "ROL_PROFESOR") {
            if (paramsCourse.name) {
                course.name = paramsCourse.name;

                course.save((err, saved) => {
                    if (err) {
                        res.status(500).send({ message: "General error" });
                    } else if (saved) {
                        res.status(200).send({ message: "Saved", saved });
                    } else {
                        res.status(200).send({ message: "An error has ocurred" });
                    }
                });
            }
        } else {
            res
                .status(200)
                .send({ message: "Userid does not exists or is not a ROL_PROFESOR" });
        }
    });
}

function getCourses(req, res) {
    let userId = req.params.id;

    if (userId) {
        User.findOne({ _id: userId, role: "ROL_PROFESOR" }, (err, userfound) => {
            if (err) {
                res.status(500).send({ message: "General error" });
            } else if (userfound) {
                Course.find({}, (err, courses) => {
                    if (err) {
                        res.status(500).send({ message: "General error" });
                    } else if (courses) {
                        res.status(200).send({ message: "Courses found", courses });
                    } else {
                        res.status(200).send({ message: "No courses" });
                    }
                });
            } else {
                res
                    .status(200)
                    .send({ message: "You are not a teacher or does not exists" });
            }
        });
    } else {
        res.status(200).send({ message: "Please, enter the all data" });
    }
}

function updateCourse(req, res) {
    let userId = req.params.idU;
    let courseId = req.params.idC;
    let update = req.body;

    if (update.name) {
        User.findOne({ _id: userId, role: "ROL_PROFESOR" }, (err, userFound) => {
            if (err) {
                res.status(500).send({ message: "General error" });
            } else if (userFound) {
                Course.findOneAndUpdate({ _id: courseId },
                    update, { new: true },
                    (err, courseUpdated) => {
                        if (err) {
                            res
                                .status(500)
                                .send({ message: "Error when trying to update a course" });
                        } else if (courseUpdated) {
                            res
                                .status(200)
                                .send({ message: "Course updated", courseUpdated });
                        } else {
                            res.status(404).send({
                                message: "Course does not exists",
                            });
                        }
                    }
                );
            } else {
                res.status(404).send({
                    message: "User does not exists or is not role ROL_PROFESOR",
                });
            }
        });
    } else {
        res.status(200).send({ message: "Please, enter all data" });
    }
}

function removeCourse(req, res) {
    let userId = req.params.idU;
    let courseId = req.params.idC;

    User.findOne({ _id: userId, role: "ROL_PROFESOR" }, (err, userFound) => {
        if (err) {
            res.status(500).send({ message: "General error" });
        } else if (userFound) {
            Course.findByIdAndRemove({ _id: courseId }, (err, courseRemoved) => {
                if (err) {
                    res
                        .status(500)
                        .send({ message: "General error, trying to delete a course" });
                } else if (courseRemoved) {
                    res.status(500).send({ message: "Course removed" });
                } else {
                    res.status(500).send({ message: "An error has occurred" });
                }
            });
        } else {
            res
                .status(500)
                .send({ message: "User does not exist or is not a teacher" });
        }
    });
}

module.exports = {
    // Alumno y profesor
    login,
    register,

    // optional
    getUsers,

    // Alumno
    updateUser,
    removeUser,

    // Profesor - courses
    saveCourse,
    getCourses,
    updateCourse,
    removeCourse,
};