import { useState } from "react";
import { RoleMutation, Roles } from "../../../../dataStructures";
import { useAddRole, useRemoveRole } from "../../../../hooks/useAuth";
import Button from "../../../Button";

type Props = {
  roleRecord: Roles;
};

export default function Role({ roleRecord }: Props) {
  const [addRoleFlag, setAddRoleFlag] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");

  const { mutate: removeRole } = useRemoveRole();
  function handleRemoveRole(userPrincipal: string, role: string) {
    let roleMutation: RoleMutation = {
      userPrincipal: userPrincipal,
      role: role,
    };
    removeRole(roleMutation);
  }

  const { mutate: addRole } = useAddRole();
  function handleAddRole(userPrincipal: string, role: string) {
    let roleMutation: RoleMutation = {
      userPrincipal: userPrincipal,
      role: role,
    };
    addRole(roleMutation);
  }

  return (
    <div className="flex items-center justify-between rounded bg-slate-50 p-4 dark:bg-slate-900">
      <div className="text-xl">{roleRecord.userPrincipal}</div>
      <div className="flex gap-x-2">
        {roleRecord.roles.map((role) => (
          <div className="flex items-center justify-between gap-4 rounded bg-slate-200 py-1 px-4 dark:bg-slate-800">
            <div className="text-lg">{role}</div>
            <button
              onClick={() => handleRemoveRole(roleRecord.userPrincipal, role)}
            >
              ❌
            </button>
          </div>
        ))}
        <div className={`${!addRoleFlag && "hidden"} `}>
          <select
            className="h-full appearance-none rounded border border-slate-500 bg-slate-100 px-3 py-1 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700"
            onChange={(event) => setSelectedRole(event.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>
        <Button
          variant="success-outline"
          hidden={!addRoleFlag}
          onClick={() => {
            handleAddRole(roleRecord.userPrincipal, selectedRole);
            setAddRoleFlag(false);
          }}
        >
          ✔️
        </Button>
        <Button
          variant={addRoleFlag ? "danger-outline" : "success-outline"}
          onClick={() => setAddRoleFlag(!addRoleFlag)}
        >
          {addRoleFlag ? "❌" : "➕"}
        </Button>
      </div>
    </div>
  );
}
