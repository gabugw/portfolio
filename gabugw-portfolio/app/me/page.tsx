"use client";
import AboutMe from "../Orbits"; // If you split it; else directly export in page.tsx

export default function MePage() {
  return (
    <div className={`about-container`}>
      <AboutMe />
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
}
