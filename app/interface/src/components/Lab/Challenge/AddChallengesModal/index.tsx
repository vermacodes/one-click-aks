import React, { useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { Challenge, Lab, Profile } from "../../../../dataStructures";
import { useUpsertChallenges } from "../../../../hooks/useChallenge";
import { useGetMyProfile } from "../../../../hooks/useProfile";
import Button from "../../../UserInterfaceComponents/Button";
import ConfirmationModal from "../../../UserInterfaceComponents/Modal/ConfirmationModal";
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

export default function AddChallengesModal({
  title,
  lab,
  challenges,
  meOwner,
  meChallenger,
  challengers,
  setShowModal,
}: Props) {
  const [newChallenges, setNewChallenges] = useState<Challenge[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [usersIChallenged, setUsersIChallenged] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);

  const prevSelectedProfilesRef = useRef<Profile[]>([]);

  const { data: myProfile } = useGetMyProfile();
  const { mutateAsync: upsertChallenge } = useUpsertChallenges();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Users I Challenged", usersIChallenged);
  }, [usersIChallenged]);

  // Challenges I've added so far.
  useEffect(() => {
    if (challenges) {
      let usersIChallengedSet = new Set<string>(usersIChallenged);
      challenges.forEach((challenge) => {
        if (
          challenge.createdBy === myProfile?.userPrincipal &&
          challenge.labId === lab.id
        ) {
          usersIChallengedSet.add(challenge.userId);
        }
      });
      console.log("Users I Challenged Set", usersIChallengedSet);
      setUsersIChallenged([...usersIChallengedSet]);
    }
  }, [challenges]);

  /**
   * This useEffect hook is used to handle the addition and removal of challenges based on the changes in selectedProfiles.
   * It has different behaviors for users who are challengers and not owners, and for users who are owners.
   */
  useEffect(() => {
    /**
     * If the user is a challenger and not an owner, check if a profile has been removed or added.
     * If a profile has been removed, remove the corresponding challenge.
     * If a profile has been added, check if the user has already created 2 challenges.
     * If they have, reset selectedProfiles to its previous value and show an error message.
     * If they haven't, add a new challenge for the added profile.
     */
    if (meChallenger && !meOwner) {
      if (isProfileRemoved()) {
        removeChallengeForProfileRemoved();
      }
      if (isProfileAdded()) {
        if (usersIChallenged.length >= 2) {
          setSelectedProfiles(prevSelectedProfilesRef.current);
          toast.error("You can only create 2 challenges.", {
            toastId: "create-challenge-error",
          });
          return;
        }
        addChallengeForProfileAdded();
      }
    }

    /**
     * If the user is an owner, check if a profile has been removed or added.
     * If a profile has been removed, remove the corresponding challenge.
     * If a profile has been added, add a new challenge for the added profile.
     */
    if (meOwner) {
      if (isProfileRemoved()) {
        removeChallengeForProfileRemoved();
      }
      if (isProfileAdded()) {
        addChallengeForProfileAdded();
      }
    }

    // Update the previous value of selectedProfiles
    prevSelectedProfilesRef.current = selectedProfiles;
  }, [selectedProfiles]);

  /**
   * Checks if a profile has been removed from selectedProfiles.
   * @returns {boolean} - Returns true if a profile has been removed, false otherwise.
   */
  function isProfileRemoved(): boolean {
    return selectedProfiles.length < prevSelectedProfilesRef.current.length;
  }

  /**
   * Checks if a profile has been added to selectedProfiles.
   * @returns {boolean} - Returns true if a profile has been added, false otherwise.
   */
  function isProfileAdded(): boolean {
    return selectedProfiles.length > prevSelectedProfilesRef.current.length;
  }

  /**
   * Removes the challenge associated with the profile that has been removed from selectedProfiles.
   * It finds the removed profile and the corresponding challenge, then removes the challenge from newChallenges.
   * If the user id of the challenge is in usersIChallenged, it also removes the user id from usersIChallenged.
   */
  function removeChallengeForProfileRemoved() {
    // find the removed profile
    const removedProfile = prevSelectedProfilesRef.current.find(
      (profile) =>
        !selectedProfiles.some(
          (selectedProfile) =>
            selectedProfile.userPrincipal === profile.userPrincipal
        )
    );

    // find the challenge for the removed profile
    const challenge = newChallenges.find(
      (challenge) => challenge.userId === removedProfile?.userPrincipal
    );

    // remove the challenge from newChallenges
    if (challenge) {
      setNewChallenges((prevChallenges) => [
        ...prevChallenges.filter(
          (prevChallenge) => prevChallenge.userId !== challenge.userId
        ),
      ]);
    }

    // remove the user id from usersIChallenged
    if (challenge && usersIChallenged.includes(challenge.userId)) {
      setUsersIChallenged((prev) => [
        ...prev.filter((user) => user !== challenge.userId),
      ]);
    }
  }

  /**
   * Adds a challenge for the profile that has been added to selectedProfiles.
   * It finds the added profile and creates a new challenge for it, then adds the challenge to newChallenges.
   * If the user id of the added profile is not in usersIChallenged, it also adds the user id to usersIChallenged.
   */
  function addChallengeForProfileAdded() {
    // find the added profile
    const addedProfile = selectedProfiles.find(
      (profile) =>
        !prevSelectedProfilesRef.current.some(
          (prevProfile) => prevProfile.userPrincipal === profile.userPrincipal
        )
    );

    // create a new challenge for the added profile
    if (addedProfile) {
      setNewChallenges((prevChallenges) => [
        ...prevChallenges,
        {
          challengeId: "",
          acceptedOn: "",
          completedOn: "",
          createdOn: "",
          status: "created",
          userId: addedProfile.userPrincipal,
          labId: lab.id,
          createdBy: "",
        },
      ]);
    }

    // add the user id to usersIChallenged
    if (
      addedProfile &&
      !usersIChallenged.includes(addedProfile.userPrincipal)
    ) {
      setUsersIChallenged((prev) => [...prev, addedProfile.userPrincipal]);
    }
  }

  /**
   * Triggers the confirmation modal for updating challenges.
   */
  function onUpdate() {
    setConfirmationModal(true);
  }

  /**
   * Confirms the update operation for the challenges.
   * It hides the modal, then calls the upsertChallenge function to save the new challenges.
   * While the upsertChallenge function is running, it shows a toast with the message "Creating challenges...".
   * If the upsertChallenge function succeeds, it shows a toast with the message "Challenges created successfully!".
   * If the upsertChallenge function fails, it shows a toast with an error message.
   * After the upsertChallenge function finishes, it invalidates the query for the challenges of the current lab.
   */
  function onConfirm() {
    setShowModal(false);
    const response = toast.promise(upsertChallenge(newChallenges), {
      pending: "Creating challenges...",
      success: "Challenges created successfully!",
      error: {
        render(data: any) {
          return `Challenge creation failed: ${data.data.response.data.error}`;
        },
        autoClose: false,
      },
    });

    response.then(() => {
      queryClient.invalidateQueries(["get-challenges-by-lab-id", lab.id]);
    });
  }

  return confirmationModal ? (
    <ConfirmationModal
      onConfirm={onConfirm}
      onClose={() => setConfirmationModal(false)}
      title="Please confirm Challenges"
    >
      <p>
        <span>{`You are about to challenge `}</span>
        <span>
          {selectedProfiles.map((profile, index) => (
            <React.Fragment key={index}>
              <strong>{profile.displayName || profile.userPrincipal}</strong>
              {index < selectedProfiles.length - 2 ? ", " : " and "}
            </React.Fragment>
          ))}
        </span>
        <span>{` to solve this lab. Once the challenges are created they can only be modified by owners. Are you sure you want to continue?`}</span>
      </p>
    </ConfirmationModal>
  ) : (
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
            noShowProfiles={challengers}
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
