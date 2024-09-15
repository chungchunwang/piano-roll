async function MidiJsonEdit(music, request) {
  let generatePrompt = `Please modify the music according to the following description:
    ${request}
    you should generate a midi formatted json output of the following format that REPLACES the current music, make sure that it is simillar in TIME LENGTH:
    ${music}
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
  //   console.log(res);
  let mus = JSON.parse(res.result);
  //   console.log("this is mus", typeof mus);
  let musx = JSON.parse(mus);
  //   console.log("this is musx", typeof musx);

  return musx;
}

export default MidiJsonEdit;
