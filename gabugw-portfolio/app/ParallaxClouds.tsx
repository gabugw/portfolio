import { useEffect, useState } from "react";

function ParallaxClouds({ offset }: { offset: number }) {
  const opacity = Math.max(0, Math.min(1, offset / 200));

  return (
    <div
      className="relative w-full h-48 z-10"
      style={{
        transform: `translateY(${-100 - offset * 1.3}px)`,
        opacity: opacity,
        pointerEvents: "none",
      }}
    >
      <img
        src="/assets/cloud.png"
        className="absolute w-full object-cover"
        alt="Clouds"
      />
    </div>
  );
}

export default ParallaxClouds;
