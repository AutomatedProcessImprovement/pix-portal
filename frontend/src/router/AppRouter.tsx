import {Routes, Route, Navigate} from "react-router-dom"
import paths from "./paths"
import Home from "../components/Index/Home";
import Projects from "../components/Projects/Projects";
import ProjectPage from "../components/Projects/ProjectPage";
import Login from "../components/Login/Login";
import Callback from "../components/Callback";
import PrivateRoute from "./ProtectedRoute";
import Register from "../components/Login/Register";


interface RouterProps {
  authenticated : boolean,
  setAuthenticated:any,
  userInfo:any,
  setUserInfo:any,
  userManager:any,
  authorize: () => void,
}

const AppRouter = (props: RouterProps) => {
  const {authenticated, setAuthenticated, userInfo, setUserInfo, userManager, authorize } = props

  return (
    <Routes>
      <Route
        path={paths.LOGIN_PATH}
        element={<Login auth={authenticated} handleLogin={authorize}/>}
      />
      <Route
        path={paths.REGISTER_PATH}
        element={<Register />}
      />
      <Route
        path="/auth/callback/zitadel"
        element={
          <Callback
            auth={authenticated}
            setAuth={setAuthenticated}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            userManager={userManager}
          />
        }
      />
      <Route path={"/home"} element={<Home />} />
      <Route path={paths.PROJECTS_PATH} element={<PrivateRoute auth={authenticated}/>}>
        <Route path={paths.PROJECTS_PATH} element={<Projects auth={authenticated} userManager={userManager}/>}/>
      </Route>
      <Route path={paths.PROJECT_ID_PATH} element={<PrivateRoute auth={authenticated}/>}>
        <Route path={paths.PROJECT_ID_PATH} element={<ProjectPage />}/>
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