import {
  loginToFishbowl,
  getInventory,
  seeTable,
} from "./fishbowl-integration/api";
import "./App.css";

function App() {
  return (
    <div className="App">
      <button onClick={loginToFishbowl}>Login to Fishbowl</button>
      <button onClick={getInventory}>Get Inventory</button>
      <button onClick={seeTable}>See Table</button>
    </div>
  );
}

export default App;
