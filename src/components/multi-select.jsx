/* eslint-disable react/prop-types */
import Select from "react-select";

export default function MultiSelect({
  selectedOptions,
  setSelectedOptions,
  options,
}) {
  const handleChange = (options) => {
    setSelectedOptions(options);
  };

  return (
    <div className="w-96">
      <Select
        isMulti
        value={selectedOptions}
        onChange={handleChange}
        options={options}
        className="basic-multi-select"
        classNamePrefix="select"
        placeholder="Select your skills..."
      />
    </div>
  );
}
