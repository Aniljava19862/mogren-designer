import { CANVAS_CONFIG } from "@/constants/designConstants";
import { useTshirtCanvas } from "@/hooks/useTshirtCanvas";

const TshirtCanvasFront = ({
  svgPath,
  onDesignUpdate,
}) => {
  const { canvasRef } =
    useTshirtCanvas({
      svgPath,
      view: "front",
      clipToGarment: false,
      onDesignUpdate,
    });

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_CONFIG.width}
        height={CANVAS_CONFIG.height}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
};

export default TshirtCanvasFront;