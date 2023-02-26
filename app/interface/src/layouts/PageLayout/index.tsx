type Props = {
  heading?: string;
  children: React.ReactNode;
};

export default function PageLayout({ heading, children }: Props) {
  return (
    <div>
      {heading && (
        <h1 className="mb-6 border-b-2 border-slate-500 py-4 text-4xl">
          {heading}
        </h1>
      )}
      {children}
    </div>
  );
}
