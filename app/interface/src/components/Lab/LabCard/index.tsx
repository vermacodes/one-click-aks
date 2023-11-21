import { Link } from "react-router-dom";
import { Lab } from "../../../dataStructures";
import ReactHtmlParser from "html-react-parser";
import {
  FaHistory,
  FaRegCalendarAlt,
  FaRegEdit,
  FaUser,
  FaUserEdit,
} from "react-icons/fa";
import { decodeIfEncoded } from "../../../utils/helpers";
import LabActionButtons from "../LabActionButtons/LabActionButtons";
import LabVersions from "../LabVersions";

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
  if (lab === undefined) {
    return <></>;
  }

  return (
    <div className="flex h-fit max-w-full flex-col justify-between gap-y-6 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500">
      <LabHeader lab={lab} showVersions={showVersions} />
      <LabDescription lab={lab} fullPage={fullPage} />
      <LabTags tags={lab.tags} />
      <LabActionButtons lab={lab} />
      <LabCredits lab={lab} />
    </div>
  );
}

type LabHeaderProps = {
  lab: Lab;
  showVersions: boolean;
};

function LabHeader({ lab, showVersions }: LabHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Link to={"/lab/" + lab.type + "/" + lab.id}>
        <h1 className="whitespace-pre-line py-2 text-3xl hover:text-sky-500 hover:underline dark:border-slate-700">
          {lab.name}
        </h1>
      </Link>
      {showVersions && (
        <LabVersions lab={lab} variant="text">
          <FaHistory /> Versions
        </LabVersions>
      )}
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
  return (
    <div className="flex flex-col gap-y-1 text-xs text-gray-500">
      {lab.createdBy !== "" && lab.createdOn !== "" && (
        <div className="flex items-center gap-x-1">
          <FaRegCalendarAlt className="text-sm" />
          <span>Created on {lab.createdOn}</span>
          <FaUser className="text-sm" />
          <span>by {lab.createdBy}</span>
        </div>
      )}
      {lab.updatedBy !== "" && lab.updatedOn !== "" && (
        <div className="flex items-center gap-x-1">
          <FaRegEdit className="text-sm" />
          <span>Updated on {lab.updatedOn}</span>
          <FaUserEdit className="text-sm" />
          <span>by {lab.updatedBy}</span>
        </div>
      )}
      <p className="text-xs text-slate-200 dark:text-slate-800">{lab.id}</p>
    </div>
  );
}
