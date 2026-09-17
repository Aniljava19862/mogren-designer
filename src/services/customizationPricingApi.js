import api from "./api";

export const getCustomizationPricing =
  async (garmentType) => {
    const response = await api.get(
      `/customization-pricing/${garmentType}`
    );

    return response.data;
  };

export const calculateCustomizationPrice =
  async ({
    garmentType,
    designedAreas,
  }) => {
    const response = await api.post(
      "/customization-pricing/calculate",
      {
        garmentType,
        designedAreas,
      }
    );

    return response.data;
  };