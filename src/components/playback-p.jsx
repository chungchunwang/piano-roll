/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { parseMidiFile } from "./parse-midi";

export default function UploadMidiFile({ midiData, setMidiData }) {
  const [error, setError] = useState("");

  // Handle File Upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file && file.name.endsWith(".mid")) {
      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;

          // Convert ArrayBuffer to MIDI data (JSON format)
          const midiJson = await parseMidiFile(arrayBuffer);

          setMidiData(midiJson);
          console.log(midiJson);
        };

        reader.readAsArrayBuffer(file);
      } catch (err) {
        setError("Error reading MIDI file.");
      }
    } else {
      setError("Please upload a valid .midi file.");
    }
  };

  return (
    <div>
      <h2>Upload a MIDI File</h2>
      <input type="file" accept=".mid" onChange={handleFileUpload} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {midiData && <pre>{JSON.stringify(midiData, null, 2)}</pre>}
    </div>
  );
}
