import { IoMdSend } from "react-icons/io";
import MultiSelect from "./multi-select";
import { useState } from "react";

function AiSideBar() {
  const options = [
    { value: "javascript", label: "JavaScript" },
    { value: "react", label: "React" },
    { value: "css", label: "CSS" },
    { value: "html", label: "HTML" },
  ];
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [details, setDetails] = useState("");

  function handleOnAISubmit(e) {
    e.preventDefault();
    console.log(selectedOptions, details);
  }

  return (
    <form onSubmit={(e) => handleOnAISubmit(e)}>
      <div>
        <p>whats ur mood</p>
        <MultiSelect
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          options={options}
        />
      </div>
      <div>
        <p>more specifics</p>
        <textarea
          className="w-[200px] h-[500px]"
          onChange={(e) => setDetails(e.target.value)}
        ></textarea>
      </div>
      <div></div>
      <button type="submit">
        <IoMdSend />
      </button>
    </form>
  );
}

export default AiSideBar;
