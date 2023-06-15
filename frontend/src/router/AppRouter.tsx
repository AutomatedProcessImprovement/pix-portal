import {Routes, Route} from "react-router-dom"
import paths from "./paths"
import Index from "../components/Index";
import Projects from "../components/Projects/Projects";

const AppRouter = () => {
  return (
    <Routes>
      <Route path={"/"} element={<Index/>} />
      <Route path={paths.LOGIN_PATH} element={<Projects/>} />
      <Route path={paths.LOGOUT_PATH} element={<Projects/>} />
      <Route path={paths.PROJECTS_PATH} element={<Projects/>} />
    </Routes>
  )
}

export default AppRouter;