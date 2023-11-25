import Detectors from "../../components/Detectors/Detectors";
import DarkModeSwitch from "../../components/UserInterfaceComponents/DarkModeSwitch";
import { useGlobalStateContext } from "../../components/Context/GlobalStateContext";
import { FaBars } from "react-icons/fa";
import Button from "../../components/UserInterfaceComponents/Button";

type Props = {
  heading?: string;
  children: React.ReactNode;
};

export default function PageLayout({ heading, children }: Props) {
  const { darkMode, setDarkMode, navbarOpen, setNavbarOpen } =
    useGlobalStateContext();
  // const { defaultAccount } = useDefaultAccount();
  return (
    <div>
      <Detectors />
      {heading !== undefined && (
        <div
          className={`${
            heading !== "" ? "mb-4 border-b-2 border-slate-500 py-4 " : "mt-6 "
          } flex items-center justify-between `}
        >
          <div className="flex items-end gap-2">
            <Button
              variant="secondary-icon"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <FaBars />
            </Button>
            <h1 className="text-4xl">{heading}</h1>
          </div>
          {/* <div className="text-sm text-slate-500">
            {defaultAccount ? defaultAccount.name : ""}
          </div> */}
          <DarkModeSwitch
            handleOnChange={() => setDarkMode(!darkMode)}
            label=""
            id="darkModeSwitch"
            checked={darkMode}
          />
        </div>
      )}
      {children}
    </div>
  );
}
