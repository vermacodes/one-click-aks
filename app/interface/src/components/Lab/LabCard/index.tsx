import ReactHtmlParser from "html-react-parser";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Lab, Profile } from "../../../dataStructures";
import { useGetAllProfilesRedacted } from "../../../hooks/useProfile";
import { decodeIfEncoded } from "../../../utils/helpers";
import ChallengeProfiles from "../Challenge/ChallengeProfiles";
import LabActionButtons from "../LabActionButtons/LabActionButtons";
import LabProfiles from "../LabProfiles";
import LabVersionsButton from "../LabVersions/LabVersionsButton";

type Props = {
  lab: Lab | undefined;
  fullPage?: boolean;
  showVersions?: boolean;
};

export default function LabCard({
  lab,
  fullPage = false,
  showVersions = false,
}: Props) {
  function renderBody() {
    if (lab === undefined) {
      return <></>;
    }
    return (
      <div className="flex h-fit w-full flex-col justify-between gap-4 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500">
        <LabHeader lab={lab} showVersions={showVersions} />
        <LabCredits lab={lab} />
        <LabDescription lab={lab} fullPage={fullPage} />
        <LabTags tags={lab.tags} />
        {/* {!fullPage && (
          <Button variant="primary-outline">
            <FaUpRightFromSquare />
            Open
          </Button>
        )} */}
        {fullPage && (
          <>
            <LabActionButtons lab={lab} />
            <LabProfiles lab={lab} profileType="owners" />
            <LabProfiles lab={lab} profileType="editors" />
            {lab.category === "private" && (
              <LabProfiles lab={lab} profileType="viewers" />
            )}
            {(lab.type === "challengelab" || lab.type === "challenge") && (
              <ChallengeProfiles lab={lab} />
            )}
          </>
        )}
        <p className="text-xs text-slate-200 dark:text-slate-800">{lab.id}</p>
      </div>
    );
  }

  if (lab === undefined) {
    return <></>;
  }

  return fullPage ? (
    renderBody()
  ) : (
    <Link to={"/lab/" + lab.type + "/" + lab.id}>{renderBody()}</Link>
  );
}

type LabHeaderProps = {
  lab: Lab;
  showVersions: boolean;
};

// function LabHeader({ lab, showVersions }: LabHeaderProps) {
//   return (
//     <div className="flex items-center justify-between">
//       <Link to={"/lab/" + lab.type + "/" + lab.id}>
//         <h1 className="whitespace-pre-line text-3xl hover:text-sky-500 hover:underline dark:border-slate-700">
//           {lab.name}
//         </h1>
//       </Link>
//       {showVersions && <LabVersionsButton lab={lab} />}
//     </div>
//   );
// }

function LabHeader({ lab, showVersions }: LabHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="whitespace-pre-line text-3xl">{lab.name}</h1>
      {showVersions && <LabVersionsButton lab={lab} />}
    </div>
  );
}

type LabDescriptionProps = {
  lab: Lab;
  fullPage?: boolean;
};

function LabDescription({ lab, fullPage = false }: LabDescriptionProps) {
  return (
    <div
      className={`${
        !fullPage && "max-h-[360px]"
      } overflow-y-auto px-1 overflow-x-hidden scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 scrollbar-thumb-rounded-full dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-700`}
    >
      {ReactHtmlParser(decodeIfEncoded(lab.description))}
    </div>
  );
}

type LabTagsProps = {
  tags: string[];
};

function LabTags({ tags }: LabTagsProps) {
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-1  pb-4 dark:border-slate-700">
      {tags &&
        tags.map((tag) => (
          <span
            key={tag}
            className="rounded border px-3 py-1  text-xs selection:border-slate-300 dark:border-slate-700 "
          >
            {tag}
          </span>
        ))}
    </div>
  );
}

type LabCreditsProps = {
  lab: Lab;
};

function LabCredits({ lab }: LabCreditsProps) {
  const [createdBy, setCreatedBy] = useState<Profile>({} as Profile);
  const [updatedBy, setUpdatedBy] = useState<Profile>({} as Profile);

  const { data: profiles } = useGetAllProfilesRedacted();

  useEffect(() => {
    if (profiles) {
      setCreatedBy(
        profiles.find((profile) => profile.userPrincipal === lab.createdBy) ||
          ({} as Profile)
      );
      setUpdatedBy(
        profiles.find((profile) => profile.userPrincipal === lab.updatedBy) ||
          ({} as Profile)
      );
    }
  }, [profiles, lab]);

  return (
    <div className="flex flex-row justify-between gap-y-1 text-xs text-gray-500">
      {lab.createdBy !== "" && lab.createdOn !== "" && lab.updatedBy == "" && (
        <div className="flex flex-col gap-1">
          <span>Created on {lab.createdOn}</span>
          <div className="flex h-fit items-center gap-2">
            <span>
              {createdBy.profilePhoto === "" ? (
                <div className="flex h-7 max-h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                  <FaUser />
                </div>
              ) : (
                <img
                  className="h-full max-h-7 rounded-full"
                  src={createdBy.profilePhoto}
                  alt="Profile Picture"
                />
              )}
            </span>
            <div className="flex flex-col">
              <span>{createdBy.displayName}</span>
              <span>
                {createdBy.userPrincipal &&
                  createdBy.userPrincipal.split("@")[0]}
              </span>
            </div>
          </div>
        </div>
      )}
      {lab.updatedBy !== "" && lab.updatedOn !== "" && (
        <div className="flex flex-col gap-1">
          <span>Updated on {lab.updatedOn}</span>
          <div className="flex h-fit items-center gap-2">
            <span>
              {updatedBy.profilePhoto === "" ? (
                <div className="flex h-7 max-h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                  <FaUser />
                </div>
              ) : (
                <img
                  className="h-full max-h-7 rounded-full"
                  src={updatedBy.profilePhoto}
                  alt="Profile Picture"
                />
              )}
            </span>
            <div className="flex flex-col">
              <span>{updatedBy.displayName}</span>
              <span>
                {updatedBy.userPrincipal &&
                  updatedBy.userPrincipal.split("@")[0]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
