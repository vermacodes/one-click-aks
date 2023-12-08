import { useState } from "react";
import { useGetAllProfiles } from "../../../hooks/useProfile";
import FilterTextBox from "../../UserInterfaceComponents/FilterTextBox";
import Profile from "./ProfileComponent";

type Props = {};

export default function Rbac({}: Props) {
  const { data: profiles } = useGetAllProfiles();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const filteredProfiles = profiles?.filter((profile) => {
    return Object.values(profile).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-y-2 pb-4">
      <div className="relative mb-4 w-full">
        <FilterTextBox
          placeHolderText="Filter by name or alias"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {filteredProfiles &&
        filteredProfiles.map((profile) => (
          <Profile profile={profile} key={profile.userPrincipal} />
        ))}
    </div>
  );
}
