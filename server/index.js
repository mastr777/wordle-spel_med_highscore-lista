const express = require("express");
const path = require("path");

const app = express();
const PORT = 5080;

// Serve React build
app.use(express.static(path.join(__dirname, "../wordle-game/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../wordle-game/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/word", (req, res) => {
  res.json({ word: "apple" });
});


