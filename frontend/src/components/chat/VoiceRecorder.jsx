import { useRef, useState } from "react";
import MicRecorder from "mic-recorder-to-mp3";

const recorder = new MicRecorder({
  bitRate: 128,
});

function VoiceRecorder({ setSelectedFile }) {
  const [recording, setRecording] = useState(false);
  const recorderStarted = useRef(false);

  const startRecording = async () => {
    try {
      await recorder.start();
      recorderStarted.current = true;
      setRecording(true);
    } catch (err) {
      console.log(err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recorderStarted.current) return;

      const [, blob] = await recorder.stop().getMp3();

      recorderStarted.current = false;
      setRecording(false);

      const file = new File(
        [blob],
        `voice-${Date.now()}.mp3`,
        {
          type: "audio/mp3",
        }
      );

      setSelectedFile(file);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <button
      type="button"
      onClick={
        recording
          ? stopRecording
          : startRecording
      }
      className={`rounded-full p-2 transition ${
        recording
          ? "bg-red-500 text-white animate-pulse"
          : "hover:bg-gray-700"
      }`}
      title="Voice Message"
    >
      🎤
    </button>
  );
}

export default VoiceRecorder;