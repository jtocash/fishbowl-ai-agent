import { loginToFishbowl } from './fishbowl-integration/api';
import './App.css';

function App() {
  return (
    <div className="App">
      <button onClick={loginToFishbowl}>Login to Fishbowl</button>
    </div>
  );
}

export default App;
