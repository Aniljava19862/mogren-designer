import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  useDispatch,
} from "react-redux";

import DesignerApp
  from "@/DesignerApp";

import {
  catalogApi,
} from "@/services/api";

import {
  clearSelectedProduct,
  setSelectedProduct,
  setSelectedType,
  setTshirtColor,
} from "@/features/tshirtSlice";


/*
 * ============================================================
 * BACKEND GARMENT TYPE -> EXISTING DESIGNER TYPE
 * ============================================================
 *
 * IMPORTANT:
 *
 * Your existing working 3D Round Neck implementation uses:
 *
 *   selectedType = "crew-neck"
 *
 * The backend uses the stable business identifier:
 *
 *   ROUND_NECK
 *
 * Keep that compatibility here.
 *
 * The other existing 2D mockups already understand:
 *
 *   WOMEN_TSHIRT
 *   WOMEN_POLO
 *   HOODIE
 * ============================================================
 */

const toDesignerType = (
  garmentType
) => {
  const normalized =
    String(
      garmentType || ""
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

  if (
    normalized ===
    "ROUND_NECK"
  ) {
    return "crew-neck";
  }

  if (
    normalized ===
    "WOMEN_TSHIRT"
  ) {
    return "WOMEN_TSHIRT";
  }

  if (
    normalized ===
    "WOMEN_POLO"
  ) {
    return "WOMEN_POLO";
  }

  if (
    normalized ===
    "HOODIE"
  ) {
    return "HOODIE";
  }

  return normalized;
};


/*
 * ============================================================
 * COLOR HELPERS
 * ============================================================
 */

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


const selectInitialColor = (
  backendColors,
  requestedColor
) => {
  const colors =
    Array.isArray(
      backendColors
    )
      ? backendColors
          .filter(Boolean)
          .map((color) =>
            String(color)
          )
      : [];

  /*
   * URL color is accepted only when the backend product
   * actually supports it.
   */
  if (
    requestedColor &&
    colors.length >
      0
  ) {
    const exact =
      colors.find(
        (color) =>
          sameColor(
            color,
            requestedColor
          )
      );

    if (exact) {
      return exact;
    }
  }

  /*
   * Prefer white for product photography / neutral launch.
   */
  const whiteName =
    colors.find(
      (color) =>
        sameColor(
          color,
          "White"
        )
    );

  if (whiteName) {
    return whiteName;
  }

  const whiteHex =
    colors.find(
      (color) => {
        const value =
          String(color)
            .trim()
            .toLowerCase();

        return (
          value ===
            "#ffffff" ||
          value ===
            "#fff"
        );
      }
    );

  if (whiteHex) {
    return whiteHex;
  }

  if (
    colors.length >
    0
  ) {
    return colors[0];
  }

  return "#FFFFFF";
};


export default function DesignerPage() {
  const dispatch =
    useDispatch();

  const [
    searchParams,
  ] =
    useSearchParams();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    product,
    setProduct,
  ] =
    useState(null);


  /*
   * ==========================================================
   * URL INPUT
   * ==========================================================
   */

  const productSlug =
    searchParams.get(
      "product"
    );

  const requestedColor =
    searchParams.get(
      "color"
    );


  /*
   * ==========================================================
   * LOAD SELECTED PRODUCT
   * ==========================================================
   */

  useEffect(() => {
    let cancelled =
      false;

    /*
     * Opening /designer directly is still supported.
     *
     * In that case DesignerApp falls back to its existing
     * default garment and price.
     */
    if (!productSlug) {
      dispatch(
        clearSelectedProduct()
      );

      setProduct(null);
      setError("");
      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    const loadProduct =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const response =
            await catalogApi
              .getProductBySlug(
                productSlug
              );

          if (cancelled) {
            return;
          }

          /*
           * Only products explicitly enabled by the backend
           * can enter the designer.
           */
          if (
            response
              ?.customizable !==
              true
          ) {
            throw new Error(
              "This product is not enabled for customization."
            );
          }

          if (
            !response
              ?.garmentType
          ) {
            throw new Error(
              "This customizable product does not have a garment type."
            );
          }

          const designerType =
            toDesignerType(
              response
                .garmentType
            );

          if (
            !designerType
          ) {
            throw new Error(
              "Unable to determine the designer garment type."
            );
          }

          const initialColor =
            selectInitialColor(
              response
                .colors,
              requestedColor
            );

          /*
           * Save the exact backend product in Redux.
           *
           * Cart can later use:
           * id, slug, name, price, sizes, colors, garmentType.
           */
          dispatch(
            setSelectedProduct(
              response
            )
          );

          /*
           * Tell DesignArea which mockup to render.
           */
          dispatch(
            setSelectedType(
              designerType
            )
          );

          /*
           * Keep the backend color value itself.
           *
           * Do not convert "Black" to "#000000" here because
           * OrderService validates against product.colors.
           */
          dispatch(
            setTshirtColor(
              initialColor
            )
          );

          setProduct(
            response
          );

        } catch (
          err
        ) {
          if (cancelled) {
            return;
          }

          console.error(
            "Unable to load designer product",
            err
          );

          dispatch(
            clearSelectedProduct()
          );

          setProduct(
            null
          );

          setError(
            err?.message ||
              "Unable to load this product in the designer."
          );

        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [
    dispatch,
    productSlug,
    requestedColor,
  ]);


  /*
   * ==========================================================
   * PRODUCT BASE PRICE
   * ==========================================================
   */

  const basePrice =
    useMemo(
      () =>
        product
          ? Number(
              product.price ||
                0
            )
          : 999,
      [
        product,
      ]
    );


  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f6f6f6]">
        <div className="text-center">
          <div className="text-lg font-bold">
            Loading Designer...
          </div>

          <div className="mt-2 text-sm text-zinc-500">
            Preparing your product.
          </div>
        </div>
      </div>
    );
  }


  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f6f6f6] px-6">
        <div className="max-w-md border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold">
            Unable to open Designer
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {error}
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex bg-black px-5 py-3 text-sm font-bold text-white"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }


  /*
   * ==========================================================
   * DESIGNER
   * ==========================================================
   */

  return (
    <div>
      <DesignerApp
        basePrice={
          basePrice
        }
      />
    </div>
  );
}
