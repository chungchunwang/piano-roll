"use client";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PianoRoll from "../components/PianoRoll";

export default function Home() {
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(50); // New state for volume

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
          <PianoRoll />
        </div>
      </div>

      {/* Footer Controls */}
      <Footer
        tempo={tempo}
        setTempo={setTempo}
        volume={volume}
        setVolume={setVolume}
      />
    </div>
  );
}
