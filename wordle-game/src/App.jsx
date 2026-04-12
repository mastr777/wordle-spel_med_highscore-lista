
import { useState } from "react";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f171d",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    backgroundColor: "#161d23",
    padding: "30px",
    borderRadius: "10px",
    width: "740px",
    textAlign: "center",
    color: "white"
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "none"
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    width: "100%",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#4caf50",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

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

  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);

  const getWord = () => {
    fetch(`/api/word?length=${length}&unique=${unique}`)
      .then((res) => res.json())
      .then((data) => {

        setWord(data.word);
        setGuess("");
        setResult("");
        setGuesses([]);
        setScoreSaved(false);
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
      setResult(`The guess must be ${length} letters`);
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

        setResult(data.isCorrect ? "Correct Word!" : "Wrong word, try again");
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

  const getScoreData = () => {
    return {
      name: playerName,
      timeMs: elapsedTime,
      guesses: guesses.map((row) => row.map((item) => item.letter).join("")),
      wordLength: Number(length),
      allowDuplicateLetters: !unique,
    };
  };

  const saveScore = () => {
    const data = getScoreData();

    fetch("/api/highscore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((response) => {
        setResult("Score saved!");
        setScoreSaved(true);
        setPlayerName("");
      })
      .catch(() => {
        console.log("Error saving score");
      });
  };

  return (
  <div style={styles.page}>
    <div style={styles.container}>
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
            paddingTop: "30px",
            color: "#5fa99c",
            letterSpacing: "0.02em"
          }}
        >
          Wordle
        </h1>

        <div style={{ marginTop: "70px" }}>
          <span>
            Word length:
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              style={{ marginLeft: "10px", fontSize: "15px", paddingLeft: "6px", padding: "2px", width: "70px" } }
            />
          </span>
        </div>

        <div>
          <p style={{ marginTop: "30px" }}>Choose type of word:</p>
          <span>
            Unique letters 'check':
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
            />
          </span>
        </div>

        <button style={{ marginTop: "60px", fontSize: "15px", letterSpacing: "0.02em" }} onClick={getWord}>
          Start Game
        </button>

        {/* just for testing, against the Word */}
{/*         <p style={{ marginTop: "20px" }}>Word: {word}</p> */}

        <div style={{ marginTop: "20px", marginBottom: "30px" }}>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)} 
            style={{ fontSize: "15px", paddingLeft: "6px", padding: "2px" } } 
            placeholder="Guess Word"
          />

          <button onClick={submitGuess} disabled={gameEnd} style={{ marginLeft: "10px", fontSize: "15px", letterSpacing: "0.02em"  }}>Guess</button>
        </div>

        <p style={{ display: "block", height: "50px", visibility: "visible", margin: "0" }}>
          {result}
        </p>

        {elapsedTime !== null && (
          <p style={{ marginBottom: "20px", color: "gray" }}>Time: {(elapsedTime / 1000).toFixed(1)} seconds</p>
        )}

        {gameEnd && (
          <div>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Type your name"
            />

            <button onClick={saveScore} disabled={!playerName || scoreSaved}>
              Save score
            </button>
          </div>
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

{/* {gameEnd && playerName && (
  <pre>
    {JSON.stringify(
      {
        ...getScoreData(),
        timeSeconds: (getScoreData().timeMs / 1000).toFixed(1)
      },
      null,
      2
    )}
  </pre>
)} */}
          
            </div>
          ))}
        </div>
      </div>
    </main>
    </div>
    </div>
  );
}

export default App;






