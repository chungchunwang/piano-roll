/* eslint-disable react/prop-types */
import { useMutation, useQuery } from "convex/react";
import CustomSquircle from "./CustomSquircle";
// import HandleFileUpload from "./playback-p";
import { api } from "../../convex/_generated/api";
import { parseMidiFile } from "./parse-midi";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

export default function Footer({ tempo, setTempo, volume, setVolume }) {
  const setNotes = useMutation(api.tasks.setMIDI);
  const convexNotesID = useQuery(api.tasks.getMIDIID, { file: "example" });
  const notes = useQuery(api.tasks.getMIDI, { id: convexNotesID });

  function handleFileUpload(event) {
    const file = event.target.files[0];

    if (file && file.name.endsWith(".mid")) {
      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;

          // Convert ArrayBuffer to MIDI data (JSON format)
          const midiJson = await parseMidiFile(arrayBuffer);
          setNotes({
            id: convexNotesID,
            midi: [
              ...midiJson.map((m) => {
                return {
                  duration: m.duration,
                  id: Math.floor(Math.random() * 10000000),
                  pitch: Tone.Frequency(m.name).toMidi(),
                  start: m.start,
                  selected: false,
                };
              }),
            ],
          });
        };

        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Please upload a valid .midi file.");
    }
  }

  function handleExport() {
    const midi = new Midi();
    const track = midi.addTrack();
    notes.map((data) => {
      if (data.pitch) {
        track.addNote({
          midi: data.pitch,
          time: data.start,
          duration: data.duration,
        });
      } else {
        track.addNote({
          name: data.name,
          time: data.start,
          duration: data.duration,
        });
      }
    });

    const blob = new Blob([midi.toArray()], { type: "audio/midi" });

    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const a = document.createElement("a");

    // Set the href of the link to the Blob URL
    a.href = url;

    // Set the filename for the download
    a.download = "output.mid";

    // Programmatically click the link to trigger the download
    a.click();

    // Release the Blob URL
    window.URL.revokeObjectURL(url);

    //   fs.writeFileSync("output.mid", new Buffer(midi.toArray()));
  }

  const playAutoPiano = () => {
    const now = Tone.now();

    // Trigger C4, E4, G4 to simulate a chord
    let synth = new Tone.PolySynth(Tone.Synth).toDestination();
    notes.map((note) => {
      synth.triggerAttackRelease(
        Tone.Frequency(note.pitch, "midi").toNote(),
        note.duration,
        now + note.start
      );
    });
    // synth.triggerAttackRelease("C4", "8n", now);
    // synth.triggerAttackRelease("E4", "8n", now + 0.5);
    // synth.triggerAttackRelease("G4", "8n", now + 1.0);
  };
  return (
    <div className="flex items-center justify-between bg-gray-700 p-4 text-white">
      {/* Left Controls */}
      <div className="flex items-center space-x-4">
        <CustomSquircle
          iconSrc="/assets/icons/play.png"
          play
          button
          altText="Play"
          label="Play"
          onClick={playAutoPiano}
          customStyle={{
            background: "#60A5FA",
            border: "none",
          }}
        />
        <CustomSquircle
          iconSrc="/assets/icons/sound.png"
          sound
          button
          altText="Sound"
          label="Sound"
          onClick={() => console.log("Sound button clicked")}
        />
        <CustomSquircle
          iconSrc="/assets/icons/property.png"
          property
          button
          altText="Property"
          label="Property"
          onClick={() => console.log("Property button clicked")}
        />
      </div>

      <div className="flex items-center space-x-6">
        {/* Tempo Control */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Tempo</span>
          <input
            type="range"
            min="60"
            max="180"
            value={tempo}
            onChange={(e) => setTempo(e.target.value)}
            className="w-32 h-2 bg-gray-600 rounded-full appearance-none"
            style={{
              background: `linear-gradient(to right, #60A5FA 0%, #60A5FA ${
                (tempo - 60) / 1.2
              }%, #4B5563 ${(tempo - 60) / 1.2}%, #4B5563 100%)`,
            }}
          />
          <span className="text-gray-300">{tempo} BPM</span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-32 h-2 bg-gray-600 rounded-full appearance-none"
            style={{
              background: `linear-gradient(to right, #60A5FA 0%, #60A5FA ${volume}%, #4B5563 ${volume}%, #4B5563 100%)`,
            }}
          />
          <span className="text-gray-300">{volume}%</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        <CustomSquircle
          iconSrc="/assets/icons/clear.png"
          altText="Clear"
          label="Clear"
          onClick={() => console.log("Clear button clicked")}
        />
        <CustomSquircle
          iconSrc="/assets/icons/save.png"
          altText="Save"
          label="Save"
          onClick={() => console.log("Save button clicked")}
        />
        <div className="w-[80px] h-[80px] flex justify-center items-center overflow-hidden relative">
          <CustomSquircle
            iconSrc="/assets/icons/export.png"
            altText="Export"
            label="Export"
            onClick={() => handleExport()}
          />
          <input type="file" accept=".mid" onChange={handleFileUpload} className="w-[500px] h-[500px] invisible absolute"/>
        </div>
      </div>
    </div>
  );
}
