import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  catalogApi,
} from "@/services/api";

import {
  useCart,
} from "@/context/CartContext";


const COLOR_NAME_TO_HEX = {
  black: "#000000",
  white: "#ffffff",
  navy: "#000080",
  red: "#dc2626",
  grey: "#808080",
  gray: "#808080",
  blue: "#2563eb",
  maroon: "#800000",
  olive: "#808000",
  beige: "#f5f5dc",
  cream: "#fffdd0",
};


const resolveColorHex = (
  value
) => {
  const text =
    String(
      value || ""
    )
      .trim();

  if (
    /^#[0-9a-f]{6}$/i
      .test(text)
    ||
    /^#[0-9a-f]{3}$/i
      .test(text)
  ) {
    return text;
  }

  return (
    COLOR_NAME_TO_HEX[
      text.toLowerCase()
    ] ||
    "#cccccc"
  );
};


const sameColor = (
  left,
  right
) =>
  String(
    left ?? ""
  )
    .trim()
    .toLowerCase() ===
  String(
    right ?? ""
  )
    .trim()
    .toLowerCase();


export default function Product() {

  const {
    slug,
  } =
    useParams();

  const nav =
    useNavigate();

  const {
    add,
  } =
    useCart();


  const [
    p,
    setP,
  ] =
    useState(null);

  const [
    size,
    setSize,
  ] =
    useState("M");

  const [
    color,
    setColor,
  ] =
    useState("Black");

  const [
    imageError,
    setImageError,
  ] =
    useState(false);


  /*
   * ==========================================================
   * LOAD PRODUCT
   * ==========================================================
   */

  useEffect(() => {

    let cancelled =
      false;

    catalogApi
      .one(
        slug
      )
      .then(
        (product) => {

          if (
            cancelled
          ) {
            return;
          }

          setP(
            product
          );


          /*
           * Initial size
           */
          setSize(
            product
              .sizes?.[0] ||
            "M"
          );


          /*
           * Initial color.
           *
           * Prefer colorVariants because each color now has
           * its own image.
           */
          if (
            Array.isArray(
              product
                .colorVariants
            )
            &&
            product
              .colorVariants
              .length >
              0
          ) {

            setColor(
              product
                .colorVariants[0]
                .name
            );

          } else {

            setColor(
              product
                .colors?.[0] ||
              "Black"
            );
          }


          setImageError(
            false
          );
        }
      );

    return () => {
      cancelled =
        true;
    };

  }, [
    slug,
  ]);


  /*
   * ==========================================================
   * COLOR VARIANTS
   * ==========================================================
   */

  const colorVariants =
    useMemo(
      () => {

        if (
          !p
        ) {
          return [];
        }


        /*
         * NEW backend model.
         */
        if (
          Array.isArray(
            p.colorVariants
          )
          &&
          p.colorVariants
            .length >
            0
        ) {

          return p
            .colorVariants
            .filter(
              (variant) =>
                variant?.name
            )
            .map(
              (variant) => ({
                name:
                  String(
                    variant.name
                  ),

                hex:
                  variant.hex ||
                  resolveColorHex(
                    variant.name
                  ),

                imageUrl:
                  variant.imageUrl ||
                  p.imageUrl ||
                  "",
              })
            );
        }


        /*
         * Backward compatibility for old products.
         */
        return (
          Array.isArray(
            p.colors
          )
            ? p.colors
            : []
        )
          .filter(
            Boolean
          )
          .map(
            (item) => ({
              name:
                String(
                  item
                ),

              hex:
                resolveColorHex(
                  item
                ),

              imageUrl:
                p.imageUrl ||
                "",
            })
          );

      },
      [
        p,
      ]
    );


  /*
   * ==========================================================
   * CURRENT SELECTED VARIANT
   * ==========================================================
   */

  const selectedVariant =
    useMemo(
      () => {

        if (
          colorVariants
            .length ===
          0
        ) {
          return null;
        }

        return (
          colorVariants
            .find(
              (variant) =>
                sameColor(
                  variant.name,
                  color
                )
            )
          ||
          colorVariants[0]
        );

      },
      [
        colorVariants,
        color,
      ]
    );


  /*
   * ==========================================================
   * DISPLAY IMAGE
   * ==========================================================
   */

  const fallbackImage =
    "https://placehold.co/900x1100/f4f4f4/111111?text=MOGREN+Wear";


  const displayImage =
    imageError
      ? fallbackImage
      : selectedVariant
          ?.imageUrl
        ||
        p?.imageUrl
        ||
        fallbackImage;


  /*
   * ==========================================================
   * COLOR CHANGE
   * ==========================================================
   */

  const handleColorChange =
    (
      value
    ) => {

      setColor(
        value
      );

      /*
       * Reset previous failed-image state so the new
       * variant gets a chance to load.
       */
      setImageError(
        false
      );
    };


  /*
   * ==========================================================
   * ADD TO CART
   * ==========================================================
   */

  const handleAddToCart =
    () => {

      add({
        productId:
          p.id,

        name:
          p.name,

        price:
          p.price,

        /*
         * Use the selected color's photo.
         */
        imageUrl:
          selectedVariant
            ?.imageUrl
          ||
          p.imageUrl,

        size,

        color,

        quantity:
          1,
      });


      nav(
        "/cart"
      );
    };


  /*
   * ==========================================================
   * OPEN DESIGNER
   * ==========================================================
   */

  const handleCustomize =
    () => {

      const params =
        new URLSearchParams({
          product:
            String(
              p.slug
            ),

          color:
            String(
              color
            ),
        });


      nav(
        `/designer?${params.toString()}`
      );
    };


  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (
    !p
  ) {

    return (
      <div className="p-12">
        Loading…
      </div>
    );
  }


  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <main
      className="
        max-w-6xl
        mx-auto

        px-4
        py-10

        grid

        md:grid-cols-2

        gap-12
      "
    >


      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div
        className="
          aspect-[4/5]

          bg-zinc-100

          rounded-3xl
          overflow-hidden
        "
      >

        <img
          key={
            displayImage
          }
          src={
            displayImage
          }
          alt={
            selectedVariant
              ?.name
              ? `${p.name} - ${selectedVariant.name}`
              : p.name
          }
          onError={() =>
            setImageError(
              true
            )
          }
          className="
            w-full
            h-full

            object-cover
          "
        />

      </div>


      {/* =====================================================
          PRODUCT INFO
      ===================================================== */}

      <div className="pt-6">

        <p
          className="
            uppercase
            text-xs
            tracking-[.2em]
            text-zinc-500
          "
        >
          {
            p.category
          }
        </p>


        <h1
          className="
            text-4xl
            font-black
            mt-2
          "
        >
          {
            p.name
          }
        </h1>


        <p
          className="
            text-2xl
            mt-4
          "
        >
          ₹
          {Number(
            p.price
          )
            .toLocaleString(
              "en-IN"
            )}
        </p>


        {p.description && (

          <p
            className="
              text-zinc-600
              mt-6
            "
          >
            {
              p.description
            }
          </p>

        )}


        {/* =================================================
            SIZE
        ================================================= */}

        <label
          className="
            block
            mt-8

            text-sm
            font-semibold
          "
        >
          Size
        </label>


        <div
          className="
            flex
            gap-2
            mt-2
            flex-wrap
          "
        >

          {(
            p.sizes ||
            []
          )
            .map(
              (item) => (

                <button
                  type="button"
                  onClick={() =>
                    setSize(
                      item
                    )
                  }
                  className={`
                    px-4
                    py-2

                    border
                    rounded

                    ${
                      size ===
                      item
                        ? "bg-black text-white"
                        : ""
                    }
                  `}
                  key={
                    item
                  }
                >
                  {
                    item
                  }
                </button>

              )
            )}

        </div>


        {/* =================================================
            COLOR
        ================================================= */}

        <label
          className="
            block
            mt-6

            text-sm
            font-semibold
          "
        >
          Color
        </label>


        {/* VISUAL COLOR BUTTONS */}

        {colorVariants
          .length >
          0 && (

          <div
            className="
              flex
              flex-wrap

              gap-3

              mt-3
            "
          >

            {colorVariants
              .map(
                (
                  variant,
                  index
                ) => {

                  const active =
                    sameColor(
                      variant.name,
                      color
                    );

                  return (

                    <button
                      type="button"
                      key={
                        `${variant.name}-${index}`
                      }
                      onClick={() =>
                        handleColorChange(
                          variant.name
                        )
                      }
                      title={
                        variant.name
                      }
                      aria-label={
                        `Choose ${variant.name}`
                      }
                      className={`
                        h-10
                        w-10

                        rounded-full

                        border

                        transition

                        ${
                          active
                            ? "ring-2 ring-black ring-offset-2"
                            : "ring-1 ring-zinc-200"
                        }
                      `}
                      style={{
                        backgroundColor:
                          variant.hex ||
                          resolveColorHex(
                            variant.name
                          ),
                      }}
                    />

                  );
                }
              )}

          </div>

        )}


        {/* DROPDOWN */}

        <select
          value={
            color
          }
          onChange={
            (
              event
            ) =>
              handleColorChange(
                event.target
                  .value
              )
          }
          className="
            mt-4

            border
            rounded

            px-4
            py-3

            w-full
          "
        >

          {colorVariants
            .map(
              (
                variant,
                index
              ) => (

                <option
                  key={
                    `${variant.name}-option-${index}`
                  }
                  value={
                    variant.name
                  }
                >
                  {
                    variant.name
                  }
                </option>

              )
            )}

        </select>


        {selectedVariant
          ?.name && (

          <p
            className="
              mt-2
              text-xs
              text-zinc-500
            "
          >
            Selected:
            {" "}
            <span className="font-semibold text-black">
              {
                selectedVariant.name
              }
            </span>
          </p>

        )}


        {/* =================================================
            ADD TO CART
        ================================================= */}

        <button
          type="button"
          onClick={
            handleAddToCart
          }
          className="
            mt-8

            bg-black
            text-white

            w-full

            py-4

            rounded-xl

            font-bold
          "
        >
          Add to cart
        </button>


        {/* =================================================
            CUSTOMIZE
        ================================================= */}

        {p.customizable &&
          p.garmentType && (

          <button
            type="button"
            onClick={
              handleCustomize
            }
            className="
              mt-3

              border
              border-black

              bg-white
              text-black

              w-full

              py-4

              rounded-xl

              font-bold

              hover:bg-zinc-100
            "
          >
            Customize
            {selectedVariant
              ?.name
              ? ` ${selectedVariant.name}`
              : ""}
          </button>

        )}

      </div>

    </main>
  );
}