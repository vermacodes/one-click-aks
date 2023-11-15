import { useEffect } from "react";
import Rbac from "../../components/Authentication/Rbac";
import PageLayout from "../../layouts/PageLayout";

type Props = {};

export default function AccessControl({}: Props) {
  useEffect(() => {
    document.title = "ACT Labs | Access Control";
  }, []);

  return (
    <PageLayout heading="Access Control">
      <Rbac />
    </PageLayout>
  );
}
