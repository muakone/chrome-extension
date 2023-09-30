import { useEffect } from "react";
import Popup from "@pages/content/components/Popup";

export default function App() {
  useEffect(() => {
    console.log("content view loaded");
  }, []);

  return <div className="w-full fixed inset-0 z-[9999]">
    <Popup />
  </div>
}
