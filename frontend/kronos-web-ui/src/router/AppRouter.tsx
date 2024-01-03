import {Route, Routes} from "react-router-dom";
import Upload from "../components/Upload";
import paths from "./paths";
import Dashboard from "../components/Dashboard";
import Search from "../components/Search";

const AppRouter = () => {
    return (
        <Routes>
            <Route path={"/"} element={<Upload/>}/>
            <Route path={paths.UPLOAD_PATH} element={<Upload/>}/>
            <Route path={paths.DASHBOARD_PATH} element={<Dashboard/>}/>
            <Route path={paths.SEARCH_PATH} element={<Search/>}/>
        </Routes>
    )
}
export default AppRouter;