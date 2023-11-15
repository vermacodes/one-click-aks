import NoSubscriptionsFound from "../NoSubscriptionsFound";
import StorageAccountNotConfigured from "../StorageAccountNotConfigured";
import VersionCheck from "../VersionCheck";
import WebSocketConnectionStatus from "../WebSocketConnectionStatus";

export default function Detectors() {
  return (
    <>
      <VersionCheck />
      <WebSocketConnectionStatus />
      <NoSubscriptionsFound />
      <StorageAccountNotConfigured />
    </>
  );
}
