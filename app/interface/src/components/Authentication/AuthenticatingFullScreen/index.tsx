import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest } from "../../../authConfig";
import { GraphData } from "../../../dataStructures";

type Props = {
  graphResponse: GraphData | undefined;
  setGraphResponse: (updatedGraphData: GraphData | undefined) => void;
  profilePhoto: string | undefined;
  setProfilePhoto: (profilePhoto: string | undefined) => void;
};

export default function AuthenticatingFullScreen({
  graphResponse,
  setGraphResponse,
  profilePhoto,
  setProfilePhoto,
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
          const url = URL.createObjectURL(data);
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 256; // cant store bigger image in DB.
            canvas.height = 256;
            ctx?.drawImage(img, 0, 0, 256, 256);
            const base64String = canvas.toDataURL("image/jpeg");
            setProfilePhoto(base64String);
          };
          img.src = url;
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
