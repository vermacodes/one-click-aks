import { useState } from "react";
import { MdDoneOutline, MdOutlineContentCopy } from "react-icons/md";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import Terminal from "../../components/Terminal";
import { useConfigureServicePrincipal } from "../../hooks/useAccount";
import { useSetLogs } from "../../hooks/useLogs";

type Props = { section: string; setSection(args: string): void };

export default function ServicePrincipal({ section, setSection }: Props) {
  
  const [configured, setConfigured] = useState<boolean>(false);
  const [copy, setCopy] = useState<boolean>(false);
  const command =
    "curl -sL https://raw.githubusercontent.com/vermacodes/one-click-aks/keyvault/scripts/service_principal_configuration.sh | bash";

  const {
    mutateAsync: configureServicePrincipalAsync,
    isLoading: configureServicePrincipalLoading,
  } = useConfigureServicePrincipal();

  const { mutate: setLogs, mutateAsync: setLogsAsync } = useSetLogs();

  function configureServicePrincipal() {

    setLogsAsync({ isStreaming: true, logs: "" }).then((response) => {
      if (response.status === 200) {
        configureServicePrincipalAsync().then((response) => {
          if (response.status === 200) {
            setConfigured(true);
          }
        });
      }
    });
  }

  function handleCommandCopy() {
    navigator.clipboard.writeText(command);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 3000);
  }

  const storageIsSetup = (
    <div>
      <p className="text-3xl text-slate-500">
        Awesome 👏. Service Principal is setup now. Hit 'Finish' to go to
        Builder and start building 🏗️ stuff. Head over to settings ⚙️ to see
        other configurations. Bye bye 👋
      </p>
    </div>
  );
  const storageIsNotSetup = (
    <div className="flex flex-col items-center space-y-6">
      <p className="text-2xl text-slate-500">
        Terraform uses some Microsoft Graph APIs which can't be accessed with a
        user principal from a docker container due to orgnization policy
        restrictions. 👮‍♀️ So we need to create a service principal 🤖.
      </p>
      <p className="text-2xl text-slate-500">
        This step will create a service principal, 🤖 add a secret to the
        service principal, 🤫 grant Contributor and User Access Administrator
        roles, create a keyvault in repro-project resrouce group. 🔑 Save the
        credentials in the keyvault. These credentials will be pulled from
        keyvault when you run terraform commands. Thats a lot. Read more about
        this in our docs 📚.
      </p>
      <p className="text-2xl text-slate-500">
        To configure,{" "}
        <a
          href="https://ms.portal.azure.com/#cloudshell/"
          className="text-sky-500 underline"
        >
          Cloud Shell
        </a>{" "}
        or other terminal that you can run AZ CLI 📟 from. Login to Azure CLI
        using `az login` command. In cloud shell you will already be logged in
        🤓. You can then run following script to configure automagically 🪄.
      </p>

      <div
        className={`flex justify-between  gap-x-5 rounded-xl border-2 bg-slate-300 py-2 px-6 dark:bg-slate-700 ${
          copy
            ? "border-green-500 bg-green-200 dark:bg-green-700"
            : "border-slate-700 dark:border-slate-200"
        }`}
      >
        <h3 className="font-mono text-sm">$ {command}</h3>
        <button className="text-xl" onClick={() => handleCommandCopy()}>
          {copy ? (
            <MdDoneOutline />
          ) : (
            <MdOutlineContentCopy className="hover:text-sky-500" />
          )}
        </button>
      </div>
      <p className="text-2xl text-slate-500">
        After thats all done, use 'validate' button to check if its all setup
        correctly. 🪄 <strong>NOTE:</strong> If you've configured this before, you dont have to do it again unless validation failed.
      </p>
      <div className="flex w-60 flex-col justify-center">
        <Button
          variant="success"
          disabled={configureServicePrincipalLoading || configured}
          onClick={() => configureServicePrincipal()}
        >
          {configureServicePrincipalLoading
            ? "Please wait..."
            : "Validate Service Principal"}
        </Button>
      </div>
    </div>
  );
  return (
    <section className={`${section !== "service-principal" && "hidden"} `}>
      <div className="flex flex-col justify-center space-y-12">
        <h1 className="text-center text-8xl">Service Principal 🔑</h1>
        {configured ? storageIsSetup : storageIsNotSetup}
        <div className="flex justify-between">
          <Button variant="primary" onClick={() => setSection("storage")}>
            {"← Previous"}
          </Button>
          <Link to={"/builder"}>
            <Button
              variant="primary"
              disabled={!configured}
              onClick={() => setLogs({ isStreaming: false, logs: "" })}
            >
              {"Finish"}
            </Button>
          </Link>
        </div>
      </div>
      <Terminal />
    </section>
  );
}
