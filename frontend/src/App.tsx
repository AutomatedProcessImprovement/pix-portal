import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AppRouter from './router/AppRouter';
import Navigation from "./components/Navigation/Navigation";

function App() {
  return (
    <BrowserRouter>
      <Navigation/>
      <div className="App">
        <AppRouter/>
      </div>
    </BrowserRouter>
  );
}

export default App;