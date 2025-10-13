import { loginToFishbowl, getInventory } from "./fishbowl-integration/api";
import "./App.css";

function App() {
  return (
    <div className="App">
      <button onClick={loginToFishbowl}>Login to Fishbowl</button>
      <button onClick={getInventory}>Get Inventory</button>
    </div>
  );
}

export default App;
