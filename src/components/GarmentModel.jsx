import {
  Center,
  Decal,
  useGLTF,
  useTexture,
} from "@react-three/drei";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

const FALLBACK_TEXTURE =
  "/3Dmodels/textures/design-fallback.png";

export function GarmentModel({
  garmentConfig,
  garmentColor = "#ffffff",
  designTexture,
  designTextureBack,
  onViewChange,
}) {
  const { nodes, materials } =
    useGLTF(garmentConfig.modelPath);

  const frontTexture = useTexture(
    designTexture || FALLBACK_TEXTURE
  );

  const backTexture = useTexture(
    designTextureBack || FALLBACK_TEXTURE
  );

  const colorMaterial = useMemo(() => {
    const source =
      materials?.[garmentConfig.colorMaterial] ||
      materials?.[garmentConfig.bodyMaterial];

    if (source) {
      return source.clone();
    }

    return new THREE.MeshStandardMaterial({
      color: garmentColor,
    });
  }, [
    materials,
    garmentConfig.colorMaterial,
    garmentConfig.bodyMaterial,
  ]);

  useEffect(() => {
    colorMaterial.color.set(garmentColor);
    colorMaterial.needsUpdate = true;
  }, [garmentColor, colorMaterial]);

  useEffect(() => {
    if (frontTexture) {
      frontTexture.colorSpace = THREE.SRGBColorSpace;
      frontTexture.flipY = false;
      frontTexture.needsUpdate = true;
    }

    if (backTexture) {
      backTexture.colorSpace = THREE.SRGBColorSpace;
      backTexture.flipY = false;
      backTexture.needsUpdate = true;
    }
  }, [frontTexture, backTexture]);

  const bodyNode =
    nodes?.[garmentConfig.bodyNode];

  const colorNode =
    nodes?.[garmentConfig.colorNode];

  const frontNode =
    nodes?.[garmentConfig.frontNode];

  const backNode =
    nodes?.[garmentConfig.backNode];

  const leftSleeveNode =
    nodes?.[garmentConfig.leftSleeveNode];

  const rightSleeveNode =
    nodes?.[garmentConfig.rightSleeveNode];

  if (!bodyNode) {
    console.error(
      `Missing body node "${garmentConfig.bodyNode}"`,
      Object.keys(nodes || {})
    );

    return null;
  }

  return (
    <Center position={[0, 0.1, 0]}>
      <group dispose={null}>
        <group rotation={garmentConfig.rotation}>
          {/* GARMENT BODY */}
          <mesh
            castShadow
            receiveShadow
            geometry={bodyNode.geometry}
            material={colorMaterial}
            scale={garmentConfig.scale}
            position={garmentConfig.position}
          />

          {/* FRONT PRINT AREA */}
          {frontNode && (
            <mesh
              geometry={frontNode.geometry}
              scale={garmentConfig.scale}
              position={garmentConfig.position}
            >
              <meshBasicMaterial
                transparent
                opacity={0}
                depthWrite={false}
              />

              <Decal
                {...garmentConfig.frontDecal}
                onClick={(event) => {
                  event.stopPropagation();
                  onViewChange?.("front");
                }}
              >
                <meshStandardMaterial
                  map={frontTexture}
                  transparent
                  toneMapped={false}
                  polygonOffset
                  polygonOffsetFactor={-4}
                  depthWrite={false}
                />
              </Decal>
            </mesh>
          )}

          {/* BACK PRINT AREA */}
          {backNode && (
            <mesh
              geometry={backNode.geometry}
              scale={garmentConfig.scale}
              position={garmentConfig.position}
            >
              <meshBasicMaterial
                transparent
                opacity={0}
                depthWrite={false}
              />

              <Decal
                {...garmentConfig.backDecal}
                onClick={(event) => {
                  event.stopPropagation();
                  onViewChange?.("back");
                }}
              >
                <meshStandardMaterial
                  map={backTexture}
                  transparent
                  toneMapped={false}
                  polygonOffset
                  polygonOffsetFactor={-4}
                  depthWrite={false}
                />
              </Decal>
            </mesh>
          )}

          {/* LEFT SLEEVE */}
          {leftSleeveNode && (
            <mesh
              castShadow
              receiveShadow
              geometry={leftSleeveNode.geometry}
              material={colorMaterial}
              scale={garmentConfig.scale}
              position={garmentConfig.position}
            />
          )}

          {/* RIGHT SLEEVE */}
          {rightSleeveNode && (
            <mesh
              castShadow
              receiveShadow
              geometry={rightSleeveNode.geometry}
              material={colorMaterial}
              scale={garmentConfig.scale}
              position={garmentConfig.position}
            />
          )}

          {/* OPTIONAL COLOR LAYER */}
          {colorNode &&
            colorNode !== bodyNode && (
              <mesh
                geometry={colorNode.geometry}
                material={colorMaterial}
                scale={garmentConfig.scale}
                position={garmentConfig.position}
              />
            )}
        </group>
      </group>
    </Center>
  );
}