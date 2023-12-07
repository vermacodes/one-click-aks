import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { graphAPIScope } from "../../../authConfig";
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
  const [graphAPIAccessToken, setGraphAPIAccessToken] = useState<string>("");
  const [graphAPITokenAcquired, setGraphAPITokenAcquired] =
    useState<boolean>(false);
  // const [actLabsAccessToken, setActLabsAccessToken] = useState<string>("");
  // const [actLabsTokenAcquired, setActLabsTokenAcquired] =
  //   useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // request access tokens after the component has mounted
  useEffect(() => {
    RequestGraphAPIAccessToken();
    // RequestActLabsAccessToken();
  }, []);

  useEffect(() => {
    if (graphAPITokenAcquired && graphAPIAccessToken !== "") {
      getGraphData();
      getProfilePhoto();
    }
  }, [graphAPITokenAcquired, graphAPIAccessToken]);

  async function getGraphData() {
    fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${graphAPIAccessToken}`,
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
        Authorization: `Bearer ${graphAPIAccessToken}`,
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

  async function RequestGraphAPIAccessToken() {
    await instance.handleRedirectPromise();
    const request = {
      ...graphAPIScope,
      account: accounts[0],
    };

    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        setGraphAPIAccessToken(response.accessToken);
        setGraphAPITokenAcquired(true);
      })
      .catch((e) => {
        instance.acquireTokenRedirect(request);
      });
  }

  // async function RequestActLabsAccessToken() {
  //   await instance.handleRedirectPromise();
  //   const request = {
  //     ...actLabsScope,
  //     account: accounts[0],
  //   };

  //   // Silently acquires an access token which is then attached to a request for Microsoft Graph data
  //   instance
  //     .acquireTokenSilent(request)
  //     .then((response) => {
  //       setActLabsAccessToken(response.accessToken);
  //       setActLabsTokenAcquired(true);
  //     })
  //     .catch((e) => {
  //       instance.acquireTokenRedirect(request);
  //     });
  // }

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
