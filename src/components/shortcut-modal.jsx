import React, { useState } from "react";
import { Modal, Box } from "@mui/material";
import ShortcutPopupModal from "./shortcut-popup-modal";
import { MdOutlineSwitchAccessShortcut } from "react-icons/md";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  height: "50vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  alignItems: "center",
  overflow: "auto",
  padding: "10px 0 10px 0",
  borderRadius: "10px",
};

const ShortcutModal = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [bindings, setBindings] = useState({
    "2nd above": "2",
    "3rd above": "3",
    "4th above": "4",
    "5th above": "5",
    "6th above": "6",
    "7th above": "7",
    "octave above": "8",
    "tonic chord": "shift + 1",
    "supertonic chord": "shift + 2",
    "mediant chord": "shift + 3",
    "subdominant chord": "shift + 4",
    "dominant chord": "shift + 5",
    "submediant chord": "shift + 6",
    "subtonic chord": "shift + 7",
    "leading note chord": "shift + 7",
    "select all": "control + a",
    undo: "control + z",
    redo: "control + y",
    "shift up pitch": "control + arrowup",
    "shift down pitch": "control + arrowdown",
    "AI assistance": "enter",
    delete: "backspace",
  });

  return (
    <>
      <MdOutlineSwitchAccessShortcut
        onClick={handleOpen}
        className="cursor-pointer w-[27px] h-[27px] pt-[4px] fill-[#EEEEEE]"
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{ zIndex: 1 }}
      >
        <Box sx={style} style={{ backgroundColor: "#E2E8F0" }}>
          <div className="h-full w-[90%] flex flex-col gap-3">
            {Object.keys(bindings).map((item, i) => (
              <div className="flex justify-center w-full" key={item + i}>
                <div className="w-[50%] text-center" key={item + i}>
                  {item}
                </div>
                <ShortcutPopupModal
                  key={item}
                  toChange={item}
                  display={bindings[item]}
                  changeBindings={setBindings}
                />
              </div>
            ))}
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default ShortcutModal;
