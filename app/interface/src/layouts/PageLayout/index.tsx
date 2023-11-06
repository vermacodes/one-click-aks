import AzureSubscription from "../../components/Config/AzureSubscription";
import VersionCheck from "../../components/Config/VersionCheck";
import WebSocketConnectionStatus from "../../components/Config/WebSocketConnectionStatus";

type Props = {
  heading?: string;
  children: React.ReactNode;
};

export default function PageLayout({ heading, children }: Props) {
  return (
    <div className="mb-4">
      <VersionCheck />
      <WebSocketConnectionStatus />
      {heading && (
        <div className="mb-6 flex justify-between border-b-2 border-slate-500 py-4 ">
          <h1 className="text-4xl">{heading}</h1>
          <div>
            <AzureSubscription />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
