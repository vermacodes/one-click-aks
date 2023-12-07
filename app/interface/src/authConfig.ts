export const msalConfig = {
  auth: {
    clientId: "00399ddd-434c-4b8a-84be-d096cff4f494",
    authority:
      "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const graphAPIScope = {
  scopes: ["User.Read", "User.ReadBasic.All"],
};

export const actLabsScope = {
  scopes: ["api://00399ddd-434c-4b8a-84be-d096cff4f494/User"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
