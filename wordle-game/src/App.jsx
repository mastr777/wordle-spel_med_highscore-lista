
import { useState } from "react";

function App() {

  const [word, setWord] = useState("");
  const [length, setLength] = useState(5);
  const [unique, setUnique] = useState(true);
  const [result, setResult] = useState("");
  const [guess, setGuess] = useState("");

  const getWord = () => {

    fetch(`/api/word?length=${length}&unique=${unique}`)
      .then((res) => res.json())
      .then((data) => {

        setWord(data.word);
        setGuess("");
        setResult("");
      
      });
  };

  const submitGuess = () => {
    fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" 
      },
      body: JSON.stringify({ guess, word })
    })
    .then(res => res.json())
    .then(data => {
      setResult(data.isCorrect ? "Correct" : "Wrong guess");
    });
  };

  return (
    <div>

      <h1  style={{ paddingTop: "40px", color: "teal" }}>Wordle</h1>

      <div>

        <span  style={{ marginTop: "40px" }}>
          Word length:
          <input type="number" value={length} onChange={(e) => setLength(e.target.value)} />
        </span>

      </div>

      <div>

        <p style={{ marginTop: "40px" }}>Choose type of word:</p>
        <span>
          Unique letters 'check':
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} />
        </span>

      </div>

      <button style={{ marginTop: "40px" }} onClick={getWord}>Start Game</button>

      {/* testing against the word */}
      <p>Word: {word}</p>

     <div>

        <input
          type="text" value={guess} onChange={e => setGuess(e.target.value)} placeholder="Your guess" />

        <button onClick={submitGuess}>Guess</button>

      </div>

      <p>{result}</p>

    </div>

  );
}

export default App;







