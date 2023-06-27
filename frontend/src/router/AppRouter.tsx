import {Routes, Route, Navigate} from "react-router-dom"
import paths from "./paths"
import Index from "../components/Index";
import Projects from "../components/Projects/Projects";
import ProjectPage from "../components/Projects/ProjectPage";
import {useEffect, useState} from "react";
import Login from "../components/Login/Login";
import {authConfig} from "../../authConfig";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import Callback from "../components/Callback";
import ProtectedRoute from "./ProtectedRoute";
import PrivateRoute from "./ProtectedRoute";


interface RouterProps {
  authenticated : boolean,
  setAuthenticated,
  userInfo,
  setUserInfo,
  clearAuth,
  userManager,
  authorize: () => void,
}

const AppRouter = (props: RouterProps) => {
  const {authenticated, setAuthenticated, userInfo, setUserInfo, clearAuth, userManager, authorize } = props

  return (
    <Routes>
      <Route
        path={paths.LOGIN_PATH}
        element={<Login auth={authenticated} handleLogin={authorize} />}
      />
      <Route
        path="/api/auth/callback/zitadel"
        element={
          <Callback
            auth={authenticated}
            setAuth={setAuthenticated}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            handleLogout={clearAuth}
            userManager={userManager}
          />
        }
      />
      <Route path={"/home"} element={<Index auth={authenticated} handleLogin={authorize}/>} />
      <Route exact path={paths.PROJECTS_PATH} element={<PrivateRoute auth={authenticated}/>}>
        <Route exact path={paths.PROJECTS_PATH} element={<Projects auth={authenticated} userManager={userManager}/>}/>
      </Route>
      <Route exact path={paths.PROJECT_ID_PATH} element={<PrivateRoute auth={authenticated}/>}>
        <Route exact path={paths.PROJECT_ID_PATH} element={<ProjectPage auth={authenticated} userManager={userManager}/>}/>
      </Route>

      {/*<Route*/}
      {/*       element={*/}
      {/*            <Projects authenticated={authenticated} userManager={userManager} />*/}
      {/*}>*/}
      {/*</Route>*/}
      {/*<Route path={paths.PROJECTS_PATH} element={<Projects/>}/>*/}
      {/*<Route path={paths.PROJECT_ID_PATH} element={<ProjectPage/>}/>*/}
      {/*<Route*/}
      {/*  path="/api/auth/callback/zitadel"*/}
      {/*  element={<Navigate to="/home" />}*/}
      {/*/>*/}
      <Route
        path="/"
        element={<Navigate to="/home" replace/>}
      />
    </Routes>
  )
}

export default AppRouter;