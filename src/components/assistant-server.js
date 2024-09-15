import { GPTPost } from "@/app/api/chatgpt/route";
import AiSideBar from "./ai-assistant";

function AssistantServer({ notes, setNotes }) {
  async function post(details, selectedOptions, music, purpose = "generate") {
    let generatePrompt = `${selectedOptions.join(", ")}
    Based on the previous keywords described to you, as well as the following description:
    ${details}
    you should generate a midi formatted json output of the following format; your response must be in the following format (each object representing a musical note):
[
  {
    "name": [an integer, 0 - 127, be sure not exceed this range, and focus most of your answers outside the extremes],
    "duration": [a floating point value],
    "start": [a floating point value]
  },
  {
    //same as above...
  }
]
your output must contain this json formatted output and the json alone, under no circumstances should extra characters or confirmations be added. Also make sure that the json outputted will be complete, and no curly braces, strings, or brackets remain hanging.`;

    if (music) {
      generatePrompt = `${selectedOptions.join(", ")}
    Based on the previous keywords described to you, as well as the following description:
    ${details}
    you should generate a midi formatted json output of the following format that REPLACES the current music:
    ${JSON.stringify(
      notes.map((note) => {
        return {
          midi: note.pitch,
          start: note.start,
          duration: note.duration,
        };
      })
    )}
    ; your response must be DIFFERENT enough from the music above that was given but different in the ways specificed above in both the detail and the mood section,
    your response should be in the following format (each object representing a musical note):
[
  {
    "name": [an integer, 0 - 127, be sure not exceed this range, and focus most of your answers outside the extremes],
    "duration": [a floating point value],
    "start": [a floating point value]
  },
  {
    //same as above...
  }
]
your output must contain this json formatted output and the json alone, under no circumstances should extra characters or confirmations be added. Also make sure that the json outputted will be complete, and no curly braces, strings, or brackets remain hanging.`;
    }
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: generatePrompt,
      }),
    });
    const res = await response.json();
    console.log(res);
    return res.result;
  }

  return <AiSideBar post={post} notes={notes} setNotes={setNotes} />;
}

export default AssistantServer;
