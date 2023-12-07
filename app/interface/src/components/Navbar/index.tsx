import { useState } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import {
  FaBook,
  FaBookReader,
  FaClipboard,
  FaCog,
  FaComments,
  FaKey,
  FaList,
  FaPuzzlePiece,
  FaRocket,
  FaShieldAlt,
  FaSuperpowers,
  FaTimes,
  FaTools,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { MdAssignment } from "react-icons/md";
import { Link } from "react-router-dom";
import { useDefaultAccount } from "../../hooks/useDefaultAccount";
import { useGetMyProfile } from "../../hooks/useProfile";
import DefaultSubscription from "../../modals/DefaultSubscription";
import LoginButton from "../Authentication/LoginButton";
import { useGlobalStateContext } from "../Context/GlobalStateContext";
import Button from "../UserInterfaceComponents/Button";
import Tooltip from "../UserInterfaceComponents/Tooltip";

export default function Navbar() {
  return (
    <nav className="flex h-screen w-full min-w-max flex-col  text-slate-900 dark:text-slate-100">
      <Title />
      <Pages />
      <FixedPages />
    </nav>
  );
}

function Title() {
  const { navbarOpen, setNavbarOpen } = useGlobalStateContext();
  return (
    <div className="flex items-center justify-between pt-6 pb-2">
      <Link to={"/"}>
        <h1 className="flex flex-row items-center pl-8 text-2xl font-bold hover:text-sky-500">
          <img src="/actlabs_logo_rocket.svg" className="mr-2 h-8 w-8"></img>
          ACT Labs
        </h1>
      </Link>
      <Button
        className="md pr-4 text-2xl md:invisible"
        onClick={() => setNavbarOpen(false)}
      >
        <FaTimes />
      </Button>
    </div>
  );
}

function Pages() {
  const { data: profile } = useGetMyProfile();
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
          <Link to={"/deployments"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaRocket />
              </span>
              <span>Deployments</span>
            </button>
          </Link>
        </li>
        {/* <li>
          <Link to={"/labs/mylabs"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaFileCode />
              </span>
              <span>My Saved Labs</span>
            </button>
          </Link>
        </li> */}
        <li>
          <Link to={"/labs/privatelab"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaUser />
              </span>
              <span>Private Labs</span>
            </button>
          </Link>
        </li>
        <li>
          <Link to={"/labs/publiclab"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaUsers />
              </span>
              <span>Public Labs</span>
            </button>
          </Link>
        </li>
        <li>
          <Link to={"/labs/challengelab"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaPuzzlePiece />
              </span>
              <span>Challenge Labs</span>
            </button>
          </Link>
        </li>
        <li>
          <Link to={"/labs/assignment"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <MdAssignment />
              </span>
              <span>My Assignments</span>
            </button>
          </Link>
        </li>
        <li>
          <Link to={"/labs/challenge"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaSuperpowers />
              </span>
              <span>My Challenges</span>
            </button>
          </Link>
        </li>
        {profile && profile.roles.includes("mentor") && (
          <>
            <li>
              <Link to={"/labs/readinesslab"}>
                <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
                  <span>
                    <FaBookReader />
                  </span>
                  <span>Readiness Labs</span>
                </button>
              </Link>
            </li>
            <li>
              <Link to={"/labs/mockcase"}>
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
        {profile && profile.roles.includes("admin") && (
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
            href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849276/ACT-Lab-Tool"
          >
            <button className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
              <span>
                <FaBook />
              </span>
              <span>ACT Labs Docs</span>
              <span>
                <BsArrowUpRight />
              </span>
            </button>
          </a>
        </li>
      </ul>
    </div>
  );
}

function FixedPages() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { defaultAccount } = useDefaultAccount();

  return (
    <div className="h-fit w-full flex-col p-4">
      <ul className="md:text-l flex w-full flex-col justify-start gap-y-1 text-sm lg:text-xl">
        {defaultAccount && (
          <li>
            <Tooltip
              message="This is the selected Azure subscription. To change redeploy server in correct subscription."
              delay={1000}
              direction="top"
            >
              <button
                className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <span className="-rotate-45">
                  <FaKey />
                </span>{" "}
                {defaultAccount.name}
              </button>
            </Tooltip>
          </li>
        )}
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
          <Link to={"/feedback"}>
            <button className="flex h-full w-full items-center justify-start gap-2 rounded bg-green-500 bg-opacity-20 py-3 px-4 text-left text-base hover:bg-slate-200 dark:bg-inherit dark:hover:bg-slate-800">
              <span>
                <FaComments />
              </span>
              <span className="dark:text-green-500">Help & Feedback</span>
            </button>
          </Link>
        </li>
        <li>
          <LoginButton />
        </li>
      </ul>
      {showSubscriptionModal && (
        <DefaultSubscription onClick={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
}
