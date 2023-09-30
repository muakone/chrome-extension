import React, { useState, useEffect, useRef } from "react";
import LogoTitle from "@assets/img/logo-title.svg";
import Settings from "@assets/img/setting-2.svg";
import Close from "@assets/img/close-circle.svg";
import Monitor from "@assets/img/monitor.svg";
import Copy from "@assets/img/copy.svg";
import Mic from "@assets/img/microphone.svg";
import Camera from "@assets/img/video-camera.svg";

export default function Popup() {
  const [toggleAudio, setToggleAudio] = useState(true);
  const [toggleVideo, setToggleVideo] = useState(true);

  const [visible, setIsVisible] = useState(true)
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const [recording, setRecording] = useState(false);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true })
        .then((stream) => {
          setMediaStream(stream);
        })
        .catch((error) => {
          console.log("error accessing screen", error);
        });
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    }
    console.log(mediaStream);
  }, [isRecording]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      setIsVisible(false)

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(recordedBlob);
        console.log(url, "file")
        const myFile = new File([recordedBlob], 'video.mp4', {
          type: recordedBlob.type,
      });
      console.log(myFile);
      try {
        // const settings = {
        //   method: "POST",
        //   mode: 'no-cors',
        //   body: myFile,
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // };
        // const res = fetch("https://hngx-vid.onrender.com/api/uploads", {
        //   method: "POST",
        //   mode: 'no-cors',
        //   body: myFile,
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // });
        // const data =  res.json();
        fetch('https://hngx-vid.onrender.com/api/uploads', {
          method: "POST",
          mode: 'no-cors',
          body: myFile,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(response => response.json())
        .then(data => console.log(data, "data"));
        
      } catch (err) {
        console.log(err);
      }
        // You can do something with the recorded video URL, like display it in a video element or upload it.
        // const a = document.createElement("a");
        // a.style.display = "none";
        // a.href = url;
        // a.download = "recorded-screen.mp4"; // You can specify the filename here

        // // Append the link to the DOM and trigger a click event to start the download
        // document.body.appendChild(a);
        // a.click();

        // console.log(a, "a")

        // Clean up resources
        recordedChunksRef.current = [];
        setRecording(false);

        // Remove the link element from the DOM
        // document.body.removeChild(a);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing screen:", error);
    }
  };

  //   const stopRecording = () => {
  //     if (mediaRecorderRef.current && recording) {
  //       mediaRecorderRef.current.stop();
  //       mediaStreamRef.current.getTracks().forEach((track) => track.stop());
  //       recordedChunksRef.current = [];
  //       setRecording(false);
  //     }
  //   }

  // const stopRecording = () => {
  //   if (mediaRecorderRef.current && recording) {
  //     mediaRecorderRef.current.stop();
  //     mediaStreamRef.current.getTracks().forEach((track) => track.stop());

  //     // Create a Blob from the recorded chunks
  //     const recordedBlob = new Blob(recordedChunksRef.current, {
  //       type: "video/webm",
  //     });

  //     // Generate a URL for the recorded Blob
  //     const url = window.URL.createObjectURL(recordedBlob);

  //     // Create a link element for downloading the video
  //     const a = document.createElement("a");
  //     a.style.display = "none";
  //     a.href = url;
  //     a.download = "recorded-screen.mp4"; // You can specify the filename here

  //     // Append the link to the DOM and trigger a click event to start the download
  //     document.body.appendChild(a);
  //     a.click();

  //     // Clean up resources
  //     recordedChunksRef.current = [];
  //     setRecording(false);

  //     // Remove the link element from the DOM
  //     document.body.removeChild(a);
  //   }
  // };

  return (
    <div className={`${!visible && "hidden"} w-[300px] rounded-3xl bg-white shadow-lg px-6 pt-2 pb-5 mx-6 my-5 absolute top-0 right-[2%]`}>
      <div className="container py-3">
        <div className="flex justify-between items-center">
          <svg
            width="130"
            height="72"
            viewBox="0 0 270 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_501_1897)">
              <path
                d="M56.0513 30.3158C55.0438 26.842 53.2109 23.6635 50.7089 21.0516C48.2069 18.4396 45.1101 16.4717 41.6829 15.3158C38.2969 14.3302 34.7379 14.0881 31.2496 14.6059C27.7613 15.1236 24.4261 16.3892 21.4723 18.3158C21.2293 18.5594 20.9245 18.7322 20.5907 18.8156C20.2569 18.8991 19.9067 18.89 19.5776 18.7895C18.9142 18.5746 18.3164 18.1942 17.8408 17.6843C17.4945 17.0595 17.3825 16.3316 17.525 15.6316C17.6154 15.2956 17.7743 14.982 17.9917 14.7103C18.2091 14.4386 18.4802 14.2147 18.7881 14.0527C27.1566 9.15794 35.3671 7.89478 43.2618 10.4211C47.1486 11.7139 50.6971 13.8594 53.6476 16.7007C56.5981 19.5419 58.8759 23.0069 60.3144 26.8421H70.8934C68.7302 18.3095 63.5158 10.865 56.2359 5.91637C48.9561 0.96769 40.1154 -1.14225 31.3853 -0.0145405C22.6552 1.11317 14.6409 5.40039 8.85751 12.0365C3.07413 18.6727 -0.0774402 27.1978 -0.00133884 36C-0.00133884 37.4211 0.156556 38.6843 0.156556 40.1053H13.5776C14.0902 40.0762 14.5983 40.2145 15.0255 40.4993C15.4527 40.7841 15.7757 41.1999 15.946 41.6843C16.9773 45.1461 18.8185 48.3124 21.3172 50.9209C23.8159 53.5295 26.9001 55.5051 30.3144 56.6843C33.7004 57.6698 37.2595 57.912 40.7478 57.3942C44.2361 56.8764 47.5713 55.6109 50.525 53.6843C50.768 53.4407 51.0728 53.2679 51.4066 53.1845C51.7404 53.101 52.0906 53.11 52.4197 53.2106C53.0831 53.4255 53.6809 53.8059 54.1566 54.3158C54.5028 54.9406 54.6148 55.6685 54.4723 56.3685C54.3819 56.7045 54.223 57.0181 54.0056 57.2898C53.7883 57.5615 53.5171 57.7854 53.2092 57.9474C48.4497 61.1499 42.8406 62.8547 37.1039 62.8421C34.2686 62.8208 31.4508 62.3955 28.7355 61.579C24.8324 60.3171 21.2682 58.1824 18.3135 55.3371C15.3587 52.4918 13.0911 49.0106 11.6829 45.1579H1.26182C3.54443 53.5503 8.78806 60.8326 16.0234 65.6587C23.2588 70.4848 31.9967 72.5283 40.622 71.4117C49.2472 70.295 57.1766 66.0936 62.9444 59.5841C68.7122 53.0745 71.9285 44.697 71.9986 36C72.028 34.6823 71.9753 33.3639 71.8408 32.0527H58.5776C58.0392 32.0171 57.5204 31.837 57.0758 31.5313C56.6312 31.2257 56.2773 30.8058 56.0513 30.3158Z"
                fill="#100A42"
              />
              <path
                d="M36.1507 51.7492C39.2591 51.7193 42.2892 50.7702 44.8593 49.0215C47.4294 47.2728 49.4245 44.8027 50.5934 41.9222C51.7623 39.0418 52.0527 35.8799 51.4279 32.8347C50.8032 29.7895 49.2914 26.9973 47.0828 24.8098C44.8742 22.6222 42.0677 21.1372 39.0167 20.5416C35.9657 19.9461 32.8067 20.2667 29.9375 21.4631C27.0684 22.6595 24.6175 24.6782 22.8935 27.2649C21.1694 29.8516 20.2494 32.8906 20.2493 35.9992C20.2492 38.0803 20.6615 40.1408 21.4625 42.0616C22.2635 43.9824 23.4371 45.7255 24.9157 47.19C26.3943 48.6545 28.1485 49.8115 30.0769 50.594C32.0053 51.3765 34.0697 51.7692 36.1507 51.7492Z"
                fill="white"
              />
            </g>
            <path
              d="M98.451 47V24.005H103.617V47H98.451ZM83.583 47V24.005H88.749V47H83.583ZM87.8355 37.7075V33.1715H99.3645V37.7075H87.8355ZM116.4 47.5985C114.93 47.5985 113.628 47.3465 112.494 46.8425C111.381 46.3385 110.446 45.6665 109.69 44.8265C108.955 43.9655 108.388 43.01 107.989 41.96C107.611 40.889 107.422 39.797 107.422 38.684V38.054C107.422 36.899 107.611 35.7965 107.989 34.7465C108.388 33.6755 108.955 32.72 109.69 31.88C110.425 31.04 111.339 30.3785 112.431 29.8955C113.544 29.3915 114.804 29.1395 116.211 29.1395C118.059 29.1395 119.613 29.5595 120.873 30.3995C122.154 31.2185 123.13 32.3 123.802 33.644C124.474 34.967 124.81 36.416 124.81 37.991V39.692H109.533V36.8255H121.755L120.117 38.1485C120.117 37.1195 119.97 36.2375 119.676 35.5025C119.382 34.7675 118.941 34.211 118.353 33.833C117.786 33.434 117.072 33.2345 116.211 33.2345C115.329 33.2345 114.583 33.434 113.974 33.833C113.365 34.232 112.903 34.82 112.588 35.597C112.273 36.353 112.116 37.2875 112.116 38.4005C112.116 39.4295 112.263 40.3325 112.557 41.1095C112.851 41.8655 113.313 42.4535 113.943 42.8735C114.573 43.2935 115.392 43.5035 116.4 43.5035C117.324 43.5035 118.08 43.325 118.668 42.968C119.256 42.611 119.655 42.17 119.865 41.645H124.495C124.243 42.8 123.75 43.829 123.015 44.732C122.28 45.635 121.356 46.3385 120.243 46.8425C119.13 47.3465 117.849 47.5985 116.4 47.5985ZM128.371 47V24.005H133.442V47H128.371ZM126.323 27.722V24.005H133.442V27.722H126.323ZM138.086 53.3V29.738H142.087V37.2035L141.551 37.172C141.635 35.45 141.992 34.001 142.622 32.825C143.252 31.628 144.103 30.7355 145.174 30.1475C146.245 29.5385 147.452 29.234 148.796 29.234C149.993 29.234 151.075 29.4545 152.041 29.8955C153.028 30.3365 153.868 30.956 154.561 31.754C155.275 32.531 155.81 33.455 156.167 34.526C156.545 35.576 156.734 36.731 156.734 37.991V38.7155C156.734 39.9545 156.556 41.12 156.199 42.212C155.842 43.283 155.317 44.2175 154.624 45.0155C153.952 45.8135 153.122 46.4435 152.135 46.9055C151.169 47.3465 150.056 47.567 148.796 47.567C147.494 47.567 146.318 47.3045 145.268 46.7795C144.239 46.2335 143.41 45.4145 142.78 44.3225C142.15 43.2095 141.803 41.8025 141.74 40.1015L143.126 41.9915V53.3H138.086ZM147.379 43.346C148.24 43.346 148.985 43.136 149.615 42.716C150.266 42.296 150.77 41.708 151.127 40.952C151.484 40.196 151.663 39.3245 151.663 38.3375C151.663 37.3505 151.484 36.4895 151.127 35.7545C150.77 35.0195 150.277 34.4525 149.647 34.0535C149.017 33.6335 148.261 33.4235 147.379 33.4235C146.623 33.4235 145.909 33.602 145.237 33.959C144.565 34.316 144.019 34.8305 143.599 35.5025C143.2 36.1535 143 36.9515 143 37.8965V39.062C143 39.965 143.21 40.742 143.63 41.393C144.071 42.023 144.628 42.506 145.3 42.842C145.972 43.178 146.665 43.346 147.379 43.346ZM160.518 47V24.005H167.637L172.898 36.92H173.496L178.694 24.005H185.939V47H180.836V27.3755L181.56 27.4385L175.481 42.338H170.567L164.456 27.4385L165.243 27.3755V47H160.518ZM198.718 47.5985C197.248 47.5985 195.946 47.3465 194.812 46.8425C193.699 46.3385 192.765 45.6665 192.009 44.8265C191.274 43.9655 190.707 43.01 190.308 41.96C189.93 40.889 189.741 39.797 189.741 38.684V38.054C189.741 36.899 189.93 35.7965 190.308 34.7465C190.707 33.6755 191.274 32.72 192.009 31.88C192.744 31.04 193.657 30.3785 194.749 29.8955C195.862 29.3915 197.122 29.1395 198.529 29.1395C200.377 29.1395 201.931 29.5595 203.191 30.3995C204.472 31.2185 205.449 32.3 206.121 33.644C206.793 34.967 207.129 36.416 207.129 37.991V39.692H191.851V36.8255H204.073L202.435 38.1485C202.435 37.1195 202.288 36.2375 201.994 35.5025C201.7 34.7675 201.259 34.211 200.671 33.833C200.104 33.434 199.39 33.2345 198.529 33.2345C197.647 33.2345 196.902 33.434 196.293 33.833C195.684 34.232 195.222 34.82 194.907 35.597C194.592 36.353 194.434 37.2875 194.434 38.4005C194.434 39.4295 194.581 40.3325 194.875 41.1095C195.169 41.8655 195.631 42.4535 196.261 42.8735C196.891 43.2935 197.71 43.5035 198.718 43.5035C199.642 43.5035 200.398 43.325 200.986 42.968C201.574 42.611 201.973 42.17 202.183 41.645H206.814C206.562 42.8 206.068 43.829 205.333 44.732C204.598 45.635 203.674 46.3385 202.561 46.8425C201.448 47.3465 200.167 47.5985 198.718 47.5985ZM221.777 47.5985C219.698 47.5985 217.881 47.2415 216.327 46.5275C214.794 45.7925 213.524 44.837 212.516 43.661C211.508 42.464 210.752 41.1725 210.248 39.7865C209.765 38.4005 209.523 37.067 209.523 35.786V35.093C209.523 33.665 209.775 32.258 210.279 30.872C210.804 29.465 211.581 28.1945 212.61 27.0605C213.639 25.9265 214.92 25.0235 216.453 24.3515C217.986 23.6585 219.761 23.312 221.777 23.312C223.793 23.312 225.567 23.6585 227.1 24.3515C228.633 25.0235 229.914 25.9265 230.943 27.0605C231.972 28.1945 232.749 29.465 233.274 30.872C233.799 32.258 234.062 33.665 234.062 35.093V35.786C234.062 37.067 233.81 38.4005 233.306 39.7865C232.802 41.1725 232.046 42.464 231.038 43.661C230.03 44.837 228.749 45.7925 227.195 46.5275C225.662 47.2415 223.856 47.5985 221.777 47.5985ZM221.777 42.779C222.869 42.779 223.845 42.59 224.706 42.212C225.588 41.834 226.334 41.309 226.943 40.637C227.573 39.965 228.045 39.188 228.36 38.306C228.675 37.424 228.833 36.479 228.833 35.471C228.833 34.4 228.665 33.4235 228.329 32.5415C228.014 31.6385 227.541 30.8615 226.911 30.2105C226.302 29.5385 225.567 29.024 224.706 28.667C223.845 28.31 222.869 28.1315 221.777 28.1315C220.685 28.1315 219.708 28.31 218.847 28.667C217.986 29.024 217.241 29.5385 216.611 30.2105C216.002 30.8615 215.54 31.6385 215.225 32.5415C214.91 33.4235 214.752 34.4 214.752 35.471C214.752 36.479 214.91 37.424 215.225 38.306C215.54 39.188 216.002 39.965 216.611 40.637C217.241 41.309 217.986 41.834 218.847 42.212C219.708 42.59 220.685 42.779 221.777 42.779ZM243.52 47.5355C241.525 47.5355 239.992 46.895 238.921 45.614C237.85 44.312 237.315 42.359 237.315 39.755V29.738H242.355V40.007C242.355 40.931 242.617 41.666 243.142 42.212C243.667 42.758 244.371 43.031 245.253 43.031C246.156 43.031 246.891 42.7475 247.458 42.1805C248.025 41.6135 248.308 40.847 248.308 39.881V29.738H253.348V47H249.348V39.7235H249.694C249.694 41.4665 249.463 42.926 249.001 44.102C248.56 45.257 247.899 46.118 247.017 46.685C246.135 47.252 245.043 47.5355 243.741 47.5355H243.52ZM265.839 47.2205C264.096 47.2205 262.689 47.0105 261.618 46.5905C260.547 46.1495 259.759 45.425 259.255 44.417C258.772 43.388 258.531 42.002 258.531 40.259V25.076H263.224V40.448C263.224 41.267 263.434 41.897 263.854 42.338C264.295 42.758 264.915 42.968 265.713 42.968H268.264V47.2205H265.839ZM255.916 33.4235V29.738H268.264V33.4235H255.916Z"
              fill="#100A42"
            />
            <defs>
              <clipPath id="clip0_501_1897">
                <rect width="72" height="72" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <div className="flex gap-x-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                stroke="#120B48"
                stroke-width="1.5"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M1.6665 10.7334V9.2667C1.6665 8.40003 2.37484 7.68336 3.24984 7.68336C4.75817 7.68336 5.37484 6.6167 4.6165 5.30836C4.18317 4.55836 4.4415 3.58336 5.19984 3.15003L6.6415 2.32503C7.29984 1.93336 8.14984 2.1667 8.5415 2.82503L8.63317 2.98336C9.38317 4.2917 10.6165 4.2917 11.3748 2.98336L11.4665 2.82503C11.8582 2.1667 12.7082 1.93336 13.3665 2.32503L14.8082 3.15003C15.5665 3.58336 15.8248 4.55836 15.3915 5.30836C14.6332 6.6167 15.2498 7.68336 16.7582 7.68336C17.6248 7.68336 18.3415 8.3917 18.3415 9.2667V10.7334C18.3415 11.6 17.6332 12.3167 16.7582 12.3167C15.2498 12.3167 14.6332 13.3834 15.3915 14.6917C15.8248 15.45 15.5665 16.4167 14.8082 16.85L13.3665 17.675C12.7082 18.0667 11.8582 17.8334 11.4665 17.175L11.3748 17.0167C10.6248 15.7084 9.3915 15.7084 8.63317 17.0167L8.5415 17.175C8.14984 17.8334 7.29984 18.0667 6.6415 17.675L5.19984 16.85C4.4415 16.4167 4.18317 15.4417 4.6165 14.6917C5.37484 13.3834 4.75817 12.3167 3.24984 12.3167C2.37484 12.3167 1.6665 11.6 1.6665 10.7334Z"
                stroke="#120B48"
                stroke-width="1.5"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99984 18.3334C14.5832 18.3334 18.3332 14.5834 18.3332 10.0001C18.3332 5.41675 14.5832 1.66675 9.99984 1.66675C5.4165 1.66675 1.6665 5.41675 1.6665 10.0001C1.6665 14.5834 5.4165 18.3334 9.99984 18.3334Z"
                stroke="#B6B3C6"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7.6416 12.3583L12.3583 7.6416"
                stroke="#B6B3C6"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12.3583 12.3583L7.6416 7.6416"
                stroke="#B6B3C6"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <p className="my-4 text-sm text-[#413C6D]">
          This extension helps you record and share help videos with ease.
        </p>
        <div className="my-6 mx-6 flex justify-between items-center">
          <div className="grid place-items-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.5865 2.66675H23.3998C28.1465 2.66675 29.3332 3.85341 29.3332 8.58675V17.0267C29.3332 21.7734 28.1465 22.9467 23.4132 22.9467H8.5865C3.85317 22.9601 2.6665 21.7734 2.6665 17.0401V8.58675C2.6665 3.85341 3.85317 2.66675 8.5865 2.66675Z"
                stroke="#928FAB"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16 22.96V29.3333"
                stroke="#928FAB"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2.6665 17.3333H29.3332"
                stroke="#928FAB"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10 29.3333H22"
                stroke="#928FAB"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p className="text-[#928FAB] font-medium text-sm my-3">
              Full screen
            </p>
          </div>
          <div className="grid place-items-center">
            <svg
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.66699 12.4998H3.83366C3.39163 12.4998 2.96771 12.3242 2.65515 12.0117C2.34259 11.6991 2.16699 11.2752 2.16699 10.8332V3.33317C2.16699 2.89114 2.34259 2.46722 2.65515 2.15466C2.96771 1.8421 3.39163 1.6665 3.83366 1.6665H11.3337C11.7757 1.6665 12.1996 1.8421 12.5122 2.15466C12.8247 2.46722 13.0003 2.89114 13.0003 3.33317V4.1665M9.66699 7.49984H17.167C18.0875 7.49984 18.8337 8.24603 18.8337 9.1665V16.6665C18.8337 17.587 18.0875 18.3332 17.167 18.3332H9.66699C8.74652 18.3332 8.00033 17.587 8.00033 16.6665V9.1665C8.00033 8.24603 8.74652 7.49984 9.66699 7.49984Z"
                stroke="#120B48"
                stroke-width="1.67"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p className="text-[#120B48] font-semibold text-sm my-3 mt-4">
              Current Tab
            </p>
          </div>
        </div>
        <div className="mt-6">
          <div className="my-5 border-2 border-[#100A42] rounded-2xl flex justify-between items-center py-3 px-2 w-full">
            <div className="flex items-center gap-x-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.75 10.5L20.4697 5.78033C20.9421 5.30786 21.75 5.64248 21.75 6.31066V17.6893C21.75 18.3575 20.9421 18.6921 20.4697 18.2197L15.75 13.5M4.5 18.75H13.5C14.7426 18.75 15.75 17.7426 15.75 16.5V7.5C15.75 6.25736 14.7426 5.25 13.5 5.25H4.5C3.25736 5.25 2.25 6.25736 2.25 7.5V16.5C2.25 17.7426 3.25736 18.75 4.5 18.75Z"
                  stroke="#0F172A"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p className="text-[#100A42] font-medium">Camera</p>
            </div>
            <div
              className="md:w-12 md:h-7 w-12 h-6 flex items-center bg-[#120B48] rounded-full py-1 cursor-pointer"
              onClick={() => {
                setToggleVideo(!toggleVideo);
              }}
            >
              <div
                className={`bg-white md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform" +  ${
                  toggleVideo ? null : "transform translate-x-6"
                }`}
              ></div>
            </div>
          </div>
          <div className="my-5 border-2 border-[#100A42] rounded-2xl flex justify-between items-center py-3 px-2 w-full">
            <div className="flex items-center gap-x-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z"
                  stroke="#0F172A"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p className="text-[#100A42] font-medium">Audio</p>
            </div>
            <div
              className="md:w-12 md:h-7 w-12 h-6 flex items-center bg-[#120B48] rounded-full py-1 cursor-pointer"
              onClick={() => {
                setToggleAudio(!toggleAudio);
              }}
            >
              <div
                className={`bg-white md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform" +  ${
                  toggleAudio ? null : "transform translate-x-6"
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
  );
}
