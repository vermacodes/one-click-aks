import AzureSubscription from "../../components/AzureSubscription";
import VersionCheck from "../../components/Config/VersionCheck";

type Props = {
  heading?: string;
  children: React.ReactNode;
};

export default function PageLayout({ heading, children }: Props) {
  return (
    <div className="mb-4">
      <VersionCheck />
      <div className="mb-6 flex justify-between border-b-2 border-slate-500 py-4 ">
        <div>{heading && <h1 className="text-4xl">{heading}</h1>}</div>
        <div>
          <AzureSubscription />
        </div>
      </div>
      {children}
    </div>
  );
}
