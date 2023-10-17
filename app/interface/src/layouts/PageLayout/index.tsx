import { useContext } from "react";
import { WebSocketContext } from "../../WebSocketContext";

type Props = {
  heading?: string;
  children: React.ReactNode;
};

export default function PageLayout({ heading, children }: Props) {
  const { data: inProgress, setActionStatus } = useContext(WebSocketContext);
  console.log("actionStatus", inProgress);

  return (
    <div className="mb-4">
      {heading && (
        <h1 className="mb-6 border-b-2 border-slate-500 py-4 text-4xl">
          {heading} - {inProgress ? "In Progress" : "Idle"}
        </h1>
      )}
      {children}
    </div>
  );
}
