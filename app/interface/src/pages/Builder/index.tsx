import Terminal from "../../components/Terminal";
import Tfvar from "../../components/Tfvar";
import { useServerStatus } from "../../hooks/useServerStatus";
import ServerError from "../ServerError";

export default function Builder() {
  const { data: serverStatus } = useServerStatus();

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

  return (
    <div className="my-3 mx-20 mb-2">
      <Tfvar />
      <Terminal />
    </div>
  );
}
