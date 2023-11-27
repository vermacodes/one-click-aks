import { createContext, useContext, useEffect, useState } from "react";
import { Lab } from "../../../dataStructures";
import { getDefaultLab } from "../../../defaults";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { setDefaultValuesInLocalStorage } from "../../../utils/helpers";

interface GlobalStateContextContextData {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  navbarOpen: boolean;
  setNavbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lab: Lab;
  setLab: React.Dispatch<React.SetStateAction<Lab>>;
  syncLab: boolean;
  setSyncLab: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [lab, setLab] = useState<Lab>(getDefaultLab());
  const [syncLab, setSyncLab] = useState<boolean>(true);
  const { mutate: setLabServerState } = useSetLab();
  const { data: labFromServer } = useLab();

  /**
   * This useEffect hook is triggered once when the component mounts.
   * It sets default values in local storage for `darkMode` and `navbarOpen`.
   * If these values are already set in local storage, it updates the local state accordingly.
   */
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

  /**
   * This useEffect hook is triggered when `darkMode` changes.
   * It updates the `darkMode` value in local storage to reflect the new state.
   */
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  /**
   * This useEffect hook is triggered when `navbarOpen` changes.
   * It updates the `navbarOpen` value in local storage to reflect the new state.
   */
  useEffect(() => {
    localStorage.setItem("navbarOpen", navbarOpen.toString());
  }, [navbarOpen]);

  /**
   * This useEffect hook is triggered when `labFromServer` changes.
   * If `labFromServer` is defined and `syncLab` is true, it updates the local `lab` state with the server state
   * and sets `syncLab` to false to prevent unnecessary updates in the future.
   */
  useEffect(() => {
    if (labFromServer !== undefined && syncLab) {
      setLab(labFromServer);
      setSyncLab(false);
    }
  }, [labFromServer]);

  /**
   * This useEffect hook is triggered when `lab` changes.
   * If `lab` is defined and `syncLab` is false, it updates the server state with the local `lab` state.
   * This ensures that any changes to the local `lab` state are persisted to the server state.
   */
  useEffect(() => {
    if (lab !== undefined && !syncLab) {
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
        syncLab,
        setSyncLab,
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
