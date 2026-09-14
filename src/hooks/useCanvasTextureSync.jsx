import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  canvasSyncManager,
} from "@/utils/canvasSyncManager";

export const useCanvasTextureSync = ({
  frontCanvas,
  backCanvas,
  leftCanvas,
  rightCanvas,
  selectedView,
}) => {
  const [
    designTextureFront,
    setDesignTextureFront,
  ] = useState(null);

  const [
    designTextureBack,
    setDesignTextureBack,
  ] = useState(null);

  const [
    designTextureLeft,
    setDesignTextureLeft,
  ] = useState(null);

  const [
    designTextureRight,
    setDesignTextureRight,
  ] = useState(null);

  /*
   * =========================================================
   * GENERATE TEXTURE
   *
   * IMPORTANT:
   *
   * canvasSyncManager.getCanvasTexture() is ASYNC.
   *
   * Therefore we MUST await it.
   * =========================================================
   */

  const generateTexture =
    useCallback(
      async (canvas, view) => {
        if (!canvas) {
          console.warn(
            `Texture sync skipped: ${view} canvas is null`
          );

          return null;
        }

        try {
          /*
           * Make sure Fabric has rendered its latest objects.
           */
          canvas.requestRenderAll();

          /*
           * CRITICAL FIX:
           *
           * BEFORE:
           *
           * const texture =
           *   canvasSyncManager.getCanvasTexture(canvas);
           *
           * That returned a Promise.
           *
           * NOW:
           */
          const texture =
            await canvasSyncManager.getCanvasTexture(
              canvas
            );

          if (!texture) {
            console.warn(
              `Texture sync returned empty texture for ${view}`
            );

            return null;
          }

          /*
           * Diagnostic.
           *
           * You should see:
           *
           * data:image/png;base64,...
           */
          console.log(
            `✅ ${view.toUpperCase()} texture generated`,
            {
              type:
                typeof texture,

              start:
                texture.substring?.(
                  0,
                  30
                ),

              length:
                texture.length,
            }
          );

          switch (view) {
            case "front":
              setDesignTextureFront(
                texture
              );
              break;

            case "back":
              setDesignTextureBack(
                texture
              );
              break;

            case "left":
              setDesignTextureLeft(
                texture
              );
              break;

            case "right":
              setDesignTextureRight(
                texture
              );
              break;

            default:
              console.warn(
                "Unknown canvas view:",
                view
              );
              break;
          }

          return texture;
        } catch (error) {
          console.error(
            `❌ Unable to generate ${view} texture`,
            error
          );

          return null;
        }
      },
      []
    );

  /*
   * =========================================================
   * COMMON EVENT REGISTRATION
   * =========================================================
   *
   * Avoid repeating the exact same event code four times.
   */

  const attachCanvasSync =
    useCallback(
      (
        canvas,
        view
      ) => {
        if (!canvas) {
          return undefined;
        }

        /*
         * Event handlers do not need to wait for the promise.
         */
        const sync =
          () => {
            void generateTexture(
              canvas,
              view
            );
          };

        /*
         * Initial texture.
         */
        sync();

        /*
         * Artwork changes.
         */
        canvas.on(
          "object:added",
          sync
        );

        canvas.on(
          "object:modified",
          sync
        );

        canvas.on(
          "object:removed",
          sync
        );

        /*
         * Live movement.
         */
        canvas.on(
          "object:moving",
          sync
        );

        canvas.on(
          "object:scaling",
          sync
        );

        canvas.on(
          "object:rotating",
          sync
        );

        return () => {
          canvas.off(
            "object:added",
            sync
          );

          canvas.off(
            "object:modified",
            sync
          );

          canvas.off(
            "object:removed",
            sync
          );

          canvas.off(
            "object:moving",
            sync
          );

          canvas.off(
            "object:scaling",
            sync
          );

          canvas.off(
            "object:rotating",
            sync
          );
        };
      },
      [
        generateTexture,
      ]
    );

  /*
   * =========================================================
   * FRONT
   * =========================================================
   */

  useEffect(() => {
    return attachCanvasSync(
      frontCanvas,
      "front"
    );
  }, [
    frontCanvas,
    attachCanvasSync,
  ]);

  /*
   * =========================================================
   * BACK
   * =========================================================
   */

  useEffect(() => {
    return attachCanvasSync(
      backCanvas,
      "back"
    );
  }, [
    backCanvas,
    attachCanvasSync,
  ]);

  /*
   * =========================================================
   * LEFT
   * =========================================================
   */

  useEffect(() => {
    return attachCanvasSync(
      leftCanvas,
      "left"
    );
  }, [
    leftCanvas,
    attachCanvasSync,
  ]);

  /*
   * =========================================================
   * RIGHT
   * =========================================================
   */

  useEffect(() => {
    return attachCanvasSync(
      rightCanvas,
      "right"
    );
  }, [
    rightCanvas,
    attachCanvasSync,
  ]);

  /*
   * =========================================================
   * SYNC SELECTED VIEW
   * =========================================================
   */

  useEffect(() => {
    switch (
      selectedView
    ) {
      case "front":
        void generateTexture(
          frontCanvas,
          "front"
        );
        break;

      case "back":
        void generateTexture(
          backCanvas,
          "back"
        );
        break;

      case "left":
        void generateTexture(
          leftCanvas,
          "left"
        );
        break;

      case "right":
        void generateTexture(
          rightCanvas,
          "right"
        );
        break;

      default:
        break;
    }
  }, [
    selectedView,
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
    generateTexture,
  ]);

  /*
   * =========================================================
   * MANUAL SYNC
   * =========================================================
   */

  const manualTriggerSync =
    useCallback(
      async (view) => {
        switch (view) {
          case "front":
            return await generateTexture(
              frontCanvas,
              "front"
            );

          case "back":
            return await generateTexture(
              backCanvas,
              "back"
            );

          case "left":
            return await generateTexture(
              leftCanvas,
              "left"
            );

          case "right":
            return await generateTexture(
              rightCanvas,
              "right"
            );

          default:
            /*
             * Sync everything.
             */
            await Promise.all([
              generateTexture(
                frontCanvas,
                "front"
              ),

              generateTexture(
                backCanvas,
                "back"
              ),

              generateTexture(
                leftCanvas,
                "left"
              ),

              generateTexture(
                rightCanvas,
                "right"
              ),
            ]);

            return null;
        }
      },
      [
        frontCanvas,
        backCanvas,
        leftCanvas,
        rightCanvas,
        generateTexture,
      ]
    );

  /*
   * =========================================================
   * RETURN
   * =========================================================
   */

  return {
    designTextureFront,
    designTextureBack,
    designTextureLeft,
    designTextureRight,

    manualTriggerSync,
  };
};