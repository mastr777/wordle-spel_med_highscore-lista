
import { useEffect, useState } from "react";

function App() {

  const [word, setWord] = useState("");

  useEffect(() => {
    fetch("/api/word")
      .then(res => res.json())
      .then(data => setWord(data.word));
  }, []);

  return (

    <div>
      <h1>Wordle</h1>
      <p>The Word: {word}</p>
    </div>
    
  );
}

export default App;



