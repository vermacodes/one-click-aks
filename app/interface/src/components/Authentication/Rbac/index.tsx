import { useGetAllRoles } from "../../../hooks/useAuth";
import RbacEditor from "../RbacEditor";
import Role from "./Role";

type Props = {};

export default function Rbac({}: Props) {
  const { data: roles } = useGetAllRoles();

  return (
    <div className="flex flex-col gap-y-2">
      {roles && roles.map((role) => <Role roleRecord={role} />)}
    </div>
  );
}
