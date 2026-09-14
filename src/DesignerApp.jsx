import {
  Suspense,
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Canvas,
} from "@react-three/fiber";

import {
  Environment,
  Loader,
  OrbitControls,
} from "@react-three/drei";

import {
  Box,
  Check,
  Save,
  Shirt,
} from "lucide-react";

import DesignArea from "./components/DesignArea";

import {
  TshirtModel,
} from "./components/TShirtModel";

import {
  ToolsSidebar,
} from "./components/ToolsSidebar";

import CustomDesignCartButton
  from "./components/CustomDesignCartButton";

import {
  Toaster,
} from "@/components/ui/toaster";

import {
  setSelectedView,
} from "./features/tshirtSlice";

import {
  useCanvas,
} from "./hooks/useCanvas";

import {
  useCanvasTextureSync,
} from "./hooks/useCanvasTextureSync";

import {
  TSHIRT_TYPES,
} from "./constants/designConstants";

import canvasStorageManager
  from "./utils/canvasStorageManager";

function App() {
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

  const selectedType =
    useSelector(
      (state) =>
        state.tshirt.selectedType
    );

  const dispatch =
    useDispatch();

  /*
   * ==========================================================
   * PREVIEW MODE
   * ==========================================================
   */

  const [
    previewMode,
    setPreviewMode,
  ] = useState("2d");

  const [
    saved,
    setSaved,
  ] = useState(false);

  /*
   * ==========================================================
   * SELECTED GARMENT CONFIG
   * ==========================================================
   */

  const selectedTshirtConfig =
    TSHIRT_TYPES?.[
      selectedType
    ] || null;

  /*
   * ==========================================================
   * 3D SUPPORT
   *
   * Your Round Neck garment is currently named:
   *
   * "Crew Neck"
   *
   * So for now only Crew Neck gets 3D.
   * ==========================================================
   */

  const supports3D =
    useMemo(() => {
      const garmentName =
        String(
          selectedTshirtConfig?.name ||
            ""
        )
          .trim()
          .toUpperCase();

      return (
        garmentName ===
          "CREW NECK" ||
        garmentName ===
          "ROUND NECK" ||
        garmentName.includes(
          "CREW NECK"
        ) ||
        garmentName.includes(
          "ROUND NECK"
        )
      );
    }, [
      selectedTshirtConfig,
    ]);

  /*
   * ==========================================================
   * FABRIC CANVASES
   * ==========================================================
   */

  const {
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
  } = useCanvas();

  /*
   * ==========================================================
   * TEXTURE SYNC
   * ==========================================================
   */

  const {
    designTextureFront,
    designTextureBack,
    designTextureLeft,
    designTextureRight,

    manualTriggerSync,
  } = useCanvasTextureSync({
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
    selectedView,
  });

  /*
   * ==========================================================
   * MANUAL SYNC
   * ==========================================================
   */

  const manualSync =
    (view) => {
      manualTriggerSync(
        view ||
          selectedView
      );
    };

  /*
   * ==========================================================
   * 3D MODEL VIEW CHANGE
   * ==========================================================
   */

  const handleViewChange =
    (view) => {
      if (
        view !==
        selectedView
      ) {
        dispatch(
          setSelectedView(
            view
          )
        );
      }
    };

  /*
   * ==========================================================
   * TOGGLE 2D / 3D
   * ==========================================================
   */

  const handleTogglePreview =
    async () => {
      /*
       * 3D -> 2D
       */
      if (
        previewMode ===
        "3d"
      ) {
        setPreviewMode(
          "2d"
        );

        return;
      }

      /*
       * Prevent unsupported garments
       * from opening 3D.
       */
      if (!supports3D) {
        return;
      }

      /*
       * Make sure the latest artwork
       * is pushed to the 3D textures.
       */
      try {
        await manualTriggerSync();
      } catch (
        error
      ) {
        console.error(
          "Unable to sync design before opening 3D",
          error
        );
      }

      setPreviewMode(
        "3d"
      );
    };

  /*
   * ==========================================================
   * SAVE DESIGN
   * ==========================================================
   */

  const handleSaveDesign =
    () => {
      try {
        /*
         * FRONT
         */
        if (frontCanvas) {
          canvasStorageManager
            .saveCanvasObjects(
              "front",
              frontCanvas
            );
        }

        /*
         * BACK
         */
        if (backCanvas) {
          canvasStorageManager
            .saveCanvasObjects(
              "back",
              backCanvas
            );
        }

        /*
         * LEFT
         */
        if (leftCanvas) {
          canvasStorageManager
            .saveCanvasObjects(
              "left",
              leftCanvas
            );
        }

        /*
         * RIGHT
         */
        if (rightCanvas) {
          canvasStorageManager
            .saveCanvasObjects(
              "right",
              rightCanvas
            );
        }

        /*
         * DESIGN METADATA
         */
        localStorage.setItem(
          "MOGREN_DESIGN_META",

          JSON.stringify({
            selectedType,
            tshirtColor,

            savedAt:
              new Date()
                .toISOString(),
          })
        );

        /*
         * Saved visual feedback.
         */
        setSaved(true);

        window.setTimeout(
          () => {
            setSaved(false);
          },
          1500
        );
      } catch (
        error
      ) {
        console.error(
          "Unable to save design",
          error
        );
      }
    };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div
      className="
        min-h-screen
        bg-[#f6f6f6]
      "
    >
      <div className="flex">

        {/* ================================================
            LEFT TOOLS
        ================================================ */}

        <ToolsSidebar
          manualSync={
            manualSync
          }
        />

        {/* ================================================
            MAIN CONTENT
        ================================================ */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <main
            className="
              relative
              min-h-[calc(100vh-72px)]
            "
          >

            {/* ============================================
                TOP RIGHT ACTION BUTTONS
            ============================================ */}

            <div
              className="
                fixed
                right-6
                top-[92px]
                z-[9999]

                flex
                items-center
                gap-3
              "
            >

              {/* ==========================================
                  SAVE DESIGN
              ========================================== */}

              <button
                type="button"

                onClick={
                  handleSaveDesign
                }

                className={`
                  inline-flex
                  h-[46px]

                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  border

                  px-6

                  text-sm
                  font-bold

                  shadow-lg

                  transition-all
                  duration-200

                  ${
                    saved
                      ? `
                        border-emerald-600
                        bg-emerald-600
                        text-white
                      `
                      : `
                        border-black
                        bg-white
                        text-black

                        hover:bg-zinc-100
                      `
                  }
                `}
              >
                {saved ? (
                  <>
                    <Check
                      size={17}
                    />

                    <span>
                      Saved
                    </span>
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />

                    <span>
                      Save Design
                    </span>
                  </>
                )}
              </button>

              {/* ==========================================
                  2D / 3D TOGGLE

                  CREW NECK ONLY
              ========================================== */}

              {supports3D && (
                <button
                  type="button"

                  onClick={
                    handleTogglePreview
                  }

                  className="
                    inline-flex
                    h-[46px]

                    items-center
                    justify-center
                    gap-2

                    rounded-full

                    border
                    border-black

                    bg-black

                    px-6

                    text-sm
                    font-bold
                    text-white

                    shadow-lg

                    transition-all
                    duration-200

                    hover:scale-[1.02]
                    hover:bg-zinc-800
                  "
                >
                  {previewMode ===
                  "2d" ? (
                    <>
                      <Box
                        size={17}
                      />

                      <span>
                        3D View
                      </span>
                    </>
                  ) : (
                    <>
                      <Shirt
                        size={17}
                      />

                      <span>
                        2D View
                      </span>
                    </>
                  )}
                </button>
              )}

            </div>

            {/* ============================================
                2D DESIGN AREA

                IMPORTANT:
                DesignArea remains mounted.

                We only hide it so all Fabric canvases
                remain alive.
            ============================================ */}

            <div
              className={`
                min-h-[calc(100vh-72px)]
                w-full

                ${
                  previewMode ===
                  "2d"
                    ? "block"
                    : "hidden"
                }
              `}
            >
              <DesignArea />
            </div>

            {/* ============================================
                3D VIEW

                CREW NECK ONLY
            ============================================ */}

            {supports3D && (
              <div
                className={`
                  min-h-[calc(100vh-72px)]
                  w-full

                  ${
                    previewMode ===
                    "3d"
                      ? "flex"
                      : "hidden"
                  }

                  items-center
                  justify-center
                `}
              >

                <div
                  className="
                    relative

                    h-[calc(100vh-100px)]
                    min-h-[650px]

                    w-full
                  "
                >

                  <Canvas>

                    <OrbitControls
                      enablePan={
                        false
                      }

                      enableZoom={
                        true
                      }

                      maxPolarAngle={
                        Math.PI /
                        2
                      }

                      minPolarAngle={
                        Math.PI /
                        3
                      }
                    />

                    <Suspense
                      fallback={
                        null
                      }
                    >

                      <TshirtModel
                        tshirtColor={
                          tshirtColor
                        }

                        onViewChange={
                          handleViewChange
                        }

                        designTexture={
                          designTextureFront
                        }

                        designTextureBack={
                          designTextureBack
                        }

                        designTextureLeft={
                          designTextureLeft
                        }

                        designTextureRight={
                          designTextureRight
                        }
                      />

                      <Environment
                        preset="sunset"
                      />

                    </Suspense>

                  </Canvas>

                  {/* ====================================
                      3D LOADER
                  ==================================== */}

                  <Loader
                    containerStyles={{
                      position:
                        "absolute",

                      inset:
                        0,

                      width:
                        "100%",

                      height:
                        "100%",

                      background:
                        "rgba(255,255,255,0.85)",

                      pointerEvents:
                        "none",
                    }}

                    dataStyles={{
                      color:
                        "#000",

                      fontSize:
                        "14px",

                      fontWeight:
                        "600",
                    }}

                    barStyles={{
                      backgroundColor:
                        "#000",

                      height:
                        "2px",
                    }}
                  />

                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ================================================
          CART BUTTON

          Save Design is no longer rendered here.
      ================================================ */}

      <CustomDesignCartButton />

      <Toaster />

    </div>
  );
}

export default App;