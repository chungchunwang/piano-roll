/* eslint-disable react/prop-types */
import CustomSquircle from "./CustomSquircle";

export default function Footer({ tempo, setTempo, volume, setVolume }) {
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
          onClick={() => console.log("Play button clicked")}
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
        <CustomSquircle
          iconSrc="/assets/icons/export.png"
          altText="Export"
          label="Export"
          onClick={() => console.log("Export button clicked")}
        />
      </div>
    </div>
  );
}
