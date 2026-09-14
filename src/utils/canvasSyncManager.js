import { STORAGE_KEYS } from "./canvasStorageManager";
import * as fabric from "fabric";
// canvasSyncManager.js
export const canvasSyncManager = {
  getCanvasTexture: async (fabricCanvas) => {
    if (!fabricCanvas) return null;
    try {
      console.debug("getCanvasTexture: start for canvas", fabricCanvas.upperCanvasEl ? fabricCanvas.upperCanvasEl.id : fabricCanvas);
      // Wait until any fabric.Image objects have their underlying elements loaded
      const waitForImagesReady = (canvas, timeout = 1500) => {
        return new Promise((resolve) => {
          const start = Date.now();
          const check = () => {
            const imgs = canvas.getObjects().filter((o) => o.type === "image");
            const allReady = imgs.every((img) => {
              try {
                const el = img.getElement && img.getElement();
                return el ? el.complete === true : true;
              } catch (e) {
                return true;
              }
            });
            if (allReady) return resolve(true);
            if (Date.now() - start > timeout) return resolve(false);
            setTimeout(check, 50);
          };
          check();
        });
      };

      const imagesReady = await waitForImagesReady(fabricCanvas, 2000);
      console.info("getCanvasTexture: imagesReady=", imagesReady);

      // Force a render before getting the texture
      fabricCanvas.renderAll();

      // Use the upper canvas which contains the actual visible content
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
        enableRetinaScaling: true,
      });

      console.info("getCanvasTexture: dataURL length=", dataURL ? dataURL.length : 0);
      return dataURL;
    } catch (error) {
      console.error("Error generating texture:", error);
      return null;
    }
  },

  getCanvasTextureFromStorage: (view) => {
    return new Promise((resolve, reject) => {
      try {
        const storageKey =
          view === "front"
            ? STORAGE_KEYS.FRONT_CANVAS
            : STORAGE_KEYS.BACK_CANVAS;

        const storedObjects = localStorage.getItem(storageKey);
        if (!storedObjects) {
          resolve(null);
          return;
        }

        // Parse the stored JSON objects
        const parsedObjects = JSON.parse(storedObjects);

        // Create a temporary canvas
        const tempCanvas = new fabric.Canvas(null, {
          width: 450, // Set appropriate width
          height: 500, // Set appropriate height
        });

        // Use fabric.util.enlivenObjects to recreate canvas objects
        fabric.util.enlivenObjects(
          parsedObjects,
          (objects) => {
            // Add recreated objects to the canvas
            objects.forEach((obj) => {
              tempCanvas.add(obj);
            });

            // Wait for any images to finish loading on the temporary canvas
            const waitForImagesReadyTemp = (canvas, timeout = 1500) => {
              return new Promise((res) => {
                const start = Date.now();
                const checkTemp = () => {
                  const imgs = canvas.getObjects().filter((o) => o.type === "image");
                  const allReady = imgs.every((img) => {
                    try {
                      const el = img.getElement && img.getElement();
                      return el ? el.complete === true : true;
                    } catch (e) {
                      return true;
                    }
                  });
                  if (allReady) return res(true);
                  if (Date.now() - start > timeout) return res(false);
                  setTimeout(checkTemp, 50);
                };
                checkTemp();
              });
            };

            waitForImagesReadyTemp(tempCanvas, 2000).then((ready) => {
              console.info("getCanvasTextureFromStorage: temp imagesReady=", ready);
              // Generate texture
              const dataURL = tempCanvas.toDataURL({
                format: "png",
                quality: 1,
                multiplier: 1,
                enableRetinaScaling: true,
              });
              console.info("getCanvasTextureFromStorage: dataURL length=", dataURL ? dataURL.length : 0);
              resolve(dataURL);
            });
          },
          (error) => {
            console.error("Error enlivening objects:", error);
            resolve(null);
          }
        );
      } catch (error) {
        console.error("Error retrieving canvas texture from storage:", error);
        reject(error);
      }
    });
  },

  // utility function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};
