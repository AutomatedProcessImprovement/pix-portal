import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AppRouter from './router/AppRouter';
import Navigation from "./components/Navigation/Navigation";
import {UserManager, WebStorageStateStore} from "oidc-client-ts";
import {authConfig} from "../authConfig";
import {useEffect, useState} from "react";


function App() {
  const [authenticated, setAuthenticated] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  console.log(authConfig)
  const userManager = new UserManager({
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    ...authConfig,
  });

  function authorize() {
    userManager.signinRedirect().then(()=> {
      setAuthenticated(true);
    });
  }

  function clearAuth() {
    userManager.signoutRedirect().then(()=> {
      setAuthenticated(false);
    });
  }

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
        <Navigation authenticated={authenticated} clearAuth={clearAuth} userManager={userManager}/>
        <div className="App">
          <AppRouter authenticated={authenticated} setAuthenticated={setAuthenticated} setUserInfo={setUserInfo} userInfo={userInfo} authorize={authorize} userManager={userManager}/>
        </div>
      </BrowserRouter>
  );
}

export default App;