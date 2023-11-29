import { createContext, useContext, useEffect, useState } from "react";
import { GraphData, Profile } from "../../../dataStructures";
import { useCreateProfile } from "../../../hooks/useProfile";
import AuthenticatingFullScreen from "../../Authentication/AuthenticatingFullScreen";

interface AuthContextData {
  graphResponse: GraphData | undefined;
  setGraphResponse: React.Dispatch<React.SetStateAction<GraphData | undefined>>;
  profilePhotoUrl: string | undefined;
  setProfilePhotoUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [graphResponse, setGraphResponse] = useState<GraphData | undefined>();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>();

  const { mutate: createProfile } = useCreateProfile();

  useEffect(() => {
    if (graphResponse && profilePhotoUrl) {
      let profile: Profile = {
        displayName: graphResponse.displayName,
        objectId: graphResponse.id,
        userPrincipal: graphResponse.userPrincipalName,
        profilePhotoUrl: profilePhotoUrl,
        roles: [],
      };

      createProfile(profile);
    }
  }, [graphResponse, profilePhotoUrl]);

  return (
    <AuthContext.Provider
      value={{
        graphResponse,
        setGraphResponse,
        profilePhotoUrl,
        setProfilePhotoUrl,
      }}
    >
      {graphResponse ? (
        children
      ) : (
        <AuthenticatingFullScreen
          graphResponse={graphResponse}
          setGraphResponse={setGraphResponse}
          profilePhotoUrl={profilePhotoUrl}
          setProfilePhotoUrl={setProfilePhotoUrl}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
