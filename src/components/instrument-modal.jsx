import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
// import * as Tone from "tone";

function InstrumentsDropdown({ setInst }) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" className="min-h-6">
          Open Menu
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        className="max-h-[500px] overflow-auto"
        onAction={(key) => setInst(key)}
      >
        <DropdownItem key={"0"}>PolySynth</DropdownItem>
        <DropdownItem key={"1"}>AMSynth</DropdownItem>
        <DropdownItem key={"2"}>DUOSynth</DropdownItem>
        <DropdownItem key={"3"}>FMSynth</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default InstrumentsDropdown;
