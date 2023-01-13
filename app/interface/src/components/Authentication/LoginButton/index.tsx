import { useState } from "react";
import { FaUserNinja } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  useAccount,
  useLogin,
  useLoginStatus,
} from "../../../hooks/useAccount";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useSetLogs } from "../../../hooks/useLogs";
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

  const navigate = useNavigate();

  function handleLogin() {
    if (!inProgress) {
      navigate("/builder");
      setLogs({ isStreaming: true, logs: "" });
      loginAsync().then((response) => {
        if (response.status !== undefined) {
          getLoginStatus();
        }
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
                  <div key={account.id}>
                    {account.isDefault === true && <p>{account.user.name}</p>}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        <Button
          variant="primary"
          onClick={() => handleLogin()}
          disabled={inProgress}
        >
          Login
        </Button>
      )}
    </div>
  );
}
