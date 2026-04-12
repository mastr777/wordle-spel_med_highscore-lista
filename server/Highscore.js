
const mongoose = require("mongoose");

const highscoreSchema = new mongoose.Schema({
  name: String,
  timeMs: Number,
  guesses: [String],
  wordLength: Number,
  allowDuplicateLetters: Boolean
});

module.exports = mongoose.model("Highscore", highscoreSchema);


