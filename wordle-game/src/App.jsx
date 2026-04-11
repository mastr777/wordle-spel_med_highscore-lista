
import { useState } from "react";

function App() {

  const [word, setWord] = useState("");
  const [length, setLength] = useState(5);
  const [unique, setUnique] = useState(true);
  const [result, setResult] = useState("");
  const [guess, setGuess] = useState("");
  const [finalization, setFinalization] = useState([]);

  const getWord = () => {
    fetch(`/api/word?length=${length}&unique=${unique}`)
      .then((res) => res.json())
      .then((data) => {

        setWord(data.word);
        setGuess("");
        setResult("");
        setFinalization([]);
      
      });
  };

  const submitGuess = () => {
    if (guess.length !== Number(length)) {
      setResult("Guess must be ${length} letters");
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
        setFinalization(data.finalization);
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
      color: "teal",
      }}>

    <div>
      <h1 
      style={{ 
        paddingTop: "40px", 
        color: "teal" 
        }}>
          Wordle</h1>

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

        <button onClick={submitGuess}>Guess</button>
      </div>

      <p style={{ display: "block", height: "50px", visibility: "visible" }}>{result}</p>

      <div style={{ minWidth: "240px", width: "auto", minHeight: "60px", height: "auto", backgroundColor: "#1e2e32", margin: "0 auto" }}>
          <div style={{ minWidth: "240px", width: "auto", display: "inline-flex", gap: "10px", marginTop: "10px" }}>

        {finalization.map((item, index) => {
          let bgColor = "lightgray";

          if (item.status === "correct") bgColor = "green";
          else if (item.status === "misplaced") bgColor = "gold";
          else if (item.status === "incorrect") bgColor = "red";

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
      </div>
    </div>
    </main>
  );
}

export default App;






