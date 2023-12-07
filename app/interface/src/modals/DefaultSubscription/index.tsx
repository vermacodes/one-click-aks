import { MdClose } from "react-icons/md";
import ModalBackdrop from "../../components/UserInterfaceComponents/Modal/ModalBackdrop";
import { useDefaultAccount } from "../../hooks/useDefaultAccount";

type Props = {
  onClick: () => void;
};

export default function DefaultSubscription({ onClick }: Props) {
  const { defaultAccount } = useDefaultAccount();
  return (
    <ModalBackdrop onClick={onClick}>
      <div
        className="my-20 h-fit w-1/3 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between pb-2 ">
          <h1 className="flex items-center gap-4 text-3xl">
            Azure Subscription
          </h1>
          <button onClick={onClick} className="hover:text-sky-500">
            <MdClose className="text-3xl" />
          </button>
        </div>
        <div className="flex flex-col justify-between gap-y-12 pt-4">
          <pre className="whitespace-pre-wrap break-words text-sm">
            {JSON.stringify(defaultAccount, null, 4)}
          </pre>
        </div>
        <p className="mt-4 py-4 text-lg">
          Want to change subscription? Please follow these{" "}
          <a
            href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849282/Getting-Started"
            target="_blank"
            className="text-sky-500 underline"
          >
            instructions to redeploy server ↗
          </a>{" "}
          and ensure desired subscription is set default.
        </p>
      </div>
    </ModalBackdrop>
  );
}
