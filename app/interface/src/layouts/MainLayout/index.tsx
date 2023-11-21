import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AccessControl from "../../pages/AccessControl";
import Assignments from "../../pages/Assignments";
import LabBuilder from "../../pages/LabBuilder";
import Landing from "../../pages/Landing";
import Settings from "../../pages/Settings";
import Deployments from "../../pages/Deployments";
import LabsGridPage from "../../pages/LabsGridPage";
import LabPage from "../../pages/LabPage";
import Feedback from "../../pages/Feedback";
import LabVersionsPage from "../../pages/LabVersionsPage";

type Props = {
  darkMode: boolean;
  setDarkMode: (updatedDarkMode: boolean) => void;
};

export default function MainLayout({ darkMode, setDarkMode }: Props) {
  function handleSetDarkMode(updatedDarkMode: boolean) {
    if (updatedDarkMode) {
      localStorage.setItem("darkMode", "true");
    } else {
      localStorage.setItem("darkMode", "false");
    }
    setDarkMode(updatedDarkMode);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className="top-0 left-0 h-screen w-1/6 min-w-fit overflow-y-auto overflow-x-hidden 
      scrollbar-thin  scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full dark:scrollbar-thumb-slate-600"
      >
        <Navbar darkMode={darkMode} setDarkMode={handleSetDarkMode} />
      </div>
      <div className="flex-1 overflow-auto bg-slate-200 px-4 scrollbar-thin  scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full dark:bg-slate-800 dark:scrollbar-thumb-slate-600">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/builder" element={<LabBuilder />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/lab/:type/:id" element={<LabPage />} />
          <Route path="/lab/versions/:type/:id" element={<LabVersionsPage />} />
          <Route path="/labs/:type" element={<LabsGridPage />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/rbac" element={<AccessControl />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </div>
    </div>
  );
}
