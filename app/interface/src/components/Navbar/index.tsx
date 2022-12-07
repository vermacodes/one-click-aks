import { useState } from "react";
import { FaServer, FaSun, FaMoon, FaCog, FaUserNinja } from "react-icons/fa";
import Settings from "../../modals/Settings";
import { Link, useNavigate } from "react-router-dom";
import { useServerStatus } from "../../hooks/useServerStatus";
import {
  useAccount,
  useGetPriviledge,
  useLogin,
  useLoginStatus,
} from "../../hooks/useAccount";
import { useGetStorageAccount } from "../../hooks/useStorageAccount";
import { useSetLogs } from "../../hooks/useLogs";
import Terraform from "../../modals/Terraform";

type NavbarProps = {
  darkMode: boolean;
  setDarkMode(args: boolean): void;
};

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showUserName, setShowUserName] = useState<boolean>(false);
  const [showServerStatus, setShowServerStatus] = useState<boolean>(false);

  const {
    data: serverStatus,
    refetch: getServerStatus,
    isError,
  } = useServerStatus();
  const {
    data: isLogin,
    refetch: getLoginStatus,
    isError: loginError,
  } = useLoginStatus();
  const { refetch: login } = useLogin();
  const { data: accounts, isLoading: accountsLoading } = useAccount();
  const { data: storageAccount } = useGetStorageAccount();
  const navigate = useNavigate();
  const { mutate: setLogs } = useSetLogs();
  const { data: priviledge } = useGetPriviledge();

  function handleLogin() {
    navigate("/builder");
    setLogs({ isStreaming: true, logs: "" });
    login();
  }
  return (
    <nav className="z-100 sticky top-0 mt-0 mb-4 w-full bg-slate-100 dark:bg-slate-900">
      <div className="flex justify-between border-b py-4 px-20 hover:shadow hover:shadow-slate-500 dark:border-b-slate-700">
        <Link to={"/"}>
          <h1 className="border-b-2 border-transparent text-2xl font-bold hover:border-b-sky-400 hover:text-sky-400">
            ACT Labs
          </h1>
        </Link>
        <div className="flex divide-x divide-slate-300 align-middle  dark:divide-slate-700">
          <ul className="flex gap-x-3 px-5 align-middle">
            <li>
              <Link to={"/builder"}>
                <button className="border-b-2 border-transparent py-1 hover:border-b-2 hover:border-b-sky-400 hover:text-sky-400 ">
                  Builder
                </button>
              </Link>
            </li>
            <li>
              <Link to={"/templates"}>
                <button className="border-b-2 border-transparent py-1 hover:border-b-2 hover:border-b-sky-400 hover:text-sky-400">
                  Templates
                </button>
              </Link>
            </li>
            <li>
              <Link to={"/learning"}>
                <button className="border-b-2 border-transparent py-1 hover:border-b-2 hover:border-b-sky-400 hover:text-sky-400">
                  Learning
                </button>
              </Link>
            </li>
            {priviledge && (priviledge.isAdmin || priviledge.isMentor) && (
              <>
                <li>
                  <Link to={"/labs"}>
                    <button className="border-b-2 border-transparent py-1 hover:border-b-2 hover:border-b-sky-400 hover:text-sky-400">
                      Labs
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to={"/mockcases"}>
                    <button className="border-b-2 border-transparent py-1 hover:border-b-2 hover:border-b-sky-400 hover:text-sky-400">
                      Mocks
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to={"/assignments"}>
                    <button className="border-b-2 border-transparent py-1 hover:border-b-2 hover:border-b-sky-400 hover:text-sky-400">
                      Assignments
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="flex gap-x-4 pl-5">
            <li>
              <Terraform />
            </li>
            <li>
              <div className="relative inline-block text-left">
                <button
                  className={`items-center justify-center border-b-2 border-transparent py-1 text-2xl hover:border-b-sky-400 hover:text-sky-400 ${
                    isError && "text-red-500"
                  }`}
                  onMouseEnter={() => {
                    setShowServerStatus(true);
                    getServerStatus();
                  }}
                  onMouseLeave={() => {
                    setShowServerStatus(false);
                  }}
                  onClick={() => getServerStatus()}
                >
                  <FaServer />
                </button>
                <div
                  className={`absolute right-0 z-10 mt-1 w-36 origin-top-right rounded bg-slate-200 p-3 text-slate-900 shadow dark:bg-slate-900 dark:text-slate-100 dark:shadow-slate-300 ${
                    !showServerStatus && "hidden"
                  }`}
                >
                  <p>{isError ? "Server is not live." : "Server is live"}</p>
                </div>
              </div>
            </li>
            <li>
              <button
                className="items-center justify-center border-b-2 border-transparent py-1 text-2xl hover:border-b-sky-400 hover:text-sky-400"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </li>
            <li>
              <button
                className={`items-center justify-center border-b-2 border-transparent py-1 text-2xl hover:border-b-sky-400 hover:text-sky-400 ${
                  isLogin &&
                  storageAccount &&
                  storageAccount.storageAccount.name === "" &&
                  "animate-bounce"
                }`}
                onClick={() => setShowSettingsModal(!showSettingsModal)}
              >
                <FaCog />
              </button>
            </li>
            <li>
              {isLogin && !loginError ? (
                <div className="relative inline-block text-left">
                  <button
                    className="items-center justify-center border-b-2 border-transparent py-1 text-2xl hover:border-b-sky-400 hover:text-sky-400"
                    onMouseEnter={() => setShowUserName(true)}
                    onMouseLeave={() => setShowUserName(false)}
                  >
                    <FaUserNinja />
                  </button>
                  <div
                    className={`absolute right-0 z-10 mt-1 w-56 origin-top-right rounded bg-slate-200 p-3 text-slate-900 shadow dark:bg-slate-900 dark:text-slate-100 dark:shadow-slate-300 ${
                      !showUserName && "hidden"
                    }`}
                  >
                    {accountsLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <>
                        {accounts?.map((account) => (
                          <>
                            {account.isDefault === true && (
                              <p>{account.user.name}</p>
                            )}
                          </>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  className="text-bold rounded-2xl bg-sky-500 py-1 px-5 text-white hover:bg-sky-700"
                  onClick={() => handleLogin()}
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </div>
        <Settings
          showModal={showSettingsModal}
          setShowModal={setShowSettingsModal}
        />
      </div>
    </nav>
  );
}
