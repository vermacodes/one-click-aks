import { Route, Routes } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AccessControl from "../../pages/AccessControl";
import Assignments from "../../pages/Assignments";
import Builder from "../../pages/Builder";
import Templates from "../../pages/Labs";
import Landing from "../../pages/Landing";
import Learning from "../../pages/Learning";
import MockCases from "../../pages/MockCases";
import ReadinessLabs from "../../pages/ReadinessLabs";
import Settings from "../../pages/Settings";
import Start from "../../pages/Start";

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
      <div className="top-0 left-0 h-screen w-1/5 min-w-fit overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 scrollbar-thumb-rounded-full">
        <Navbar darkMode={darkMode} setDarkMode={handleSetDarkMode} />
      </div>
      <div className="flex-1 overflow-auto bg-slate-100 px-8 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 scrollbar-thumb-rounded-full dark:bg-slate-800">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/labs" element={<Templates />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/redinesslabs" element={<ReadinessLabs />} />
          <Route path="/mockcases" element={<MockCases />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/start" element={<Start />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/rbac" element={<AccessControl />} />
        </Routes>
      </div>
    </div>
  );
}
