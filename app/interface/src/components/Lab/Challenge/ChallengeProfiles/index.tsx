import { useEffect, useState } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { Lab, Profile } from "../../../../dataStructures";
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
import Tooltip from "../../../UserInterfaceComponents/Tooltip";
import AddChallengesModal from "../AddChallengesModal";

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
              (challenge) =>
                challenge.createdBy === myProfile.userPrincipal &&
                challenge.labId === lab.id
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
    </Container>
  );
}
