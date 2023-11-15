import { Lab } from "../../../../dataStructures";
import ExportLabButton from "../../Export/ExportLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import DeleteLabButton from "../../DeleteLabButton";

type Props = {
  lab: Lab;
};

export default function MySavedLabActionButtons({ lab }: Props) {
  return (
    <div className="flex justify-start gap-1">
      <LoadToBuilderButton lab={lab} variant="primary">
        Open
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
