import Terminal from "../../components/Terminal";
import Tfvar from "../../components/Tfvar";
import { useServerStatus } from "../../hooks/useServerStatus";
import PageLayout from "../../layouts/PageLayout";
import ServerError from "../ServerError";

export default function Builder() {
  const { data: serverStatus } = useServerStatus();

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

  return (
    <PageLayout heading="Lab Builder">
      <Tfvar />
      <Terminal />
    </PageLayout>
  );
}
