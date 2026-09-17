import {
  Suspense,
  useEffect,
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

import DesignArea
  from "./components/DesignArea";

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

/*
 * ============================================================
 * DESIGNER APP
 * ============================================================
 *
 * basePrice:
 *
 * For now defaults to ₹999.
 *
 * Later Product page should pass the actual base product price.
 *
 * Example:
 *
 * <DesignerApp
 *    basePrice={899}
 * />
 *
 * ============================================================
 */

function App({
  basePrice = 999,
}) {

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
   * CUSTOMIZATION PRICING
   * ==========================================================
   */

  const [
    customizationPricing,
    setCustomizationPricing,
  ] = useState([]);

  const [
    pricingLoading,
    setPricingLoading,
  ] = useState(false);

  const [
    pricingError,
    setPricingError,
  ] = useState("");

  /*
   * ==========================================================
   * DESIGN PRESENCE
   * ==========================================================
   *
   * We only charge when the respective Fabric canvas
   * actually contains at least one design object.
   * ==========================================================
   */

  const [
    designPresence,
    setDesignPresence,
  ] = useState({
    front: false,
    back: false,
    left: false,
    right: false,
  });

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
   * NORMALIZED GARMENT NAME
   * ==========================================================
   */

  const garmentName =
    useMemo(() => {
      return String(
        selectedTshirtConfig?.name ||
          selectedType ||
          ""
      )
        .trim()
        .toUpperCase();
    }, [
      selectedTshirtConfig,
      selectedType,
    ]);

  /*
   * ==========================================================
   * BACKEND GARMENT TYPE
   * ==========================================================
   *
   * IMPORTANT:
   *
   * Frontend currently calls Round Neck:
   *
   * "Crew Neck"
   *
   * Backend pricing uses:
   *
   * ROUND_NECK
   *
   * This mapper keeps UI terminology separate from the
   * backend's stable business identifier.
   * ==========================================================
   */

  const backendGarmentType =
    useMemo(() => {

      /*
       * CREW / ROUND NECK
       */
      if (
        garmentName.includes(
          "CREW NECK"
        ) ||
        garmentName.includes(
          "ROUND NECK"
        )
      ) {
        return "ROUND_NECK";
      }

      /*
       * WOMEN POLO
       */
      if (
        garmentName.includes(
          "WOMEN"
        ) &&
        garmentName.includes(
          "POLO"
        )
      ) {
        return "WOMEN_POLO";
      }

      /*
       * WOMEN T-SHIRT
       */
      if (
        garmentName.includes(
          "WOMEN"
        ) &&
        (
          garmentName.includes(
            "T-SHIRT"
          ) ||
          garmentName.includes(
            "TSHIRT"
          )
        )
      ) {
        return "WOMEN_TSHIRT";
      }

      /*
       * HOODIE
       */
      if (
        garmentName.includes(
          "HOOD"
        )
      ) {
        return "HOODIE";
      }

      /*
       * If Redux already contains a backend-compatible ID,
       * normalize and use it.
       */
      return String(
        selectedType ||
          ""
      )
        .trim()
        .toUpperCase()
        .replaceAll(
          "-",
          "_"
        )
        .replaceAll(
          " ",
          "_"
        );

    }, [
      garmentName,
      selectedType,
    ]);

  /*
   * ==========================================================
   * 3D SUPPORT
   * ==========================================================
   *
   * Your current working 3D model is Crew Neck / Round Neck.
   * ==========================================================
   */

  const supports3D =
    useMemo(() => {

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
      garmentName,
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
   * FETCH CUSTOMIZATION PRICING
   * ==========================================================
   *
   * Calls:
   *
   * GET
   * /api/customization-pricing/ROUND_NECK
   *
   * Backend is DB-driven.
   * ==========================================================
   */

  useEffect(() => {

    if (
      !backendGarmentType
    ) {
      return;
    }

    let cancelled =
      false;

    const loadPricing =
      async () => {

        try {

          setPricingLoading(
            true
          );

          setPricingError(
            ""
          );

          const response =
            await fetch(
              `/api/customization-pricing/${encodeURIComponent(
                backendGarmentType
              )}`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              `Unable to load customization pricing. HTTP ${response.status}`
            );
          }

          const data =
            await response.json();

          if (
            !cancelled
          ) {
            setCustomizationPricing(
              Array.isArray(
                data
              )
                ? data
                : []
            );
          }

        } catch (
          error
        ) {

          console.error(
            "Unable to load customization pricing",
            error
          );

          if (
            !cancelled
          ) {
            setCustomizationPricing(
              []
            );

            setPricingError(
              "Customization pricing unavailable"
            );
          }

        } finally {

          if (
            !cancelled
          ) {
            setPricingLoading(
              false
            );
          }
        }
      };

    loadPricing();

    return () => {
      cancelled =
        true;
    };

  }, [
    backendGarmentType,
  ]);

  /*
   * ==========================================================
   * PRICING MAP
   * ==========================================================
   *
   * Backend:
   *
   * [
   *   { printArea: "FRONT", price: 100 },
   *   { printArea: "BACK", price: 100 },
   *   ...
   * ]
   *
   * becomes:
   *
   * {
   *   FRONT: 100,
   *   BACK: 100,
   *   LEFT_SLEEVE: 50,
   *   RIGHT_SLEEVE: 50
   * }
   * ==========================================================
   */

  const pricingMap =
    useMemo(() => {

      const map = {};

      customizationPricing
        .forEach(
          (item) => {

            const key =
              String(
                item?.printArea ||
                  ""
              )
                .trim()
                .toUpperCase();

            if (!key) {
              return;
            }

            map[key] =
              Number(
                item?.price ||
                  0
              );
          }
        );

      return map;

    }, [
      customizationPricing,
    ]);

  /*
   * ==========================================================
   * CHECK IF CANVAS HAS USER DESIGN
   * ==========================================================
   */

  const canvasHasDesign =
    (canvas) => {

      if (!canvas) {
        return false;
      }

      try {

        const objects =
          canvas.getObjects?.() ||
          [];

        return (
          objects.length >
          0
        );

      } catch (
        error
      ) {

        console.error(
          "Unable to inspect Fabric canvas",
          error
        );

        return false;
      }
    };

  /*
   * ==========================================================
   * REFRESH DESIGN PRESENCE
   * ==========================================================
   */

  const refreshDesignPresence =
    () => {

      setDesignPresence({
        front:
          canvasHasDesign(
            frontCanvas
          ),

        back:
          canvasHasDesign(
            backCanvas
          ),

        left:
          canvasHasDesign(
            leftCanvas
          ),

        right:
          canvasHasDesign(
            rightCanvas
          ),
      });
    };

  /*
   * ==========================================================
   * LISTEN TO FABRIC CHANGES
   * ==========================================================
   *
   * As soon as user:
   *
   * adds
   * removes
   * modifies
   *
   * an object, pricing updates.
   * ==========================================================
   */

  useEffect(() => {

    const canvases = [
      frontCanvas,
      backCanvas,
      leftCanvas,
      rightCanvas,
    ].filter(Boolean);

    if (
      canvases.length ===
      0
    ) {
      return;
    }

    const update =
      () => {
        refreshDesignPresence();
      };

    canvases.forEach(
      (canvas) => {

        canvas.on(
          "object:added",
          update
        );

        canvas.on(
          "object:removed",
          update
        );

        canvas.on(
          "object:modified",
          update
        );
      }
    );

    /*
     * Initial check.
     */
    refreshDesignPresence();

    return () => {

      canvases.forEach(
        (canvas) => {

          canvas.off(
            "object:added",
            update
          );

          canvas.off(
            "object:removed",
            update
          );

          canvas.off(
            "object:modified",
            update
          );
        }
      );
    };

  }, [
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
  ]);

  /*
   * ==========================================================
   * DESIGNED AREAS
   * ==========================================================
   *
   * This is the value that eventually goes to backend
   * when adding the customized product to cart.
   * ==========================================================
   */

  const designedAreas =
    useMemo(() => {

      const areas = [];

      if (
        designPresence.front
      ) {
        areas.push(
          "FRONT"
        );
      }

      if (
        designPresence.back
      ) {
        areas.push(
          "BACK"
        );
      }

      if (
        designPresence.left
      ) {
        areas.push(
          "LEFT_SLEEVE"
        );
      }

      if (
        designPresence.right
      ) {
        areas.push(
          "RIGHT_SLEEVE"
        );
      }

      return areas;

    }, [
      designPresence,
    ]);

  /*
   * ==========================================================
   * CUSTOMIZATION TOTAL
   * ==========================================================
   */

  const customizationTotal =
    useMemo(() => {

      return designedAreas
        .reduce(
          (
            total,
            area
          ) => {

            return (
              total +
              Number(
                pricingMap[
                  area
                ] ||
                  0
              )
            );

          },
          0
        );

    }, [
      designedAreas,
      pricingMap,
    ]);

  /*
   * ==========================================================
   * FINAL DISPLAY PRICE
   * ==========================================================
   *
   * IMPORTANT:
   *
   * This calculation is only for UI display.
   *
   * Backend must calculate again before saving cart/order.
   * ==========================================================
   */

  const finalPrice =
    useMemo(() => {

      return (
        Number(
          basePrice ||
            0
        ) +
        Number(
          customizationTotal ||
            0
        )
      );

    }, [
      basePrice,
      customizationTotal,
    ]);

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
       * Unsupported garment.
       */
      if (
        !supports3D
      ) {
        return;
      }

      /*
       * Sync all four canvases before 3D.
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
        if (
          frontCanvas
        ) {

          canvasStorageManager
            .saveCanvasObjects(
              "front",
              frontCanvas
            );
        }

        /*
         * BACK
         */
        if (
          backCanvas
        ) {

          canvasStorageManager
            .saveCanvasObjects(
              "back",
              backCanvas
            );
        }

        /*
         * LEFT
         */
        if (
          leftCanvas
        ) {

          canvasStorageManager
            .saveCanvasObjects(
              "left",
              leftCanvas
            );
        }

        /*
         * RIGHT
         */
        if (
          rightCanvas
        ) {

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

            backendGarmentType,

            tshirtColor,

            designedAreas,

            basePrice,

            customizationTotal,

            displayFinalPrice:
              finalPrice,

            savedAt:
              new Date()
                .toISOString(),
          })
        );

        setSaved(
          true
        );

        window.setTimeout(
          () => {

            setSaved(
              false
            );

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
   * CURRENCY FORMAT
   * ==========================================================
   */

  const formatPrice =
    (value) => {

      return new Intl
        .NumberFormat(
          "en-IN",
          {
            maximumFractionDigits:
              2,
          }
        )
        .format(
          Number(
            value ||
              0
          )
        );
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

      <div
        className="
          flex
        "
      >

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
                TOP RIGHT ACTIONS
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

                KEEP MOUNTED.
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

      {/* =================================================
          PRICE BREAKDOWN
      ================================================= */}

      <div
        className="
          fixed
          bottom-[92px]
          right-6
          z-[250]

          w-[300px]

          rounded-2xl

          border
          border-zinc-200

          bg-white

          p-4

          shadow-xl
        "
      >

        <div
          className="
            mb-3

            flex
            items-center
            justify-between
          "
        >

          <span
            className="
              text-sm
              font-bold
              text-zinc-900
            "
          >
            Price Details
          </span>

          {pricingLoading && (
            <span
              className="
                text-xs
                text-zinc-400
              "
            >
              Loading...
            </span>
          )}

        </div>

        {pricingError ? (

          <div
            className="
              text-xs
              text-red-600
            "
          >
            {pricingError}
          </div>

        ) : (

          <div
            className="
              space-y-2
              text-sm
            "
          >

            {/* BASE PRODUCT */}

            <div
              className="
                flex
                justify-between
              "
            >
              <span
                className="
                  text-zinc-600
                "
              >
                T-Shirt
              </span>

              <span
                className="
                  font-medium
                "
              >
                ₹{formatPrice(
                  basePrice
                )}
              </span>
            </div>

            {/* FRONT */}

            {designPresence.front && (
              <div
                className="
                  flex
                  justify-between
                "
              >
                <span
                  className="
                    text-zinc-600
                  "
                >
                  Front Design
                </span>

                <span>
                  +₹{formatPrice(
                    pricingMap
                      .FRONT ||
                      0
                  )}
                </span>
              </div>
            )}

            {/* BACK */}

            {designPresence.back && (
              <div
                className="
                  flex
                  justify-between
                "
              >
                <span
                  className="
                    text-zinc-600
                  "
                >
                  Back Design
                </span>

                <span>
                  +₹{formatPrice(
                    pricingMap
                      .BACK ||
                      0
                  )}
                </span>
              </div>
            )}

            {/* LEFT SLEEVE */}

            {designPresence.left && (
              <div
                className="
                  flex
                  justify-between
                "
              >
                <span
                  className="
                    text-zinc-600
                  "
                >
                  Left Sleeve
                </span>

                <span>
                  +₹{formatPrice(
                    pricingMap
                      .LEFT_SLEEVE ||
                      0
                  )}
                </span>
              </div>
            )}

            {/* RIGHT SLEEVE */}

            {designPresence.right && (
              <div
                className="
                  flex
                  justify-between
                "
              >
                <span
                  className="
                    text-zinc-600
                  "
                >
                  Right Sleeve
                </span>

                <span>
                  +₹{formatPrice(
                    pricingMap
                      .RIGHT_SLEEVE ||
                      0
                  )}
                </span>
              </div>
            )}

            {/* CUSTOMIZATION TOTAL */}

            {customizationTotal >
              0 && (
              <div
                className="
                  flex
                  justify-between

                  border-t
                  border-zinc-100

                  pt-2
                "
              >
                <span
                  className="
                    text-zinc-600
                  "
                >
                  Customization
                </span>

                <span
                  className="
                    font-medium
                  "
                >
                  +₹{formatPrice(
                    customizationTotal
                  )}
                </span>
              </div>
            )}

            {/* FINAL DISPLAY PRICE */}

            <div
              className="
                mt-3

                flex
                justify-between

                border-t
                border-zinc-200

                pt-3

                text-base
                font-bold
              "
            >
              <span>
                Total
              </span>

              <span>
                ₹{formatPrice(
                  finalPrice
                )}
              </span>
            </div>

          </div>
        )}

      </div>

      {/* =================================================
          EXISTING CART BUTTON
      ================================================= */}

      <CustomDesignCartButton
  basePrice={Number(basePrice)}
  customizationTotal={Number(customizationTotal)}
  finalPrice={Number(finalPrice)}
  garmentType={backendGarmentType}
  designedAreas={designedAreas}
  designPresence={designPresence}
/>

      <Toaster />

    </div>
  );
}

export default App;