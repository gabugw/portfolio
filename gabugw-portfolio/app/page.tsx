"use client";
import { useEffect, useState } from "react";


const HomePage = () => {
  const Character = () => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [pupil, setPupil] = useState({ x: 0, y: 0 }); 
    const [size, setSize] = useState({ width: 0, height: 0 });

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
      <div onMouseMove={handleMove} className="relative w-screen h-screen">
        <img
          src="/assets/eyes.png"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{
            transform: `translate(${pupil.x}px, ${pupil.y}px)`,
          }}
          alt="Pupils"
        />
        <img
          src="/assets/character1.png"
          alt="Character"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      </div>
    );
  };

  return (
    <div className={`home-container`}>
      <Character />

      <style jsx>{`
        .home-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          transition: background 1s ease;
          text-align: center;
          font-family: sans-serif;
          color: #fff;
          background: #a2d4db;
        }

        h1 {
          font-size: 3rem;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
