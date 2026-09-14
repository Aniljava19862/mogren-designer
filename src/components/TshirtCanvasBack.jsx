import {
  useTshirtCanvas,
} from "@/hooks/useTshirtCanvas";

const TshirtCanvasBack = ({
  svgPath,
  canvasWidth = 300,
  canvasHeight = 400,
}) => {
  const {
    canvasRef,
  } = useTshirtCanvas({
    svgPath,

    view: "back",

    canvasWidth,
    canvasHeight,

    clipToGarment: false,
  });

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
      />
    </div>
  );
};

export default TshirtCanvasBack;