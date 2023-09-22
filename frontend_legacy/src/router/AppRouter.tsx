import {Routes, Route} from "react-router-dom"
import pix_paths from "./pix/pix_paths"
import prosimos_paths from "./prosimos/prosimos_paths"

import Home from "../components/pix/pixIndex/Home";
import Projects from "../components/pix/pixProjects/Projects";
import ProjectPage from "../components/pix/pixProjects/ProjectPage";
import Callback from "../components/pix/pixLoginCallback/Callback";
import PrivateRoute from "./ProtectedRoute";
import Register from "../components/pix/pixLogin/Register";
import BPMNModelViewer from "../components/prosimos/model/BPMNModelViewer";
import SimulationParameters from "../components/prosimos/SimulationParameters";


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
      {/* PIX ROUTING | UNPROTECTED */}
      <Route
        path={pix_paths.LOGIN_PATH}
        element={<Home auth={authenticated} handleLogin={authorize}/>}
      />
      <Route
        path={pix_paths.REGISTER_PATH}
        element={<Register auth={authenticated} handleLogin={authorize}/>}
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

      {/* PIX PROJECT ROUTING | PROTECTED */}
      <Route path={"/home"} element={<Home auth={authenticated} handleLogin={authorize}/>}/>

      <Route path={pix_paths.PROJECTS_PATH} element={<PrivateRoute auth={authenticated}/>}>
        <Route path={pix_paths.PROJECTS_PATH} element={<Projects auth={authenticated} userManager={userManager}/>}/>
      </Route>
      <Route path={pix_paths.PROJECT_ID_PATH} element={<PrivateRoute auth={authenticated}/>}>
        <Route path={pix_paths.PROJECT_ID_PATH} element={<ProjectPage />}/>
      </Route>

      {/* PROSIMOS ROUTING | PROTECTED */}
      <Route path={prosimos_paths.SIMULATOR_SCENARIO_PATH} element={<PrivateRoute auth={authenticated}/>}>
        <Route path={prosimos_paths.SIMULATOR_SCENARIO_PATH} element={<SimulationParameters/>} />
      </Route>
      <Route path={prosimos_paths.MODEL_VIEWER} element={<PrivateRoute auth={true}/>}>
        <Route path={prosimos_paths.MODEL_VIEWER} element={<BPMNModelViewer/>} />
      </Route>


      {/*DEFAULT ROUTING | REROUTING*/}
      <Route
        path="/"
        element={<Home auth={authenticated} handleLogin={authorize}/>}
      />
    </Routes>
  )
}

export default AppRouter;