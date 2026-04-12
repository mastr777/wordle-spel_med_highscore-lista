
const Highscore = require("./Highscore");

require("dotenv").config();
const connectToDatabase = require("./db");

const express = require("express");
const path = require("path");
const words = require("./words");

const app = express();
const PORT = 5080;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../wordle-game/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../wordle-game/dist/index.html"));
});

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error("Database connection failed:", error);
  });

/* app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); */

function uniqueLetters(word) {
  return new Set(word).size === word.length;
}

app.get("/api/word", (req, res) => {
  const length = parseInt(req.query.length);
  const unique = req.query.unique === "true";

  let wordFiltering = words;

  if (!isNaN(length)) {
    wordFiltering = wordFiltering.filter((word) => word.length === length);
  }

  if (unique) {
    wordFiltering = wordFiltering.filter(uniqueLetters);
  }

  if (wordFiltering.length === 0) {
    return res.status(400).json({ error: "No Word with that length" });
  }

  function getFinalization(guess, word) {
    const result = [];
    const wordLetters = word.split("");
    const guessLetters = guess.split("");

    for (let i = 0; i < guessLetters.length; i++) {
      if (guessLetters[i] === wordLetters[i]) {
        result[i] = { letter: guessLetters[i], status: "correct" };

        wordLetters[i] = null;
        guessLetters[i] = null;
      }
    }

    for (let i = 0; i < guessLetters.length; i++) {
      if (guessLetters[i] === null) continue;

      const index = wordLetters.indexOf(guessLetters[i]);

      if (index !== -1) {
        result[i] = { letter: guessLetters[i], status: "misplaced" };
        wordLetters[index] = null;
      } else {
        result[i] = { letter: guessLetters[i], status: "incorrect" };
      }
    }

    return result;
  }

  app.post("/api/guess", (req, res) => {
    const { guess, word } = req.body;

    if (!guess || !word) {
      return res.status(400).json({ error: "A guess and a Word are required" });
    }

    if (guess.length !== word.length) {
      return res
        .status(400)
        .json({ error: "Guess must have the same length as the Word length" });
    }

    const lowerGuess = guess.toLowerCase();
    const lowerWord = word.toLowerCase();
    const finalization = getFinalization(lowerGuess, lowerWord);

    const isCorrect = lowerGuess === lowerWord;

    res.json({ isCorrect, finalization });
  });

  const randomWord = Math.floor(Math.random() * wordFiltering.length);
  const word = wordFiltering[randomWord];

  res.json({ word });
});

app.post("/api/highscore", async (req, res) => {
  try {
    const newScore = new Highscore(req.body);
    await newScore.save();

    res.json({ message: "Highscore saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save highscore" });
  }
});





