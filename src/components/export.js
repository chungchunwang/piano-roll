import { Midi } from "@tonejs/midi";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function Export(jsonData) {
  const setNotes = useMutation(api.tasks.setMIDI);
  const convexNotesID = useQuery(api.tasks.getMIDIID, { file: "example" });
  const midi = new Midi();
  const track = midi.addTrack();
  jsonData.map((data) => {
    if (data.midi) {
      track.addNote({
        midi: data.midi,
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

  console.log(midi.toArray());

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

export default Export;
