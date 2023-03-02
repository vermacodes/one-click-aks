import { useState } from "react";
import Button from "../../components/Button";
import Terminal from "../../components/Terminal";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";

type Props = { section: string; setSection(args: string): void };

export default function Login({ section, setSection }: Props) {
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { data: lab } = useLab();

  function handleLogin() {
    if (!inProgress) {
      setShowTerminal(true);
      setLogs({ isStreaming: true, logs: "" });
      // loginAsync().then((response) => {
      //   if (response.status !== undefined) {
      //     loginStatus.refetch();
      //     setLogs({ isStreaming: false, logs: "" });
      //   }
      // });
    }
  }

  const authenticated = (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-3xl text-slate-500">
        Great 👏. You are now Logged In. Hit 'Next' to continue the setup.
      </p>
    </div>
  );
  const unauthenticated = (
    <div className="flex flex-col items-center space-y-4">
      {/* <p className="text-3xl text-slate-500">
        Now that the server is up and running 👍. You need to login 🔐 to Azure
        CLI running in the docker container to be able to do stuff. Hit "Login"
        button below and follow instructions in terminal that will pop up. Did I
        mention 'Please be patient' ⌛?
      </p>
      <div className="flex w-40 flex-col justify-center">
        <Button
          variant="success"
          disabled={inProgress || loginLoading || loginStatus.isFetching}
          onClick={() => handleLogin()}
        >
          {inProgress || loginLoading || loginStatus.isFetching
            ? "Please wait..."
            : "Login"}
        </Button>
      </div>
      <div className="w-full">
        {showTerminal &&
          !(loginStatus.data !== undefined && loginStatus.data) && <Terminal />}
      </div> */}
    </div>
  );
  return (
    <section className={`${section !== "login" && "hidden"} `}>
      {/* <div className="flex flex-col justify-center space-y-12">
        <h1 className="text-center text-8xl">Login 🥷</h1>
        {loginStatus.data !== undefined && loginStatus.data
          ? authenticated
          : unauthenticated}
        <div className="flex justify-between">
          <Button variant="primary" onClick={() => setSection("server")}>
            {"← Previous"}
          </Button>
          <Button
            variant="primary"
            disabled={!(loginStatus.data !== undefined && loginStatus.data)}
            onClick={() => {
              setLogs({
                isStreaming: false,
                logs: JSON.stringify(lab?.template, null, 4),
              });
              setSection("subscription");
            }}
          >
            {"Next →"}
          </Button>
        </div>
      </div> */}
    </section>
  );
}
