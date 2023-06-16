import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AppRouter from './router/AppRouter';
import Navigation from "./components/Navigation/Navigation";
import { ConfirmProvider } from "material-ui-confirm";


function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter>
        <Navigation/>
        <div className="App">
          <AppRouter/>
        </div>
      </BrowserRouter>
    </ConfirmProvider>
  );
}

export default App;