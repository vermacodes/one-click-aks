import Detectors from "../../components/Detectors/Detectors";
import { useDefaultAccount } from "../../hooks/useDefaultAccount";

type Props = {
  heading?: string;
  children: React.ReactNode;
};

export default function PageLayout({ heading, children }: Props) {
  const { defaultAccount } = useDefaultAccount();
  return (
    <div>
      <Detectors />
      {heading && (
        <div className="mb-6 flex items-center justify-between border-b-2 border-slate-500 py-4 ">
          <h1 className="text-4xl">{heading}</h1>
          <div className="text-sm text-slate-500">
            {defaultAccount ? defaultAccount.name : ""}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
