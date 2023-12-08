import { useEffect, useState } from "react";
import { FaSuperpowers, FaUser } from "react-icons/fa";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { Challenge, Lab, Profile } from "../../../../dataStructures";
import {
  useDeleteChallenge,
  useGetChallengesByLabId,
} from "../../../../hooks/useChallenge";
import {
  useGetAllProfilesRedacted,
  useGetMyProfile,
} from "../../../../hooks/useProfile";
import Button from "../../../UserInterfaceComponents/Button";
import Container from "../../../UserInterfaceComponents/Container";
import ConfirmationModal from "../../../UserInterfaceComponents/Modal/ConfirmationModal";
import Tooltip from "../../../UserInterfaceComponents/Tooltip";
import AddChallengesModal from "../AddChallengesModal";
import SelectedChallengeProfile from "../SelectedChallengeProfile";

type Props = {
  lab: Lab;
};

export default function ChallengeProfiles({ lab }: Props) {
  const [labId, setLabId] = useState("");
  const [challengers, setChallengers] = useState<Profile[]>([]);
  const [meOwner, setMeOwner] = useState<boolean>(false);
  const [meChallenger, setMeChallenger] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);
  const [challengeToBeDeleted, setChallengeToBeDeleted] = useState<Profile>(
    {} as Profile
  );
  const [selectedChallenge, setSelectedChallenge] = useState<
    Challenge | undefined
  >(undefined);

  const { mutateAsync: deleteChallenge } = useDeleteChallenge();

  const { data: challenges } = useGetChallengesByLabId(labId);
  const { data: profiles } = useGetAllProfilesRedacted();
  const { data: myProfile } = useGetMyProfile();

  const queryClient = useQueryClient();

  /**
   * This useEffect hook is used to update the labId state whenever the lab prop changes.
   */
  useEffect(() => {
    setLabId(lab.id);
  }, [lab]);

  /**
   * This useEffect hook is used to filter the profiles based on the challenges.
   * It sets the challengers state to the profiles that have a corresponding challenge in the current lab.
   */
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

  /**
   * This useEffect hook is used to check if the current user is an owner or a challenger of the lab.
   * If the user's principal is included in the lab's owners, it sets meOwner to true.
   * If there is a challenge for the user in the current lab, it sets meChallenger to true.
   */
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

        setSelectedChallenge(
          challenges?.find(
            (challenge) =>
              challenge.userId === myProfile.userPrincipal &&
              challenge.labId === lab.id
          )
        );
      }
    }
  }, [myProfile, lab, challengers]);

  function onDeleteChallenge(profile: Profile) {
    // Owner can delete any challenge
    // Challenger can delete their own challenge
    if (!meOwner && profile.userPrincipal !== myProfile?.userPrincipal) {
      return;
    }

    setChallengeToBeDeleted(profile);
    setShowConfirmDeleteModal(true);
  }

  /**
   * Deletes a challenge for a given profile.
   * If the current user is not an owner and the profile is not the current user's profile, it does nothing.
   * Otherwise, it calls the deleteChallenge function to delete the challenge.
   * While the deleteChallenge function is running, it shows a toast with the message "Deleting Challenge...".
   * If the deleteChallenge function succeeds, it shows a toast with the message "Challenge Deleted.".
   * If the deleteChallenge function fails, it shows a toast with an error message.
   * After the deleteChallenge function finishes, it invalidates the query for the challenges of the current lab.
   * @param {Profile} profile - The profile for which the challenge should be deleted.
   */
  function onConfirmDeleteChallenge() {
    setShowConfirmDeleteModal(false);

    const response = toast.promise(
      deleteChallenge(`${challengeToBeDeleted.userPrincipal}+${lab.id}`),
      {
        pending: "Deleting Challenge...",
        success: "Challenge Deleted.",
        error: {
          render(data: any) {
            return `Failed to delete challenge. ${data.data.response.data.error}`;
          },
        },
      }
    );

    response.then(() => {
      queryClient.invalidateQueries(["get-challenges-by-lab-id", lab.id]);
    });
  }

  function onProfileClick(profile: Profile) {
    const challenge = challenges?.find(
      (challenge) => challenge.userId === profile.userPrincipal
    );
    if (challenge) {
      setSelectedChallenge(challenge);
    }
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
                className={`
                ${
                  challenges?.some(
                    (challenge) =>
                      challenge.userId === profile.userPrincipal &&
                      challenge.status === "accepted"
                  ) && "outline outline-2 outline-purple-500 "
                }
                ${
                  challenges?.some(
                    (challenge) =>
                      challenge.userId === profile.userPrincipal &&
                      challenge.status === "completed"
                  ) && "outline outline-2 outline-green-500 "
                }
                ${
                  (meOwner ||
                    profile.userPrincipal === myProfile?.userPrincipal) &&
                  "hover:cursor-pointer"
                } group flex w-8 flex-row justify-between rounded-full border border-slate-50 transition-all dark:border-slate-900 `}
              >
                <div onClick={() => onProfileClick(profile)}>
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
                </div>
                {/* <div
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
                </div> */}
              </div>
            </Tooltip>
          ))}
        </div>
        {(meOwner ||
          (meChallenger &&
            challenges &&
            myProfile &&
            challenges.filter(
              (challenge) =>
                challenge.createdBy === myProfile.userPrincipal &&
                challenge.labId === lab.id
            ).length < 2 &&
            challenges.some(
              (challenge) =>
                challenge.userId === myProfile.userPrincipal &&
                challenge.labId === lab.id &&
                challenge.status === "completed"
            ))) && (
          <Tooltip message={"Challenge Someone"} delay={1000}>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaSuperpowers /> Challenge Others
            </Button>
          </Tooltip>
        )}
      </div>
      {showModal && (
        <AddChallengesModal
          title={"Challenge"}
          lab={lab}
          challenges={challenges}
          meOwner={meOwner}
          meChallenger={meChallenger}
          challengers={[...challengers]}
          setShowModal={setShowModal}
        />
      )}
      {showConfirmDeleteModal && (
        <ConfirmationModal
          onClose={() => setShowConfirmDeleteModal(false)}
          onConfirm={onConfirmDeleteChallenge}
          title={"Confirm Delete Challenge"}
        >
          <p>
            Are you sure you want to delete this challenge for{" "}
            <strong>
              {challengeToBeDeleted.displayName ||
                challengeToBeDeleted.userPrincipal}
            </strong>
            ? Not only will lose access to the lab, their progress and credits
            will be lost irreversibly.
          </p>
        </ConfirmationModal>
      )}
      {selectedChallenge && (
        <SelectedChallengeProfile challenge={selectedChallenge} lab={lab} />
      )}
    </Container>
  );
}
