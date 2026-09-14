import { createContext, useState, useContext } from "react";

const CanvasContext = createContext(null);

export const CanvasProvider = ({ children }) => {
  const [frontCanvas, setFrontCanvas] = useState(null);
  const [backCanvas, setBackCanvas] = useState(null);
  const [leftCanvas, setLeftCanvas] = useState(null);
  const [rightCanvas, setRightCanvas] = useState(null);
  const [activeCanvas, setActiveCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <CanvasContext.Provider
      value={{
        frontCanvas,
        setFrontCanvas,
        backCanvas,
        setBackCanvas,
        leftCanvas,
        setLeftCanvas,
        rightCanvas,
        setRightCanvas,
        activeCanvas,
        setActiveCanvas,
        selectedObject,
        setSelectedObject,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);
