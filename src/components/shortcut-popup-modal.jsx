import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

function ShortcutPopupModal({ toChange, changeBindings, display }) {
  const redefs = {
    "!": "1",
    "@": "2",
    "#": "3",
    $: "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
  };
  const [keybinds, setKeybinds] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    setKeybinds([]);
  }, [isOpen]);

  return (
    <>
      <Button onPress={onOpen} className="w-[50%]">
        {display}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onKeyDown={(e) =>
          setKeybinds((keybinds) => {
            if (
              ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"].includes(e.key)
            ) {
              return keybinds.includes(redefs[e.key])
                ? keybinds
                : [...keybinds, redefs[e.key]];
            } else {
                return keybinds.includes(e.key.toLowerCase())
                ? keybinds
                : [...keybinds, e.key.toLowerCase()];
            }
          })
        }
        onKeyUp={(e) =>
          setKeybinds((keybinds) =>
            keybinds.filter((elem) => {
              if (
                ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"].includes(
                  e.key
                )
              ) {
                return elem != redefs[e.key];
              } else {
                return elem != e.key.toLowerCase();
              }
            })
          )
        }
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Key Rebinding:
              </ModalHeader>
              <ModalBody>{keybinds.join(" + ")}</ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                  }}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    changeBindings((c) => {
                      return { ...c, [toChange]: keybinds.join(" + ") };
                    });
                    onClose();
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ShortcutPopupModal;
