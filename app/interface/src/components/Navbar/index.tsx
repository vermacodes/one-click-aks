import {
  FaClipboard,
  FaCog,
  FaExternalLinkAlt,
  FaFileCode,
  FaFlask,
  FaList,
  FaMoon,
  FaPeopleCarry,
  FaShieldAlt,
  FaSun,
  FaTools,
  FaTrash,
  FaUserGraduate,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useGetMyRoles } from "../../hooks/useAuth";
import { useLab } from "../../hooks/useLab";
import LoginButton from "../Authentication/LoginButton";
import CurrentTerraformWorkspace from "../CurrentTerraformWorkspace";
import DestroyButton from "../Terraform/DestroyButton";

type NavbarProps = {
  darkMode: boolean;
  setDarkMode(args: boolean): void;
};

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  return (
    <nav className="flex h-screen w-full min-w-max flex-col  text-slate-900 dark:text-slate-100">
      <Title />
      <Pages />
      <FixedPages darkMode={darkMode} setDarkMode={setDarkMode} />
    </nav>
  );
}

function Title() {
  return (
    <Link to={"/"}>
      <h1 className="flex flex-row items-center px-8 pt-8 text-2xl font-bold hover:text-sky-500">
        <img src="/actlabs_logo.svg" className="mr-2 h-8 w-8"></img>
        ACT Labs
      </h1>
    </Link>
  );
}

function Pages() {
  const { data: roles } = useGetMyRoles();
  return (
    <div className="h-9/10 mt-2 flex w-full flex-col overflow-y-scroll border-b border-slate-300 px-4 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full dark:border-slate-700 dark:scrollbar-thumb-slate-600">
      <ul className="md:text-l flex w-full flex-col justify-start gap-y-1 py-2 text-sm lg:text-xl">
        <li>
          <Link to={"/builder"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaTools />
              </span>
              <span>Lab Builder</span>
            </button>
          </Link>
        </li>
        <li>
          <Link to={"/mylabs"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaFileCode />
              </span>
              <span>My Saved Labs</span>
            </button>
          </Link>
        </li>
        <li>
          <Link to={"/publiclabs"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaPeopleCarry />
              </span>
              <span>Public Labs</span>
            </button>
          </Link>
        </li>
        <li>
          <Link to={"/learning"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaUserGraduate />
              </span>
              <span>My Assignments</span>
            </button>
          </Link>
        </li>
        {roles && roles.roles.includes("mentor") && (
          <>
            <li>
              <Link to={"/redinesslabs"}>
                <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
                  <span>
                    <FaFlask />
                  </span>
                  <span>Readiness Labs</span>
                </button>
              </Link>
            </li>
            <li>
              <Link to={"/mockcases"}>
                <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
                  <span>
                    <FaClipboard />
                  </span>
                  <span>Mock Cases</span>
                </button>
              </Link>
            </li>
            <li>
              <Link to={"/assignments"}>
                <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
                  <span>
                    <FaList />
                  </span>
                  <span>Lab Assignments</span>
                </button>
              </Link>
            </li>
          </>
        )}
        {roles && roles.roles.includes("admin") && (
          <>
            <li>
              <Link to={"/rbac"}>
                <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
                  <span>
                    <FaShieldAlt />
                  </span>
                  <span>Access Control</span>
                </button>
              </Link>
            </li>
          </>
        )}
        <li>
          <a
            target="_blank"
            href="https://actlabsdocs.z13.web.core.windows.net/docs/introduction"
          >
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaExternalLinkAlt />
              </span>
              <span>ACT Labs Docs</span>
            </button>
          </a>
        </li>
      </ul>
    </div>
  );
}

type FixedPagesProps = {
  darkMode: boolean;
  setDarkMode(args: boolean): void;
};

function FixedPages({ darkMode, setDarkMode }: FixedPagesProps) {
  const { data: lab } = useLab();

  return (
    <div className="h-fit w-full flex-col p-4">
      <ul className="md:text-l flex w-full flex-col justify-start gap-y-1 text-sm lg:text-xl">
        {/* <li>
          <CurrentTerraformWorkspace />
        </li> */}
        {/* <li>
          <DestroyButton variant="secondary-text" navbarButton={true} lab={lab}>
            <span>
              <FaTrash />
            </span>
            Terraform Destroy
          </DestroyButton>
        </li> */}
        <li>
          <button
            className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </li>
        <li>
          <Link to={"/settings"}>
            <button
              className={`flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800`}
            >
              <span>
                <FaCog />
              </span>
              <span>Settings</span>
            </button>
          </Link>
        </li>
        <li>
          <LoginButton />
        </li>
      </ul>
    </div>
  );
}
