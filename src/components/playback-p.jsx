"use client";

import { useState } from "react";
import { parseMidiFile } from "./parse-midi";
import * as Tone from "tone";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function HandleFileUpload(event) {
  const setNotes = useMutation(api.tasks.setMIDI);
  const file = event.target.files[0];

  if (file && file.name.endsWith(".mid")) {
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;

        // Convert ArrayBuffer to MIDI data (JSON format)
        const midiJson = await parseMidiFile(arrayBuffer);

        console.log("midiJson", midiJson);

        setNotes((notes) => [
          ...notes,
          ...midiJson.map((m) => {
            console.log(m);
            return {
              duration: m.duration,
              id: Math.floor(Math.random() * 10000000),
              pitch: Tone.Frequency(m.name).toMidi(),
              start: m.start,
              selected: false,
            };
          }),
        ]);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("Please upload a valid .midi file.");
  }
}

// export default function UploadMidiFile() {
//   const [error, setError] = useState("");

//   // const convexNotesID = useQuery(api.tasks.getMIDIID, { file: "example" });
//   // const notes = useQuery(api.tasks.getMIDI, { id: convexNotesID });
//   const setNotes = useMutation(api.tasks.setMIDI);

//   // Handle File Upload
//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];

//     if (file && file.name.endsWith(".mid")) {
//       try {
//         const reader = new FileReader();

//         reader.onload = async (e) => {
//           const arrayBuffer = e.target.result;

//           // Convert ArrayBuffer to MIDI data (JSON format)
//           const midiJson = await parseMidiFile(arrayBuffer);

//           setMidiData(midiJson);
//           console.log("midiJson", midiJson);

//           setNotes((notes) => [
//             ...notes,
//             ...midiJson.map((m) => {
//               console.log(m);
//               return {
//                 duration: m.duration,
//                 id: Math.floor(Math.random() * 10000000),
//                 pitch: Tone.Frequency(m.name).toMidi(),
//                 start: m.start,
//                 selected: false,
//               };
//             }),
//           ]);
//         };

//         reader.readAsArrayBuffer(file);
//       } catch (err) {
//         setError("Error reading MIDI file.");
//       }
//     } else {
//       setError("Please upload a valid .midi file.");
//     }
//   };

//   return (
//     <div>
//       <h2>Upload a MIDI File</h2>
//       <input type="file" accept=".mid" onChange={handleFileUpload} />
//       {/* {error && <p style={{ color: "red" }}>{error}</p>}
//       {midiData && <pre>{JSON.stringify(midiData, null, 2)}</pre>} */}
//     </div>
//   );
// }
