import React, { useEffect, useState, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { mux } from "@/config";
import rpc from "@/components/Rpc";
const CAMERA_CONSTRAINTS = {
  audio: true,
  video: true,
  video: { width: 960, height: 540 },
};

export default (props) => {
  const index = props?.index;

  const [connected, setConnected] = useState(false);

  const wsRef = useRef();

  const mediaRecorderRef = useRef();

  const [data, setData] = useState({ live: false });

  const startCamera = async () => {
    try {
      const inputStream = await navigator.mediaDevices.getUserMedia(
        CAMERA_CONSTRAINTS
      );

      const videoElement = document.querySelector("#camera-video");
      if (videoElement) {
        videoElement.srcObject = inputStream;
        await videoElement.play();
      }
      const live = await rpc.startLive(index);

      const streamKey = live?.streamKey;

      wsRef.current = new WebSocket(mux.ws + "?key=" + streamKey);

      wsRef.current.addEventListener("open", function open() {
        setConnected(true);
      });

      wsRef.current.addEventListener("close", () => {
        setConnected(false);
        stopCamera();
      });

      mediaRecorderRef.current = new MediaRecorder(inputStream, {
        mimeType: "video/webm",
        videoBitsPerSecond: 3000000,
      });

      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        wsRef.current.send(e.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        stopCamera();
        wsRef.current.close();
      });

      mediaRecorderRef.current.start(1000);

      setData({ ...data, inputStream, cameraEnabled: true });
    } catch (error) {
      console.error("live failure: ", error);
    }
  };

  const stopCamera = async () => {
    if (data.inputStream) {
      const tracks = data.inputStream.getTracks();
      tracks.forEach((track) => track.stop());

      const videoElement = document.querySelector("#camera-video");
      if (videoElement) {
        videoElement.srcObject = null;
      }

      mediaRecorderRef.current.stop();

      await rpc.stopLive(index);
      setData({ ...data, cameraEnabled: false });
    }
  };

  async function fetchData() {
    const liveStream = await rpc.getLive(index);
    setData({ ...data, liveStream });
  }

  useEffect(() => {
    fetchData();
  }, [index]);
  console.log(data);
  const isDeployer = props?.isDeployer;
  return (
    <div>
      {isDeployer && (
        <>
          {!data?.live && (
            <>
              <div
                className="btn"
                onClick={() => {
                  setData({ ...data, live: true });
                }}
              >
                Start Live
              </div>
            </>
          )}
          {data?.live && (
            <>
              {!data?.cameraEnabled && (
                <div className="btn" onClick={startCamera}>
                  Enable Camera
                </div>
              )}
              {data?.cameraEnabled && (
                <>
                  <div className="btn" onClick={stopCamera}>
                    Stop Camera
                  </div>
                </>
              )}

              <div className="font-black">
                {connected ? "Connected" : "DisConnected"}
              </div>
              <div className="row">
                <div className="column">
                  <video
                    id="camera-video"
                    controls
                    className="w-full h-auto"
                  ></video>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {!isDeployer && data?.liveStream?.live && (
        <MuxPlayer
          streamType="live"
          playbackId={data?.liveStream?.playbackId}
          metadataVideoTitle="Placeholder (optional)"
          metadataViewerUserId="Placeholder (optional)"
          primaryColor="#FFFFFF"
          secondaryColor="#000000"
        />
      )}
    </div>
  );
};
