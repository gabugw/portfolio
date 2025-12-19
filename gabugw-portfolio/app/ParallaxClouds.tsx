function ParallaxClouds({ offset }: { offset: number }) {
  return (
    <div
      className="absolute w-full h-48 z-8"
      style={{
        transform: `translateY(${offset * 0.2}px)`,
        opacity: 0.3,
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
