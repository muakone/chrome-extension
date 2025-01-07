import { useEffect } from "react";
import Popup from "@pages/content/components/Popup";

export default function App() {
  useEffect(() => {
    console.log("content view loaded");
  }, []);
  

  return (
    <div className="fixed z-[9999]">
      <Popup />
    </div>
  );
}
