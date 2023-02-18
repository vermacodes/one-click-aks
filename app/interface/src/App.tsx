import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import { Routes, Route } from "react-router-dom";
import Builder from "./pages/Builder";
import Templates from "./pages/Templates";
import Learning from "./pages/Learning";
import MockCases from "./pages/MockCases";
import Labs from "./pages/Labs";
import Assignments from "./pages/Assignments";
import Start from "./pages/Start";
import Settings from "./pages/Settings";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    var darkModeFromLocalStorage = localStorage.getItem("darkMode");
    if (darkModeFromLocalStorage === null) {
      localStorage.setItem("darkMode", "true");
    } else {
      if (darkModeFromLocalStorage === "false") {
        setDarkMode(false);
      }
    }
  }, []);

  function handleSetDarkMode(updatedDarkMode: boolean) {
    if (updatedDarkMode) {
      localStorage.setItem("darkMode", "true");
    } else {
      localStorage.setItem("darkMode", "false");
    }
    setDarkMode(updatedDarkMode);
  }

  return (
    <div
      className={`min-h-screen w-full min-w-[1000px] pb-2 scrollbar scrollbar-track-sky-500 ${
        darkMode
          ? " dark bg-slate-900 text-slate-200"
          : " bg-slate-100 text-slate-900"
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={handleSetDarkMode} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/mockcases" element={<MockCases />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/start" element={<Start />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
