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
    <div>
      <p className="mb-6 border-b-2 border-slate-500 py-4 text-4xl">
        Lab Builder
      </p>
      <Tfvar />
      <Terminal />
    </div>
  );
}
