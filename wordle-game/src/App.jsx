import { useEffect, useState } from "react";

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#191f24",
    display: "flex",
    justifyContent: "center",
  },

  container: {
    backgroundColor: "#151618",
    marginTop: "16px",
    padding: "5px",
    paddingBottom: "40px",
    borderRadius: "0",
    width: "740px",
    textAlign: "center",
    color: "white",
  },

  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "none",
  },

  winContainer: {
    marginBottom: "16px",
  },

  button: {
    padding: "4px",
    marginTop: "6px",
    marginLeft: "10px",
    display: "inline-block",
    width: "120px",
    borderRadius: "5px",
    border: "none",
    fontSize: "14px",
    letterSpacing: "0.04em",
    backgroundColor: "#4caf50",
    color: "white",
    fontWeight: "500",
    cursor: "pointer",
  },

  link: {
    fontFamily: '"Lucida Console", "Courier New", monospace',
    color: "white",
    marginRight: "26px",
    textDecoration: "none",
    fontSize: "17px",
    lineHeight: "135%",
    fontWeight: "bold",
    letterSpacing: "0.03em",
  },

  grid: {
    marginTop: "0",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "center",
  },
  gridRow: {
    display: "flex",
    gap: "10px",
  },
  tile: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "20px",
    textTransform: "uppercase",
    borderRadius: "4px",
  },

  buttonPrimaryOne: {
    all: "unset",
    width: "110px",
    cursor: "pointer",
    color: "#f1b96f",
    marginTop: "60px",
    fontSize: "15px",
    backgroundColor: "#3f1b1b",
    border: "0",
    borderRadius: "4px",
    letterSpacing: "0.05em",
    padding: "3px",
    fontWeight: "bold",
  },

  buttonPrimaryOneSub: {
    all: "unset",
    width: "70px",
    cursor: "pointer",
    color: "#b3c3c4",
    marginLeft: "10px",
    marginTop: "60px",
    fontSize: "15px",
    backgroundColor: "#3f1b1b",
    border: "0",
    borderRadius: "4px",
    letterSpacing: "0.05em",
    padding: "3px",
    fontWeight: "bold",
  },

  buttonPrimaryTwo: {
    all: "unset",
    width: "70px",
    cursor: "pointer",
    color: "#f1b96f",
    marginLeft: "10px",
    fontSize: "15px",
    backgroundColor: "#3f1b1b",
    border: "0",
    borderRadius: "4px",
    letterSpacing: "0.05em",
    padding: "3px",
    fontWeight: "bold",
  }
};

