
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

app.get("/api/word", (req, res) => {
  const length = parseInt(req.query.length);

  let filteredWords = words;

  if (!isNaN(length)) {
    filteredWords = words.filter(word => word.length === length);
  }

  if (filteredWords.length === 0) {
    return res.status(400).json({ error: "No words found with that length" });
  }

  const randomWord = Math.floor(Math.random() * filteredWords.length);
  const word = filteredWords[randomWord];

  res.json({ word });

});





