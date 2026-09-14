// src/config/garmentModels.js

export const GARMENT_MODELS = {
  ROUND_NECK: {
    id: "ROUND_NECK",
    name: "Round Neck T-Shirt",
    modelPath: "/3Dmodels/round-neck.glb",

    scale: 7.5,
    position: [0, 0, 2],
    rotation: [Math.PI / 2, 0, 0],

    bodyNode: "T-Shirt_1",
    colorNode: "T-Shirt001",

    frontNode: "T-Shirt_2",
    backNode: "T-Shirt_3",

    leftSleeveNode: "T-Shirt_4",
    rightSleeveNode: "T-Shirt_5",

    bodyMaterial: "Shirt",
    colorMaterial: "background",

    frontDecal: {
      position: [0, 0.2, -0.31],
      rotation: [-Math.PI / 2 - 0.05, 0, 0],
      scale: [0.52, 0.7, 0.5],
    },

    backDecal: {
      position: [0, -0.2, -0.27],
      rotation: [Math.PI / 2 - 0.2, 0, Math.PI],
      scale: [0.52, 0.7, 0.5],
    },
  },

  V_NECK: {
    id: "V_NECK",
    name: "V-Neck T-Shirt",
    modelPath: "/3Dmodels/v-neck.glb",

    scale: 7.5,
    position: [0, 0, 2],
    rotation: [Math.PI / 2, 0, 0],

    bodyNode: "VNeck_Body",
    colorNode: "VNeck_Body",

    frontNode: "VNeck_Front",
    backNode: "VNeck_Back",

    leftSleeveNode: "VNeck_LeftSleeve",
    rightSleeveNode: "VNeck_RightSleeve",

    bodyMaterial: "Fabric",
    colorMaterial: "Fabric",

    frontDecal: {
      position: [0, 0.15, -0.28],
      rotation: [-Math.PI / 2, 0, 0],
      scale: [0.50, 0.62, 0.5],
    },

    backDecal: {
      position: [0, -0.18, -0.25],
      rotation: [Math.PI / 2, 0, Math.PI],
      scale: [0.50, 0.65, 0.5],
    },
  },

  HOODIE: {
    id: "HOODIE",
    name: "Hoodie",
    modelPath: "/3Dmodels/hoodie.glb",

    scale: 6,
    position: [0, -0.2, 1.5],
    rotation: [Math.PI / 2, 0, 0],

    bodyNode: "Hoodie_Body",
    colorNode: "Hoodie_Body",

    frontNode: "Hoodie_Front",
    backNode: "Hoodie_Back",

    leftSleeveNode: "Hoodie_LeftSleeve",
    rightSleeveNode: "Hoodie_RightSleeve",

    bodyMaterial: "HoodieFabric",
    colorMaterial: "HoodieFabric",

    frontDecal: {
      position: [0, 0.05, -0.34],
      rotation: [-Math.PI / 2, 0, 0],
      scale: [0.58, 0.62, 0.5],
    },

    backDecal: {
      position: [0, -0.12, -0.32],
      rotation: [Math.PI / 2, 0, Math.PI],
      scale: [0.60, 0.72, 0.5],
    },
  },
};