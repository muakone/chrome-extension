import React, { useEffect, useState } from "react";
import logo from "@assets/img/logo.svg";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import withSuspense from "@src/shared/hoc/withSuspense";

const Popup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const theme = useStorage(exampleThemeStorage);
  console.log("Popup");
  console.log(theme, "theme");
  const handlePopUp = () => {
    chrome.runtime.sendMessage({ action: "CHECK_AUTH_STATUS" }, (response) => {
      if (response?.isAuthenticated) {
        openPopUpWithUserDetails();
        console.log("User authenticated successfully.");
      } else {
        handleAuthentication();
        console.log("User not authenticated. Redirecting to authentication...");
      }
    });
  };

  const openPopUpWithUserDetails = () => {
    chrome.storage.local.get("authDetails", (result) => {
      const userDetails = result.authDetails || {};
      console.log("User details:", userDetails);
      // Update the popup UI with user details here
    });
  };

  const handleAuthentication = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const originalUrl = currentTab.url || "";

      // Open the Next.js authentication page
      const nextAuthUrl = `http://localhost:3000/signin?redirectUrl=${encodeURIComponent(
        originalUrl
      )}`;
      window.open(nextAuthUrl, "_blank");
    });
  };

  const injectContentScript = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["src/pages/content/index.js"],
      });
    });
  };

  useEffect(() => {
    handlePopUp();
    injectContentScript();
    const timer = setTimeout(() => {
      window.close()
    }, 500);

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null; // Render nothing if the popup is not visible
  }

  return (
    <div className="popup-container">
      <p></p>
    </div>
  );
};

export default withSuspense(Popup);
