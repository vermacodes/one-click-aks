import { useEffect, useRef, useState } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { Challenge, Lab, Profile } from "../../../../dataStructures";
import {
  useDeleteChallenge,
  useGetChallengesByLabId,
  useUpsertChallenges,
} from "../../../../hooks/useChallenge";
import {
  useGetAllProfilesRedacted,
  useGetMyProfile,
} from "../../../../hooks/useProfile";
import Button from "../../../UserInterfaceComponents/Button";
import Container from "../../../UserInterfaceComponents/Container";
import ModalBackdrop from "../../../UserInterfaceComponents/Modal/ModalBackdrop";
import Tooltip from "../../../UserInterfaceComponents/Tooltip";
import SelectProfilesDropdown from "../../Assignment/CreateAssignment/SelectProfilesDropdown";

type Props = {
  lab: Lab;
};

export default function ChallengeProfiles({ lab }: Props) {
  const [labId, setLabId] = useState("");
  const [challengers, setChallengers] = useState<Profile[]>([]);
  const [meOwner, setMeOwner] = useState<boolean>(false);
  const [meChallenger, setMeChallenger] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { mutateAsync: deleteChallenge } = useDeleteChallenge();

  const { data: challenges } = useGetChallengesByLabId(labId);
  const { data: profiles } = useGetAllProfilesRedacted();
  const { data: myProfile } = useGetMyProfile();

  const queryClient = useQueryClient();

  useEffect(() => {
    setLabId(lab.id);
  }, [lab]);

  useEffect(() => {
    if (profiles && challenges) {
      const filteredProfiles = profiles.filter((profile) => {
        return challenges?.some((challenge) => {
          return (
            challenge.userId === profile.userPrincipal &&
            challenge.labId === lab.id
          );
        });
      });
      setChallengers(filteredProfiles);
    }
  }, [profiles, challenges]);

  useEffect(() => {
    if (myProfile && lab) {
      if (lab.owners.includes(myProfile.userPrincipal)) {
        setMeOwner(true);
      }
      if (
        challenges?.some(
          (challenge) => challenge.userId === myProfile.userPrincipal
        )
      ) {
        setMeChallenger(true);
      }
    }
  }, [myProfile, lab, challengers]);

  function onDeleteChallenge(profile: Profile) {
    // Owner can delete any challenge
    // Challenger can delete their own challenge
    if (!meOwner && profile.userPrincipal !== myProfile?.userPrincipal) {
      return;
    }

    const response = toast.promise(
      deleteChallenge(`${profile.userPrincipal}+${lab.id}`),
      {
        pending: "Deleting Challenge...",
        success: "Challenge Deleted.",
        error: {
          render(data: any) {
            return `Failed to delete challenge. ${data.data.data}`;
          },
        },
      }
    );

    response.then(() => {
      queryClient.invalidateQueries(["get-challenges-by-lab-id", lab.id]);
    });
  }

  return (
    <Container
      hoverEffect={false}
      additionalClasses="outline"
      title="Challenges"
    >
      <div className="flex flex-row flex-wrap justify-between gap-2">
        <div className="flex flex-row flex-wrap gap-2">
          {challengers?.map((profile) => (
            <Tooltip
              key={profile.userPrincipal}
              message={profile.displayName || profile.userPrincipal}
              delay={300}
            >
              <div
                key={`${profile.userPrincipal}-profile`}
                className={`${
                  (meOwner ||
                    profile.userPrincipal === myProfile?.userPrincipal) &&
                  "hover:border-1 hover:w-20 hover:border-slate-500 dark:border-slate-900 dark:hover:border-slate-500 "
                } group flex w-8 flex-row justify-between rounded-full border border-slate-50 transition-all `}
              >
                {profile.profilePhoto === "" ? (
                  <div className="flex h-8 max-h-8 w-8 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700">
                    <FaUser />
                  </div>
                ) : (
                  <img
                    className="h-full max-h-8 rounded-full"
                    src={profile.profilePhoto}
                    alt="Profile Picture"
                  />
                )}
                <div
                  className={`${
                    (meOwner ||
                      profile.userPrincipal === myProfile?.userPrincipal) &&
                    "group-hover:block "
                  } hidden`}
                >
                  <Button
                    variant="danger-icon"
                    onClick={() => onDeleteChallenge(profile)}
                  >
                    <FaTimes />
                  </Button>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
        {(meOwner ||
          (meChallenger &&
            challenges &&
            myProfile &&
            challenges.filter(
              (challenge) => challenge.createdBy === myProfile.userPrincipal
            ).length < 2)) && (
          <Tooltip message={"Challenge Someone"} delay={1000}>
            <Button
              variant="primary-outline"
              onClick={() => setShowModal(true)}
            >
              Challenge
            </Button>
          </Tooltip>
        )}
      </div>
      {showModal && (
        <Modal
          title={"Challenge"}
          lab={lab}
          challenges={challenges}
          meOwner={meOwner}
          meChallenger={meChallenger}
          challengers={[...challengers]}
          setShowModal={setShowModal}
        />
      )}
    </Container>
  );
}

type ModalProps = {
  title: string;
  lab: Lab;
  challenges?: Challenge[];
  meOwner: boolean;
  meChallenger: boolean;
  challengers: Profile[];
  setShowModal: (showModal: boolean) => void;
};

function Modal({
  title,
  lab,
  challenges,
  meOwner,
  meChallenger,
  challengers,
  setShowModal,
}: ModalProps) {
  //const [selectedProfile, setSelectedProfile] = useState<Profile>();
  const [newChallenges, setNewChallenges] = useState<Challenge[]>([]);
  //const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [usersIChallenged, setUsersIChallenged] = useState<string[]>([]);
  const prevSelectedProfilesRef = useRef<Profile[]>([]);

  const { data: myProfile } = useGetMyProfile();

  const { mutateAsync: upsertChallenge } = useUpsertChallenges();

  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Users I Challenged", usersIChallenged);
  }, [usersIChallenged]);

  // Count challenges I've created so far.
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

  useEffect(() => {
    if (meChallenger && !meOwner) {
      if (isProfileRemoved()) {
        removeChallengeForProfileRemoved();
      }
      if (isProfileAdded()) {
        if (usersIChallenged.length >= 2) {
          setSelectedProfiles(prevSelectedProfilesRef.current);
          toast.error("You can only create 2 challenges.");
          return;
        }
        addChallengeForProfileAdded();
      }
    }
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

  function isProfileRemoved(): boolean {
    return selectedProfiles.length < prevSelectedProfilesRef.current.length;
  }

  function isProfileAdded(): boolean {
    return selectedProfiles.length > prevSelectedProfilesRef.current.length;
  }

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

    // add the user id to usersIChallenged
    if (challenge && usersIChallenged.includes(challenge.userId)) {
      setUsersIChallenged((prev) => [
        ...prev.filter((user) => user !== challenge.userId),
      ]);
    }
  }

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
