import Rbac from "../../components/Authentication/Rbac";
import { useGetAllRoles, useGetMyRoles } from "../../hooks/useAuth";

type Props = {};

export default function AccessControl({}: Props) {
  return (
    <div className="gap-y-10">
      <h1 className="my-2 mb-6 border-b-2 border-slate-500 py-4 text-4xl">
        Access Control
      </h1>
      <Rbac />
    </div>
  );
}
