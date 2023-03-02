import { useEffect, useState } from "react";
import MainLayout from "./layouts/MainLayout";

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

  return (
    <div
      className={`${
        darkMode
          ? " dark bg-slate-900 text-slate-200"
          : " bg-slate-50 text-slate-900"
      }`}
    >
      <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}

export default App;
