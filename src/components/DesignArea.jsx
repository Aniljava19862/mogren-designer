import { useSelector, useDispatch } from "react-redux";

import { TSHIRT_TYPES } from "../constants/designConstants";

import TshirtCanvasFront from "./TshirtCanvasFront";
import TshirtCanvasBack from "./TshirtCanvasBack";
import TshirtCanvasLeft from "./TshirtCanvasLeft";
import TshirtCanvasRight from "./TshirtCanvasRight";

import { setSelectedView } from "../features/tshirtSlice";

import { useCanvas } from "@/hooks/useCanvas";

/*
 * ============================================================
 * GARMENT MOCKUPS
 * ============================================================
 */

const GARMENT_MOCKUPS = {
  ROUND_NECK: {
    name: "Round Neck T-Shirt",

    views: {
      front: {
        image: "/mockups/round-neck-front.png",

        printArea: {
          left: 34,
          top: 23,
          width: 32,
          height: 45,
        },
      },

      back: {
        image: "/mockups/round-neck-back.png",

        printArea: {
          left: 34,
          top: 22,
          width: 32,
          height: 47,
        },
      },

      left: {
        image: "/mockups/round-neck-left.png",

        printArea: {
    left: 41,
    top: 30,
    width: 16,
    height: 15,
  },
      },

      right: {
        image: "/mockups/round-neck-right.png",

         printArea: {
    left: 42.5,
    top: 25.5,
    width: 18,
    height: 17,
  },
      },
    },
  },

  WOMEN_TSHIRT: {
    name: "Women's T-Shirt",

    views: {
      front: {
        image: "/mockups/women-tshirt-front.png",

        printArea: {
          left: 35,
          top: 23,
          width: 30,
          height: 44,
        },
      },

      back: {
        image: "/mockups/women-tshirt-back.png",

        printArea: {
          left: 35,
          top: 22,
          width: 30,
          height: 46,
        },
      },

      left: {
        image: "/mockups/women-tshirt-left.png",

        printArea: {
          left: 36,
          top: 30,
          width: 26,
          height: 26,
        },
      },

      right: {
        image: "/mockups/women-tshirt-right.png",

        printArea: {
          left: 38,
          top: 30,
          width: 26,
          height: 26,
        },
      },
    },
  },

  WOMEN_POLO: {
    name: "Women's Polo",

    views: {
      front: {
        image: "/mockups/women-polo-front.png",

        printArea: {
          left: 35,
          top: 26,
          width: 30,
          height: 41,
        },
      },

      back: {
        image: "/mockups/women-polo-back.png",

        printArea: {
          left: 35,
          top: 22,
          width: 30,
          height: 46,
        },
      },

      left: {
        image: "/mockups/women-polo-left.png",

        printArea: {
          left: 36,
          top: 30,
          width: 26,
          height: 25,
        },
      },

      right: {
        image: "/mockups/women-polo-right.png",

        printArea: {
          left: 38,
          top: 30,
          width: 26,
          height: 25,
        },
      },
    },
  },

  HOODIE: {
    name: "Hoodie",

    views: {
      front: {
        image: "/mockups/hoodie-front.png",

        printArea: {
          left: 34,
          top: 29,
          width: 32,
          height: 33,
        },
      },

      back: {
        image: "/mockups/hoodie-back.png",

        printArea: {
          left: 33,
          top: 26,
          width: 34,
          height: 39,
        },
      },

      left: {
        image: "/mockups/hoodie-left.png",

        printArea: {
          left: 35,
          top: 29,
          width: 28,
          height: 35,
        },
      },

      right: {
        image: "/mockups/hoodie-right.png",

        printArea: {
          left: 37,
          top: 29,
          width: 28,
          height: 35,
        },
      },
    },
  },
};

/*
 * ============================================================
 * VIEW ORDER
 * ============================================================
 */

const VIEW_ORDER = [
  {
    id: "front",
    label: "Front",
  },

  {
    id: "back",
    label: "Back",
  },

  {
    id: "right",
    label: "Right",
  },

  {
    id: "left",
    label: "Left",
  },
];

/*
 * ============================================================
 * DESIGN AREA
 * ============================================================
 */

