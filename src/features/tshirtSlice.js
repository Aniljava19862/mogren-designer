import {
  createSlice,
} from "@reduxjs/toolkit";


const initialState = {
  /*
   * Existing default designer garment.
   *
   * Round Neck currently uses "crew-neck" because that is the
   * key used by the working 3D designer configuration.
   */
  selectedType:
    "crew-neck",

  /*
   * IMPORTANT:
   *
   * This stores the backend product color value.
   *
   * Examples:
   * "Black"
   * "White"
   * "Navy"
   * "#ffffff"
   *
   * Keeping the backend value prevents checkout/order color
   * validation mismatches.
   */
  tshirtColor:
    "#FFFFFF",

  selectedView:
    "front",

  /*
   * Full backend product currently being customized.
   *
   * Example:
   * {
   *   id,
   *   slug,
   *   name,
   *   price,
   *   colors,
   *   sizes,
   *   garmentType,
   *   customizable
   * }
   */
  selectedProduct:
    null,
};


export const tshirtSlice =
  createSlice({
    name:
      "designer",

    initialState,

    reducers: {
      setSelectedType:
        (
          state,
          action
        ) => {
          state.selectedType =
            action.payload;
        },

      setTshirtColor:
        (
          state,
          action
        ) => {
          state.tshirtColor =
            action.payload;
        },

      setSelectedView:
        (
          state,
          action
        ) => {
          state.selectedView =
            action.payload;
        },

      setSelectedProduct:
        (
          state,
          action
        ) => {
          state.selectedProduct =
            action.payload;
        },

      clearSelectedProduct:
        (
          state
        ) => {
          state.selectedProduct =
            null;
        },
    },
  });


export const {
  setSelectedType,
  setTshirtColor,
  setSelectedView,
  setSelectedProduct,
  clearSelectedProduct,
} =
  tshirtSlice.actions;


export default
  tshirtSlice.reducer;