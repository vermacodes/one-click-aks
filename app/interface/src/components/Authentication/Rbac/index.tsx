import { useState } from "react";
import { FaFilter } from "react-icons/fa";
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
      <div className="relative mb-4 w-full">
        <input
          type="text"
          placeholder="Filter profiles"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full rounded border bg-slate-50 p-2 pl-10 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500"
        />
        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
      </div>
      {filteredProfiles &&
        filteredProfiles.map((profile) => (
          <Profile profile={profile} key={profile.userPrincipal} />
        ))}
    </div>
  );
}
