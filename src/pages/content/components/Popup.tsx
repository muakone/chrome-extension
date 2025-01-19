/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef, MouseEvent } from "react";
import Controls from "./Controls";

export default function Popup() {
  const [toggleAudio, setToggleAudio] = useState(true);
  const [toggleVideo, setToggleVideo] = useState(true);

  const [isrecording, setIsRecording] = useState(false);
  const [webCamStatus, setWebCamStatus] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const combinedStreamRef = useRef(null); // Combined screen + webcam stream
  const webcamPreviewRef = useRef(null); // Ref for the webcam preview

  //authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authDetails, setAuthDetails] = useState(null);

  const authImg = authDetails?.image.replace("s96-c", "s800-c");

  // Dragging
  const [position, setPosition] = useState({
    x: 0,
    y: window.innerHeight - 298,
  });
  const [isDragging, setIsDragging] = useState(false);
  const draggingPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    draggingPosition.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - draggingPosition.current.x,
        y: e.clientY - draggingPosition.current.y,
      });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for mousemove and mouseup
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const initializeWebcam = async () => {
      try {
  
        // Retrieve auth details
        const result = await new Promise((resolve, reject) => {
          chrome.storage.local.get(["authDetails", "isAuthenticated"], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
        console.log("Retrieved data from local storage:", result.isAuthenticated);
        console.log("Retrieved data from local storage:", result.authDetails);
        setAuthDetails(result.authDetails);
        setIsAuthenticated(result.isAuthenticated);
  
        // Set webcam status
        setWebCamStatus(true);
  
        // Access webcam stream
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
  
        if (webcamPreviewRef.current) {
          webcamPreviewRef.current.srcObject = webcamStream;
          await webcamPreviewRef.current.play(); // Ensure playback starts
          console.log("Webcam preview started.");
        } else {
          console.error("Webcam preview element not found.");
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };
  
    initializeWebcam();
  }, []);
  

  // Start recording
  const startRecording = async () => {
    try {
      // Capture screen
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Capture webcam
      
      // const webcamStream = await navigator.mediaDevices.getUserMedia({
      //   video: true,
      //   audio: true,
      // });
      // Trigger re-render with webcam enabled

      // Combine screen and webcam streams
      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...webcamPreviewRef.current.srcObject.getTracks(),
      ]);
      combinedStreamRef.current = combinedStream;

      // Set webcam preview in the video element
      

      if (combinedStreamRef.current) {
        combinedStreamRef.current.getTracks().forEach((track) => {
          // Check if the track is of the desired kind and is from the webcam
          if (
            track.kind === "video" &&
            track.label.toLowerCase().includes("webcam") && webcamPreviewRef.current  // Adjust this condition based on the actual label
          ) {
            track.enabled = toggleVideo;
            console.log(`video (webcam) set to ${toggleVideo}`);
          }
          if (track.kind === "audio") {
            // Handle toggling audio tracks separately
            track.enabled = toggleAudio;
            console.log(`audio set to ${toggleAudio}`);
          }
        });
        console.log("combined stream", combinedStreamRef.current.getTracks())
      }

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.webm"; // Default filename if not provided
        document.body.appendChild(a);

        // Trigger the download
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Recording URL:", url);

        recordedChunksRef.current = [];
        setWebCamStatus(false); // Reset webcam status
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleCancelClick = () => {
    setIsRecording(true); // Close the popup
  };

  return (
    <div>
      <div
        className="flex video-preview fixed z-[9999999]"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        {webCamStatus && isAuthenticated  ? (
          <video
            ref={webcamPreviewRef}
            className="border border-gray-300 rounded-full w-72 h-72 object-cover scale-x-[-1]"
            autoPlay
            muted
            onMouseDown={handleMouseDown}
          />
        ) : !webCamStatus && isAuthenticated ? (
          <img
            src={authImg}
            alt="User profile"
            className="border border-gray-300 rounded-full w-72 h-72 object-contain select-none"
            draggable="false"
            onMouseDown={handleMouseDown}
          />
        ) : (
          <img
            src="https://ui-avatars.com/api/?name=H+p&size=400&rounded=true"
            alt="Default avatar"
            className="border border-gray-300 rounded-full w-72 h-72 object-cover select-none"
            draggable="false"
            onMouseDown={handleMouseDown}
          />
        )}
        {isrecording && (
          <Controls
            handleMouseDown={handleMouseDown}
            stopRecording={stopRecording}
            mediaRecorder={mediaRecorderRef.current}
            combinedMedia={combinedStreamRef.current}
            toggleVideo = {toggleVideo}
            toggleAudio = {toggleAudio}
            setToggleVideo = {setToggleVideo}
          />
        )}
      </div>
      {!isrecording && (
        <div
          className={`w-[290px] rounded-3xl bg-white fixed top-2 right-2 shadow-xl px-6 pt-2 pb-5 mx-6 my-5 z-[9999999]`}
        >
          <div className="container py-2">
            <div className="flex justify-between items-center">
              <img
                src={chrome.runtime.getURL("images/logo-title.svg")}
                alt="logo"
              />
              <div className="flex gap-x-3">
                <img
                  src={chrome.runtime.getURL("images/setting-2.svg")}
                  alt="setting"
                />
                <img
                  src={chrome.runtime.getURL("images/close-circle.svg")}
                  alt="close"
                />
              </div>
            </div>
            <p className="my-2 text-sm text-[#413C6D]">
              This extension helps you record and share help videos with ease.
            </p>
            <div className="my-3 mx-6 flex justify-between items-center">
              <div className="grid place-items-center">
                <img
                  src={chrome.runtime.getURL("images/monitor.svg")}
                  alt="monitor"
                />
                <p className="text-[#928FAB] font-medium text-sm my-1.5">
                  Full screen
                </p>
              </div>
              <div className="grid place-items-center">
                <img
                  src={chrome.runtime.getURL("images/copy.svg")}
                  alt="tabs"
                />
                <p className="text-[#120B48] font-semibold text-sm my-1.5 mt-2">
                  Current Tab
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="my-3 border-2 border-[#100A42] rounded-2xl flex justify-between items-center py-3 px-2 w-full">
                <div className="flex items-center gap-x-2">
                  <img
                    src={chrome.runtime.getURL("images/video-camera.svg")}
                    alt="close"
                  />
                  <p className="text-[#100A42] font-medium">Camera</p>
                </div>
                <div
                  className={`md:w-12 md:h-7 w-12 h-6 flex items-center rounded-full py-1 cursor-pointer transition-colors duration-300 ${
                    toggleVideo
                      ? "bg-[#120B48]"
                      : "bg-[#E0E0E0] border border-[#C0C0C0]"
                  }`}
                  onClick={() => {
                    setToggleVideo(!toggleVideo);
                  }}
                >
                  <div
                    className={`md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform transition-transform ease-in-out duration-300 ${
                      toggleVideo
                        ? "bg-white translate-x-6"
                        : "bg-[#FFFFFF] translate-x-0"
                    }`}
                  ></div>
                </div>
              </div>
              <div className="my-3 border-2 border-[#100A42] rounded-2xl flex justify-between items-center py-3 px-2 w-full">
                <div className="flex items-center gap-x-2">
                  <img
                    src={chrome.runtime.getURL("images/microphone.svg")}
                    alt="close"
                  />
                  <p className="text-[#100A42] font-medium">Audio</p>
                </div>
                <div
                  className={`md:w-12 md:h-7 w-12 h-6 flex items-center rounded-full py-1 cursor-pointer transition-colors duration-300 ${
                    toggleAudio
                      ? "bg-[#120B48]"
                      : "bg-[#E0E0E0] border border-[#C0C0C0]"
                  }`}
                  onClick={() => {
                    setToggleAudio(!toggleAudio);
                  }}
                >
                  <div
                    className={`md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform transition-transform ease-in-out duration-300 ${
                      toggleAudio
                        ? "bg-white translate-x-6"
                        : "bg-[#FFFFFF] translate-x-0"
                    }`}
                  ></div>
                </div>
              </div>

              <button
                onClick={startRecording}
                className="bg-[#120B48] p-4 rounded-2xl text-[#FAFDFF] font-medium text-base text-center w-full"
              >
                Start Recording
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// fetch("https://hngx-vid.onrender.com/api/uploads"
