import { createContext, useContext, useEffect, useState } from "react";
import { setDefaultValuesInLocalStorage } from "../../../utils/helpers";

interface GlobalStateContextContextData {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalStateContextContext = createContext<
  GlobalStateContextContextData | undefined
>(undefined);

type Props = {
  children: React.ReactNode;
};

export function GlobalStateContextProvider({ children }: Props) {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    setDefaultValuesInLocalStorage();

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
    <GlobalStateContextContext.Provider
      value={{
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </GlobalStateContextContext.Provider>
  );
}

export function useGlobalStateContext() {
  const context = useContext(GlobalStateContextContext);
  if (!context) {
    throw new Error(
      "useGlobalStateContext must be used within an GlobalStateContextProvider"
    );
  }
  return context;
}