const DesignArea = ({
  garmentColor,
  tshirtColor,

  onFrontDesignUpdate,
  onBackDesignUpdate,
  onLeftDesignUpdate,
  onRightDesignUpdate,
}) => {
  const dispatch = useDispatch();

  /*
   * ==========================================================
   * REDUX
   * ==========================================================
   */

  const selectedType = useSelector(
    (state) => state.tshirt.selectedType
  );

  const selectedView = useSelector(
    (state) => state.tshirt.selectedView
  );

  const reduxColor = useSelector(
    (state) =>
      state.tshirt.tshirtColor ||
      state.tshirt.selectedColor ||
      state.tshirt.color
  );

  /*
   * ==========================================================
   * CANVAS CONTEXT
   * ==========================================================
   */

  const {
    activeCanvas,
    setSelectedObject,
  } = useCanvas();

  /*
   * ==========================================================
   * COLOR
   * ==========================================================
   */

  const color =
    garmentColor ||
    tshirtColor ||
    reduxColor ||
    "#ffffff";

  /*
   * ==========================================================
   * NORMALIZE GARMENT TYPE
   * ==========================================================
   */

  const normalizedType = String(
    selectedType || ""
  )
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  let garment =
    GARMENT_MOCKUPS[normalizedType];

  /*
   * ==========================================================
   * FALLBACK GARMENT MAPPING
   * ==========================================================
   */

  if (!garment) {
    if (
      normalizedType.includes("HOOD")
    ) {
      garment =
        GARMENT_MOCKUPS.HOODIE;
    } else if (
      normalizedType.includes("WOMEN") &&
      normalizedType.includes("POLO")
    ) {
      garment =
        GARMENT_MOCKUPS.WOMEN_POLO;
    } else if (
      normalizedType.includes("WOMEN")
    ) {
      garment =
        GARMENT_MOCKUPS.WOMEN_TSHIRT;
    } else {
      garment =
        GARMENT_MOCKUPS.ROUND_NECK;
    }
  }

  /*
   * ==========================================================
   * CURRENT VIEW
   * ==========================================================
   */

  const currentView =
    garment.views[selectedView] ||
    garment.views.front;

  /*
   * ==========================================================
   * SVG PATH
   *
   * Existing canvas components still receive this.
   * ==========================================================
   */

  const getSvgPath = (view) => {
    const tshirtType =
      TSHIRT_TYPES[selectedType];

    if (!tshirtType) {
      return null;
    }

    if (view === "front") {
      return (
        tshirtType.frontPath ||
        null
      );
    }

    if (view === "back") {
      return (
        tshirtType.backPath ||
        tshirtType.frontPath ||
        null
      );
    }

    if (view === "left") {
      return (
        tshirtType.leftPath ||
        tshirtType.frontPath ||
        null
      );
    }

    if (view === "right") {
      return (
        tshirtType.rightPath ||
        tshirtType.frontPath ||
        null
      );
    }

    return (
      tshirtType.frontPath ||
      null
    );
  };

  /*
   * ==========================================================
   * VIEW CHANGE
   * ==========================================================
   */

  const handleViewChange = (
    view
  ) => {
    if (
      view === selectedView
    ) {
      return;
    }

    /*
     * Remove Fabric selection handles.
     */
    if (activeCanvas) {
      activeCanvas
        .discardActiveObject();

      activeCanvas
        .requestRenderAll();
    }

    setSelectedObject(null);

    dispatch(
      setSelectedView(view)
    );
  };

  /*
   * ==========================================================
   * PERSISTENT CANVASES
   *
   * ALL FOUR CANVASES REMAIN MOUNTED.
   *
   * Do not change this.
   * ==========================================================
   */

  const renderPersistentCanvases =
    () => {
      return (
        <>
          {/* ==============================
              FRONT
          ============================== */}

          <div
            className={`
              absolute
              inset-0
              h-full
              w-full

              ${
                selectedView ===
                "front"
                  ? "visible z-20"
                  : "invisible z-0 pointer-events-none"
              }
            `}
          >
            <TshirtCanvasFront
              svgPath={
                getSvgPath(
                  "front"
                )
              }

              onDesignUpdate={
                onFrontDesignUpdate
              }
            />
          </div>

          {/* ==============================
              BACK
          ============================== */}

          <div
            className={`
              absolute
              inset-0
              h-full
              w-full

              ${
                selectedView ===
                "back"
                  ? "visible z-20"
                  : "invisible z-0 pointer-events-none"
              }
            `}
          >
            <TshirtCanvasBack
              svgPath={
                getSvgPath(
                  "back"
                )
              }

              onDesignUpdate={
                onBackDesignUpdate
              }
            />
          </div>

          {/* ==============================
              LEFT
          ============================== */}

          <div
            className={`
              absolute
              inset-0
              h-full
              w-full

              ${
                selectedView ===
                "left"
                  ? "visible z-20"
                  : "invisible z-0 pointer-events-none"
              }
            `}
          >
            <TshirtCanvasLeft
              svgPath={
                getSvgPath(
                  "left"
                )
              }

              onDesignUpdate={
                onLeftDesignUpdate
              }
            />
          </div>

          {/* ==============================
              RIGHT
          ============================== */}

          <div
            className={`
              absolute
              inset-0
              h-full
              w-full

              ${
                selectedView ===
                "right"
                  ? "visible z-20"
                  : "invisible z-0 pointer-events-none"
              }
            `}
          >
            <TshirtCanvasRight
              svgPath={
                getSvgPath(
                  "right"
                )
              }

              onDesignUpdate={
                onRightDesignUpdate
              }
            />
          </div>
        </>
      );
    };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
  <section
    className="
      relative
      w-full
      overflow-hidden
      bg-[#f6f4f3]
    "
  >
    {/* =====================================================
        MAIN WORKSPACE

        Garment + Front/Back/Right/Left stay together.
    ===================================================== */}

    <div
      className="
        flex
        w-full
        justify-start
        px-4
        pb-4
        pt-2

        md:pl-10
        lg:pl-14
      "
    >
      <div
        className="
          flex
          items-start
          gap-5

          lg:gap-7
        "
      >
        {/* =================================================
            GARMENT STAGE

            IMPORTANT:

            Our mockup PNG files are square.
            Therefore this container MUST also be square.

            This keeps printArea percentages aligned
            with the actual garment image.
        ================================================= */}

        <div
          className="
            relative

            h-[650px]
            w-[650px]

            md:h-[700px]
            md:w-[700px]

            xl:h-[760px]
            xl:w-[760px]
          "
        >
          {/* ===============================================
              GARMENT
          =============================================== */}

          <img
            src={currentView.image}
            alt={`${garment.name} ${selectedView}`}
            draggable={false}
            className="
              pointer-events-none
              absolute
              inset-0
              z-0

              h-full
              w-full

              select-none
              object-contain
            "
          />

          {/* ===============================================
              GARMENT COLOR
          =============================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[1]
            "
            style={{
              backgroundColor: color,

              WebkitMaskImage:
                `url("${currentView.image}")`,

              WebkitMaskRepeat:
                "no-repeat",

              WebkitMaskPosition:
                "center",

              WebkitMaskSize:
                "contain",

              maskImage:
                `url("${currentView.image}")`,

              maskRepeat:
                "no-repeat",

              maskPosition:
                "center",

              maskSize:
                "contain",

              mixBlendMode:
                "multiply",

              opacity: 0.72,
            }}
          />

          {/* ===============================================
              PRINT / DROPPABLE AREA
          =============================================== */}

          <div
            className="
              absolute
              z-20
              overflow-hidden
            "
            style={{
              left:
                `${currentView.printArea.left}%`,

              top:
                `${currentView.printArea.top}%`,

              width:
                `${currentView.printArea.width}%`,

              height:
                `${currentView.printArea.height}%`,
            }}
          >
            {/* FABRIC CANVASES */}

            <div
              className="
                absolute
                inset-0
                z-20

                h-full
                w-full

                overflow-hidden
              "
            >
              {renderPersistentCanvases()}
            </div>

            {/* DOTTED BORDER */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                z-50

                border-2
                border-dashed
                border-zinc-500/80
              "
            />
          </div>
        </div>

        {/* =================================================
            VIEW SELECTOR

            It is now physically part of the same layout,
            not positioned at the far-right of the page.
        ================================================= */}

        <div
          className="
            flex
            w-[90px]
            flex-col
            items-center

            gap-5
            pt-16
          "
        >
          {VIEW_ORDER.map(
            ({
              id,
              label,
            }) => {
              const view =
                garment.views[id];

              const active =
                selectedView === id;

              return (
                <button
                  key={id}
                  type="button"

                  onClick={() =>
                    handleViewChange(
                      id
                    )
                  }

                  className="
                    flex
                    w-[82px]
                    flex-col
                    items-center
                  "
                >
                  {/* THUMBNAIL */}

                  <div
                    className={`
                      relative

                      h-[68px]
                      w-[68px]

                      rounded-full
                      bg-white

                      transition

                      ${
                        active
                          ? `
                            ring-2
                            ring-black
                            ring-offset-2
                          `
                          : `
                            ring-1
                            ring-zinc-200

                            hover:ring-zinc-400
                          `
                      }
                    `}
                  >
                    <img
                      src={view.image}
                      alt={label}
                      draggable={false}

                      className="
                        absolute
                        inset-0

                        h-full
                        w-full

                        object-contain
                        p-2
                      "
                    />

                    {/* THUMBNAIL COLOR */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-2
                      "
                      style={{
                        backgroundColor:
                          color,

                        WebkitMaskImage:
                          `url("${view.image}")`,

                        WebkitMaskRepeat:
                          "no-repeat",

                        WebkitMaskPosition:
                          "center",

                        WebkitMaskSize:
                          "contain",

                        maskImage:
                          `url("${view.image}")`,

                        maskRepeat:
                          "no-repeat",

                        maskPosition:
                          "center",

                        maskSize:
                          "contain",

                        mixBlendMode:
                          "multiply",

                        opacity:
                          0.72,
                      }}
                    />
                  </div>

                  {/* LABEL */}

                  <span
                    className={`
                      mt-2

                      text-[10px]
                      font-bold

                      uppercase
                      tracking-[0.15em]

                      ${
                        active
                          ? "text-black"
                          : "text-zinc-500"
                      }
                    `}
                  >
                    {label}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  </section>
);
};

export default DesignArea;