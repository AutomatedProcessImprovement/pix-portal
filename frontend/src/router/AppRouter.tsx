import {Routes, Route} from "react-router-dom"
import paths from "./paths"
import Index from "../components/Index";
import Projects from "../components/Projects/Projects";
import ProjectPage from "../components/Projects/ProjectPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path={"/"} element={<Index/>} />
      <Route path={paths.LOGIN_PATH} element={<Projects/>} />
      <Route path={paths.LOGOUT_PATH} element={<Index/>} />
      <Route path={paths.PROJECTS_PATH} element={<Projects/>} />
      <Route path={paths.PROJECT_ID_PATH} element={<ProjectPage/>} />
    </Routes>
  )
}

export default AppRouter;