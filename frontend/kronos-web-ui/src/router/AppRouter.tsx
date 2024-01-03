import { Route, Routes } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import Search from "../components/Search";
import paths from "./paths";

const AppRouter = () => {
  return (
    <Routes>
      <Route path={paths.DASHBOARD_PATH} element={<Dashboard />} />
      <Route path={paths.SEARCH_PATH} element={<Search />} />
    </Routes>
  );
};
export default AppRouter;
