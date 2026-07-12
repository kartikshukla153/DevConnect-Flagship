import { useState } from "react";

function VoiceRecorder() {
  const [recording, setRecording] = useState(false);

  const handleClick = () => {
    setRecording(!recording);

    alert(
      "Voice recording will be re-enabled later using the browser MediaRecorder API."
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full p-2 transition ${
        recording
          ? "bg-red-500 text-white"
          : "hover:bg-gray-700"
      }`}
      title="Voice Message"
    >
      🎤
    </button>
  );
}

export default VoiceRecorder;