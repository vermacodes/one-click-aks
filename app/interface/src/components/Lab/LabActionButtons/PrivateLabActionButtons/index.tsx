import { Lab } from "../../../../dataStructures";
import DeleteLabButton from "../../DeleteLabButton";
import ExportLabButton from "../../Export/ExportLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";

type Props = {
  lab: Lab;
};

export default function PrivateLabActionButtons({ lab }: Props) {
  return (
    <div className="flex justify-start gap-1">
      <LoadToBuilderButton lab={lab} variant="primary-outline">
        Open in Builder
      </LoadToBuilderButton>
      <ExportLabButton lab={lab} variant="secondary-text">
        Export
      </ExportLabButton>
      <DeleteLabButton lab={lab} variant="danger-text">
        Delete
      </DeleteLabButton>
    </div>
  );
}
