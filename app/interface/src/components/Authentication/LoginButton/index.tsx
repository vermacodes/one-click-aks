import { useState } from "react";
import { FaSignInAlt, FaUserNinja } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  useAccount,
  useLogin,
  useLoginStatus,
} from "../../../hooks/useAccount";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../../hooks/useActionStatus";
import { useAddDefaultRoles } from "../../../hooks/useAuth";
import { useSetLogs } from "../../../hooks/useLogs";
import { useResetServerCache } from "../../../hooks/useServerCache";
import { useServerStatus } from "../../../hooks/useServerStatus";
import Button from "../../Button";

type Props = {};

export default function LoginButton({}: Props) {
  const [showUserName, setShowUserName] = useState<boolean>(false);
  const { data: serverStatus } = useServerStatus();
  const { data: inProgress } = useActionStatus();
  const {
    data: isLogin,
    refetch: getLoginStatus,
    isError: loginError,
  } = useLoginStatus();
  const { mutateAsync: loginAsync } = useLogin();
  const { data: accounts, isLoading: accountsLoading } = useAccount();
  const { mutate: setLogs } = useSetLogs();
  const setActionStatus = useSetActionStatus();
  const { mutateAsync: resetServerCacheAsync } = useResetServerCache();

  const defaultRoles = useAddDefaultRoles();

  const navigate = useNavigate();

  function handleLogin() {
    if (!inProgress) {
      navigate("/builder");
      setLogs({ isStreaming: true, logs: "" });
      loginAsync()
        .then((response) => {
          if (response.status !== undefined) {
            getLoginStatus();

            setActionStatus
              .mutateAsync({
                inProgress: false,
              })
              .finally(() => {
                setLogs({ isStreaming: false, logs: "" });
              });

            // Create Default Roles
            defaultRoles.mutate();

            // Reset server cache and reload window.
            // resetServerCacheAsync().finally(() => {
            //   window.location.reload();
            // });
          }
        })
        // Finally End action status and log stream.
        .finally(() => {
          setActionStatus
            .mutateAsync({
              inProgress: false,
            })
            .finally(() => {
              setLogs({ isStreaming: false, logs: "" });
            });
        });
    }
  }

  if (serverStatus?.status !== "OK") {
    return <></>;
  }

  return (
    <div>
      {isLogin && !loginError ? (
        <div className="relative inline-block text-left">
          <button
            className="justify-star flex h-full w-full items-center gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800"
            onMouseEnter={() => setShowUserName(true)}
            onMouseLeave={() => setShowUserName(false)}
          >
            <span>
              <FaUserNinja />
            </span>
            <span>
              {accountsLoading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {accounts?.map((account) => (
                    <div key={account.id}>
                      {account.isDefault === true && <p>{account.user.name}</p>}
                    </div>
                  ))}
                </>
              )}
            </span>
          </button>
          {/* <div
            className={`absolute right-0 z-10 mt-1 w-56 origin-top-right rounded bg-slate-200 p-3 text-slate-900 shadow dark:bg-slate-900 dark:text-slate-100 dark:shadow-slate-300 ${
              !showUserName && "hidden"
            }`}
          >
            {accountsLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                {accounts?.map((account) => (
                  <div key={account.id}>
                    {account.isDefault === true && <p>{account.user.name}</p>}
                  </div>
                ))}
              </>
            )}
          </div> */}
        </div>
      ) : (
        <button
          className="justify-star flex h-full w-full items-center gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800"
          onClick={() => handleLogin()}
          disabled={inProgress}
        >
          <span>
            <FaSignInAlt />
          </span>
          <span>Login</span>
        </button>
      )}
    </div>
  );
}
