import { loginToFishbowl, getInventory, seeTable } from "./api/fishbowlapi";
import { useState } from "react";
import "./App.css";
import { callAgent } from "./api/aiagentapi";
import { getMail } from "./api/msgraphapi";

function App() {
  const [partNumber, setPartNumber] = useState("");
  const [inputText, setInputText] = useState("");
  return (
    <div className="App">
      <button onClick={loginToFishbowl}>Login to Fishbowl</button>
      <button onClick={getInventory}>Get Inventory</button>
      <input onChange={(e) => setPartNumber(e.target.value)}></input>
      <button onClick={(e) => seeTable(partNumber)}>See Table</button>
      <textarea onChange={(e) => setInputText(e.target.value)}></textarea>
      <button onClick={(e) => callAgent(inputText)}>test </button>
      <button onClick={(e) => getMail()}>test </button>
    </div>
  );
}

export default App;
