
import { useState } from "react";

function App() {

  const [word, setWord] = useState("");
  const [length, setLength] = useState(5);
  const [unique, setUnique] = useState(true);
  const [result, setResult] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);

  /* game End and Time variables */
  const [gameEnd, setGameEnd] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);


  const getWord = () => {
    fetch(`/api/word?length=${length}&unique=${unique}`)
      .then((res) => res.json())
      .then((data) => {

        setWord(data.word);
        setGuess("");
        setResult("");
        setGuesses([]);
        
        setGameEnd(false);
        setStartTime(Date.now());
        setElapsedTime(null);
      
      });
  };

  const submitGuess = () => {
    if (gameEnd) {
      return;
    }

    if (guess.length !== Number(length)) {
      setResult(`Guess must be ${length} letters`);
      setFinalization([]);
    }

    fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess, word }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setResult(data.error);
          setFinalization([]);
          return;
        }

        setResult(data.isCorrect ? "Correct!" : "Wrong word, try again");
        setGuesses((prev) => [...prev, data.finalization]);

        if (data.isCorrect) {
          setGameEnd(true);
          setElapsedTime(Date.now() - startTime);
        }

        if (data.isCorrect) {
          setGameEnd(true);
        }
      })

      .catch(() => {
        setResult("Soemthing went wrong");
        setFinalization([]);
      });
  };

  return (
    <main
      style={{
        width: "100%",
        minHeight: "700px",
        height: "auto",
        margin: "0 auto",
        color: "#5fa99c",
      }}
    >
      <div>
        <h1
          style={{
            paddingTop: "40px",
            color: "#5fa99c",
          }}
        >
          Wordle
        </h1>

        <div>
          <span style={{ marginTop: "40px" }}>
            Word length:
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </span>
        </div>

        <div>
          <p style={{ marginTop: "40px" }}>Choose type of word:</p>
          <span>
            Unique letters 'check':
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
            />
          </span>
        </div>

        <button style={{ marginTop: "40px" }} onClick={getWord}>
          Start Game
        </button>

        {/* just for testing, against the Word */}
        <p style={{ marginTop: "20px" }}>Word: {word}</p>

        <div style={{ marginTop: "10px", marginBottom: "30px" }}>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Guess Word"
          />

          <button onClick={submitGuess} disabled={gameEnd}>Guess</button>
        </div>

        <p style={{ display: "block", height: "50px", visibility: "visible" }}>
          {result}
        </p>

        {elapsedTime !== null && (
          <p>Time: {(elapsedTime / 1000).toFixed(1)} seconds</p>
        )}

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: "60px",
            height: "auto",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {guesses.map((guessRow, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                position: "relative",
                minWidth: "300px",
                maxWidth: "440px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "11px",
                marginTop: "16px",
              }}
            >
              {guessRow.map((item, index) => {
                let bgColor = "lightgray";

                if (item.status === "correct") bgColor = "#317f2a";
                else if (item.status === "misplaced") bgColor = "#a6a629";
                else if (item.status === "incorrect") bgColor = "#8f2424";

                return (
                  <div
                    key={index}
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: bgColor,
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {item.letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;