function App() {
  const [word, setWord] = useState("");
  const [length, setLength] = useState(5);
  const [unique, setUnique] = useState(true);
  const [result, setResult] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);

  /* game End / Start, Score and Time variables */
  const [gameEnd, setGameEnd] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);

  const [hasWon, setHasWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const maxGuesses = 5;


  useEffect(() => {
    if (!gameStarted || gameEnd || !startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [gameStarted, gameEnd, startTime]);


  /* reset game */
  const resetGameState = () => {
    setWord("");
    setGuess("");
    setResult("");
    setGuesses([]);
    setGameEnd(false);
    setHasWon(false);
    setStartTime(null);
    setElapsedTime(null);
    setScoreSaved(false);
    setPlayerName("");
    setGameStarted(false);
  };

  const getWord = () => {
    const numericLength = Number(length);

    if (!numericLength || numericLength < 3 || numericLength > 9) {
      setResult("Word length must be between 3 and 9");
      return;
    }

    // reset gameplay but not settings
    resetGameState();

    fetch(`/api/word?length=${numericLength}&unique=${unique}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setResult(data.error);
          return;
        }

        setWord(data.word);
        setGameStarted(true);
        setStartTime(Date.now());

      })
      .catch(() => {
        setResult("Something went wrong");
      });
  };

  const submitGuess = () => {
    if (gameEnd) {
      return;
    }

    if (guesses.length >= maxGuesses) {
      setResult("No guesses left");
      return;
    }

    if (guess.length !== Number(length)) {
      setResult(`The guess must be ${length} letters`);
      return;
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
          return;
        }

        const nextGuessCount = guesses.length + 1;

        setResult(data.isCorrect ? "Correct Word!" : "Wrong word, try again");
        setGuesses((prev) => [...prev, data.finalization]);
        setGuess("");

        if (data.isCorrect) {
          setGameEnd(true);
          setHasWon(true);
          setElapsedTime(Date.now() - startTime);
        } else if (nextGuessCount >= maxGuesses) {
          setGameEnd(true);
          setHasWon(false);
          setResult(`Game Over. Correct Word: ${word}`);
        }
      })
      .catch(() => {
        setResult("Something went wrong");
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

  const safeLength = Math.max(1, Number(length) || 1);

  const emptyRow = Array.from({ length: safeLength }, () => ({
    letter: "",
    status: "empty",
  }));

  const gridRows = [...guesses];

  while (gridRows.length < maxGuesses) {
    gridRows.push(emptyRow);
  }

  const isGameActive = gameStarted && !gameEnd;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <nav style={{ marginBottom: "20px", marginTop: "2px" }}>
          <a href="/" style={styles.link}>
            Play
          </a>
          <a href="/highscore" style={styles.link}>
            Highscore
          </a>
          <a href="/about" style={styles.link}>
            About
          </a>
        </nav>

        <main
          style={{
            width: "100%",
            minHeight: "700px",
            height: "auto",
            margin: "0 auto",
            color: "#dddddd",
          }}
        >
          <div>
            <h1
              style={{
                color: "#a8e2e3",
                letterSpacing: "0.03em",
                marginTop: "80px",
              }}
            >
              Word<span style={{ color: "#79aeaa" }}>le</span>
            </h1>

            <div style={{ marginTop: "50px" }}>
              <span>
                Choose <span style={{ fontWeight: "500" }}>Word</span> length:
                <input
                  type="number"
                  value={length}
                  min="3"
                  max="9"
                  onChange={(e) => setLength(e.target.value)}
                  style={{
                    marginLeft: "10px",
                    fontSize: "15px",
                    paddingLeft: "6px",
                    padding: "2px",
                    width: "70px",
                  }}
                  disabled={gameStarted && !gameEnd}
                />
              </span>
            </div>

            <div style={{ marginTop: "20px" }}>
{/*               <p>
                Type of <span style={{ fontWeight: "500" }}>Word</span>
              </p> */}
              <span>
                Unique <span style={{ fontWeight: "500" }}>Word</span> letters 'check'
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={(e) => setUnique(e.target.checked)}
                  disabled={gameStarted && !gameEnd}
                  style={{ marginLeft: "10px" }}
                />
              </span>
            </div>

            <button
              style={styles.buttonPrimaryOne}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#502c2a")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#3f1b1b")}
              onClick={getWord}
            >
              {gameStarted || gameEnd ? "Retry @" : "Start Game"}
            </button>
            <button
              style={styles.buttonPrimaryOneSub}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#502c2a")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#3f1b1b")}
              onClick={() => {
                resetGameState();
                }
              } disabled={!gameStarted && guesses.length === 0}
            >
              Reset
            </button>

              {gameStarted && !gameEnd && (
                <p style={{ marginTop: " 20px" }} >Time: {(currentTime / 1000).toFixed(1)} s</p>
              )}

            {/* just for testing, against the Word */}
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

            <div style={{ marginTop: "20px", marginBottom: "10px" }}>
              <input
                type="text"
                value={guess}
                onChange={e => setGuess(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && isGameActive) {
                    submitGuess();
                  }
                }}
                style={{ fontSize: "15px", paddingLeft: "6px", padding: "2px" }}
                placeholder="Guess Word"
                disabled={!isGameActive}
              />

              <button
                style={styles.buttonPrimaryTwo}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#502c2a")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#3f1b1b")}
                onClick={submitGuess}
                disabled={!isGameActive}
              >
                Guess
              </button>
            </div>

            <p
              style={{
                display: "block",
                height: "50px",
                visibility: "visible",
                margin: "0",
              }}
            >
              {result}
            </p>

            {elapsedTime !== null && (
              <p style={{ marginBottom: "20px", color: "gray" }}>
                Time: {(elapsedTime / 1000).toFixed(1)} seconds
              </p>
            )}

            {hasWon && (
              <div style={styles.winContainer}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Type your name"
                  style={{
                    fontSize: "15px",
                    paddingLeft: "6px",
                    padding: "2px",
                  }}
                />

                <button
                  onClick={saveScore}
                  disabled={!playerName || scoreSaved}
                  style={styles.button}
                >
                  Save score
                </button>
              </div>
            )}

            <div style={styles.grid}>
              {gridRows.map((guessRow, rowIndex) => (
                <div key={rowIndex} 
                style={{...styles.gridRow, 
                border: rowIndex === guesses.length ? "2px solid #5a7070" : "none", 
                padding: "4px", 
                borderRadius: "4px"}}
                >
                  {guessRow.map((item, index) => {
                    let bgColor = "transparent";
                    let border = "2px solid #3a3a3c";

                    if (item.status === "correct") {
                      bgColor = "#538d4e";
                      border = "2px solid #538d4e";
                    } else if (item.status === "misplaced") {
                      bgColor = "#b59f3b";
                      border = "2px solid #b59f3b";
                    } else if (item.status === "incorrect") {
                      bgColor = "#3a3a3c";
                      border = "2px solid #3a3a3c";
                    }

                    return (
                      <div
                        key={index}
                        style={{
                          ...styles.tile,
                          backgroundColor: bgColor,
                          border: border,
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
      </div>
    </div>
  );
}

export default App;
