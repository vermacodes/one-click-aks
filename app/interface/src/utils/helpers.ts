import ansiHTML from "ansi-to-html";
import DOMPurify from "dompurify";
import { DeploymentType, TerraformWorkspace } from "../dataStructures";

// Function returns the new epoch time for deployment destroy time.
export function calculateNewEpochTimeForDeployment(deployment: DeploymentType) {
  if (deployment.deploymentAutoDelete === false) {
    return 0;
  }

  const now = new Date();
  // Get epoch time in seconds
  const epochTime = Math.floor(now.getTime() / 1000);

  return deployment.deploymentLifespan + epochTime;
}

// Function returns the time when the deployment will be destroyed in user's local time.
export function getDeploymentDestroyTime(deployment: DeploymentType) {
  if (deployment.deploymentAutoDelete === false) {
    return "Never";
  }

  const epochTime = deployment.deploymentAutoDeleteUnixTime;
  const date = new Date(epochTime * 1000);
  return date.toLocaleString();
}

// Function returns the time remaining in hours, minutes and seconds for the deployment to be destroyed based on user's local time.
export function getDeploymentDestroyTimeRemaining(
  deployment: DeploymentType,
  setDeploymentDestroyTimeRemaining: React.Dispatch<
    React.SetStateAction<string>
  >
) {
  setInterval(() => {
    if (deployment.deploymentAutoDelete === false) {
      return "Never";
    }

    const epochTime = deployment.deploymentAutoDeleteUnixTime;
    const now = new Date();
    const timeRemaining = epochTime - Math.floor(now.getTime() / 1000);

    if (timeRemaining < 0) {
      return "Expired";
    }

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = Math.floor((timeRemaining % 3600) % 60);

    return hours + "h " + minutes + "m " + seconds + "s";
  }, 1000);
}

// set default values in local storage
export function setDefaultValuesInLocalStorage() {
  if (localStorage.getItem("darkMode") === null) {
    localStorage.setItem("darkMode", "false");
  }

  if (localStorage.getItem("autoScroll") === null) {
    localStorage.setItem("autoScroll", "true");
  }

  if (localStorage.getItem("authServiceBaseUrl") === null) {
    localStorage.setItem(
      "authServiceBaseUrl",
      "https://actlabs-auth.azurewebsites.net/"
    );
  }

  if (localStorage.getItem("baseUrl") === null) {
    localStorage.setItem("baseUrl", "http://localhost:8880/");
  }
}

// This function uses a hack to decode base64 strings.
// If the string is not base64 encoded, it returns the original string.
// It also replaces empty paragraphs with paragraphs with margin.
export function decodeIfEncoded(value: string) {
  if (value === undefined) {
    return "";
  }

  try {
    // Decode base64 string
    value = atob(value);
    return value.replace(/<p><\/p>/g, '<p class="mb-4"></p>');
  } catch (error) {
    // If an error is thrown, return the original value
    return value.replace(/<p><\/p>/g, '<p class="mb-4"></p>');
  }
}

export function stringToHTML(value: string | undefined): string {
  if (value === undefined) {
    return "";
  }
  var convert = new ansiHTML({
    newline: false,
    escapeXML: false,
    stream: true,
  });
  const dirty = convert.toHtml(value);

  // Sanitize the HTML string
  const clean = DOMPurify.sanitize(dirty);

  return clean;
}
