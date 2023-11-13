import { useState } from "react";
import { useGetAllRoles } from "../../../hooks/useAuth";
import Role from "./Role";

type Props = {};

export default function Rbac({}: Props) {
  const { data: roles } = useGetAllRoles();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredRoles = roles?.filter((role) => {
    return Object.values(role).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-y-2">
      <input
        type="text"
        placeholder="Search roles"
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-2 rounded border p-4 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-800"
      />
      {filteredRoles &&
        filteredRoles.map((role) => (
          <Role roleRecord={role} key={role.userPrincipal} />
        ))}
    </div>
  );
}
