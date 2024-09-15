"use client";

import { useRef, useState } from "react";
import * as Tone from "tone";
import UploadMidiFile from "./playback-p";

export const playAutoPiano = (midiData) => {
  const now = Tone.now();

  console.log(midiData, "mididata", midiData[0]);

  // Trigger C4, E4, G4 to simulate a chord
  let synth = new Tone.PolySynth(Tone.Synth).toDestination();
  midiData.map((note) => {
    let l;
    if (note.midi) {
      l = Tone.Frequency(note.midi, "midi").toNote();
    } else {
      l = note.name;
    }
    synth.triggerAttackRelease(l, note.duration, now + note.start);
  });
  // synth.triggerAttackRelease("C4", "8n", now);
  // synth.triggerAttackRelease("E4", "8n", now + 0.5);
  // synth.triggerAttackRelease("G4", "8n", now + 1.0);
};

export default function SynthPiano() {
  const synth = useRef(null);
  const [midiData, setMidiData] = useState(null);

  const playPiano = () => {
    if (!synth.current)
      synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();

    Tone.context.resume();

    // Trigger C4, E4, G4 to simulate a chord
    midiData.map((note) => {
      synth.current.triggerAttackRelease(
        note.name,
        note.duration,
        now + note.start
      );
    });
    // synth.triggerAttackRelease("C4", "8n", now);
    // synth.triggerAttackRelease("E4", "8n", now + 0.5);
    // synth.triggerAttackRelease("G4", "8n", now + 1.0);
  };

  return (
    <div>
      <UploadMidiFile midiData={midiData} setMidiData={setMidiData}/>
      {/* <button onClick={() => Tone.start().then(playPiano)}>Play Piano</button>
      <button
        onClick={() => {
          Tone.Transport.cancel();
          Tone.Transport.stop();
          Tone.getTransport().cancel();
          Tone.getTransport().stop();

          // Manually release any synths that are playing
          if (synth.current) synth.current.triggerRelease();
          //   Tone.context.close();
        }}
      >
        stop
      </button> */}
    </div>
  );
}
