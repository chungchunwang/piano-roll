/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

// To whom it may concern, I apologize for this monolith of a file. Unfortuately, it is the fastest way for me to iterate, and desperate hackmit times call for desperate measures. - Yours, Jason Wang

import Select from "react-select";
import { useState, useRef, useEffect } from "react";
import { FaBoltLightning } from "react-icons/fa6";
import MIDIToTimeBased from "./MIDIToTimeBased";

import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { use } from "framer-motion/client";
import TimeBasedToMIDI from "./TimeBasedToMIDI";

const NUM_MIDI_KEYS = 128; // Total number of MIDI keys
const KEY_HEIGHT = 20; // Height of each key
const BEAT_WIDTH = 100; // Width of one beat
const NUM_BEATS = 500; // Total number of beats
const BEATS_PER_BAR = 4; // Beats per bar (e.g., 4 for 4/4 time signature)
const PIANO_KEY_WIDTH = 50; // Width of piano keys area
const TIME_RULER_HEIGHT = 25; // Height of time ruler
const CANVAS_WIDTH = 800; // Total width of the canvas
const CANVAS_HEIGHT = 600; // Height of the piano roll area

// Function to determine if a MIDI key is a black key
const isBlackKey = (midiNumber) => {
  const noteInOctave = midiNumber % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
};

// Function to get the note name from MIDI number
const getNoteName = (midiNumber) => {
  const noteNames = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
  ];
  const octave = Math.floor(midiNumber / 12) - 1;
  const note = noteNames[midiNumber % 12];
  return `${note}${octave}`;
};

function calculateZoomSettings(zoomX) {
  let subdivision = 1;
  let barStep = 1;
  if (zoomX > 4) {
    subdivision = 16; // Show 16th notes
    barStep = 1;
  } else if (zoomX > 1.5) {
    subdivision = 4; // Show sub-beats (quarters)
    barStep = 1;
  } else if (zoomX > 0.1) {
    subdivision = 1; // Only main beats
    barStep = 1; // Show every bar
  } else if (zoomX > 0.05) {
    subdivision = 1;
    barStep = 2; // Show every other bar
  } else {
    subdivision = 1;
    barStep = 4; // Show every 4 bars
  }
  return [subdivision, barStep];
}

