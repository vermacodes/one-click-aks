import { useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { Challenge, Lab, Profile } from "../../../../dataStructures";
import { useUpsertChallenges } from "../../../../hooks/useChallenge";
import { useGetMyProfile } from "../../../../hooks/useProfile";
import Button from "../../../UserInterfaceComponents/Button";
import ModalBackdrop from "../../../UserInterfaceComponents/Modal/ModalBackdrop";
import SelectProfilesDropdown from "../../Assignment/CreateAssignment/SelectProfilesDropdown";

type Props = {
  title: string;
  lab: Lab;
  challenges?: Challenge[];
  meOwner: boolean;
  meChallenger: boolean;
  challengers: Profile[];
  setShowModal: (showModal: boolean) => void;
};

export default function AddChallengeModal({
  title,
  lab,
  challenges,
  meOwner,
  meChallenger,
  challengers,
  setShowModal,
}: Props) {
  //const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [newChallenges, setNewChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [challengesICreated, setChallengesICreated] = useState<number>(0);
  const prevSelectedProfilesRef = useRef<Profile[]>([]);

  const { data: myProfile } = useGetMyProfile();

  const { mutateAsync: upsertChallenge } = useUpsertChallenges();

  const queryClient = useQueryClient();

  // Add all existing challenges to selected Profiles.
  useEffect(() => {
    setSelectedProfiles(challengers);
  }, [challengers]);

  useEffect(() => {
    console.log("Challenges Created", challengesICreated);
  }, [challengesICreated]);

  // Do this every time selectedProfiles change.
  // If an existing challengers is removed, then add them back. (basically undoing the removal)
  // if current user is not the owner and already created 2 challenges, then don't allow them to create more. (undo the removal)
  // this info is available in createdBy field of challenge.
  // if current user is the owner, then allow them to create more challenges.
  // create new challenges for each profile added.

  useEffect(() => {
    if (selectedProfiles.length < prevSelectedProfilesRef.current.length) {
      const removedProfiles = prevSelectedProfilesRef.current.filter(
        (profile) => {
          return !selectedProfiles.some(
            (selectedProfile) =>
              selectedProfile.userPrincipal === profile.userPrincipal
          );
        }
      );

      const updatedSelectedProfiles = [...selectedProfiles];

      removedProfiles.forEach((profile) => {
        if (profile.userPrincipal !== myProfile?.userPrincipal) {
          updatedSelectedProfiles.push(profile);
        }
      });

      if (updatedSelectedProfiles.length !== selectedProfiles.length) {
        setSelectedProfiles(updatedSelectedProfiles);
      }
    }
  }, [selectedProfiles, myProfile]);

  useEffect(() => {
    if (!meOwner) {
      const updatedSelectedProfiles = [...selectedProfiles];

      challengers.forEach((challenger) => {
        if (
          !updatedSelectedProfiles.some(
            (profile) => profile.userPrincipal === challenger.userPrincipal
          )
        ) {
          updatedSelectedProfiles.push(challenger);
        }
      });

      if (updatedSelectedProfiles.length !== selectedProfiles.length) {
        setSelectedProfiles(updatedSelectedProfiles);
      }
    }
  }, [selectedProfiles, meOwner, challengers]);

  function onUpdate() {
    setShowModal(false);
    const response = toast.promise(upsertChallenge(newChallenges), {
      pending: "Saving lab...",
      success: "Lab saved.",
      error: {
        render(data: any) {
          return `Lab creation failed: ${data.data.data}`;
        },
        autoClose: false,
      },
    });

    response.then(() => {
      queryClient.invalidateQueries(["get-challenges-by-lab-id", lab.id]);
    });
  }

  return (
    <ModalBackdrop
      onClick={(e) => {
        e.stopPropagation;
        setShowModal(false);
      }}
    >
      <div
        className="my-20 h-[550px] w-1/3 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between pb-2 ">
          <h1 className="text-3xl">{"Add " + title}</h1>
          <button
            onClick={() => setShowModal(false)}
            className="hover:text-sky-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
        <div className="flex h-[90%] w-full flex-col justify-between">
          <SelectProfilesDropdown
            selectedProfiles={selectedProfiles}
            setSelectedProfiles={setSelectedProfiles}
          />
          <div className="flex flex-row justify-end gap-2">
            <Button variant="primary" onClick={onUpdate}>
              Update
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
