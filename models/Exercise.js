const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
