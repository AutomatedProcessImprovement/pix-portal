import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AppRouter from './router/AppRouter';
import Navigation from "./components/Navigation/Navigation";
import {UserManager, WebStorageStateStore} from "oidc-client-ts";
import {authConfig} from "../authConfig";
import {useEffect, useState} from "react";


function App() {
  const userManager = new UserManager({
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    ...authConfig,
  });

  function authorize() {
    userManager.signinRedirect().then((user: any)=> {
      setAuthenticated(true);
    });
  }

  function clearAuth() {
    userManager.signoutRedirect().then((user: any)=> {
      setAuthenticated(false);
    });
  }

  const [authenticated, setAuthenticated] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    userManager.getUser().then((user) => {
      if (user) {
        setAuthenticated(true);
        // setUserInfo(user)
      } else {
        setAuthenticated(false);
        // setUserInfo(null)
      }
    });
  }, [userManager]);

  return (

      <BrowserRouter>
        <Navigation authenticated={authenticated} userInfo={userInfo} clearAuth={clearAuth}/>
        <div className="App">
          <AppRouter authenticated={authenticated} setAuthenticated={setAuthenticated} setUserInfo={setUserInfo} userInfo={userInfo} authorize={authorize} clearAuth={clearAuth} userManager={userManager}/>
        </div>
      </BrowserRouter>
  );
}

export default App;