"use client";
import { useEffect, useState } from "react";
import "./Character.css";
import Orbits from "./Orbits";

const Character = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [characterLoaded, setCharacterLoaded] = useState(false);
  const [eyesLoaded, setEyesLoaded] = useState(false);

  const eyesImg = "/assets/eyes.png";
  const characterImg = "/assets/character1.png";

  useEffect(() => {
    const preloadImage = (src: string, callback: () => void) => {
      const img = new window.Image();
      img.src = src;
      img.onload = callback;
    };

    preloadImage(characterImg, () => setCharacterLoaded(true));
    preloadImage(eyesImg, () => setEyesLoaded(true));
  }, []);

  useEffect(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    let frame: number;

    const animate = () => {
      const targetX = (pos.x / size.width - 0.5) * 15;
      const targetY = (pos.y / size.height - 0.5) * 15;

      const t = 0.1;
      setPupil((prev) => ({
        x: prev.x + (targetX - prev.x) * t,
        y: prev.y + (targetY - prev.y) * t,
      }));

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pos, size.width, size.height]);

  return (
    <div
      onMouseMove={handleMove}
      className="relative w-screen h-screen overflow-hidden"
    >
      {characterLoaded && eyesLoaded && (
        <div style={{ pointerEvents: "auto" }}>
          <div className="absolute left-0 top-0 w-screen h-screen">
            <img
              src={characterImg}
              alt="Character"
              onLoad={() => setCharacterLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover z-10"
              style={{
                pointerEvents: "none",
                filter: "drop-shadow(5px 6px 4px #13121d96)",
              }}
            />

            <img
              src={eyesImg}
              className="absolute inset-0 w-full h-full object-cover z-9"
              style={{
                transform: `translate(${pupil.x}px, ${pupil.y}px)`,
                pointerEvents: "none",
              }}
              alt="Pupils"
            />
            <Orbits />
            <div className="nameplate">
              <b className="gabrielllaUgwonali">
                GABRIELLA
                <br />
                UGWONALI
              </b>
              <div className="gabReeElUhOoGwuhNoLee">
                /gab-ree-El-uh OO-gwuh-NAH-lee/
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Character;
