import { useState } from "react";
import { RoleMutation, Roles } from "../../../../dataStructures";
import { useAddRole, useRemoveRole } from "../../../../hooks/useAuth";
import Button from "../../../UserInterfaceComponents/Button";
import { toast } from "react-toastify";

type Props = {
  roleRecord: Roles;
};

export default function Role({ roleRecord }: Props) {
  const [addRoleFlag, setAddRoleFlag] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");

  const { mutateAsync: removeRole } = useRemoveRole();
  function handleRemoveRole(userPrincipal: string, role: string) {
    let roleMutation: RoleMutation = {
      userPrincipal: userPrincipal,
      role: role,
    };
    toast.promise(removeRole(roleMutation), {
      pending: "Removing Role...",
      success: "Role Removed.",
      error: {
        render(data: any) {
          return `Failed to remove role. ${data.data.data}`;
        },
      },
    });
  }

  const { mutateAsync: addRole } = useAddRole();
  function handleAddRole(userPrincipal: string, role: string) {
    let roleMutation: RoleMutation = {
      userPrincipal: userPrincipal,
      role: role,
    };
    toast.promise(addRole(roleMutation), {
      pending: "Adding Role...",
      success: "Role Added.",
      error: {
        render(data: any) {
          return `Failed to add role. ${data.data.data}`;
        },
      },
    });
  }

  return (
    <div className="flex flex-col justify-between gap-2 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900  dark:outline-slate-600 dark:hover:outline-sky-500 md:flex-row md:items-center">
      <div className="text-xl">{roleRecord.userPrincipal}</div>
      <div className="flex flex-wrap justify-end gap-2">
        {roleRecord.roles.map((role) => (
          <div
            key={role}
            className="flex items-center justify-between gap-4 rounded bg-slate-200 py-1 px-4 dark:bg-slate-800"
          >
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
            <option value="contributor">Contributor</option>
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
