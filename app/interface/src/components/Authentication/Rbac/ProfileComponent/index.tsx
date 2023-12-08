import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { Profile, ProfileMutation } from "../../../../dataStructures";
import { useAddRole, useRemoveRole } from "../../../../hooks/useProfile";
import Button from "../../../UserInterfaceComponents/Button";

type Props = {
  profile: Profile;
};

export default function ProfileComponent({ profile }: Props) {
  const [addRoleFlag, setAddRoleFlag] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");

  const { mutateAsync: removeRole } = useRemoveRole();
  function handleRemoveRole(userPrincipal: string, role: string) {
    let ProfileMutation: ProfileMutation = {
      userPrincipal: userPrincipal,
      role: role,
    };
    toast.promise(removeRole(ProfileMutation), {
      pending: "Removing Role...",
      success: "Role Removed.",
      error: {
        render(data: any) {
          return `Failed to remove role. ${data.data.response.data.error}`;
        },
      },
    });
  }

  const { mutateAsync: addRole } = useAddRole();
  function handleAddRole(userPrincipal: string, role: string) {
    let ProfileMutation: ProfileMutation = {
      userPrincipal: userPrincipal,
      role: role,
    };
    toast.promise(addRole(ProfileMutation), {
      pending: "Adding Role...",
      success: "Role Added.",
      error: {
        render(data: any) {
          return `Failed to add role. ${data.data.response.data.error}`;
        },
      },
    });
  }

  return (
    <div className="flex flex-col justify-between gap-2 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900  dark:outline-slate-600 dark:hover:outline-sky-500 md:flex-row md:items-center">
      <div className="flex h-fit items-center gap-2">
        <span>
          {profile.profilePhoto === "" ? (
            <div className="flex h-12 max-h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
              <FaUser />
            </div>
          ) : (
            <img
              className="h-full max-h-12 rounded-full"
              src={profile.profilePhoto}
              alt="Profile Picture"
            />
          )}
        </span>
        <div className="flex flex-col">
          <span>{profile.displayName}</span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {profile.userPrincipal}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {profile.roles.map((role) => (
          <div
            key={role}
            className="flex items-center justify-between gap-4 rounded bg-slate-200 py-1 px-4 dark:bg-slate-800"
          >
            <div className="text-lg">{role}</div>
            <button
              onClick={() => handleRemoveRole(profile.userPrincipal, role)}
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
            handleAddRole(profile.userPrincipal, selectedRole);
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
