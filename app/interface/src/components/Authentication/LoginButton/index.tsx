import { FaUserNinja } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

type Props = {};

export default function LoginButton({}: Props) {
  const { graphResponse, profilePhoto } = useAuth();

  return graphResponse ? (
    <div>
      <a className="justify-star flex h-full w-full items-center gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
        <span>
          {profilePhoto === "" ? (
            <FaUserNinja />
          ) : (
            <img
              className="h-8 w-8 rounded-full"
              src={profilePhoto}
              alt="Profile Picture"
            />
          )}
        </span>
        <span>{graphResponse.displayName}</span>
      </a>
    </div>
  ) : null;
}
