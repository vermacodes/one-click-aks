import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AccessControl from "../../pages/AccessControl";
import Assignments from "../../pages/Assignments";
import Builder from "../../pages/Builder";
import LabPage from "../../pages/LabPage";
import Landing from "../../pages/Landing";
import Learning from "../../pages/Learning";
import MockCases from "../../pages/MockCases";
import PublicLabs from "../../pages/PublicLabs";
import ReadinessLabs from "../../pages/ReadinessLabs";
import SavedLabs from "../../pages/SavedLabs";
import Settings from "../../pages/Settings";
import Deployments from "../../pages/Deployments";

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
        className="top-0 left-0 h-screen w-1/5 min-w-fit overflow-y-auto overflow-x-hidden 
      scrollbar-thin  scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full dark:scrollbar-thumb-slate-600"
      >
        <Navbar darkMode={darkMode} setDarkMode={handleSetDarkMode} />
      </div>
      <div className="flex-1 overflow-auto bg-slate-200 px-4 scrollbar-thin  scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full dark:bg-slate-800 dark:scrollbar-thumb-slate-600">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/mylabs" element={<SavedLabs />} />
          <Route path="/publiclabs" element={<PublicLabs />} />
          <Route path="/lab/:type/:id" element={<LabPage />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/redinesslabs" element={<ReadinessLabs />} />
          <Route path="/mockcases" element={<MockCases />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/rbac" element={<AccessControl />} />
        </Routes>
      </div>
    </div>
  );
}
