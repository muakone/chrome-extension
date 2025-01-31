import { useState, useEffect } from "react";

type RecordFuncProps = {
  title?: string;
  img: string;
  img2?: string;
  style?: string;
  onClick?: (index: number, active: boolean) => void;
};

const getAssetURL = (url: string) => {
  return typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.getURL
    ? chrome.runtime.getURL(url)
    : url;
};

const Controls = ({
  handleMouseDown,
  stopRecording,
  mediaRecorder,
  screenRecordMedia,
  toggleAudio,
  toggleVideo,
  setToggleVideo,
  handleToggleWebcam,
  deleteRecording,
}: {
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  stopRecording: () => void;
  mediaRecorder: MediaRecorder;
  screenRecordMedia: MediaStream;
  toggleAudio: boolean;
  toggleVideo: boolean;
  setToggleVideo: (toggle: boolean) => void;
  handleToggleWebcam: () => void;
  deleteRecording: () => void;
}) => {
  const recordFunctions: RecordFuncProps[] = [
    {
      title: "pause",
      img: "images/play.svg",
      img2: "images/pause.svg",
      onClick: (index, active) => {
        active ? pauseRecording(index) : resumeRecording(index);
      },
    },
    {
      title: "stop",
      img: "images/square.svg",
      onClick: () => stopRecording(),
    },
    {
      title: "camera",
      img: "images/video-off.svg",
      img2: "images/video.svg",
      onClick: (index) => handleToggle(index, "video"),
    },
    {
      title: "mic",
      img: "images/mic-off.svg",
      img2: "images/mic.svg",
      onClick: (index) => handleToggle(index, "audio"),
    },
    {
      img: "images/trash-2.svg",
      onClick: () => deleteRecording(),
      style: "bg-[#4B4B4B]",
    },
  ];

  // Default activeStates to true for all buttons
  const [activeStates, setActiveStates] = useState<boolean[]>([
    true,
    true,
    toggleVideo,
    toggleAudio,
    true,
  ]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [pause, setIsPaused] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return stopRecording();
    if (!pause) {
      const timeReducer = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => window.clearInterval(timeReducer);
    }
  }, [timeLeft, pause]);

  const formatTime = (timeLeft: number) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const pauseRecording = (index: number) => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      setActiveStates((prev) => {
        const newState = prev.map((state, i) => (i === index ? !state : state));
        return newState;
      });
      mediaRecorder.pause();
      console.log("Recording paused");
      alert("Recording paused");
      setIsPaused(true);
    }
  };

  const resumeRecording = (index: number) => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      setActiveStates((prev) => {
        const newState = prev.map((state, i) => (i === index ? !state : state));
        return newState;
      });
      mediaRecorder.resume();
      console.log("Recording resumed");
      alert("Recording resumed");
      setIsPaused(false);
    }
  };

  const toggleOption = (kind: string, activeState: boolean) => {
    console.log("test", screenRecordMedia.getTracks());
    if (screenRecordMedia) {
      screenRecordMedia.getTracks().forEach((track) => {
        // Check if the track is of the desired kind and is from the webcam
        if (
          track.kind === kind &&
          track.label.toLowerCase().includes("webcam") // Adjust this condition based on the actual label
        ) {
          track.enabled = activeState;
          setToggleVideo(!toggleVideo);
          console.log(`${kind} (webcam) set to ${activeState}`);
        } else if (kind === "audio" && track.kind === "audio") {
          // Handle toggling audio tracks separately
          track.enabled = activeState;
          console.log(`audio set to ${activeState}`);
        }
      });
      console.log("combined stream", screenRecordMedia.getTracks());
    }
  };

  const handleToggle = (index: number, kind?: string) => {
    setActiveStates((prev) => {
      const newState = prev.map((state, i) => (i === index ? !state : state));
      if (kind == "audio") {
        toggleOption(kind, newState[index]);
      } else if (kind == "video") {
        handleToggleWebcam();
      }
      return newState;
    });
  };

  return (
    <div
      className="w-[550px] max-h-24 flex flex-col justify-center my-40 bg-black border-8 border-[#E8E8E8] rounded-full py-3 px-9"
      onMouseDown={handleMouseDown}
    >
      <div className="flex gap-x-6 items-center divide-x">
        {/* Timer Section */}
        <div className="flex items-center gap-x-3">
          <p className="text-xl text-white">00 : {formatTime(timeLeft)}</p>
          {timeLeft > 0 && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>

        {/* Record Buttons */}
        <div className="flex flex-1 justify-evenly">
          {recordFunctions.map((data, index) => (
            <div
              key={index}
              className="text-center mx-auto cursor-pointer"
              onClick={() => {
                data.onClick?.(index, activeStates[index]);
              }}
            >
              <div
                className={`rounded-full flex justify-center items-center ${
                  data.style ? data.style : "bg-white"
                }`}
              >
                <img
                  src={
                    activeStates[index] && data.img2
                      ? getAssetURL(data.img2)
                      : getAssetURL(data.img)
                  }
                  alt={data.title ?? "default action"}
                  width={40}
                  height={40}
                  className="p-2"
                />
              </div>
              <p className="text-sm mt-0.5 text-gray-300">{data.title || ""}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Controls;
