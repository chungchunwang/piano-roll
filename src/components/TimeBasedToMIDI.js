const TimeBasedToMIDI = (timeData, BPM) => {
  const midiData = JSON.parse(timeData).map((note) => {
    console.log(note);
    return {
      pitch: note["name"],
      duration: (note["duration"] * BPM) / 60,
      start: (note["start"] * BPM) / 60,
      id: Date.now() + Math.random(),
    };
  });
  return midiData;
};

export default TimeBasedToMIDI;