const PianoRoll = (props) => {
  let beats_per_minute = props.BPM;
  let playbackPosition = props.playbackPosition;
  let setPlaybackPosition = props.setPlaybackPosition;

  const callModAPI = useAction(api.functions.modAPI);

  // State variables for zoom and scroll positions
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [zoomX, setZoomX] = useState(1);
  const [zoomY, setZoomY] = useState(1);

  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_HEIGHT);

  // Modifier keys state
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isEnterPressed, setIsEnterPressed] = useState(false);

  const [actionPageOpen, setActionPageOpen] = useState(false);
  const [chatPageOpen, setChatPageOpen] = useState(false);

  const [isChatLoading, setIsChatLoading] = useState(false);

  // Refs to handle canvas elements
  const gridCanvasRef = useRef(null);
  const pianoCanvasRef = useRef(null);
  const timeRulerCanvasRef = useRef(null);
  const actionSearchBar = useRef(null);
  const chatBoxBar = useRef(null);

  const { isSignedIn, user, isLoaded } = useUser();

  // State to store MIDI notes
  const convexNotesID = useQuery(api.tasks.getMIDIID, { file: "example" });
  const notes = useQuery(api.tasks.getMIDI, { id: convexNotesID });
  const setNotes = useMutation(api.tasks.setMIDI);

  const cursors = useQuery(api.tasks.getCursors, { id: convexNotesID });
  const setCursors = useMutation(api.tasks.setCursors);

  const [selectedNotes, setSelectedNotes] = useState([]);

  const [tempDraggingNotes, setTempDraggingNotes] = useState([]);

  // State for mouse interaction
  const [isDragging, setIsDragging] = useState(false);
  const [draggingNoteId, setDraggingNoteId] = useState(null);
  const [draggingType, setDraggingType] = useState(null); // 'move', 'resizeStart', 'resizeEnd'
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [initialNotesState, setInitialNotesState] = useState([]);
  const [cursorStyle, setCursorStyle] = useState("default");

  // State for selection box
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  // State for playback bar
  const [isDraggingPlayback, setIsDraggingPlayback] = useState(false); // New state variable

  //State for virtual cursor
  const [virtualCursorPosition, setVirtualCursorPosition] = useState({
    x: 0,
    y: 0,
  }); // New state variable

  //State for virtual bookmark
  const [bookmarkCursorPosition, setBookmarkCursorPosition] = useState({
    x: 0,
    y: 0,
  }); // New state variable

  // State for middle mouse panning
  const [isMiddleMouseDragging, setIsMiddleMouseDragging] = useState(false); // New state variable
  const [lastMiddleMousePosition, setLastMiddleMousePosition] = useState({
    x: 0,
    y: 0,
  }); // New state variable

  // State for default note duration
  const [defaultNoteDuration, setDefaultNoteDuration] = useState(1); // New state variable

  // State for copied notes
  const [copiedNotes, setCopiedNotes] = useState([]); // New state variable

  // Calculate total height of the piano roll
  const totalPianoRollHeight = NUM_MIDI_KEYS * KEY_HEIGHT * zoomY;
  const maxScrollY = Math.max(0, totalPianoRollHeight - canvasHeight);
  const minScrollY = 0;

  // Calculate total width of the piano roll
  const totalPianoRollWidth = NUM_BEATS * BEAT_WIDTH * zoomX;

  const MAX_VISIBLE_BARS = 100;

  useEffect(() => {
    if (isCtrlPressed && isAltPressed && !actionPageOpen) {
      setActionPageOpen(true);
    }
  }, [isCtrlPressed, isAltPressed, actionPageOpen]);

  useEffect(() => {
    if (isCtrlPressed && isShiftPressed && !chatPageOpen) {
      setChatPageOpen(true);
    }
  }, [isCtrlPressed, isShiftPressed, chatPageOpen]);

  useEffect(() => {
    if (actionPageOpen) actionSearchBar.current.focus();
  }, [actionPageOpen]);

  useEffect(() => {
    if (chatPageOpen) chatBoxBar.current.focus();
  }, [chatPageOpen]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Call the handler once to set the initial dimensions
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle wheel events for scrolling and zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const MAX_SCROLL_X = Math.max(
      0,
      totalPianoRollWidth - (canvasWidth - PIANO_KEY_WIDTH)
    );
    const MIN_SCROLL_X = 0;
    // Limit zoom out to encompass at most 100 bars
    const MIN_ZOOM_X =
      (canvasWidth - PIANO_KEY_WIDTH) /
      (BEAT_WIDTH * BEATS_PER_BAR * MAX_VISIBLE_BARS);
    const gridCanvas = gridCanvasRef.current;
    const rect = gridCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isCtrlPressed && !isAltPressed && !isShiftPressed) {
      // Resize horizontally, centered at mouse position
      const worldX = (mouseX + scrollX) / zoomX;

      let newZoomX = zoomX * (e.deltaY > 0 ? 0.9 : 1.1);
      newZoomX = Math.max(MIN_ZOOM_X, newZoomX); // Limit zoom out

      // Compute new scrollX to keep the worldX under the mouse
      let newScrollX = worldX * newZoomX - mouseX;

      // Clamp newScrollX to valid range
      const newTotalWidth = NUM_BEATS * BEAT_WIDTH * newZoomX;
      const newMaxScrollX = Math.max(
        0,
        newTotalWidth - (canvasWidth - PIANO_KEY_WIDTH)
      );
      newScrollX = Math.max(0, Math.min(newScrollX, newMaxScrollX));

      setZoomX(newZoomX);
      setScrollX(newScrollX);
    } else if (isShiftPressed) {
      // Resize vertically, centered at mouse position
      const worldY = (mouseY + scrollY) / zoomY;

      let newZoomY = zoomY * (e.deltaY > 0 ? 0.9 : 1.1);
      newZoomY = Math.max(0.1, newZoomY);

      // Compute new scrollY to keep the worldY under the mouse
      let newScrollY = worldY * newZoomY - mouseY;

      // Clamp newScrollY to valid range
      const newTotalHeight = NUM_MIDI_KEYS * KEY_HEIGHT * newZoomY;
      const newMaxScrollY = Math.max(0, newTotalHeight - canvasHeight);
      newScrollY = Math.max(0, Math.min(newScrollY, newMaxScrollY));

      setZoomY(newZoomY);
      setScrollY(newScrollY);
    } else if (isAltPressed) {
      // Move horizontally (more fine-grained)
      let newScrollX = scrollX + e.deltaY * 0.2; // Adjusted for finer scrolling
      newScrollX = Math.max(MIN_SCROLL_X, Math.min(newScrollX, MAX_SCROLL_X));
      setScrollX(newScrollX);
    } else {
      // Handle horizontal and vertical scrolling
      if (e.deltaY !== 0) {
        // Vertical scrolling
        let newScrollY = scrollY + e.deltaY;
        newScrollY = Math.max(minScrollY, Math.min(newScrollY, maxScrollY));
        setScrollY(newScrollY);
      }
      if (e.deltaX !== 0) {
        // Horizontal scrolling
        let newScrollX = scrollX + e.deltaX;
        newScrollX = Math.max(MIN_SCROLL_X, Math.min(newScrollX, MAX_SCROLL_X));
        setScrollX(newScrollX);
      }
    }
  };

  useEffect(() => {
    const gridCanvas = gridCanvasRef.current;
    gridCanvas.addEventListener("wheel", handleWheel);

    const handleKeyDown = (e) => {
      const MAX_SCROLL_X = Math.max(
        0,
        totalPianoRollWidth - (canvasWidth - PIANO_KEY_WIDTH)
      );
      const MIN_SCROLL_X = 0;
      // Limit zoom out to encompass at most 100 bars
      const MIN_ZOOM_X =
        (canvasWidth - PIANO_KEY_WIDTH) /
        (BEAT_WIDTH * BEATS_PER_BAR * MAX_VISIBLE_BARS);
      if (e.key === "Alt") {
        setIsAltPressed(true);
      }
      if (e.key === "Control") {
        setIsCtrlPressed(true);
      }
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
      if (e.key === "Space") {
        setIsSpacePressed(true);
      }
      if (e.key === "Enter") {
        setIsEnterPressed(true);
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        // Delete selected notes
        console.log("Deleting selected notes");
        console.log(selectedNotes);
        console.log(
          notes.filter(
            (note) => !selectedNotes.some((snote) => snote === note.id)
          )
        );
        setNotes({
          midi: notes.filter(
            (note) => !selectedNotes.some((snote) => snote === note.id)
          ),
          id: convexNotesID,
        });
      }
      if (e.key === "ArrowLeft") {
        // Scroll left
        let newScrollX = scrollX - 20; // Adjust the scroll amount as needed
        newScrollX = Math.max(MIN_SCROLL_X, Math.min(newScrollX, MAX_SCROLL_X));
        setScrollX(newScrollX);
      }
      if (e.key === "ArrowRight") {
        // Scroll right
        let newScrollX = scrollX + 20; // Adjust the scroll amount as needed
        newScrollX = Math.max(MIN_SCROLL_X, Math.min(newScrollX, MAX_SCROLL_X));
        setScrollX(newScrollX);
      }

      // Handle Copy (Ctrl+C)
      if (notes && e.key.toLowerCase() === "c" && isCtrlPressed) {
        // Copy selected notes
        const selectedNotes = notes.filter((note) =>
          selectedNotes.includes(note.id)
        );
        if (selectedNotes.length > 0) {
          // Copy the notes, adjust so that the earliest note starts at 0
          const earliestStart = Math.min(
            ...selectedNotes.map((note) => note.start)
          );
          const notesToCopy = selectedNotes.map((note) => ({
            ...note,
            start: note.start - earliestStart,
          }));
          setCopiedNotes(notesToCopy);
        }
      }

      // Handle Paste (Ctrl+V)
      if (e.key.toLowerCase() === "v" && isCtrlPressed) {
        // Paste copied notes at the playback bar
        if (copiedNotes.length > 0) {
          const pasteStart = playbackPosition;
          const newNotes = copiedNotes.map((note) => ({
            ...note,
            id: Date.now() + Math.random(), // Ensure unique ID
            start: note.start + pasteStart,
            selected: true,
          }));
          // Deselect existing notes and add new notes
          setSelectedNotes([]);
          setNotes({
            midi: [...notes.map((note) => ({ ...note })), ...newNotes],
            id: convexNotesID,
          });
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Alt") {
        setIsAltPressed(false);
      }
      if (e.key === "Control") {
        setIsCtrlPressed(false);
      }
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
      if (e.key === "Space") {
        setIsSpacePressed(false);
      }
      if (e.key == "Enter") {
        setIsEnterPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      gridCanvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    isAltPressed,
    isCtrlPressed,
    isShiftPressed,
    isSpacePressed,
    isEnterPressed,
    scrollX,
    scrollY,
    zoomX,
    zoomY,
    maxScrollY,
    notes,
    playbackPosition,
    copiedNotes,
    handleWheel,
    totalPianoRollWidth,
    canvasWidth,
    selectedNotes,
    setNotes,
    convexNotesID,
  ]);

  // Function to determine grid size based on zoom level
  const determineGridSize = (zoomLevel) => {
    if (zoomLevel > 2.5) {
      return 1 / 16; // 16th notes
    } else if (zoomLevel > 1.5) {
      return 1 / 4; // Quarter notes
    } else {
      return 1; // Whole notes
    }
  };

  // Function to snap to grid if close, otherwise return null
  const snapToGrid = (value, zoomLevel) => {
    const gridSize = determineGridSize(zoomLevel);

    // Determine if the value is close enough to snap
    const snapThreshold = gridSize * 0.3; // 30% of the grid size
    const remainder = value % gridSize;
    if (remainder <= snapThreshold || remainder >= gridSize - snapThreshold) {
      return Math.round(value / gridSize) * gridSize;
    } else {
      return null; // Return null to indicate no snapping
    }
  };

  // Function to get the grid line to the left of a given value
  const getGridLineToLeft = (value, gridSize) => {
    return Math.floor(value / gridSize) * gridSize;
  };

  // Function to draw the time ruler
  const drawTimeRuler = () => {
    const canvas = timeRulerCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const devicePixelRatio = window.devicePixelRatio || 1;

    const timeRulerCanvasWidth = canvasWidth - PIANO_KEY_WIDTH;
    const timeRulerCanvasHeight = TIME_RULER_HEIGHT;

    // Adjust canvas size for high DPI displays
    canvas.width = timeRulerCanvasWidth * devicePixelRatio;
    canvas.height = timeRulerCanvasHeight * devicePixelRatio;
    canvas.style.width = `${timeRulerCanvasWidth}px`;
    canvas.style.height = `${timeRulerCanvasHeight}px`;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear the canvas and fill background color
    ctx.clearRect(0, 0, timeRulerCanvasWidth, timeRulerCanvasHeight);
    ctx.fillStyle = "#102436"; // Time ruler background color
    ctx.fillRect(0, 0, timeRulerCanvasWidth, timeRulerCanvasHeight);

    // Determine level of detail based on zoomX
    let [subdivision, barStep] = calculateZoomSettings(zoomX);

    // Set styles
    ctx.strokeStyle = "#FFFFFF"; // Beat lines in white
    ctx.fillStyle = "#FFFFFF"; // Text in white
    ctx.font = "10px Arial"; // Smaller numbers
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const beatWidth = BEAT_WIDTH * zoomX;
    const subBeatWidth = beatWidth / subdivision;

    const totalBars = Math.ceil(NUM_BEATS / BEATS_PER_BAR);

    for (let bar = 0; bar <= totalBars; bar += barStep) {
      const barStartBeat = bar * BEATS_PER_BAR;
      const x = barStartBeat * beatWidth - scrollX;

      // Draw bar number label, moved 5px to the right
      if (x >= -beatWidth && x <= timeRulerCanvasWidth && subdivision == 1) {
        ctx.fillText(`${bar + 1}`, x + 5, 0);
        // Draw bar line (more prominent)
        ctx.strokeStyle = "#FFFFFF"; // White bar lines
        ctx.lineWidth = 1; // Thinner line
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, timeRulerCanvasHeight / 2); // Half the length
        ctx.stroke();
      }

      if (barStep === 1) {
        // Now draw beats within the bar
        for (let beatInBar = 1; beatInBar <= BEATS_PER_BAR; beatInBar++) {
          const beat = barStartBeat + beatInBar - 1;
          if (beat >= NUM_BEATS) break;

          const beatX = beat * beatWidth - scrollX;

          if (beatX < -beatWidth || beatX > timeRulerCanvasWidth) continue;

          // Draw beat label if zoomed in enough
          if (subdivision == 4) {
            ctx.fillText(
              `${bar + 1}.${beatInBar}`,
              beatX + 2,
              timeRulerCanvasHeight / 2
            );
          } else {
            // Draw beat line
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 0.5; // Half the size
            ctx.beginPath();
            ctx.moveTo(beatX, timeRulerCanvasHeight / 2);
            ctx.lineTo(beatX, timeRulerCanvasHeight * 0.75); // Shorter line
            ctx.stroke();
          }

          // Draw subdivisions if zoomed in
          if (subdivision > 1 && beat < NUM_BEATS - 1) {
            for (let sub = 1; sub < subdivision; sub++) {
              const subX = beatX + sub * subBeatWidth;
              if (subX < -beatWidth || subX > timeRulerCanvasWidth) continue;

              // Draw subdivision line
              ctx.strokeStyle = subdivision === 16 ? "#666666" : "#AAAAAA";
              ctx.lineWidth = 0.5; // Half the size
              ctx.beginPath();
              ctx.moveTo(subX, timeRulerCanvasHeight * 0.75);
              ctx.lineTo(subX, timeRulerCanvasHeight); // Shorter line
              ctx.stroke();

              // Draw subdivision labels for 16th notes
              if (subdivision === 16 && zoomX > 2.5) {
                const subBeatNumber = sub + 1;
                ctx.fillText(
                  `${bar + 1}.${beatInBar}.${subBeatNumber}`,
                  subX + 2,
                  timeRulerCanvasHeight * 0.5
                );
              }
            }
          }
        }
      }
    }

    // Draw the playback position triangle and line
    const playbackX = playbackPosition * BEAT_WIDTH * zoomX - scrollX;

    if (playbackX >= 0 && playbackX <= timeRulerCanvasWidth) {
      // Draw the triangle
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.moveTo(playbackX - 6, 0);
      ctx.lineTo(playbackX + 6, 0);
      ctx.lineTo(playbackX, timeRulerCanvasHeight / 2);
      ctx.closePath();
      ctx.fill();

      // Draw the vertical line down
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playbackX, timeRulerCanvasHeight / 2);
      ctx.lineTo(playbackX, timeRulerCanvasHeight);
      ctx.stroke();
    }
  };

  // Function to draw piano keys and key names
  const drawPianoKeys = () => {
    const canvas = pianoCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const devicePixelRatio = window.devicePixelRatio || 1;
    const keysCanvasWidth = PIANO_KEY_WIDTH;
    const keysCanvasHeight = canvasHeight;

    // Adjust canvas size for high DPI displays
    canvas.width = keysCanvasWidth * devicePixelRatio;
    canvas.height = keysCanvasHeight * devicePixelRatio;
    canvas.style.width = `${keysCanvasWidth}px`;
    canvas.style.height = `${keysCanvasHeight}px`;

    // Scale the context to account for device pixel ratio
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear the canvas
    ctx.clearRect(0, 0, keysCanvasWidth, keysCanvasHeight);

    // Set font for key names
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let key = 0; key < NUM_MIDI_KEYS; key++) {
      const y = key * KEY_HEIGHT * zoomY - scrollY;
      const height = KEY_HEIGHT * zoomY;
      const noteName = getNoteName(NUM_MIDI_KEYS - key - 1);

      // Only draw keys that are visible
      if (y + height < 0 || y > keysCanvasHeight) {
        continue;
      }

      if (isBlackKey(NUM_MIDI_KEYS - key - 1)) {
        ctx.fillStyle = "#333";
      } else {
        ctx.fillStyle = "#fff";
      }
      ctx.fillRect(0, y, keysCanvasWidth, height);

      // Draw key border
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 0.5; // Half the size
      ctx.strokeRect(0, y, keysCanvasWidth, height);

      // Draw key name
      ctx.fillStyle = isBlackKey(NUM_MIDI_KEYS - key - 1) ? "#fff" : "#000";
      ctx.fillText(noteName, keysCanvasWidth / 2, y + height / 2);
    }
  };

  // Function to draw the main MIDI grid and notes
  const drawGrid = () => {
    const canvas = gridCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const devicePixelRatio = window.devicePixelRatio || 1;
    const gridCanvasWidth = canvasWidth - PIANO_KEY_WIDTH;
    const gridCanvasHeight = canvasHeight;

    // Adjust canvas size for high DPI displays
    canvas.width = gridCanvasWidth * devicePixelRatio;
    canvas.height = gridCanvasHeight * devicePixelRatio;
    canvas.style.width = `${gridCanvasWidth}px`;
    canvas.style.height = `${gridCanvasHeight}px`;

    // Scale the context to account for device pixel ratio
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear the canvas
    ctx.clearRect(0, 0, gridCanvasWidth, gridCanvasHeight);

    // Draw horizontal key lines
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 0.5; // Half the size
    for (let key = 0; key <= NUM_MIDI_KEYS; key++) {
      const y = key * KEY_HEIGHT * zoomY - scrollY;
      if (y >= 0 && y <= gridCanvasHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(totalPianoRollWidth - scrollX, y);
        ctx.stroke();
      }
    }

    // Determine level of detail based on zoomX
    let [subdivision, barStep] = calculateZoomSettings(zoomX);

    // Draw vertical lines for bars, beats, and subdivisions
    const beatWidth = BEAT_WIDTH * zoomX;
    const subBeatWidth = beatWidth / subdivision;

    const totalBars = Math.ceil(NUM_BEATS / BEATS_PER_BAR);

    for (let bar = 0; bar <= totalBars; bar += barStep) {
      const barStartBeat = bar * BEATS_PER_BAR;
      const x = barStartBeat * beatWidth - scrollX;

      // Draw bar line (more prominent)
      ctx.strokeStyle = "#FFFFFF"; // White bar lines
      ctx.lineWidth = 1; // Thinner line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalPianoRollHeight - scrollY);
      ctx.stroke();

      if (barStep === 1 || zoomX > 1.5) {
        // Now draw beats within the bar
        for (let beatInBar = 1; beatInBar <= BEATS_PER_BAR; beatInBar++) {
          const beat = barStartBeat + beatInBar - 1;
          if (beat >= NUM_BEATS) break;

          const beatX = beat * beatWidth - scrollX;

          if (beatX < -beatWidth || beatX > gridCanvasWidth) continue;

          // Draw beat line
          ctx.strokeStyle = "#ccc";
          ctx.lineWidth = 0.5; // Half the size
          ctx.beginPath();
          ctx.moveTo(beatX, 0);
          ctx.lineTo(beatX, totalPianoRollHeight - scrollY);
          ctx.stroke();

          // Draw subdivisions if zoomed in
          if (subdivision > 1 && beat < NUM_BEATS - 1) {
            for (let sub = 1; sub < subdivision; sub++) {
              const subX = beatX + sub * subBeatWidth;
              if (subX < -beatWidth || subX > gridCanvasWidth) continue;

              // Draw subdivision line
              ctx.strokeStyle = subdivision === 16 ? "#666666" : "#AAAAAA";
              ctx.lineWidth = 0.5; // Half the size
              ctx.beginPath();
              ctx.moveTo(subX, 0);
              ctx.lineTo(subX, totalPianoRollHeight - scrollY);
              ctx.stroke();
            }
          }
        }
      }
    }
    // Draw line at virtual cursor position
    const virtualCursorX =
      virtualCursorPosition.x * BEAT_WIDTH * zoomX - scrollX;
    const virtualCursorY =
      virtualCursorPosition.y * KEY_HEIGHT * zoomY - scrollY;

    if (
      virtualCursorX >= 0 &&
      virtualCursorX <= gridCanvasWidth &&
      virtualCursorY >= 0 &&
      virtualCursorY <= gridCanvasHeight
    ) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(virtualCursorX, virtualCursorY);
      ctx.lineTo(virtualCursorX, virtualCursorY + KEY_HEIGHT * zoomY);
      ctx.stroke();
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.moveTo(virtualCursorX - 10, virtualCursorY - 10);
      ctx.lineTo(virtualCursorX - 10, virtualCursorY - 5);
      ctx.lineTo(virtualCursorX - 5, virtualCursorY - 5);
      ctx.closePath();
      ctx.fill();
    }
    if (cursors != null)
      for (const [key, value] of Object.entries(cursors)) {
        const bookmarkCursorX = value[0] * BEAT_WIDTH * zoomX - scrollX;
        const bookmarkCursorY = value[1] * KEY_HEIGHT * zoomY - scrollY;

        if (
          bookmarkCursorX >= 0 &&
          bookmarkCursorX <= gridCanvasWidth &&
          bookmarkCursorY >= 0 &&
          bookmarkCursorY <= gridCanvasHeight
        ) {
          ctx.fillStyle = "white";
          ctx.font = "10px Arial";
          ctx.fillText(key, bookmarkCursorX + 15, bookmarkCursorY - 5);
          ctx.strokeStyle = "purple";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bookmarkCursorX, bookmarkCursorY);
          ctx.lineTo(bookmarkCursorX, bookmarkCursorY + KEY_HEIGHT * zoomY);
          ctx.stroke();
          ctx.fillStyle = "purple";
          ctx.beginPath();
          ctx.moveTo(bookmarkCursorX + 10, bookmarkCursorY - 10);
          ctx.lineTo(bookmarkCursorX + 10, bookmarkCursorY - 5);
          ctx.lineTo(bookmarkCursorX + 5, bookmarkCursorY - 5);
          ctx.closePath();
          ctx.fill();
        }
      }

    // Draw MIDI notes
    const ids = tempDraggingNotes
      ? tempDraggingNotes.map((note) => note.id)
      : [];
    if (notes)
      notes.forEach((note) => {
        if (ids.includes(note.id)) {
          return;
        }
        const x = note.start * BEAT_WIDTH * zoomX - scrollX;
        const y =
          (NUM_MIDI_KEYS - note.pitch - 1) * KEY_HEIGHT * zoomY - scrollY;
        const width = note.duration * BEAT_WIDTH * zoomX;
        const height = KEY_HEIGHT * zoomY;

        // Only draw notes that are visible
        if (
          x + width < 0 ||
          x > gridCanvasWidth ||
          y + height < 0 ||
          y > gridCanvasHeight
        ) {
          return;
        }

        ctx.fillStyle = selectedNotes.includes(note.id) ? "brown" : "orange";
        ctx.fillRect(x, y, width, height);

        // Draw note border
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
      });
    if (tempDraggingNotes)
      tempDraggingNotes.forEach((note) => {
        const x = note.start * BEAT_WIDTH * zoomX - scrollX;
        const y =
          (NUM_MIDI_KEYS - note.pitch - 1) * KEY_HEIGHT * zoomY - scrollY;
        const width = note.duration * BEAT_WIDTH * zoomX;
        const height = KEY_HEIGHT * zoomY;

        // Only draw notes that are visible
        if (
          x + width < 0 ||
          x > gridCanvasWidth ||
          y + height < 0 ||
          y > gridCanvasHeight
        ) {
          return;
        }

        ctx.fillStyle = selectedNotes.includes(note.id) ? "brown" : "orange";
        ctx.fillRect(x, y, width, height);

        // Draw note border
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
      });

    // Draw selection box if active
    if (isSelecting) {
      const x1 = selectionBox.x1;
      const y1 = selectionBox.y1;
      const x2 = selectionBox.x2;
      const y2 = selectionBox.y2;

      const rectX = Math.min(x1, x2);
      const rectY = Math.min(y1, y2);
      const rectWidth = Math.abs(x2 - x1);
      const rectHeight = Math.abs(y2 - y1);

      ctx.fillStyle = "rgba(173, 216, 230, 0.3)"; // light blue with transparency
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      ctx.strokeStyle = "rgba(0, 0, 255, 0.5)"; // darker blue edges
      ctx.lineWidth = 1;
      ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    }

    // Draw the playback bar
    const playbackX = playbackPosition * BEAT_WIDTH * zoomX - scrollX;

    if (playbackX >= 0 && playbackX <= gridCanvasWidth) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playbackX, 0);
      ctx.lineTo(playbackX, gridCanvasHeight);
      ctx.stroke();
    }
  };

  // Adjust scroll positions when zoom changes
  useEffect(() => {
    // Adjust vertical scroll if necessary
    const newTotalHeight = NUM_MIDI_KEYS * KEY_HEIGHT * zoomY;
    const newMaxScrollY = Math.max(0, newTotalHeight - canvasHeight);
    setScrollY((prevScrollY) =>
      Math.max(0, Math.min(prevScrollY, newMaxScrollY))
    );

    // Adjust horizontal scroll if necessary
    const newTotalWidth = NUM_BEATS * BEAT_WIDTH * zoomX;
    const newMaxScrollX = Math.max(
      0,
      newTotalWidth - (canvasWidth - PIANO_KEY_WIDTH)
    );
    setScrollX((prevScrollX) =>
      Math.max(0, Math.min(prevScrollX, newMaxScrollX))
    );
  }, [canvasHeight, canvasWidth, zoomX, zoomY]);

  // Redraw piano keys, grid, and time ruler when zoom, scroll, or playback position changes
  useEffect(() => {
    drawPianoKeys();
    drawGrid();
    drawTimeRuler();
  }, [
    scrollX,
    scrollY,
    zoomX,
    zoomY,
    notes,
    isSelecting,
    selectionBox,
    playbackPosition,
    virtualCursorPosition,
    drawPianoKeys,
    drawGrid,
    drawTimeRuler,
  ]);

  // Mouse event handlers for adding and manipulating notes
  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent context menu on right-click
    const gridCanvas = gridCanvasRef.current;
    const rect = gridCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.button === 1) {
      // Middle mouse button pressed
      setIsMiddleMouseDragging(true);
      setLastMiddleMousePosition({ x: e.clientX, y: e.clientY });
      return;
    }

    const worldX = (mouseX + scrollX) / (BEAT_WIDTH * zoomX);
    const worldY = (mouseY + scrollY) / (KEY_HEIGHT * zoomY);

    let [subdivision] = calculateZoomSettings(zoomX);
    const closestX = Math.round(worldX * subdivision) / subdivision;
    const closestY = Math.round(worldY);
    setBookmarkCursorPosition({ x: closestX, y: closestY });
    setCursors({
      id: convexNotesID,
      cursors: { [user.fullName]: [closestX, closestY] },
    });

    // Check if clicked on an existing note
    let clickedNote = null;
    if (notes)
      notes.forEach((note) => {
        const noteX = note.start * BEAT_WIDTH;
        const noteY = (NUM_MIDI_KEYS - note.pitch - 1) * KEY_HEIGHT;
        const noteWidth = note.duration * BEAT_WIDTH;
        const noteHeight = KEY_HEIGHT;
        if (
          worldX * BEAT_WIDTH >= noteX &&
          worldX * BEAT_WIDTH <= noteX + noteWidth &&
          worldY * KEY_HEIGHT >= noteY &&
          worldY * KEY_HEIGHT <= noteY + noteHeight
        ) {
          clickedNote = note;
        }
      });
    if (clickedNote) {
      if (e.button === 2) {
        // Right-click to delete the note
        setNotes({
          midi: notes.filter((note) => note.id !== clickedNote.id),
          id: convexNotesID,
        });
        return;
      }
      if (isShiftPressed) {
        // Shift-click to toggle selection
        if (selectedNotes.some((id) => id === clickedNote.id)) {
          setSelectedNotes(selectedNotes.filter((id) => id !== clickedNote.id));
        } else {
          setSelectedNotes([...selectedNotes, clickedNote.id]);
        }
      } else {
        if (selectedNotes.includes(clickedNote.id)) {
          // Note is already selected; do not change selection
        } else {
          console.log("Setting selected notes");
          setSelectedNotes([...selectedNotes, clickedNote.id]);
        }
      }

      setIsDragging(true);
      setInitialMousePosition({ x: worldX, y: worldY });
      setMouseDownPosition({ x: worldX, y: worldY });

      // Determine if we're resizing or moving
      const noteX = clickedNote.start * BEAT_WIDTH;
      const noteWidth = clickedNote.duration * BEAT_WIDTH;
      const resizeMargin = 5 / zoomX; // 5 pixels in world coordinates

      if (
        worldX * BEAT_WIDTH >= noteX + noteWidth - resizeMargin &&
        worldX * BEAT_WIDTH <= noteX + noteWidth + resizeMargin
      ) {
        setDraggingType("resizeEnd");
        setInitialNotesState([{ ...clickedNote }]);
        setDraggingNoteId(clickedNote.id);
      } else if (
        worldX * BEAT_WIDTH >= noteX - resizeMargin &&
        worldX * BEAT_WIDTH <= noteX + resizeMargin
      ) {
        setDraggingType("resizeStart");
        setInitialNotesState([{ ...clickedNote }]);
        setDraggingNoteId(clickedNote.id);
      } else {
        setDraggingType("move");
        // Store initial state of all selected notes
        const selNotes = notes.filter((note) =>
          selectedNotes.includes(note.id)
        );
        setInitialNotesState(selNotes.map((note) => ({ ...note })));
      }
    } else {
      if (e.button === 2) {
        // Right-click on empty space does nothing
        return;
      }

      // If Control is pressed, add a new note
      if (isCtrlPressed && !isShiftPressed && !isAltPressed) {
        // Add a new note starting from the closest grid line to the left
        const gridSize = determineGridSize(zoomX);
        const quantizedStart = getGridLineToLeft(worldX, gridSize);
        const pitch = NUM_MIDI_KEYS - Math.floor(worldY) - 1;

        const newNote = {
          id: Date.now(),
          start: quantizedStart,
          duration: defaultNoteDuration, // Use default note duration
          pitch: pitch,
          selected: true,
        };
        setTempDraggingNotes([...notes, newNote]);
        setNotes({ midi: [...notes, newNote], id: convexNotesID }).then(() => {
          setTempDraggingNotes(null);
        });
        setIsDragging(true);
        setDraggingType("resizeEnd"); // Start dragging the end to set the duration
        setDraggingNoteId(newNote.id);
        setInitialNotesState([newNote]);
        setInitialMousePosition({ x: worldX, y: worldY });
        setMouseDownPosition({ x: worldX, y: worldY });
      } else {
        // Deselect any selected notes
        setSelectedNotes([]);
        // Start selection box
        setIsSelecting(true);
        setSelectionBox({ x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY });
      }
    }
  };

  const handleMouseMove = (e) => {
    const gridCanvas = gridCanvasRef.current;
    const rect = gridCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const MAX_SCROLL_X = Math.max(
      0,
      totalPianoRollWidth - (canvasWidth - PIANO_KEY_WIDTH)
    );
    const MIN_SCROLL_X = 0;
    // Limit zoom out to encompass at most 100 bars
    const MIN_ZOOM_X =
      (canvasWidth - PIANO_KEY_WIDTH) /
      (BEAT_WIDTH * BEATS_PER_BAR * MAX_VISIBLE_BARS);

    if (isMiddleMouseDragging) {
      const deltaX = e.clientX - lastMiddleMousePosition.x;
      const deltaY = e.clientY - lastMiddleMousePosition.y;

      let newScrollX = scrollX - deltaX;
      let newScrollY = scrollY - deltaY;

      newScrollX = Math.max(MIN_SCROLL_X, Math.min(newScrollX, MAX_SCROLL_X));
      newScrollY = Math.max(minScrollY, Math.min(newScrollY, maxScrollY));

      setScrollX(newScrollX);
      setScrollY(newScrollY);

      setLastMiddleMousePosition({ x: e.clientX, y: e.clientY });
      return;
    }

    const worldX = (mouseX + scrollX) / (BEAT_WIDTH * zoomX);
    const worldY = (mouseY + scrollY) / (KEY_HEIGHT * zoomY);

    let [subdivision] = calculateZoomSettings(zoomX);
    const closestX = Math.round(worldX * subdivision) / subdivision;
    const closestY = Math.round(worldY);
    setVirtualCursorPosition({ x: closestX, y: closestY });

    // Change cursor when hovering over note edges
    let cursor = "default";
    let hoveringOverEdge = false;
    if (notes)
      notes.forEach((note) => {
        const noteX = note.start * BEAT_WIDTH;
        const noteWidth = note.duration * BEAT_WIDTH;
        const noteY = (NUM_MIDI_KEYS - note.pitch - 1) * KEY_HEIGHT;
        const noteHeight = KEY_HEIGHT;
        const resizeMargin = 5 / zoomX; // 5 pixels in world coordinates

        if (
          worldY * KEY_HEIGHT >= noteY &&
          worldY * KEY_HEIGHT <= noteY + noteHeight &&
          ((worldX * BEAT_WIDTH >= noteX - resizeMargin &&
            worldX * BEAT_WIDTH <= noteX + resizeMargin) ||
            (worldX * BEAT_WIDTH >= noteX + noteWidth - resizeMargin &&
              worldX * BEAT_WIDTH <= noteX + noteWidth + resizeMargin))
        ) {
          cursor = "ew-resize";
          hoveringOverEdge = true;
        }
      });

    if (!hoveringOverEdge && !isDragging) {
      cursor = "default";
    }
    setCursorStyle(cursor);

    if (isSelecting) {
      setSelectionBox((prevBox) => ({ ...prevBox, x2: mouseX, y2: mouseY }));
    }

    if (!isDragging) return;

    const deltaX = worldX - initialMousePosition.x;
    const deltaY = worldY - initialMousePosition.y;

    if (draggingType === "move") {
      setTempDraggingNotes(
        notes.map((note) => {
          if (!note.selected) return note;

          const initialNote = initialNotesState.find((n) => n.id === note.id);
          if (!initialNote) return note;

          const newStartRaw = initialNote.start + deltaX;
          const snappedStart = snapToGrid(newStartRaw, zoomX);
          const newStart = snappedStart !== null ? snappedStart : newStartRaw;

          const newPitch = initialNote.pitch - Math.floor(deltaY);

          return {
            ...note,
            start: Math.max(0, newStart),
            pitch: Math.min(NUM_MIDI_KEYS - 1, Math.max(0, newPitch)),
          };
        })
      );
    } else {
      // Resizing only affects the specific note being dragged
      setTempDraggingNotes(
        notes.map((note) => {
          if (note.id !== draggingNoteId) return note;

          const initialNote = initialNotesState.find((n) => n.id === note.id);
          if (!initialNote) return note;

          if (draggingType === "resizeEnd") {
            const newDurationRaw = initialNote.duration + deltaX;
            const snappedDuration = snapToGrid(newDurationRaw, zoomX);
            const newDuration =
              snappedDuration !== null ? snappedDuration : newDurationRaw;

            // Update default note duration
            setDefaultNoteDuration(newDuration);

            return {
              ...note,
              duration: Math.max(0.1, newDuration),
            };
          } else if (draggingType === "resizeStart") {
            const newStartRaw = initialNote.start + deltaX;
            const newDurationRaw = initialNote.duration - deltaX;
            const snappedStart = snapToGrid(newStartRaw, zoomX);
            const snappedDuration = snapToGrid(newDurationRaw, zoomX);
            const newStart = snappedStart !== null ? snappedStart : newStartRaw;
            const newDuration =
              snappedDuration !== null ? snappedDuration : newDurationRaw;

            // Update default note duration
            setDefaultNoteDuration(newDuration);

            return {
              ...note,
              start: Math.max(0, newStart),
              duration: Math.max(0.1, newDuration),
            };
          }
          return note;
        })
      );
    }
  };

  const handleMouseUp = (e) => {
    if (tempDraggingNotes) {
      const ids = tempDraggingNotes.map((note) => note.id);
      setNotes({
        midi: [
          ...tempDraggingNotes,
          ...notes.filter((note) => !ids.includes(note.id)),
        ],
        id: convexNotesID,
      }).then(() => {
        setTempDraggingNotes(null);
      });
    }
    if (e.button === 1 && isMiddleMouseDragging) {
      setIsMiddleMouseDragging(false);
      return;
    }

    if (isSelecting) {
      setIsSelecting(false);

      const xMin = Math.min(selectionBox.x1, selectionBox.x2);
      const xMax = Math.max(selectionBox.x1, selectionBox.x2);
      const yMin = Math.min(selectionBox.y1, selectionBox.y2);
      const yMax = Math.max(selectionBox.y1, selectionBox.y2);

      // Convert from canvas coordinates to world coordinates
      const worldXMin = (xMin + scrollX) / (BEAT_WIDTH * zoomX);
      const worldXMax = (xMax + scrollX) / (BEAT_WIDTH * zoomX);

      const worldYMin = (yMin + scrollY) / (KEY_HEIGHT * zoomY);
      const worldYMax = (yMax + scrollY) / (KEY_HEIGHT * zoomY);

      const pitchMin = Math.floor(NUM_MIDI_KEYS - 1 - worldYMax);
      const pitchMax = Math.ceil(NUM_MIDI_KEYS - 1 - worldYMin);

      // Select notes within the selection rectangle
      const toAdd = notes
        .map((note) => {
          const noteStart = note.start;
          const noteEnd = note.start + note.duration;
          const notePitch = note.pitch;

          if (
            noteStart < worldXMax &&
            noteEnd > worldXMin &&
            notePitch >= pitchMin &&
            notePitch <= pitchMax
          ) {
            return note.id;
          } else {
            return false;
          }
        })
        .filter((id) => id !== false);

      setSelectedNotes([...selectedNotes, ...toAdd]);
    }

    if (isDragging) {
      setIsDragging(false);
      setDraggingType(null);
      setDraggingNoteId(null);
      setInitialNotesState([]);
    }
  };

  useEffect(() => {
    const gridCanvas = gridCanvasRef.current;
    gridCanvas.addEventListener("mousedown", handleMouseDown);
    gridCanvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Prevent context menu on right-click
    gridCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      gridCanvas.removeEventListener("mousedown", handleMouseDown);
      gridCanvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isSelecting,
    mouseDownPosition,
    initialMousePosition,
    draggingType,
    initialNotesState,
    draggingNoteId,
    scrollX,
    scrollY,
    zoomX,
    zoomY,
    isShiftPressed,
    isCtrlPressed,
    isAltPressed,
    selectionBox,
    isMiddleMouseDragging,
    lastMiddleMousePosition,
    defaultNoteDuration,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  ]);

  // Event handlers for the time ruler
  const handleTimeRulerMouseDown = (e) => {
    e.preventDefault();
    const canvas = timeRulerCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Calculate the x-coordinate of the playback triangle
    const triangleX = playbackPosition * BEAT_WIDTH * zoomX - scrollX;

    // Check if the mouse is on the triangle
    if (Math.abs(mouseX - triangleX) <= 5) {
      setIsDraggingPlayback(true);
    }

    // Set the playback position based on the mouse position
    const newPlaybackPosition = (mouseX + scrollX) / (BEAT_WIDTH * zoomX);
    const clampedPosition = Math.max(
      0,
      Math.min(newPlaybackPosition, NUM_BEATS)
    );
    const snappedPosition = snapToGrid(clampedPosition, zoomX);
    const finalPosition =
      snappedPosition !== null ? snappedPosition : clampedPosition;
    setPlaybackPosition(finalPosition);
  };

  const handleTimeRulerMouseMove = (e) => {
    if (!isDraggingPlayback) return;

    const canvas = timeRulerCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const newPlaybackPosition = (mouseX + scrollX) / (BEAT_WIDTH * zoomX);
    const clampedPosition = Math.max(
      0,
      Math.min(newPlaybackPosition, NUM_BEATS)
    );
    const snappedPosition = snapToGrid(clampedPosition, zoomX);
    const finalPosition =
      snappedPosition !== null ? snappedPosition : clampedPosition;
    setPlaybackPosition(finalPosition);
  };

  const handleTimeRulerMouseUp = (e) => {
    if (isDraggingPlayback) {
      setIsDraggingPlayback(false);
    }
  };

  useEffect(() => {
    const timeRulerCanvas = timeRulerCanvasRef.current;
    timeRulerCanvas.addEventListener("mousedown", handleTimeRulerMouseDown);
    timeRulerCanvas.addEventListener("mousemove", handleTimeRulerMouseMove);
    window.addEventListener("mouseup", handleTimeRulerMouseUp);

    return () => {
      timeRulerCanvas.removeEventListener(
        "mousedown",
        handleTimeRulerMouseDown
      );
      timeRulerCanvas.removeEventListener(
        "mousemove",
        handleTimeRulerMouseMove
      );
      window.removeEventListener("mouseup", handleTimeRulerMouseUp);
    };
  }, [
    isDraggingPlayback,
    scrollX,
    zoomX,
    playbackPosition,
    handleTimeRulerMouseDown,
    handleTimeRulerMouseMove,
    handleTimeRulerMouseUp,
  ]);

  const options = [
    { value: () => console.log("hello"), label: "Console Hello" },
    { value: () => {}, label: "Third" },
    { value: () => {}, label: "Second" },
  ];
  const handleOptionsPickerSelect = (e) => {
    e.value();
    setActionPageOpen(false);
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "rgb(44, 52, 65)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: PIANO_KEY_WIDTH,
          height: TIME_RULER_HEIGHT,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 100,
          color: "white",
          fontSize: "12px",
          lineHeight: `${TIME_RULER_HEIGHT}px`,
          textAlign: "center",
        }}
        onClick={() => setActionPageOpen(true)}
      >
        <FaBoltLightning />
      </div>
      {/* Time ruler at the top */}
      <canvas
        ref={timeRulerCanvasRef}
        width={canvasWidth}
        height={TIME_RULER_HEIGHT}
        style={{
          position: "absolute",
          left: `${PIANO_KEY_WIDTH}px`,
          top: "0",
          border: "none",
        }}
      />
      <canvas
        ref={pianoCanvasRef}
        width={PIANO_KEY_WIDTH}
        height={canvasHeight - TIME_RULER_HEIGHT}
        style={{
          borderRight: "1px solid black",
          left: 0,
          top: `${TIME_RULER_HEIGHT}px`,
          position: "absolute",
          border: "none",
        }}
      />
      {/* Main MIDI grid */}
      <canvas
        ref={gridCanvasRef}
        width={canvasWidth - PIANO_KEY_WIDTH}
        height={canvasHeight - TIME_RULER_HEIGHT}
        style={{
          overflow: "hidden",
          cursor: cursorStyle,
          position: "absolute",
          left: `${PIANO_KEY_WIDTH}px`,
          top: `${TIME_RULER_HEIGHT}px`,
          border: "none",
        }}
      />
      {actionPageOpen ? (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            }}
            onClick={() => setActionPageOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              height: "400px",
              width: "300px",
              top: "calc(50% - 200px)",
              left: "calc(50% - 150px)",
              border: "2px solid grey 1px",
              backgroundColor: "rgba(41, 41, 41, 0.9)",
              textAlign: "center",
              color: "black",
              padding: "10px",
              zIndex: 2,
            }}
          >
            <Select
              options={options}
              onChange={handleOptionsPickerSelect}
              ref={actionSearchBar}
              style={{ zIndex: 3 }}
            />
            <div
              style={{
                position: "absolute",
                height: "25px",
                width: "100%",
                backgroundColor: "rgba(46, 46, 46, 1)",
                left: 0,
                bottom: 0,
                color: "rgba(150, 150, 150, 1)",
                lineHeight: "25px",
                fontWeight: "600",
                fontSize: "12px",
                zIndex: 3,
              }}
            >
              <b>Run action</b>
              <br />
              <i>Press Enter to select</i>
            </div>
          </div>
        </div>
      ) : null}
      {chatPageOpen ? (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            }}
            onClick={() => (isChatLoading ? null : setChatPageOpen(false))}
          />
          <div
            style={{
              position: "absolute",
              height: "400px",
              width: "300px",
              top: "calc(50% - 200px)",
              left: "calc(50% - 150px)",
              border: "2px solid grey 1px",
              backgroundColor: "rgba(41, 41, 41, 0.9)",
              textAlign: "center",
              color: "black",
              padding: "10px",
              zIndex: 2,
            }}
          >
            <textarea
              ref={chatBoxBar}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  setIsChatLoading(true);
                  const time_based = MIDIToTimeBased(
                    notes.filter((note) => selectedNotes.includes(note.id)),
                    beats_per_minute
                  );
                  callModAPI({
                    music: time_based,
                    request: chatBoxBar.current.value,
                  }).then((res) => {
                    setNotes({
                      midi: [
                        ...notes,
                        ...TimeBasedToMIDI(JSON.parse(res), beats_per_minute),
                      ],
                      id: convexNotesID,
                    });
                    setIsChatLoading(false);
                    setChatPageOpen(false);
                  });
                }
              }}
              style={{
                zIndex: 3,
                backgroundColor: "rgb(24, 26, 27)",
                borderColor: "rgb(62, 68, 70)",
                padding: "10px",
                color: "white",
                fontSize: "16px",
                width: "280px",
                height: "355px",
                top: "10px",
                left: "10px",
                position: "absolute",
                resize: "none",
              }}
              disabled={isChatLoading}
            />
            <div
              style={{
                position: "absolute",
                height: "25px",
                width: "100%",
                backgroundColor: "rgba(46, 46, 46, 1)",
                left: 0,
                bottom: 0,
                color: "rgba(150, 150, 150, 1)",
                lineHeight: "25px",
                fontWeight: "600",
                fontSize: "12px",
                zIndex: 3,
              }}
            >
              <b>Get Suggestions</b>
              <br />
              {isChatLoading ? (
                <i>Waiting for a marvelous response!</i>
              ) : (
                <i>Press Ctrl-Enter to submit!</i>
              )}
              <br />
              <i>
                Note, AI suggestions may potentially give unexpected responses.
              </i>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PianoRoll;
