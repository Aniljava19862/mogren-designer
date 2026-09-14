import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CANVAS_CONFIG,
  DEFAULT_TEXT_CONFIG,
  TSHIRT_TYPES,
  TSHIRT_COLOR_CODES,
} from "../constants/designConstants";

import { setSelectedType, setTshirtColor } from "../features/tshirtSlice";
import { useRef, useState } from "react";
import SaveDesign from "./SaveDesign";
import { useCanvas } from "@/hooks/useCanvas";
import canvasStorageManager from "@/utils/canvasStorageManager";
import {
  Box,
  Type,
  Image as ImageIcon,
  Paintbrush,
  User,
  Gift,
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Trash2,
} from "lucide-react";

const ToolBar = ({ manualSync }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null); // use for handle image input
  const selectedType = useSelector((state) => state.tshirt.selectedType);
  const { activeCanvas, selectedObject, frontCanvas, backCanvas, leftCanvas, rightCanvas } = useCanvas();
  const selectedView = useSelector((state) => state.tshirt.selectedView);

  const items = [
    { id: "products", label: "Products", icon: <Box /> },
    { id: "text", label: "Text", icon: <Type /> },
    { id: "image", label: "Image", icon: <ImageIcon /> },
    { id: "art", label: "Art", icon: <Paintbrush /> },
    { id: "name", label: "Name", icon: <User /> },
    { id: "order", label: "Order", icon: <Gift /> },
  ];

  const [active, setActive] = useState("products");
  const [textInput, setTextInput] = useState("");
  const [lineColor, setLineColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [selectedArtCategory, setSelectedArtCategory] = useState(null);
  const historyRef = useRef({ front: [], back: [], left: [], right: [] });
  const redoRef = useRef({ front: [], back: [], left: [], right: [] });
  const isApplyingRef = useRef(false);
  const handleTypeChange = (value) => {
    console.log("Selected Tshirt " + value);
    dispatch(setSelectedType(value));
  };

  const handleColorChange = (color) => {
    dispatch(setTshirtColor(color));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddImage = (e) => {
    const canvas = getCanvasByView(selectedView || "front") || activeCanvas;
    if (!canvas || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.src = event.target.result;

      imgObj.onload = () => {
        const image = new fabric.Image(imgObj);

        // Calculate scaling to fit within canvas
        const maxWidth = CANVAS_CONFIG.width * 0.5;
        const maxHeight = CANVAS_CONFIG.height * 0.5;

        if (image.width > maxWidth || image.height > maxHeight) {
          const scale = Math.min(
            maxWidth / image.width,
            maxHeight / image.height
          );
          image.scale(scale);
        }

        // Center the image
        image.set({
          left: (canvas.width - image.getScaledWidth()) / 2,
          top: (canvas.height - image.getScaledHeight()) / 2,
        });

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
        console.info("handleAddImage: image added to canvas, src=", imgObj.src);
      };
    };

    reader.readAsDataURL(file);
    // Reset input value to allow uploading the same image again
    e.target.value = "";
  };

  const handleAddText = () => {
    const canvas = getCanvasByView(selectedView || "front") || activeCanvas;
    if (!canvas) return;

    const text = new fabric.Textbox("Add Your Text Here...", {
      ...DEFAULT_TEXT_CONFIG,
      left: canvas.width / 2,
      top: canvas.height / 2,
      width: 200,
      editable: false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleAddLine = () => {
    const canvas = getCanvasByView(selectedView || "front") || activeCanvas;
    if (!canvas) return;

    const line = new fabric.Line([100, 200, 250, 200], {
      stroke: "black",
      strokeWidth: 3,
      selectable: true,
      hasControls: true,
      strokeLineCap: "round",
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  };

  const handleDelete = () => {
    const canvas = getCanvasByView(selectedView || "front") || activeCanvas;
    if (!canvas || !selectedObject) return;

    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    manualSync && manualSync(selectedView || "front");
  };

  // Add a clear all function if needed
  const handleClearAll = () => {
    const canvas = getCanvasByView(selectedView || "front") || activeCanvas;
    if (!canvas) return;

    // Clear all objects from canvas
    canvas.clear();

    // Clear storage for current view
    canvasStorageManager.clearCanvasStorage("all");

    // Re-initialize canvas with basic settings if needed
    canvas.renderAll();
    manualSync && manualSync(selectedView || "front");
  };

  const handleClearStorage = () => {
    const ok = window.confirm("Clear all saved designs from browser storage? This cannot be undone.");
    if (!ok) return;
    try {
      canvasStorageManager.clearCanvasStorage("all");
    } catch (e) {
      console.error("Failed clearing storage", e);
    }

    if (activeCanvas) {
      activeCanvas.clear();
      activeCanvas.renderAll();
    }

    // reset history
    historyRef.current = { front: [], back: [], left: [], right: [] };
    redoRef.current = { front: [], back: [], left: [], right: [] };

    if (manualSync) {
      requestAnimationFrame(() => setTimeout(() => manualSync(), 50));
    }
  };

  // History / Undo / Redo
  const getCanvasByView = (view) => {
    switch (view) {
      case "front":
        return frontCanvas;
      case "back":
        return backCanvas;
      case "left":
        return leftCanvas;
      case "right":
        return rightCanvas;
      default:
        return frontCanvas;
    }
  };

  const loadFromState = (view, state) => {
    const canvas = getCanvasByView(view);
    if (!canvas || !state) return;
    try {
      isApplyingRef.current = true;
      const parsed = typeof state === "string" ? JSON.parse(state) : state;
      console.info("loadFromState:", view, "loading state, imageObjects=", parsed.objects ? parsed.objects.filter((o) => o.type === "image").length : 0);
      canvas.loadFromJSON(parsed, () => {
        canvas.renderAll();
        // Immediately trigger a sync so 3D updates even for empty canvases
        if (manualSync) {
          console.info("loadFromState:", view, "immediate manualSync (before image wait)");
          manualSync(view);
        }

        // wait until any image elements are fully loaded before syncing
        const waitForImagesReady = (timeout = 2000) => {
          return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
              const imgs = canvas.getObjects().filter((o) => o.type === "image");
              const statuses = imgs.map((img) => {
                try {
                  const el = img.getElement && img.getElement();
                  return el ? !!el.complete : true;
                } catch (e) {
                  return true;
                }
              });
              const allReady = statuses.every(Boolean);
              console.info("waitForImagesReady:", view, "images=", imgs.length, "statuses=", statuses, "elapsed=", Date.now() - start);
              if (allReady) return resolve(true);
              if (Date.now() - start > timeout) return resolve(false);
              setTimeout(check, 50);
            };
            check();
          });
        };

        waitForImagesReady(3000).then((ready) => {
          console.info("loadFromState:", view, "imagesReady=", ready);
          isApplyingRef.current = false;
          if (manualSync) {
            console.info("loadFromState:", view, "calling manualSync retry");
            manualSync(view);
            setTimeout(() => manualSync(view), 150);
            setTimeout(() => manualSync(view), 500);
            setTimeout(() => manualSync(view), 1200);
          }
        });
      });
    } catch (e) {
      console.error("Failed to load canvas state", e);
      isApplyingRef.current = false;
    }
  };

  const handleUndo = () => {
    const view = selectedView || "front";
    const history = historyRef.current[view] || [];
    console.info("handleUndo:", view, "invoked, historySize=", history.length);
    if (!getCanvasByView(view) || history.length <= 1) return;
    const current = historyRef.current[view].pop();
    redoRef.current[view].push(current);
    const prev = historyRef.current[view][historyRef.current[view].length - 1];
    loadFromState(view, prev);
    // Ensure 3D sync happens even if loadFromJSON callback is delayed
    if (manualSync) {
      console.info("handleUndo:", view, "scheduling manualSync retries");
      manualSync(view);
      setTimeout(() => manualSync(view), 120);
      setTimeout(() => manualSync(view), 400);
      setTimeout(() => manualSync(view), 1000);
    }
  };

  const handleRedo = () => {
    const view = selectedView || "front";
    const redo = redoRef.current[view] || [];
    console.info("handleRedo:", view, "invoked, redoSize=", redo.length);
    if (!getCanvasByView(view) || redo.length === 0) return;
    const next = redoRef.current[view].pop();
    historyRef.current[view].push(next);
    loadFromState(view, next);
    if (manualSync) {
      console.info("handleRedo:", view, "scheduling manualSync retries");
      manualSync(view);
      setTimeout(() => manualSync(view), 120);
      setTimeout(() => manualSync(view), 400);
      setTimeout(() => manualSync(view), 1000);
    }
  };

  // Attach listeners to keep per-view history in sync
  React.useEffect(() => {
    const serializeCanvas = (canvas) => {
      try {
        canvas.getObjects().forEach((o) => {
          if (o.type === "image") {
            try {
              const el = o.getElement && o.getElement();
              if (el && el.src) o.set("src", el.src);
            } catch (e) {}
          }
        });
        return JSON.stringify(canvas.toJSON());
      } catch (e) {
        return null;
      }
    };

    const pushHistoryForView = (view, canvas) => {
      if (!canvas) return;
      if (isApplyingRef.current) return;
      try {
        const start = Date.now();
        const tryPush = () => {
          const imgs = canvas.getObjects().filter((o) => o.type === "image");
          const statuses = imgs.map((img) => {
            try {
              const el = img.getElement && img.getElement();
              return el ? !!el.complete : true;
            } catch (e) {
              return true;
            }
          });
          const allReady = statuses.every(Boolean);
          console.info("pushHistoryForView:", view, "imagesFound=", imgs.length, "statuses=", statuses, "allReady=", allReady, "elapsed=", Date.now() - start);

          if (allReady || Date.now() - start > 3000) {
            try {
              const snapshot = serializeCanvas(canvas);
              if (!historyRef.current[view]) historyRef.current[view] = [];
              historyRef.current[view].push(snapshot);
              if (historyRef.current[view].length > 100) historyRef.current[view].shift();
              redoRef.current[view] = [];
              console.info("pushHistoryForView:", view, "pushed snapshot, historySize=", historyRef.current[view].length);
            } catch (e) {
              console.error("pushHistoryForView: failed to push snapshot", e);
            }
          } else {
            setTimeout(tryPush, 80);
          }
        };

        tryPush();
      } catch (e) {
        console.error(e);
      }
    };

    // initialize histories for front/back/left/right
    if (frontCanvas) {
      historyRef.current.front = [serializeCanvas(frontCanvas)].filter(Boolean);
      redoRef.current.front = [];
    }
    if (backCanvas) {
      historyRef.current.back = [serializeCanvas(backCanvas)].filter(Boolean);
      redoRef.current.back = [];
    }
    if (leftCanvas) {
      historyRef.current.left = [serializeCanvas(leftCanvas)].filter(Boolean);
      redoRef.current.left = [];
    }
    if (rightCanvas) {
      historyRef.current.right = [serializeCanvas(rightCanvas)].filter(Boolean);
      redoRef.current.right = [];
    }

    // attach listeners
    const frontHandlers = {};
    const backHandlers = {};
    const leftHandlers = {};
    const rightHandlers = {};
    if (frontCanvas) {
      frontHandlers.push = () => pushHistoryForView("front", frontCanvas);
      frontCanvas.on("object:added", frontHandlers.push);
      frontCanvas.on("object:modified", frontHandlers.push);
      frontCanvas.on("object:removed", frontHandlers.push);
    }
    if (backCanvas) {
      backHandlers.push = () => pushHistoryForView("back", backCanvas);
      backCanvas.on("object:added", backHandlers.push);
      backCanvas.on("object:modified", backHandlers.push);
      backCanvas.on("object:removed", backHandlers.push);
    }
    if (leftCanvas) {
      leftHandlers.push = () => pushHistoryForView("left", leftCanvas);
      leftCanvas.on("object:added", leftHandlers.push);
      leftCanvas.on("object:modified", leftHandlers.push);
      leftCanvas.on("object:removed", leftHandlers.push);
    }
    if (rightCanvas) {
      rightHandlers.push = () => pushHistoryForView("right", rightCanvas);
      rightCanvas.on("object:added", rightHandlers.push);
      rightCanvas.on("object:modified", rightHandlers.push);
      rightCanvas.on("object:removed", rightHandlers.push);
    }

    return () => {
      try {
        if (frontCanvas && frontHandlers.push) {
          frontCanvas.off("object:added", frontHandlers.push);
          frontCanvas.off("object:modified", frontHandlers.push);
          frontCanvas.off("object:removed", frontHandlers.push);
        }
        if (backCanvas && backHandlers.push) {
          backCanvas.off("object:added", backHandlers.push);
          backCanvas.off("object:modified", backHandlers.push);
          backCanvas.off("object:removed", backHandlers.push);
        }
        if (leftCanvas && leftHandlers.push) {
          leftCanvas.off("object:added", leftHandlers.push);
          leftCanvas.off("object:modified", leftHandlers.push);
          leftCanvas.off("object:removed", leftHandlers.push);
        }
        if (rightCanvas && rightHandlers.push) {
          rightCanvas.off("object:added", rightHandlers.push);
          rightCanvas.off("object:modified", rightHandlers.push);
          rightCanvas.off("object:removed", rightHandlers.push);
        }
      } catch (e) {
        console.error(e);
      }
    };
  }, [frontCanvas, backCanvas]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* hidden file input used by popover action */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleAddImage}
        className="hidden"
      />

      {/* Left vertical sidebar */}
      <aside className="w-24 bg-white border-r flex flex-col items-center py-6 gap-4">
        {/* Shirt popover trigger */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-14 h-14 rounded-md flex items-center justify-center transition shadow-sm text-gray-600 hover:bg-gray-100">
              {/* inline SVG shirt icon with colorful badge */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <defs>
                  <radialGradient id="g2" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="#FFD36B" />
                    <stop offset="55%" stopColor="#FF6B6B" />
                    <stop offset="100%" stopColor="#7C4DFF" />
                  </radialGradient>
                </defs>
                <path d="M3 8.5 7 6l1.2 3.2A2 2 0 0 0 10 11h4a2 2 0 0 0 1.8-1.8L17 6l4 2.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
                <circle cx="19" cy="7" r="2" fill="url(#g2)" stroke="#fff" strokeWidth="0.6" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="center" className="w-64 p-4 rounded-md shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold">Image</h4>
                <p className="text-xs text-muted-foreground mt-1">Quick actions for Image</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={triggerFileInput}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded"
              >
                Upload Image
              </button>
              <button
                onClick={() => { setActive('products'); /* example action */ }}
                className="w-full px-3 py-2 border rounded"
              >
                Use Product Image
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Undo / Redo buttons */}
        <div className="flex flex-col gap-2">
          <button onClick={handleUndo} className="w-14 h-14 rounded-md flex items-center justify-center transition shadow-sm text-gray-600 hover:bg-gray-100" aria-label="Undo">
            <RotateCcw size={18} />
          </button>
          <button onClick={handleRedo} className="w-14 h-14 rounded-md flex items-center justify-center transition shadow-sm text-gray-600 hover:bg-gray-100" aria-label="Redo">
            <RotateCw size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedObject}
            className={`w-14 h-14 rounded-md flex items-center justify-center transition shadow-sm text-gray-600 hover:bg-gray-100 ${!selectedObject ? 'opacity-40 cursor-not-allowed' : ''}`}
            aria-label="Delete Selected"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={handleClearStorage} className="w-14 h-14 rounded-md flex items-center justify-center transition shadow-sm text-red-600 hover:bg-red-50" aria-label="Clear Cache">
            <Trash2 size={18} />
          </button>
        </div>

        {items.map((it) => (
          <Popover key={it.id}>
            <PopoverTrigger asChild>
              <button
                onClick={() => setActive(it.id)}
                className={`w-14 h-14 rounded-md flex items-center justify-center transition shadow-sm
                  ${active === it.id ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                aria-label={it.label}
              >
                {React.cloneElement(it.icon, { size: 18 })}
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="right"
              align="center"
              className={it.id === "art" ? "w-[720px] p-4 rounded-md shadow-xl max-h-[560px] overflow-auto" : "w-64 p-4 rounded-md shadow-xl"}
            >
              {/* Content varies by item id */}
              {it.id === "text" && (
                <div>
                  <h4 className="text-sm font-semibold">Text</h4>
                  <p className="text-xs text-muted-foreground mt-1">Quick text actions</p>
                  <div className="mt-3 flex gap-2">
                    <input value={textInput} onChange={(e)=>setTextInput(e.target.value)} placeholder="Your text" className="flex-1 border rounded px-2 py-1" />
                    <button onClick={()=>{ if(textInput.trim()){ const txt = new fabric.Textbox(textInput.trim(), {...DEFAULT_TEXT_CONFIG, left: activeCanvas.width/2, top: activeCanvas.height/2}); activeCanvas.add(txt); activeCanvas.setActiveObject(txt); activeCanvas.renderAll(); setTextInput(""); manualSync(); }}} className="px-3 py-1 bg-gray-800 text-white rounded">Add</button>
                  </div>
                  <div className="mt-3">
                    <button onClick={handleAddText} className="w-full px-3 py-2 border rounded">Add default text</button>
                  </div>
                </div>
              )}

              {it.id === "image" && (
                <div>
                  <h4 className="text-sm font-semibold">Image</h4>
                  <p className="text-xs text-muted-foreground mt-1">Upload or use product image</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button onClick={triggerFileInput} className="w-full px-3 py-2 bg-gray-800 text-white rounded">Upload Image</button>
                    <button onClick={()=>{ /* placeholder action */ setActive('products'); }} className="w-full px-3 py-2 border rounded">Use Product Image</button>
                  </div>
                </div>
              )}

            {it.id === "art" && (
              <div>
                {/* Candidate debug panel removed */}
                {/* If no category selected, show main categories in 2-column list */}
                {!selectedArtCategory ? (
                  <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-auto p-2">
                    {
                    [
                      { id: 'Holi', icon: '🌈' },
                      { id: 'Valentines', icon: '❤️' },
                      { id: 'Winter Mood', icon: '❄️' },
                      { id: 'Trending & Popular', icon: '🔥' },
                      { id: 'Couples & Romance', icon: '💕' },
                      { id: 'Class of', icon: '🎓' },
                      { id: 'School & College', icon: '🏫' },
                      { id: 'Sports', icon: '🏆' },
                      { id: 'Go Green', icon: '🌿' },
                      { id: 'Animals', icon: '🐾' },
                      { id: 'Emojis', icon: '😃' },
                      { id: 'Workout', icon: '🏋️' },
                      { id: 'Dance', icon: '💃' },
                      { id: 'Clipart', icon: '🧩' },
                      { id: 'Team Bride', icon: '👰' },
                      { id: 'LGBT', icon: '🏳️‍🌈' },
                      { id: 'Team Groom', icon: '🤵' },
                      { id: 'Christmas', icon: '🎄' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedArtCategory(c.id); }}
                        className={`flex items-center gap-3 p-3 rounded border bg-white hover:shadow-sm text-sm ${selectedArtCategory === c.id ? 'ring-2 ring-indigo-300' : ''}`}
                      >
                        <div className="w-9 h-9 flex items-center justify-center rounded bg-gray-50 text-lg">{c.icon}</div>
                        <div className="truncate">{c.id}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Subcategory grid view (2 columns) with back button */
                  <div className="p-2">
                    <div className="flex items-center gap-3 mb-3">
                      <button onClick={() => { setSelectedArtCategory(null); }} className="p-2 rounded hover:bg-gray-100"><ArrowLeft size={16} /></button>
                      <h4 className="text-sm font-semibold uppercase tracking-wide">{selectedArtCategory}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[480px] overflow-auto">
                      {(() => {
                        const map = {
                          "Holi": ['Happy Holi','Color Splash','Gulal','Holi Burst','Kids Playing','Holi Text'],
                          "Valentines": ['Heart Arrow','Love Badge','Couple Sil','Valentine Text','Be Mine','Heart Spray'],
                          "Winter Mood": ['Snowflake','Winter Mug','Cozy Sweater','Winter Badge','Snowy Scene','Warm Text'],
                          "Trending & Popular": ['Abstract','Minimal','Retro','Pop Shape','Modern Badge','Trendy Text'],
                          "Couples & Romance": ['matching-set','Lock & Key','Kiss','Couple Sil','Romance Text','Pair Badge'],
                          "Class of": ['Year Badge','Graduation Hat','Class Text','Tassel','Grad Icon','Class Emblem'],
                          "School & College": ['Mascot','College Name','Shield','Team Logo','School Text','Crest'],
                          "Sports": ['Ball','Trophy','Team Badge','Sport Text','Medal','Player Sil'],
                          "Go Green": ['Leaf','Eco Badge','Recycle','Plant','Green Text','Earth'],
                          "Animals": ['Paw','Bird','Fish','Cat','Dog','Animal Icon'],
                          "Emojis": ['Smile','Wink','Laugh','Cool','Love','Surprised'],
                          "Workout": ['Dumbbell','Runner','Yoga','Gym Text','Fit Badge','Trainer'],
                          "Dance": ['Ballet','HipHop','Silhouette','Dance Text','Dancer','Moves'],
                          "Clipart": ['Stickers','Icons','Shapes','Badge','Simple Art','Sticker Pack'],
                          "Team Bride": ['Bride Silhouette','Bride Text','Hen Night','Bridal Badge','Bride Icon','Bridesmaid'],
                          "LGBT": ['Rainbow','Pride Heart','Flag','Pride Text','Pride Badge','Unity'],
                          "Team Groom": ['Groom Silhouette','Groom Text','Stag','Groom Badge','Groom Icon','Party'],
                          "Christmas": ['Tree','Santa','Ornament','Santa Hat','Gift','Snowman'],
                        };
                        const subs = map[selectedArtCategory] || [];
                        // Map of category -> asset filenames (place images under public/assets/art/<Category>/)
                        const ART_ASSETS = {
                          Holi: ['happy-holi.png','color-splash.png','gulal.png','holi-burst.png','kids-playing.png','holi-text.png'],
                          Valentines: ['heart-arrow.png','love-badge.png','couple-sil.png','valentine-text.png','be-mine.png','heart-spray.png'],
                          'Winter Mood': ['snowflake.png','winter-mug.png','cozy-sweater.png','winter-badge.png','snowy-scene.png','warm-text.png'],
                          'Trending & Popular': ['abstract.png','minimal.png','retro.png','pop-shape.png','modern-badge.png','trendy-text.png'],
                          'Couples & Romance': ['matching-set.png','lock-key.png','kiss.png','couple-sil.png','romance-text.png','pair-badge.png'],
                          'Class of': ['year-badge.png','graduation-hat.png','class-text.png','tassel.png','grad-icon.png','class-emblem.png'],
                          'School & College': ['mascot.png','college-name.png','shield.png','team-logo.png','school-text.png','crest.png'],
                          Sports: ['ball.png','trophy.png','team-badge.png','sport-text.png','medal.png','player-sil.png'],
                          'Go Green': ['leaf.png','eco-badge.png','recycle.png','plant.png','green-text.png','earth.png'],
                          Animals: ['paw.png','bird.png','fish.png','cat.png','dog.png','animal-icon.png'],
                          Emojis: ['smile.png','wink.png','laugh.png','cool.png','love.png','surprised.png'],
                          Workout: ['dumbbell.png','runner.png','yoga.png','gym-text.png','fit-badge.png','trainer.png'],
                          Dance: ['ballet.png','hiphop.png','silhouette.png','dance-text.png','dancer.png','moves.png'],
                          Clipart: ['stickers.png','icons.png','shapes.png','badge.png','simple-art.png','sticker-pack.png'],
                          'Team Bride': ['bride-silhouette.png','bride-text.png','hen-night.png','bridal-badge.png','bride-icon.png','bridesmaid.png'],
                          LGBT: ['rainbow.png','pride-heart.png','flag.png','pride-text.png','pride-badge.png','unity.png'],
                          'Team Groom': ['groom-silhouette.png','groom-text.png','stag.png','groom-badge.png','groom-icon.png','party.png'],
                          Christmas: ['tree.png','santa.png','ornament.png','santa-hat.png','gift.png','snowman.png'],
                        };

                        const addArtImageFromAsset = (category, filename) => {
                          const targetView = selectedView || 'front';
                          const canvas = getCanvasByView(targetView) || activeCanvas;
                          if (!canvas) return;

                          const tryVariants = (cat) => {
                            const variants = [
                              cat,
                              cat.replace(/\s+/g, '-'),
                              cat.replace(/[^a-z0-9\-]/gi, '-'),
                              cat.replace(/ & /g, ' and '),
                              cat.toLowerCase(),
                            ];
                            return Array.from(new Set(variants));
                          };

                          const baseCandidates = tryVariants(category).map((c) => `/assets/art/${encodeURIComponent(c)}/${encodeURIComponent(filename)}`);

                          // Expand candidates to try alternate extensions (.svg, .webp) if .png fails
                          const expandExts = (url) => {
                            const list = [url];
                            if (/\.png$/i.test(url)) {
                              list.push(url.replace(/\.png$/i, '.svg'));
                              list.push(url.replace(/\.png$/i, '.webp'));
                            } else if (/\.jpg$|\.jpeg$/i.test(url)) {
                              list.push(url.replace(/\.jpe?g$/i, '.png'));
                              list.push(url.replace(/\.jpe?g$/i, '.svg'));
                            } else {
                              list.push(url + '.svg');
                            }
                            return list;
                          };

                          const candidatesExpanded = baseCandidates.flatMap(expandExts);

                          // debug panel removed; no UI update needed

                          const tryLoad = (urls, idx = 0) => {
                            if (idx >= urls.length) {
                              console.warn('addArtImageFromAsset: failed to load', filename, 'for category', category, 'tried', urls);
                              return;
                            }
                            const src = urls[idx];
                            const imgEl = new Image();
                            imgEl.crossOrigin = 'anonymous';
                            imgEl.onload = () => {
                              const fImg = new fabric.Image(imgEl);
                              const maxWidth = CANVAS_CONFIG.width * 0.5;
                              const maxHeight = CANVAS_CONFIG.height * 0.5;
                              if (fImg.width > maxWidth || fImg.height > maxHeight) {
                                const scale = Math.min(maxWidth / fImg.width, maxHeight / fImg.height);
                                fImg.scale(scale);
                              }
                              fImg.set({ left: (canvas.width - fImg.getScaledWidth()) / 2, top: (canvas.height - fImg.getScaledHeight()) / 2 });
                              try { fImg.set('src', imgEl.src); } catch (e) {}
                              canvas.add(fImg);
                              canvas.setActiveObject(fImg);
                              canvas.renderAll();
                              manualSync && manualSync(targetView);
                            };
                            imgEl.onerror = () => tryLoad(urls, idx + 1);
                            imgEl.src = src;
                          };

                          tryLoad(candidatesExpanded);
                        };

                        const filenames = ART_ASSETS[selectedArtCategory] || [];
                        return filenames.map((filename) => {
                          const tryVariantsLocal = (cat) => {
                            const variants = [
                              cat,
                              cat.replace(/\s+/g, '-'),
                              cat.replace(/[^a-z0-9\-]/gi, '-'),
                              cat.replace(/ & /g, ' and '),
                              cat.toLowerCase(),
                            ];
                            return Array.from(new Set(variants));
                          };
                          const candidates = tryVariantsLocal(selectedArtCategory).map((c) => `/assets/art/${encodeURIComponent(c)}/${encodeURIComponent(filename)}`);
                          return (
                          <button
                            key={filename}
                            onClick={() => addArtImageFromAsset(selectedArtCategory, filename)}
                            className="flex flex-col items-center gap-2 p-2 bg-white rounded shadow-sm hover:shadow-md"
                          >
                            <div className="w-full h-32 bg-gray-50 rounded flex items-center justify-center text-xs text-gray-700">
                              <img
                                src={`/assets/art/${encodeURIComponent(selectedArtCategory)}/${encodeURIComponent(filename)}`}
                                alt={filename}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const el = e.currentTarget;
                                  console.warn('Art thumbnail failed to load, attempting fallback:', el.src);
                                  el.onerror = null;
                                  // try swapping .png -> .svg first
                                  const svgCandidate = el.src.replace(/\.png(\?.*)?$/i, '.svg');
                                  if (svgCandidate && svgCandidate !== el.src) {
                                    el.onerror = (ev) => { ev.currentTarget.onerror = null; ev.currentTarget.src = '/3Dmodels/textures/design-fallback.png'; };
                                    el.src = svgCandidate;
                                  } else {
                                    el.src = '/3Dmodels/textures/design-fallback.png';
                                  }
                                }}
                              />
                            </div>
                            <div className="text-xs text-center truncate w-full">{filename.replace(/[-_]/g,' ').replace(/\.[^.]+$/,'')}</div>
                          </button>
                        )});
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

              {it.id === "name" && (
                <div>
                  <h4 className="text-sm font-semibold">Name</h4>
                  <p className="text-xs text-muted-foreground mt-1">Add name/number</p>
                  <div className="mt-3">
                    <button onClick={handleAddText} className="w-full px-3 py-2 bg-gray-800 text-white rounded">Add Name Text</button>
                  </div>
                </div>
              )}

              {it.id === "order" && (
                <div>
                  <h4 className="text-sm font-semibold">Order</h4>
                  <p className="text-xs text-muted-foreground mt-1">Order actions</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button onClick={()=>{ alert('Proceed to checkout (demo)'); }} className="w-full px-3 py-2 bg-gray-800 text-white rounded">Checkout</button>
                    <button onClick={()=>{ alert('Save design (demo)'); }} className="w-full px-3 py-2 border rounded">Save</button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        ))}
      </aside>

      {/* Adjacent panel */}
      <section className="flex-1 p-8">
        <div className="max-w-xl bg-white rounded shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActive(null)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft />
            </button>
            <h3 className="text-lg font-semibold uppercase tracking-wider">Addon</h3>
          </div>

          <div className="mb-6">
            <p className="text-base">Do you want <span className="text-blue-600 font-medium">Embroidery</span> on this product?</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button className="flex-1 py-3 rounded-full bg-gray-800 text-white font-semibold">YES</button>
            <button className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold">NO</button>
          </div>

          <div className="text-sm text-gray-500 leading-relaxed">
            <strong>NOTE:</strong>
            <ul className="list-disc ml-5 mt-2">
              <li>The maximum width possible is 4 inches.</li>
              <li>All embroidery artworks are subject to final confirmation post design team checks. If the artwork cannot be embroidered, you will be informed.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToolBar;
