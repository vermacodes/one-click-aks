import { useState } from "react";
import { HiUser, HiServerStack, HiSun, HiMoon, HiCog6Tooth } from "react-icons/hi2";
import Settings from "../../modals/Settings";
import { Link, useNavigate } from "react-router-dom";
import { useServerStatus } from "../../hooks/useServerStatus";
import { useAccount, useLogin, useLoginStatus } from "../../hooks/useAccount";
import { useGetStorageAccount } from "../../hooks/useStorageAccount";
import { useSetLogs } from "../../hooks/useLogs";

type NavbarProps = {
    darkMode: boolean;
    setDarkMode(args: boolean): void;
};

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
    const [showUserName, setShowUserName] = useState<boolean>(false);
    const [showServerStatus, setShowServerStatus] = useState<boolean>(false);

    const { data: serverStatus, refetch: getServerStatus, isError } = useServerStatus();
    const { data: isLogin, refetch: getLoginStatus, isError: loginError } = useLoginStatus();
    const { refetch: login } = useLogin();
    const { data: account } = useAccount();
    const { data: storageAccount } = useGetStorageAccount();
    const navigate = useNavigate();
    const { mutate: setLogs } = useSetLogs();

    function handleLogin() {
        navigate("/builder");
        setLogs({ isStreaming: true, logs: "" });
        login();
    }
    return (
        <nav className="mt-0 fixed w-full top-0 z-100 mb-4 bg-slate-100 dark:bg-slate-900 opacity-95">
            <div className="flex justify-between py-4 px-20 border-b dark:border-b-slate-700 hover:shadow hover:shadow-slate-500">
                <Link to={"/"}>
                    <h1 className="text-2xl font-bold border-b-2 border-transparent hover:border-b-sky-400 hover:text-sky-400">
                        ACT Labs
                    </h1>
                </Link>
                <div className="flex divide-x divide-slate-300 dark:divide-slate-700  align-middle">
                    <ul className="flex space-x-3 px-5 align-middle">
                        <li>
                            <Link to={"/builder"}>
                                <button className="py-1 border-b-2 border-transparent hover:border-b-sky-400 hover:border-b-2 hover:text-sky-400 ">
                                    Builder
                                </button>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/templates"}>
                                <button className="py-1 border-b-2 border-transparent hover:border-b-sky-400 hover:border-b-2 hover:text-sky-400">
                                    Templates
                                </button>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/learning"}>
                                <button className="py-1 border-b-2 border-transparent hover:border-b-sky-400 hover:border-b-2 hover:text-sky-400">
                                    Learning
                                </button>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/labs"}>
                                <button className="py-1 border-b-2 border-transparent hover:border-b-sky-400 hover:border-b-2 hover:text-sky-400">
                                    Labs
                                </button>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/mockcases"}>
                                <button className="py-1 border-b-2 border-transparent hover:border-b-sky-400 hover:border-b-2 hover:text-sky-400">
                                    Mock Cases
                                </button>
                            </Link>
                        </li>
                    </ul>
                    <ul className="flex space-x-4 pl-5">
                        <li>
                            <div className="relative inline-block text-left">
                                <button
                                    className={`py-1 border-b-2 border-transparent hover:border-b-sky-400 text-2xl items-center justify-center hover:text-sky-400 ${
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
                                    <HiServerStack />
                                </button>
                                <div
                                    className={`origin-top-right absolute w-36 p-3 z-10 mt-1 right-0 bg-slate-200 text-slate-900 dark:bg-slate-900 dark:text-slate-100 rounded shadow dark:shadow-slate-300 ${
                                        !showServerStatus && "hidden"
                                    }`}
                                >
                                    <p>{isError ? "Server is not live." : "Server is live"}</p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <button
                                className="py-1 border-b-2 border-transparent hover:border-b-sky-400 text-2xl items-center justify-center hover:text-sky-400"
                                onClick={() => setDarkMode(!darkMode)}
                            >
                                {darkMode ? <HiSun /> : <HiMoon />}
                            </button>
                        </li>
                        <li>
                            <button
                                className={`py-1 border-b-2 border-transparent hover:border-b-sky-400 text-2xl items-center justify-center hover:text-sky-400 ${
                                    isLogin &&
                                    storageAccount &&
                                    storageAccount.storageAccount.name === "" &&
                                    "animate-bounce"
                                }`}
                                onClick={() => setShowSettingsModal(!showSettingsModal)}
                            >
                                <HiCog6Tooth />
                            </button>
                        </li>
                        <li>
                            {isLogin && !loginError ? (
                                <div className="relative inline-block text-left">
                                    <button
                                        className="py-1 border-b-2 border-transparent hover:border-b-sky-400 text-2xl items-center justify-center hover:text-sky-400"
                                        onMouseEnter={() => setShowUserName(true)}
                                        onMouseLeave={() => setShowUserName(false)}
                                    >
                                        <HiUser />
                                    </button>
                                    <div
                                        className={`absolute right-0 p-3 z-10 w-56 mt-1 origin-top-right bg-slate-200 text-slate-900 dark:bg-slate-900 dark:text-slate-100 rounded shadow dark:shadow-slate-300 ${
                                            !showUserName && "hidden"
                                        }`}
                                    >
                                        <p>{account && account.user.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="bg-sky-500 py-1 px-5 rounded-2xl text-bold text-white hover:bg-sky-700"
                                    onClick={() => handleLogin()}
                                >
                                    Login
                                </button>
                            )}
                        </li>
                    </ul>
                </div>
                <Settings showModal={showSettingsModal} setShowModal={setShowSettingsModal} />
            </div>
        </nav>
    );
}
