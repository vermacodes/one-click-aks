import { axiosInstance } from "../../utils/axios-interceptors";
import Button from "../Button";

type Props = {};

export default function EndLogStream({}: Props) {
  return (
    <div className="flex w-60 flex-col gap-2 p-2">
      <Button variant="primary-outline">Break State Lease</Button>
      <p className="text-xs">
        Use this to force break terraform state lease. Use dont abuse.
      </p>
    </div>
  );
}
