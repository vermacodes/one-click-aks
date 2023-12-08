type Props = {
  showImage?: boolean;
  message?: string;
};
export default function NoContent({ showImage = true, message = "" }: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {/* <FcNightLandscape className="flex h-1/2 w-1/2 items-center justify-center" /> */}
      {showImage && (
        <img className="h-1/2 w-1/2" src="/BrunoError.gif" alt="Error"></img>
      )}
      <p className="text-xl">{message}</p>
    </div>
  );
}
