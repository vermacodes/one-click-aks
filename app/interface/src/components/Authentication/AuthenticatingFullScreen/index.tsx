import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest } from "../../../authConfig";
import { GraphData } from "../../../dataStructures";

type Props = {
  graphResponse: GraphData | undefined;
  setGraphResponse: (updatedGraphData: GraphData | undefined) => void;
  profilePhotoUrl: string | undefined;
  setProfilePhotoUrl: (profilePhotoUrl: string | undefined) => void;
};

export default function AuthenticatingFullScreen({
  graphResponse,
  setGraphResponse,
  profilePhotoUrl,
  setProfilePhotoUrl,
}: Props) {
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState<string>("");
  const [tokenAcquired, setTokenAcquired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // call RequestAccessToken after the component has mounted
  useEffect(() => {
    RequestAccessToken();
  }, []);

  useEffect(() => {
    if (tokenAcquired || accessToken !== "") {
      getGraphData();
      getProfilePhoto();
    }
  }, [tokenAcquired, accessToken]);

  async function getGraphData() {
    fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          setGraphResponse(data);
          setLoading(false);
        });
      }
    });
  }

  async function getProfilePhoto() {
    fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      if (response.ok) {
        console.log("Profile Photo", response);
        response.blob().then((data) => {
          console.log("Profile Photo", data);
          setProfilePhotoUrl(URL.createObjectURL(data));
        });
      }
    });
  }

  async function RequestAccessToken() {
    await instance.handleRedirectPromise();
    const request = {
      ...loginRequest,
      account: accounts[0],
    };

    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        setAccessToken(response.accessToken);
        setTokenAcquired(true);
      })
      .catch((e) => {
        instance.acquireTokenRedirect(request);
      });
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Authenticating...</p>
      </div>
    );
  }

  // Return your main component here
  return null;
}
