import { html as beautifyHtml } from "js-beautify";
import DiffLines from "../../../UtilityComponents/DiffLines";
import { Lab } from "../../../../dataStructures";
import { decodeIfEncoded } from "../../../../utils/helpers";

type Props = {
  versionA: Lab | undefined;
  versionB: Lab | undefined;
};

export default function LabVersionDiff({ versionA, versionB }: Props) {
  if (
    versionA === undefined ||
    versionB === undefined ||
    versionA.versionId === versionB.versionId
  ) {
    return null;
  }
  return (
    <>
      <DiffLines
        versionA={JSON.stringify(versionA.template, null, 4)}
        versionB={JSON.stringify(versionB.template, null, 4)}
        heading="Template"
      />
      <DiffLines
        versionA={decodeIfEncoded(versionA.extendScript)}
        versionB={decodeIfEncoded(versionB.extendScript)}
        heading="Extend Script"
      />
      <DiffLines
        versionA={beautifyHtml(decodeIfEncoded(versionA.description))}
        versionB={beautifyHtml(decodeIfEncoded(versionB.description))}
        heading="Description"
      />
    </>
  );
}
