"use client";

// components/Modal.js
import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { LiaFilterSolid } from "react-icons/lia";
import {

  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem
} from "@nextui-org/react";

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

const FilterModal = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  
  return (

    <>

      
      <LiaFilterSolid
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
        <div className="h-full w-[90%] flex flex-col gap-3 bg-gray-200">

          <Dropdown>
                  <DropdownTrigger>
                  <Button variant="bordered">Dropdown
                    
                  </Button>
                    
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="One">1</DropdownItem>
                    <DropdownItem key="Two">2</DropdownItem>
                    <DropdownItem key="Three">3</DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                    >
                      lol
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>

          </div>
        </Box>
      </Modal>


      
    </>
  );
  
};

export default FilterModal;
