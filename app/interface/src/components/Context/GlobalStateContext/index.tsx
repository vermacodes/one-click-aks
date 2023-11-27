import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { Lab } from "../../../dataStructures";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { setDefaultValuesInLocalStorage } from "../../../utils/helpers";

interface GlobalStateContextContextData {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  navbarOpen: boolean;
  setNavbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lab: Lab | undefined;
  setLab: React.Dispatch<React.SetStateAction<Lab | undefined>>;
}

const GlobalStateContextContext = createContext<
  GlobalStateContextContextData | undefined
>(undefined);

type Props = {
  children: React.ReactNode;
};

export function GlobalStateContextProvider({ children }: Props) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [navbarOpen, setNavbarOpen] = useState<boolean>(true);
  const [lab, setLab] = useState<Lab | undefined>(undefined);
  const { mutate: setLabServerState } = useSetLab();
  const { data: labFromServer } = useLab();
  const queryClient = useQueryClient();

  useEffect(() => {
    setDefaultValuesInLocalStorage();

    var darkModeFromLocalStorage = localStorage.getItem("darkMode");
    if (darkModeFromLocalStorage === null) {
      localStorage.setItem("darkMode", "false");
    } else {
      if (darkModeFromLocalStorage === "true") {
        setDarkMode(true);
      }
    }

    var navbarOpenFromLocalStorage = localStorage.getItem("navbarOpen");
    if (navbarOpenFromLocalStorage === null) {
      localStorage.setItem("navbarOpen", "true");
    } else {
      if (navbarOpenFromLocalStorage === "false") {
        setNavbarOpen(false);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("navbarOpen", navbarOpen.toString());
  }, [navbarOpen]);

  useEffect(() => {
    if (lab === undefined) {
      console.log("State from server", labFromServer);
      setLab(labFromServer);
    }
  }, [labFromServer]);

  useEffect(() => {
    if (lab !== undefined) {
      console.log("Setting lab state on server", lab);
      setLabServerState(lab);
    }
  }, [lab]);

  return (
    <GlobalStateContextContext.Provider
      value={{
        darkMode,
        setDarkMode,
        navbarOpen,
        setNavbarOpen,
        lab,
        setLab,
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
