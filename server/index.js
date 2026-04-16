const Highscore = require("./Highscore");

require("dotenv").config();
const connectToDatabase = require("./db");

const express = require("express");
const path = require("path");
const words = require("./words");

const app = express();
const PORT = 5080;

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
      return res.status(400).json({ error: "A guess of a Word is required" });
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

app.get("/about", (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>About</title>

      <style>
        html {
          margin: 0 auto;
          text-align: center;
        }

        body {
          font-family: "Lucida Console", "Courier New", monospace;
          font-size: 18px;
          font-weight: lighter;
          background: #191f24;
          color: #eeeeee;
          letter-spacing: 0.04em;
          width: 90%;
          margin: 0 auto;
        }

        nav {
          margin-top: 26px;
        }

        nav a {
          color: white;
          margin-right: 16px;
          text-decoration: none;
          font-size: 17px;
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
          margin-top: 80px;
          margin-bottom: 70px;
          font-size: 34px;
          font-weight: bold;
        }

        p {
        margin-top: 30px;
        }

        h2 {
          margin-top: 90px;
          margin-bottom: 40px;
          font-size: 28px;
          font-weight: bold;
        }
        
        .aboutContainer {
          width: min(740px, 100%);
          min-height: 400px;
          height: auto;
          margin: 0 auto;
        }

        ul li {
          padding: 8px;
          color: #e1d8b7;
        }

        .textContainer {
          width: min(600px, 100%);
          height: auto;
          text-align: left;
          padding-left: 110px;
          font-size: 18px;
          font-weight: lighter;
          letter-spacing: 0.04em;
          line-height: 135%;
          margin-bottom: 120px;
        }

        .textSign {
          opacity: 0.4;
          padding: 20px 0 0 0;
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

            <div class="textContainer">

                <p>Detta projekt är ett fullstack Wordle-spel byggt med React, Node.js (Express) och MongoDB.</p>
                <p>Målet har varit att återskapa grundidén i Wordle genom att bygga en komplett applikation med frontend, 
                backend och en highscorelista som sparas i en databas.</p>

                <h2>Hur spelet fungerar</h2>
                <p>När användaren startar ett nytt spel hämtas ett slumpmässigt ord från servern.</p>
                <p>Användaren kan välja:</p>
                <ul>
                  <li>hur många bokstäver ordet ska ha</li>
                  <li>om det ska vara tillåtet med upprepade bokstäver</li>
                </ul>

                <p>Spelaren försöker sedan gissa ordet genom att skriva in gissningar.</p>

                <p>Efter varje gissning får man feedback på varje bokstav.</p> 
                <p>Grön = rätt bokstav på rätt plats, Gul = rätt bokstav men fel plats, 
                och Röd = bokstaven finns inte i ordet.</p>

                <p>Spelet fortsätter tills:</p>
                <ul>
                <li>spelaren gissar rätt ord</li>
                  <li>eller max antal gissningar (6) är förbrukade</li>
                </ul>

                <h2>Backend logik</h2>
                <p>Backenden är byggd med Express och hanterar generering av slumpmässiga ord (/api/word), 
                kontroll av gissningar och feedback (/api/guess), samt sparande av highscores (/api/highscore).</p>

                <p>Feedback-algoritmen jämför det gissade ordet med det rätta ordet och returnerar status för varje bokstav.</p>


                <h2>Databasen</h2>
                <p>Highscores sparas i MongoDB Atlas. Varje resultat innehåller spelarens namn, 
                tid (i millisekunder), alla gissningar, ordlängd och spelinställningar (om dubbla bokstäver är tillåtna eller inte).</p>

                <p>Databasen används för att lagra highscores. Databaskopplingen sker via en
                så kallad environment-variabel (.env-fil), där anslutningssträngen lagras istället för att hårdkodas i koden.</p>

                <p>Detta gör att känslig information som lösenord inte exponeras i projektet. För att möjliggöra anslutning under utveckling 
                är databasen konfigurerad för att acceptera anslutningar från externa IP-adresser.</p>

                <h2>Highscorelista</h2>
                <p>Highscorelistan visas på en egen route (/highscore). Den sidan är server-side renderad, vilket innebär 
                att servern hämtar data från databasen, bygger upp HTML och skickar en färdig sida till webbläsaren.</p>

                <h2>Informationssida</h2>
                <p>Denna sida, /about, är en statisk sida som beskriver projektet. Den använder ingen dynamisk data eller något API-anrop.</p>


                <h2>Tech stack</h2>
                <p>Följande tekniker och verktyg har använts för att skapa detta fullstackprojekt:</p>

                <ul>
                  <li>React (frontend)</li>
                  <li>Node.js + Express (backend)</li>
                  <li>MongoDB Atlas (databas)</li>
                  <li>Visual Studio Code (utvecklingsmiljö)</li>
                </ul>

                <h2>Slutord</h2>
                <p>Genom detta projekt har jag fått en bättre förståelse för hur frontend och backend arbetar tillsammans, 
                samt hur man kan lagra och hantera data i en databas.</p>

                <p>Projektet har också gett mig insikt i hur man bygger upp en applikation från grunden och hur olika delar 
                samverkar i ett fullstackprojekt.</p>
                <p class="textSign">Mattias Strandberg</p>

              </div>
            </div>
          </body>
        </html>
      `;

    res.send(html);
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
        html {
          margin: 0 auto;
          text-align: center;
        }

        body {
          font-family: "Lucida Console", "Courier New", monospace;
          font-size: 18px;
          background: #191f24;
          color: white;
          letter-spacing: 0.04em;
          width: 90%;
          margin: 0 auto;
        }

        nav {
          margin-top: 26px;
        }

        nav a {
          color: white;
          margin-right: 16px;
          text-decoration: none;
          font-size: 17px;
          font-weight: bold;
        }

        table {
          width: min(720px, 100%);
          margin-top: 60px;
          border-collapse: collapse;
          background: #212b2e;
          text-align: left;
        }

        th, td {
          padding: 14px;
          color: #bbefed;
          letter-spacing: 0.05em;
          font-size: 18px;
          font-weight: normal;
          border: 1px solid #111111;
        }

        h1 {
          margin-top: 80px;
          margin-bottom: 70px;
          font-size: 34px;
          font-weight: bold;
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

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load highscores");
  }
});

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
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

function uniqueLetters(word) {
  return new Set(word).size === word.length;
}
