import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import * as fabric from "fabric";

import {
  CANVAS_CONFIG,
} from "../constants/designConstants";

import {
  useSelector,
} from "react-redux";

import {
  useCanvas,
} from "@/hooks/useCanvas";

import canvasStorageManager
  from "@/utils/canvasStorageManager";

import {
  canvasSyncManager,
} from "@/utils/canvasSyncManager";

/*
 * ============================================================
 * USE TSHIRT CANVAS
 * ============================================================
 */
export const useTshirtCanvas = ({
  svgPath,
  view,
  onDesignUpdate,

  /*
   * New realistic mockup DesignArea:
   *
   * false
   *
   * Old SVG designer:
   *
   * true
   */
  clipToGarment = false,
}) => {
  /*
   * ==========================================================
   * REFS
   * ==========================================================
   */

  const canvasRef =
    useRef(null);

  const fabricCanvasRef =
    useRef(null);

  /*
   * Prevent React closures from holding stale callback values.
   */
  const designUpdateRef =
    useRef(onDesignUpdate);

  /*
   * ==========================================================
   * REDUX
   * ==========================================================
   */

  const tshirtColor =
    useSelector(
      (state) =>
        state.tshirt.tshirtColor
    );

  const selectedView =
    useSelector(
      (state) =>
        state.tshirt.selectedView
    );

  /*
   * ==========================================================
   * CANVAS CONTEXT
   * ==========================================================
   */

  const {
    setActiveCanvas,
    setSelectedObject,

    setFrontCanvas,
    setBackCanvas,
    setLeftCanvas,
    setRightCanvas,
  } = useCanvas();

  /*
   * ==========================================================
   * KEEP CALLBACK REF CURRENT
   * ==========================================================
   */

  useEffect(() => {
    designUpdateRef.current =
      onDesignUpdate;
  }, [onDesignUpdate]);

  /*
   * ==========================================================
   * REGISTER CANVAS
   * ==========================================================
   */

  const registerCanvas =
    useCallback(
      (canvas) => {
        if (
          view === "front"
        ) {
          setFrontCanvas(
            canvas
          );
        }

        if (
          view === "back"
        ) {
          setBackCanvas(
            canvas
          );
        }

        if (
          view === "left"
        ) {
          setLeftCanvas(
            canvas
          );
        }

        if (
          view === "right"
        ) {
          setRightCanvas(
            canvas
          );
        }
      },
      [
        view,
        setFrontCanvas,
        setBackCanvas,
        setLeftCanvas,
        setRightCanvas,
      ]
    );

  /*
   * ==========================================================
   * SAVE CANVAS
   * ==========================================================
   */

  const saveCanvas =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) {
        return;
      }

      try {
        canvasStorageManager
          .saveCanvasObjects(
            view,
            canvas
          );
      } catch (error) {
        console.error(
          `Unable to save ${view} canvas`,
          error
        );
      }
    }, [view]);

  /*
   * ==========================================================
   * GENERATE TEXTURE FOR 3D
   * ==========================================================
   */

  const notifyDesignChange =
  useCallback(async () => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    try {
      canvasStorageManager
        .saveCanvasObjects(
          view,
          canvas
        );
    } catch (error) {
      console.error(
        `Unable to auto-save ${view}`,
        error
      );
    }

    if (
      designUpdateRef.current
    ) {
      try {
        const textureDataUrl =
          await canvasSyncManager
            .getCanvasTexture(
              canvas
            );

        if (
          textureDataUrl
        ) {
          designUpdateRef.current(
            textureDataUrl
          );
        }
      } catch (error) {
        console.error(
          `Unable to sync ${view} texture`,
          error
        );
      }
    }
  }, [view]);

  /*
   * ==========================================================
   * INITIALIZE FABRIC
   *
   * IMPORTANT:
   *
   * This effect runs ONCE per view.
   *
   * It does NOT depend on selectedView.
   *
   * Switching Front -> Back therefore does NOT destroy Front.
   * ==========================================================
   */

  useEffect(() => {
    if (
      !canvasRef.current
    ) {
      return;
    }

    /*
     * Protect against accidental duplicate Fabric instance.
     */
    if (
      fabricCanvasRef.current
    ) {
      return;
    }

    /*
     * ========================================================
     * CREATE FABRIC CANVAS
     * ========================================================
     */

    const canvas =
      new fabric.Canvas(
        canvasRef.current,
        {
          /*
           * Keep one stable logical coordinate system.
           */
          ...CANVAS_CONFIG,

          width:
            CANVAS_CONFIG.width,

          height:
            CANVAS_CONFIG.height,

          preserveObjectStacking:
            true,

          selection:
            true,

          backgroundColor:
            "transparent",
        }
      );

    fabricCanvasRef.current =
      canvas;

    /*
     * ========================================================
     * MAKE FABRIC'S GENERATED WRAPPER RESPONSIVE
     * ========================================================
     *
     * Fabric creates:
     *
     * .canvas-container
     *   lower-canvas
     *   upper-canvas
     *
     * Logical Fabric size remains CANVAS_CONFIG.
     * CSS scales it to our dotted print area.
     * ========================================================
     */

    if (
      canvas.wrapperEl
    ) {
      canvas.wrapperEl.style.width =
        "100%";

      canvas.wrapperEl.style.height =
        "100%";

      canvas.wrapperEl.style.position =
        "relative";
    }

    if (
      canvas.lowerCanvasEl
    ) {
      canvas.lowerCanvasEl.style.width =
        "100%";

      canvas.lowerCanvasEl.style.height =
        "100%";
    }

    if (
      canvas.upperCanvasEl
    ) {
      canvas.upperCanvasEl.style.width =
        "100%";

      canvas.upperCanvasEl.style.height =
        "100%";
    }

    /*
     * Needed because canvas is visually scaled with CSS.
     */
    canvas.calcOffset();

    /*
     * ========================================================
     * REGISTER
     * ========================================================
     */

    registerCanvas(
      canvas
    );

    /*
     * Set as active if this is the currently selected view.
     */
    if (
      selectedView ===
      view
    ) {
      setActiveCanvas(
        canvas
      );
    }

    /*
     * ========================================================
     * LOAD STORED DESIGN
     * ========================================================
     */

    const restoreCanvas =
      async () => {
        try {
          const saved =
            canvasStorageManager
              .loadCanvasObjects(
                view
              );

          if (!saved) {
            return;
          }

          let json =
            null;

          /*
           * Full Fabric JSON
           */
          if (
            saved.objects &&
            Array.isArray(
              saved.objects
            )
          ) {
            json =
              saved;
          }

          /*
           * Legacy array
           */
          else if (
            Array.isArray(
              saved
            )
          ) {
            json = {
              version:
                fabric.version,

              objects:
                saved,
            };
          }

          if (!json) {
            return;
          }

          /*
           * Fabric 6 returns a Promise.
           */
          await canvas
            .loadFromJSON(
              json
            );

          canvas
            .requestRenderAll();

          /*
           * Refresh 3D texture after restoration.
           */
          if (
            designUpdateRef.current
          ) {
            try {
              const textureDataUrl =
                canvasSyncManager
                  .getCanvasTexture(
                    canvas
                  );

              designUpdateRef.current(
                textureDataUrl
              );
            } catch (
              error
            ) {
              console.error(
                `Unable to sync restored ${view} texture`,
                error
              );
            }
          }
        } catch (error) {
          console.error(
            `Unable to restore ${view} canvas`,
            error
          );
        }
      };

    restoreCanvas();

    /*
     * ========================================================
     * SELECTION EVENTS
     * ========================================================
     */

    const handleSelectionCreated =
      (event) => {
        setSelectedObject(
          event.selected?.[0] ||
            null
        );
      };

    const handleSelectionUpdated =
      (event) => {
        setSelectedObject(
          event.selected?.[0] ||
            null
        );
      };

    const handleSelectionCleared =
      () => {
        setSelectedObject(
          null
        );
      };

    canvas.on(
      "selection:created",
      handleSelectionCreated
    );

    canvas.on(
      "selection:updated",
      handleSelectionUpdated
    );

    canvas.on(
      "selection:cleared",
      handleSelectionCleared
    );

    /*
     * ========================================================
     * DESIGN EVENTS
     * ========================================================
     */

    canvas.on(
      "object:added",
      notifyDesignChange
    );

    canvas.on(
      "object:modified",
      notifyDesignChange
    );

    canvas.on(
      "object:removed",
      notifyDesignChange
    );

    /*
     * Also synchronize while object is moving/scaling/rotating.
     *
     * This makes 3D preview feel much more live.
     */

    canvas.on(
      "object:moving",
      notifyDesignChange
    );

    canvas.on(
      "object:scaling",
      notifyDesignChange
    );

    canvas.on(
      "object:rotating",
      notifyDesignChange
    );

    /*
     * ========================================================
     * WINDOW RESIZE
     *
     * Update Fabric pointer calculations when responsive
     * CSS changes visual canvas dimensions.
     * ========================================================
     */

    const handleResize =
      () => {
        canvas.calcOffset();
      };

    window.addEventListener(
      "resize",
      handleResize
    );

    /*
     * ========================================================
     * BEFORE UNLOAD
     * ========================================================
     */

    window.addEventListener(
      "beforeunload",
      saveCanvas
    );

    /*
     * ========================================================
     * CLEANUP
     *
     * This should now happen only when the whole designer
     * actually unmounts — NOT while switching views.
     * ========================================================
     */

    return () => {
      try {
        saveCanvas();

        window.removeEventListener(
          "resize",
          handleResize
        );

        window.removeEventListener(
          "beforeunload",
          saveCanvas
        );

        canvas.off(
          "selection:created",
          handleSelectionCreated
        );

        canvas.off(
          "selection:updated",
          handleSelectionUpdated
        );

        canvas.off(
          "selection:cleared",
          handleSelectionCleared
        );

        canvas.off(
          "object:added",
          notifyDesignChange
        );

        canvas.off(
          "object:modified",
          notifyDesignChange
        );

        canvas.off(
          "object:removed",
          notifyDesignChange
        );

        canvas.off(
          "object:moving",
          notifyDesignChange
        );

        canvas.off(
          "object:scaling",
          notifyDesignChange
        );

        canvas.off(
          "object:rotating",
          notifyDesignChange
        );

        canvas.dispose();
      } catch (
        error
      ) {
        console.error(
          `Error disposing ${view} canvas`,
          error
        );
      }

      fabricCanvasRef.current =
        null;

      setSelectedObject(
        null
      );
    };

    /*
     * CRITICAL:
     *
     * Do NOT add selectedView here.
     *
     * Do NOT add width/height here.
     *
     * Otherwise Fabric will be recreated.
     */
  }, [
    view,
    registerCanvas,
    notifyDesignChange,
    saveCanvas,
    setActiveCanvas,
    setSelectedObject,
  ]);

  /*
   * ==========================================================
   * SWITCH ACTIVE CANVAS
   *
   * Existing Fabric instances stay alive.
   *
   * We simply tell toolbar:
   *
   * "this is now the active one."
   * ==========================================================
   */

  useEffect(() => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    if (
      selectedView ===
      view
    ) {
      setActiveCanvas(
        canvas
      );

      /*
       * Recalculate mouse coordinates after canvas became visible.
       */
      requestAnimationFrame(
        () => {
          canvas.calcOffset();

          canvas
            .requestRenderAll();
        }
      );
    }
  }, [
    selectedView,
    view,
    setActiveCanvas,
  ]);

  /*
   * ==========================================================
   * CLIP PATH
   * ==========================================================
   *
   * For our new realistic PNG design:
   *
   * clipToGarment = false
   *
   * So no SVG clipping is used.
   * ==========================================================
   */

  useEffect(() => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) {
      return;
    }

    /*
     * New design area.
     */
    if (
      !clipToGarment
    ) {
      canvas.clipPath =
        null;

      canvas
        .requestRenderAll();

      return;
    }

    /*
     * Old SVG mode.
     */
    if (!svgPath) {
      canvas.clipPath =
        null;

      canvas
        .requestRenderAll();

      return;
    }

    /*
     * ========================================================
     * LEGACY SVG CLIPPING
     * ========================================================
     */

    const clipPath =
      new fabric.Path(
        svgPath
      );

    const scale =
      CANVAS_CONFIG.height /
      810;

    let scaleAdj =
      scale * 0.9;

    let left =
      5;

    let top =
      64;

    if (
      view === "left"
    ) {
      scaleAdj =
        scale * 1.05;

      left =
        20;

      top =
        110;
    } else if (
      view === "right"
    ) {
      scaleAdj =
        scale * 1.05;

      left =
        CANVAS_CONFIG.width -
        180;

      top =
        110;
    }

    clipPath.set({
      scaleX:
        scaleAdj,

      scaleY:
        scaleAdj,

      left,

      top,

      originX:
        "left",

      originY:
        "top",

      absolutePositioned:
        true,

      selectable:
        false,

      evented:
        false,
    });

    canvas.clipPath =
      clipPath;

    canvas
      .requestRenderAll();
  }, [
    svgPath,
    view,
    clipToGarment,
  ]);

  /*
   * ==========================================================
   * RETURN
   * ==========================================================
   */

  return {
    canvasRef,

    fabricCanvasRef,

    tshirtColor,

    saveCanvas,
  };
};