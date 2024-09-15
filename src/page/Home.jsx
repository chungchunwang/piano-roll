"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PianoRoll from "../components/PianoRoll";
import Instruments from "webaudio-instruments";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const [bpm, setBPM] = useState(120);
  const [volume, setVolume] = useState(50); // New state for volume
  const [playback, setPlayback] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  const [playbackInterval, setPlaybackInterval] = useState(null);

  const convexNotesID = useQuery(api.tasks.getMIDIID, { file: "example" });
  const notes = useQuery(api.tasks.getMIDI, { id: convexNotesID });

  let player = new Instruments();

  useEffect(() => {
    clearInterval(playbackInterval);
    if (playback) {
      const interval = setInterval(
        () => setPlaybackPosition((prevState) => prevState + 0.1),
        60000 / bpm / 4 / 20
      );
      setPlaybackInterval(interval);
      clearInterval(playbackInterval);
    }
  }, [playback]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log(e.key);
      if (e.key === " ") {
        setPlayback((prevState) => !prevState);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-300">
      <Header />
      {/* <SynthPiano /> */}

      {/* Main Grid, add the piano UI here */}
      <div className="flex-grow flex justify-center items-center">
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            top: 0,
            display: "grid",
            backgroundColor: "black",
            margin: 0,
            padding: 0,
          }}
        >
          <PianoRoll
            BPM={bpm}
            playbackPosition={playbackPosition}
            setPlaybackPosition={setPlaybackPosition}
            setPlayback={setPlayback}
            playback={playback}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <Footer
        tempo={bpm}
        setTempo={setBPM}
        volume={volume}
        setVolume={setVolume}
        setPlayback={setPlayback}
        playback={playback}
      />
    </div>
  );
}
