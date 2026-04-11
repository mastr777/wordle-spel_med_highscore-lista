
import { useState } from "react";

function App() {

  const [word, setWord] = useState("");
  const [length, setLength] = useState(5);
  const [unique, setUnique] = useState(true);

  const getWord = () => {

    fetch(`/api/word?length=${length}&unique=${unique}`)
      .then((res) => res.json())
      .then((data) => setWord(data.word));
      
  };

  return (
    <div>

      <h1>Wordle</h1>

      <div>

        <span>
          Word length:
          <input type="number" value={length} onChange={(e) => setLength(e.target.value)} />
        </span>

      </div>

      <div>

        <p>Choose type of word:</p>
        <span>
          Unique letters 'check':
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} />
        </span>

      </div>

      <button onClick={getWord}>Start Game</button>

      <p>Word: {word}</p>
    </div>
  );
}

export default App;







