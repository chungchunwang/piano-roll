import { action } from "./_generated/server";
import { v } from "convex/values";

export const modAPI = action({
  args: { music: v.any(), request: v.string() },
  handler: async (_, args) => {
    let generatePrompt = `Please modify the music according to the following description:
    ${args.request}
    you should generate a midi formatted json output of the following format that REPLACES the current music, make sure that it is simillar in TIME LENGTH:
    ${args.music}
    ; your response must be DIFFERENT enough from the music above that was given but different in the ways specificed above in both the detail section,
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
    const MODEL_ID = "8w6yyp2q";
    const BASETEN_API_KEY = "YMKFudUr.FcjOTi13DlaR3ZtCbBIumoXeqFJy25yx"; // Paste from Discord

    const messages = [
      {
        role: "system",
        content: generatePrompt,
      },
      { role: "user", content: generatePrompt },
    ];

    const payload = {
      messages: messages,
      stream: false,
      max_tokens: 9048,
      temperature: 0.9,
    };

    try {
      const response = await fetch(
        `https://model-${MODEL_ID}.api.baseten.co/production/predict`,
        {
          method: "POST",
          headers: {
            Authorization: `Api-Key ${BASETEN_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
      console.log("The response is", result);
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      return error.messages;
    }
  },
});

export const talkAPI = action({
  args: { notes: v.any(), userConvo: v.string() },
  handler: async (_, args) => {
    let generatePrompt = `Based on the following music formatted like so:
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
  here is the music:
  ${JSON.stringify(
    args.notes.map((note) => {
      return {
        midi: note.pitch,
        start: note.start,
        duration: note.duration,
      };
    })
  ).slice(0, 1000)}
  answer the following question comprehensively, your answer should revolve around creativity, composition, and useful tips in music and music production; also remember to keep your answers short and concise, only having long answers if the user requests it, and remember the limitations of this program, which is that it is manipulating MIDI: ${args.userConvo}`;
    const MODEL_ID = "8w6yyp2q";
    const BASETEN_API_KEY = "YMKFudUr.FcjOTi13DlaR3ZtCbBIumoXeqFJy25yx"; // Paste from Discord

    const messages = [
      {
        role: "system",
        content: generatePrompt,
      },
      { role: "user", content: generatePrompt },
    ];

    const payload = {
      messages: messages,
      stream: false,
      max_tokens: 9048,
      temperature: 0.9,
    };

    try {
      const response = await fetch(
        `https://model-${MODEL_ID}.api.baseten.co/production/predict`,
        {
          method: "POST",
          headers: {
            Authorization: `Api-Key ${BASETEN_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
      console.log("The response is", result);
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      return error.messages;
    }
  },
});
