export const STORAGE_KEYS = {
  FRONT_CANVAS: "tshirt-designer-front",
  BACK_CANVAS: "tshirt-designer-back",
  LEFT_CANVAS: "tshirt-designer-left",
  RIGHT_CANVAS: "tshirt-designer-right",
};

const canvasStorageManager = {
  // Save canvas objects
  saveCanvasObjects: (view, canvas) => {
    if (!canvas) return;
    try {
      let storageKey;
      if (view === "front") storageKey = STORAGE_KEYS.FRONT_CANVAS;
      else if (view === "back") storageKey = STORAGE_KEYS.BACK_CANVAS;
      else if (view === "left") storageKey = STORAGE_KEYS.LEFT_CANVAS;
      else if (view === "right") storageKey = STORAGE_KEYS.RIGHT_CANVAS;
      else storageKey = STORAGE_KEYS.FRONT_CANVAS;

      // Save full canvas JSON (preferred) so we have object metadata
      const json = canvas.toJSON();
      localStorage.setItem(storageKey, JSON.stringify(json));
    } catch (error) {
      console.error("Error saving canvas objects:", error);
    }
  },

  // Load canvas objects
  loadCanvasObjects: (view) => {
    try {
      let storageKey;
      if (view === "front") storageKey = STORAGE_KEYS.FRONT_CANVAS;
      else if (view === "back") storageKey = STORAGE_KEYS.BACK_CANVAS;
      else if (view === "left") storageKey = STORAGE_KEYS.LEFT_CANVAS;
      else if (view === "right") storageKey = STORAGE_KEYS.RIGHT_CANVAS;
      else storageKey = STORAGE_KEYS.FRONT_CANVAS;

      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading canvas objects:", error);
      return null;
    }
  },

  // Clear stored objects for a specific view
  clearCanvasStorage: (view) => {
    if (view === "all") {
      localStorage.clear();
    } else {
      let storageKey;
      if (view === "front") storageKey = STORAGE_KEYS.FRONT_CANVAS;
      else if (view === "back") storageKey = STORAGE_KEYS.BACK_CANVAS;
      else if (view === "left") storageKey = STORAGE_KEYS.LEFT_CANVAS;
      else if (view === "right") storageKey = STORAGE_KEYS.RIGHT_CANVAS;
      else storageKey = STORAGE_KEYS.FRONT_CANVAS;

      localStorage.removeItem(storageKey);
    }
  },

  // Setup canvas event listeners for auto-saving
  // setupCanvasAutoSave: (canvas, view) => {
  //   if (!canvas) return;

  //   const events = [
  //     "object:modified",
  //     "object:added",
  //     "object:removed",
  //     "path:created",
  //   ];

  //   events.forEach((eventType) => {
  //     canvas.on(eventType, () => {
  //       canvasStorageManager.saveCanvasObjects(view, canvas);
  //     });
  //   });
  // },
};

export default canvasStorageManager;
