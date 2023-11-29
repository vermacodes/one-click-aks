import { useState } from "react";
import { useGetAllProfiles } from "../../../hooks/useProfile";
import Profile from "./ProfileComponent";

type Props = {};

export default function Rbac({}: Props) {
  const { data: profiles } = useGetAllProfiles();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProfiles = profiles?.filter((profile) => {
    return Object.values(profile).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-y-2 pb-4">
      <input
        type="text"
        placeholder="Search profiles"
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-2 rounded border bg-slate-50 p-2 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-800"
      />
      {filteredProfiles &&
        filteredProfiles.map((profile) => (
          <Profile profile={profile} key={profile.userPrincipal} />
        ))}
    </div>
  );
}
