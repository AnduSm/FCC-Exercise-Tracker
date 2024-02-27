const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User.js");
const Exercise = require("./models/Exercise");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGO_DB);
    console.log(`Database Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

connectDB();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
});

app.post("/api/users", async (req, res) => {
  try {
    console.log(req.body);
    const username = req.body.username;
    const userObj = new User({ username });
    console.log(userObj);
    const user = await userObj.save();
    res.json(user); // Send the user object as a response
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/users/:_id/exercises", async (req, res) => {
  try {
    const userId = req.params._id;
    const exercises = await Exercise.find({ userId });
    res.json(exercises);
  } catch (err) {
    console.log(err);
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const userId = req.params._id;
    const description = req.body.description;
    const duration = req.body.duration;
    const date = req.body.date ? new Date(req.body.date) : new Date();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exercise = new Exercise({
      userId,
      description,
      duration,
      date,
    });

    const savedExercise = await exercise.save();

    const response = {
      _id: user._id,
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
    };

    res.json(response);
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const userId = req.params._id;
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let query = Exercise.find({ userId });
    if (from) {
      query = query.where("date").gte(new Date(from));
    }
    if (to) {
      query = query.where("date").lte(new Date(to));
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    const exercises = await query.exec();
    const count = exercises.length;
    const log = exercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    }));
    res.json({
      _id: user._id,
      username: user.username,
      count: count,
      log: log,
    });
  } catch (err) {
    console.log(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
