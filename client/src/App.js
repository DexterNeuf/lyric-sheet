import { Switch, Route, Redirect } from "react-router-dom";
import Playback from "./components/Playback";
import "./styles/main.scss";
import  queryString from 'query-string'


function App() {
  return (
    <div className="App">
      <Switch>
      <Route path="/" exact>
        <main className="front-page">
          <button className="front-page__button" onClick={() => window.location="http://localhost:8888/login"}>
            Login with Spotify
          </button>
        </main>
      </Route>
        <Route path="/playback" component={Playback}/>
      </Switch>
    </div>
  );
}

export default App;
