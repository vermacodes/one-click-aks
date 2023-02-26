import Rbac from "../../components/Authentication/Rbac";
import PageLayout from "../../layouts/PageLayout";

type Props = {};

export default function AccessControl({}: Props) {
  return (
    <PageLayout heading="Access Control">
      <Rbac />
    </PageLayout>
  );
}
