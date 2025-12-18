"use client";
import GithubDisplay from "./components/GithubDisplay";
import Character from "./components/Character/Character";
import { useEffect, useState } from "react";
import ParallaxClouds from "./ParallaxClouds";

const HomePage = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset); // slower than scroll
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`home-container`}>
      <Character offset={offset} />
      <ParallaxClouds offset={offset} />
      <GithubDisplay />
      <GithubDisplay />
      <GithubDisplay />
      <style jsx>{`
        .home-container {
          position: relative;
          // height: 100dvh;
          width: 100vw;
          // background: #a2d4db;
          background: #2a4459;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: sans-serif;
          color: #fff;
          transition: background 1s ease;
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
