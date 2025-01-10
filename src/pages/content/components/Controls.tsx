import React, { useState } from "react";

type RecordFuncProps = {
  title?: string;
  img: string;
  img2?: string;
  style?: string;
  onClick?: (index: number, active: boolean) => void;
};

const recordFunctions: RecordFuncProps[] = [
  {
    title: "pause",
    img: "images/pause.svg",
    img2: "images/play.svg",
    onClick: (index, active) =>
      console.log(active ? "video played" : "video paused"),
  },
  {
    title: "stop",
    img: "images/square.svg",
    onClick: () => console.log("video stopped"),
  },
  {
    title: "camera",
    img: "images/video.svg",
    img2: "images/video-off.svg",
    onClick: (index, active) =>
      console.log(active ? "camera on" : "camera off"),
  },
  {
    title: "mic",
    img: "images/mic.svg",
    img2: "images/mic-off.svg",
    onClick: (index, active) => console.log(active ? "mic on" : "mic off"),
  },
  {
    img: "images/trash-2.svg",
    onClick: () => console.log("item deleted"),
    style: "bg-[#4B4B4B]",
  },
];

const Controls = ({
  handleMouseDown,
}: {
  handleMouseDown: (index: number) => void;
}) => {
  const [activeStates, setActiveStates] = useState<boolean[]>(
    new Array(recordFunctions.length).fill(false)
  );

  const toggleActiveState = (index: number) => {
    setActiveStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state))
    );
  };

  return (
    <div
      className="w-[550px] max-h-24 flex flex-col justify-center my-40 bg-black border-8 border-[#E8E8E8] rounded-full py-3 px-9"
      onMouseDown={handleMouseDown}
    >
      <div className="flex gap-x-6 items-center divide-x">
        {/* Timer Section */}
        <div className="flex items-center gap-x-3">
          <p className="text-xl text-white">00:05:00</p>
          <div className="w-2.5 h-2.5 bg-[#C00404] rounded-full ring-8 ring-red-900 ring-opacity-50"></div>
        </div>

        {/* Record Buttons */}
        <div className="flex flex-1 justify-evenly">
          {recordFunctions.map((data, index) => (
            <div
              key={index}
              className="text-center mx-auto cursor-pointer"
              onClick={() => {
                toggleActiveState(index);
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
                      ? chrome.runtime.getURL(data.img2)
                      : chrome.runtime.getURL(data.img)
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
