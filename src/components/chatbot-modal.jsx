import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { IoMdSend } from "react-icons/io";

export default function ChatbotModal() {
  const convexNotesID = useQuery(api.tasks.getMIDIID, { file: "example" });
  const notes = useQuery(api.tasks.getMIDI, { id: convexNotesID });

  const [userConvo, setUserConvo] = useState("");
  const [response, setResponse] = useState("");

  const [history, setHistory] = useState([]);
  const callTalkAPI = useAction(api.functions.talkAPI);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  async function handleOnAISubmit(e) {
    e.preventDefault();
    console.log('fffffffffffff')
    callTalkAPI({
      userConvo: userConvo,
      notes: notes,
    }).then((res) => {
      console.log("res", res);
      setResponse(res);
      setHistory((history) => [...history, ["ai", res]]);
    });
  }

  return (
    <>
      <Button onPress={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="w-[60%] h-[60%] bg-sky-200 flex justify-center items-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                M I T I C H A T
              </ModalHeader>
              <ModalBody className="flex justify-center items-center">
                <div className="w-[400px] flex flex-col gap-[15px] items-center rounded-xl bg-sky-200 max-h-[400px] min-h-[300px] overflow-auto border-4 border-cyan-500 absolute top-0 left-0 text-black">
                  <div>
                    {history.map((msg, i) => {
                      return (
                        <div
                          key={msg[1] + i}
                          className={`${
                            msg[0] == "ai" ? "self-start" : "self-end"
                          } w-[300px] mb-[15px]`}
                        >
                          <div>
                            <span className="bg-slate-100 m-2 p-3 rounded-xl">
                              {msg[0]}
                            </span>
                          </div>
                          <div className="bg-cyan-100 p-4 rounded-xl">
                            {msg[1]?.replace(/\\n/g, "\n")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={(e) => handleOnAISubmit(e)}>
                    <div>
                      <Input
                        placeholder="Ask questions about your music!"
                        onChange={(e) => setUserConvo(e.target.value)}
                      />
                    </div>
                    <button type="submit">
                      <IoMdSend className="w-[30px] h-[30px]" />
                    </button>
                  </form>
                  {response}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
