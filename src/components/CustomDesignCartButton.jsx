import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useCanvas } from "@/hooks/useCanvas";
import { useCart } from "@/context/CartContext";

export default function CustomDesignCartButton({
  basePrice = 999,
  customizationTotal = 0,
  finalPrice = 999,

  garmentType = "ROUND_NECK",

  designedAreas = [],

  designPresence = {
    front: false,
    back: false,
    left: false,
    right: false,
  },
}) {
  /*
   * ==========================================================
   * CANVASES
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
   * REDUX
   * ==========================================================
   */

  const color =
    useSelector(
      (state) =>
        state.tshirt.tshirtColor
    );

  /*
   * ==========================================================
   * CART / NAVIGATION
   * ==========================================================
   */

  const {
    add,
  } = useCart();

  const navigate =
    useNavigate();

  /*
   * ==========================================================
   * SIZE
   * ==========================================================
   */

  const [
    size,
    setSize,
  ] = useState("M");

  /*
   * ==========================================================
   * SERIALIZE FABRIC CANVAS
   * ==========================================================
   */

  const serializeCanvas =
    (canvas) => {

      if (!canvas) {
        return null;
      }

      try {
        return canvas.toJSON();
      } catch (
        error
      ) {
        console.error(
          "Unable to serialize canvas",
          error
        );

        return null;
      }
    };

  /*
   * ==========================================================
   * BUILD PREVIEW
   * ==========================================================
   */

  const buildPreview =
    () => {

      try {

        /*
         * Prefer Front preview.
         */
        if (frontCanvas) {

          return frontCanvas
            .toDataURL({
              format:
                "png",

              multiplier:
                1,
            });
        }

        /*
         * Fall back to Back.
         */
        if (backCanvas) {

          return backCanvas
            .toDataURL({
              format:
                "png",

              multiplier:
                1,
            });
        }

        /*
         * Left sleeve.
         */
        if (leftCanvas) {

          return leftCanvas
            .toDataURL({
              format:
                "png",

              multiplier:
                1,
            });
        }

        /*
         * Right sleeve.
         */
        if (rightCanvas) {

          return rightCanvas
            .toDataURL({
              format:
                "png",

              multiplier:
                1,
            });
        }

      } catch (
        error
      ) {

        console.error(
          "Unable to generate custom design preview",
          error
        );
      }

      return "";
    };

  /*
   * ==========================================================
   * ADD TO CART
   * ==========================================================
   */

  const handleAddToCart =
    () => {

      const preview =
        buildPreview();

      /*
       * ======================================================
       * DESIGN DATA
       * ======================================================
       */

      const designData = {
        version:
          2,

        garmentType,

        tshirtColor:
          color,

        size,

        /*
         * Which surfaces contain a design.
         */
        designedAreas,

        designPresence,

        /*
         * Fabric.js editable data.
         */
        views: {
          front:
            serializeCanvas(
              frontCanvas
            ),

          back:
            serializeCanvas(
              backCanvas
            ),

          left:
            serializeCanvas(
              leftCanvas
            ),

          right:
            serializeCanvas(
              rightCanvas
            ),
        },

        /*
         * Frontend display-price snapshot.
         *
         * IMPORTANT:
         *
         * Backend must calculate again before creating
         * the final order.
         */
        pricing: {
          basePrice:
            Number(
              basePrice ||
                0
            ),

          customizationTotal:
            Number(
              customizationTotal ||
                0
            ),

          displayFinalPrice:
            Number(
              finalPrice ||
                0
            ),
        },
      };

      const customDesign =
        JSON.stringify(
          designData
        );

      /*
       * ======================================================
       * ADD CART ITEM
       * ======================================================
       *
       * IMPORTANT:
       *
       * price is now FINAL PRICE.
       *
       * Example:
       *
       * base          = 999
       * front design  = 100
       *
       * price         = 1099
       * ======================================================
       */

      add({
        productId:
          1,

        name:
          "Custom Premium T-Shirt",

        /*
         * This fixes your current issue.
         */
        price:
          Number(
            finalPrice
          ),

        /*
         * Keep breakdown too.
         */
        basePrice:
          Number(
            basePrice
          ),

        customizationTotal:
          Number(
            customizationTotal
          ),

        garmentType,

        designedAreas,

        imageUrl:
          preview,

        size,

        color,

        quantity:
          1,

        customDesign,
      });

      /*
       * Go to cart.
       */
      navigate(
        "/cart"
      );
    };

  /*
   * ==========================================================
   * FORMAT PRICE
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
        fixed
        bottom-5
        right-5
        z-50

        flex
        items-center
        gap-3

        rounded-2xl

        border
        border-zinc-200

        bg-white

        p-3

        shadow-xl
      "
    >

      {/* =================================================
          SIZE
      ================================================= */}

      <select
        className="
          rounded-lg
          border
          border-zinc-200

          bg-white

          px-3
          py-2

          outline-none

          focus:border-black
        "

        value={
          size
        }

        onChange={
          (event) =>
            setSize(
              event.target.value
            )
        }
      >
        {[
          "S",
          "M",
          "L",
          "XL",
          "XXL",
        ].map(
          (item) => (
            <option
              key={
                item
              }
              value={
                item
              }
            >
              {item}
            </option>
          )
        )}
      </select>

      {/* =================================================
          PRICE
      ================================================= */}

      <div
        className="
          min-w-[90px]
          text-sm
        "
      >

        <div
          className="
            font-bold
            text-zinc-900
          "
        >
          ₹{formatPrice(
            finalPrice
          )}
        </div>

        <div
          className="
            text-xs
            text-zinc-500
          "
        >
          Custom tee
        </div>

      </div>

      {/* =================================================
          ADD TO CART
      ================================================= */}

      <button
        type="button"

        onClick={
          handleAddToCart
        }

        className="
          rounded-xl

          bg-black

          px-5
          py-3

          font-bold
          text-white

          transition

          hover:bg-zinc-800
        "
      >
        Add design to cart
      </button>

    </div>
  );
}