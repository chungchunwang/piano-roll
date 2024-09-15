import { parseMidi } from "midi-file";
import { Midi } from "@tonejs/midi";

export async function parseMidiFile(arrayBuffer) {
  try {
    // Convert the ArrayBuffer to a Uint8Array
    const byteArray = new Uint8Array(arrayBuffer);

    // Parse the MIDI file
    const midiData = new Midi(byteArray);

    let note_array = [];

    midiData.tracks.forEach((track) => {
      //tracks have notes and controlChanges

      //notes are an array
      const notes = track.notes;
      notes.forEach((note) => {
        note_array.push({
          name: note.name
            ? note.name
            : Tone.Frequency(note.midi, "midi").toNote(),
          duration: note.duration,
          start: note.time,
        });
        //note.midi, note.time, note.duration, note.name
      });

      //the control changes are an object
      //the keys are the CC number
      //   track.controlChanges[64];
      //they are also aliased to the CC number's common name (if it has one)
      //   track.controlChanges.sustain.forEach((cc) => {
      //     // cc.ticks, cc.value, cc.time
      //   });

      //the track also has a channel and instrument
      //track.instrument.name
    });

    // Log or return the parsed MIDI data
    console.log(midiData);
    return note_array;
  } catch (error) {
    console.error("Error parsing MIDI file:", error);
    throw error;
  }
}
