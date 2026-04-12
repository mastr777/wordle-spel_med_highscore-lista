
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

app.get("/highscore", async (req, res) => {
  try {

    const highscores = await Highscore.find().sort({ timeMs: 1 }).limit(10);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Highscores</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #0f1a1d;
          color: white;
          padding: 20px;
          letter-spacing: 0.02em;
        }

        nav {
          margin-bottom: 20px;
        }

        nav a {
          color: white;
          margin-right: 15px;
          text-decoration: none;
          font-weight: bold;
        }

        table {
          width: min(720px, 100%);
          margin-top: 60px;
          border-collapse: collapse;
          background: #1e292d;
          color: #acdad9;
        }

        th, td {
          padding: 14px;
          border: 1px solid #111111;
        }

        h1 {
          margin-top: 90px;
          margin-bottom: 20px;
        }
        
        .highscoreContainer {
          width: min(740px, 100%);
          min-height: 400px;
          height: auto;
          margin: 0 auto;
        }
      </style>
    </head>

        <body>
          <nav>
            <a href="/">Play</a>
            <a href="/highscore">Highscore</a>
            <a href="/about">About</a>
          </nav>

<div class="highscoreContainer">
          <h1>Highscore List</h1>

          <table border="1" cellpadding="8" cellspacing="0">
            <tr>
              <th>Name</th>
              <th>Time</th>
              <th>Guesses</th>
              <th>Word length</th>
              <th>Duplicate letters</th>
            </tr>
</div>
            ${highscores
              .map(
                (score) => `
                  <tr>
                    <td>${score.name}</td>
                    <td>${(score.timeMs / 1000).toFixed(1)} s</td>
                    <td>${score.guesses.length}</td>
                    <td>${score.wordLength}</td>
                    <td>${score.allowDuplicateLetters ? "Yes" : "No"}</td>
                  </tr>
                `,
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    app.get("/about", (req, res) => {
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>About</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          background: #0f1a1d;
          color: white;
          padding: 20px;
          letter-spacing: 0.02em;
        }

        nav {
          margin-bottom: 20px;
        }

        nav a {
          color: white;
          margin-right: 15px;
          text-decoration: none;
          font-weight: bold;
        }

        table {
          margin-top: 60px;
          border-collapse: collapse;
          background: #2b3e45;
          color: #acdad9;
        }

        th, td {
          padding: 14px;
          border: 1px solid #111111;
        }

        h1 {
          margin-top: 90px;
          margin-bottom: 20px;
        }

        h2 {
          margin-top: 40px;
          margin-bottom: 40px;
          font-size: 24px
          font-weight: 200;
        }
        
        .aboutContainer {
          width: min(740px, 100%);
          min-height: 400px;
          height: auto;
          margin: 0 auto;
        }
      </style>
    </head>

          <body>
            <nav>
              <a href="/">Play</a>
              <a href="/highscore">Highscore</a>
              <a href="/about">About</a>
            </nav>

            <div class="aboutContainer">
            <h1>About / Information</h1>

            <p>Ett Wordle spel, skapat med React, Express och MongoDB.</p>

            <h2>Features</h2>
              <ul>
                <li>Random word generation on the server</li>
                <li>Guess validation with feedback</li>
                <li>Highscore list stored in MongoDB</li>
              </ul>

              <h2>Technologies</h2>
              <ul>
                <li>React (frontend)</li>
                <li>Node.js + Express (backend)</li>
                <li>MongoDB Atlas (database)</li>
              </ul>
            </div>
          </body>
        </html>
      `;

      res.send(html);
    });

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load highscores");
  }
});

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

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error("Database connection failed:", error);
  });

function uniqueLetters(word) {
  return new Set(word).size === word.length;
}





