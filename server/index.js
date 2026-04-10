
const express = require("express");
const path = require("path");
const words = require("./words");

const app = express();
const PORT = 5080;

app.use(express.static(path.join(__dirname, "../wordle-game/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../wordle-game/dist/index.html"));

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});

function uniqueLetters(word) {
  return new Set(word).size === word.length;
}

app.get("/api/word", (req, res) => {
  const length = parseInt(req.query.length);
  const unique = req.query.unique === "true";

  let wordFiltering = words;

  if (!isNaN(length)) {
    wordFiltering = wordFiltering.filter(word => word.length === length);
  }

  if (unique) {
    wordFiltering = wordFiltering.filter(uniqueLetters);
  }

  if (wordFiltering.length === 0) {
    return res.status(400).json({ error: "No words found with that length" });
  }

  const randomWord = Math.floor(Math.random() * wordFiltering.length);
  const word = wordFiltering[randomWord];

  res.json({ word });

});





