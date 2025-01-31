/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef, MouseEvent } from "react";
import Controls from "./Controls";

export default function Popup() {
  const [toggleAudio, setToggleAudio] = useState(true);
  const [toggleVideo, setToggleVideo] = useState(true);
  const [currentShare, setCurrentShare] = useState("monitor");

  const [isrecording, setIsRecording] = useState(false);
  const [webCamStatus, setWebCamStatus] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const combinedStreamRef = useRef(null); // Combined screen + webcam stream
  const screenRecordStreamRef = useRef(null); //sreen record stream
  const webcamPreviewRef = useRef(null); // Ref for the webcam preview

  //authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [authDetails, setAuthDetails] = useState(null);

  const [skipDownload, setSkipDownload] = useState(false);

  const authImg = authDetails?.image.replace("s96-c", "s800-c");

  const apiKey = import.meta.env.VITE_API_KEY;
    const cloudinaryName = import.meta.env.VITE_CLOUDINARY_NAME;
    const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_PRESET
    console.log("API Key:", apiKey, cloudinaryName, cloudinaryPreset);

  // Dragging
  const [position, setPosition] = useState({
    x: 0,
    y: window.innerHeight - 271,
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
          chrome.storage.local.get(
            ["authDetails", "isAuthenticated"],
            (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(result);
              }
            }
          );
        });
        console.log(
          "Retrieved data from local storage:",
          result.isAuthenticated
        );
        console.log("Retrieved data from local storage:", result.authDetails);
        setAuthDetails(result.authDetails);
        setIsAuthenticated(result.isAuthenticated);

        const devices = await navigator.mediaDevices.enumerateDevices(); // Get all media devices
        const videoDevices = devices.filter((device) => device.kind === "videoinput"); // Filter only video input devices
        const integratedCam = videoDevices.find((device) => device.label.toLowerCase().includes("integrated"))
        if (!integratedCam) {
          throw new Error("Integrated Webcam not found.");
        }

        // Set webcam status
        setWebCamStatus(true);

        setIsLoading(true);

        // Access webcam stream
        setIsLoading(false);
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: {deviceId: integratedCam.deviceId },
          audio: false,
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
    const listCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices(); // Get all media devices
        const videoDevices = devices.filter((device) => device.kind === "videoinput"); // Filter only video input devices
    
        console.log("Available cameras:");
        videoDevices.forEach((device, index) => {
          console.log(`Camera ${index + 1}:`, device.label || `Device ID: ${device.deviceId}`);
        });
    
        console.log(`Total number of cameras: ${videoDevices.length}`);
      } catch (error) {
        console.error("Error listing cameras:", error);
      }
    };
    
    listCameras();

    initializeWebcam();
    

  }, []);

  // Start recording
  const startRecording = async () => {
    if (!currentShare) {
      throw new Error("No screen share option selected.");
    }
    try {
      // Capture screen
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: currentShare || "", // "monitor" for full screen
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Capture webcam

      const audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      // Trigger re-render with webcam enabled

      // Combine screen and audio streams
      // const combinedStream = new MediaStream([
      //   ...screenStream.getTracks(),
      //   ...webcamPreviewRef.current.srcObject.getTracks(),
      // ]);
      // combinedStreamRef.current = combinedStream;

      /* new code */

      const screenRecordStream = new MediaStream([
        ...screenStream.getTracks(),
        ...audioStream.getAudioTracks(),
      ]);
      screenRecordStreamRef.current = screenRecordStream;

      // Set webcam preview in the video element

      // Listen for the "stop" event on the screen stream's video track
      const videoTrack = screenStream.getVideoTracks()[0];
      if (screenRecordStreamRef.current) {
        screenRecordStreamRef.current.getTracks().forEach((track) => {
          // Check if the track is of the desired kind and is from the webcam
          // if (
          //   track.kind === "video" &&
          //   track.label.toLowerCase().includes("webcam") && webcamPreviewRef.current  // Adjust this condition based on the actual label
          // ) {
          //   track.enabled = toggleVideo;
          //   console.log(`video (webcam) set to ${toggleVideo}`);
          // }
          if (track.kind === "audio") {
            // Handle toggling audio tracks separately
            track.enabled = toggleAudio;
            console.log(`audio set to ${toggleAudio}`);
          }
        });
        console.log(
          "combined stream",
          screenRecordStreamRef.current.getTracks()
        );
      }

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(screenRecordStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      videoTrack.onended = () => {
        console.log("Screen sharing stopped (stream inactive).");
        setSkipDownload(false);
        stopRecording(); // Trigger custom stop logic
      };

      mediaRecorder.onstop = () => {
        if (skipDownload) {
          console.log("Skipping download as skipDownload is true.");
          return;
        }
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        uploadToCloudinary(blob)
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

  const stopAllTrack = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (screenRecordStreamRef.current) {
      screenRecordStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (webcamPreviewRef.current && webcamPreviewRef.current.srcObject) {
      const tracks = webcamPreviewRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop()); // Stop all tracks
      webcamPreviewRef.current.srcObject = null; // Clear the srcObject
    }
    chrome.runtime.sendMessage({ action: "reload_extension" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else if (response && response.success) {
        console.log("Extension reload triggered successfully.");
      } else {
        console.error("Unexpected response or no response received.");
      }
    });
  };
  // Stop recording
  const stopRecording = () => {
    stopAllTrack();
  };

  const deleteRecording = () => {
    setSkipDownload(true);
    // Clear recorded chunks
    recordedChunksRef.current = [];
    stopAllTrack();

    // // Optionally reset other state
    // setIsRecording(false);
    // setWebCamStatus(false);

    console.log("Recording deleted successfully.");
  };

  const handleCancelClick = () => {
    setIsRecording(true); // Close the popup
  };

  const handleToggleWebcam = async () => {
    if (toggleVideo) {
      // Stop the webcam stream
      if (webcamPreviewRef.current && webcamPreviewRef.current.srcObject) {
        const tracks = webcamPreviewRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop()); // Stop all tracks
        webcamPreviewRef.current.srcObject = null; // Clear the srcObject
      }
      setToggleVideo(false);
      console.log("Webcam preview stopped.");
    } else {
      // Start the webcam stream
      setIsLoading(true);
      setToggleVideo(true);
      try {
        setIsLoading(false);
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
          setToggleVideo(false);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setIsLoading(false);
        setToggleVideo(false);
      }
    }
  };

  const uploadToCloudinary = async (file: Blob) => {
    // Your Cloudinary upload function here
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", cloudinaryPreset)
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryName}/video/upload`, {
      method: "POST",
      body: formData,
    });
  
    const data = await response.json();
    console.log("cloudinary url", data.secure_url)
    return data.secure_url;
  }

  return (
    <div>
      <div
        className="flex video-preview fixed z-[9999999]"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        {isAuthenticated && toggleVideo && !loading ? (
          <video
            ref={webcamPreviewRef}
            className="border border-gray-300 rounded-full w-64 h-64 object-cover scale-x-[-1]"
            autoPlay
            muted
            onMouseDown={handleMouseDown}
          />
        ) : isAuthenticated && !toggleVideo && !loading ? (
          <img
            src={authImg}
            alt="User profile"
            className="border border-gray-300 rounded-full w-64 h-64 object-contain select-none"
            draggable="false"
            onMouseDown={handleMouseDown}
          />
        ) : isAuthenticated && toggleVideo && loading ? (
          <div
            className="border border-gray-300 bg-gray-400 rounded-full w-64 h-64 object-contain select-none"
            draggable="false"
            onMouseDown={handleMouseDown}
          />
        ) : (
          <img
            src="https://ui-avatars.com/api/?name=H+p&size=400&rounded=true"
            alt="Default avatar"
            className="border border-gray-300 rounded-full w-64 h-64 object-cover select-none"
            draggable="false"
            onMouseDown={handleMouseDown}
          />
        )}
        {isrecording && (
          <Controls
            handleMouseDown={handleMouseDown}
            stopRecording={stopRecording}
            mediaRecorder={mediaRecorderRef.current}
            screenRecordMedia={screenRecordStreamRef.current}
            toggleVideo={toggleVideo}
            toggleAudio={toggleAudio}
            setToggleVideo={setToggleVideo}
            handleToggleWebcam={handleToggleWebcam}
            deleteRecording={deleteRecording}
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
            <div className="my-3 mx-6 flex justify-between items-baseline">
              <div
                className="grid place-items-center cursor-pointer"
                onClick={() => setCurrentShare("monitor")}
              >
                {currentShare === "monitor" ? (
                  <img
                    src={chrome.runtime.getURL("images/monitor-active.svg")}
                    alt="monitor-active"
                  />
                ) : (
                  <img
                    src={chrome.runtime.getURL("images/monitor.svg")}
                    alt="monitor"
                  />
                )}

                <p
                  className={`${
                    currentShare === "monitor"
                      ? "text-[#120B48]"
                      : "text-[#928FAB]"
                  } font-semibold text-sm my-1.5`}
                >
                  Full screen
                </p>
              </div>
              <div
                className="grid place-items-center cursor-pointer"
                onClick={() => setCurrentShare("browser")}
              >
                {currentShare === "browser" ? (
                  <img
                    src={chrome.runtime.getURL("images/copy-active.svg")}
                    alt="tab-active"
                  />
                ) : (
                  <img
                    src={chrome.runtime.getURL("images/copy.svg")}
                    alt="tab"
                  />
                )}
                <p
                  className={`${
                    currentShare === "browser"
                      ? "text-[#120B48]"
                      : "text-[#928FAB]"
                  } font-semibold text-sm my-1.5`}
                >
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
                    handleToggleWebcam();
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

// <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="2.5" r="1.5" opacity=".14"/><circle cx="16.75" cy="3.77" r="1.5" opacity=".29"/><circle cx="20.23" cy="7.25" r="1.5" opacity=".43"/><circle cx="21.50" cy="12.00" r="1.5" opacity=".57"/><circle cx="20.23" cy="16.75" r="1.5" opacity=".71"/><circle cx="16.75" cy="20.23" r="1.5" opacity=".86"/><circle cx="12" cy="21.5" r="1.5"/></g></svg>
