import PianoRoll from "./components/PianoRoll"; // Adjust the path accordingly

import { NextUIProvider } from "@nextui-org/react";

function App() {
  return (
    <NextUIProvider>
      <div
        style={{
          position: "absolute",
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
    </NextUIProvider>
  );
}

export default App;
