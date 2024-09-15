const MIDIToTimeBased = (midiData, BPM) => {
  const timeData = midiData.map((note) => {
    return {
      name: note.pitch,
      duration: (note.duration * 60) / BPM,
      start: (note.start * 60) / BPM,
    };
  });
  return timeData;
};
export default MIDIToTimeBased;
