import {BrowserRouter} from 'react-router-dom';
import './App.css';
import Navbar from "./components/navbar/Navbar";
import AppRouter from './router/AppRouter';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Navbar/>
                <div className="App">
                    <AppRouter/>
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
