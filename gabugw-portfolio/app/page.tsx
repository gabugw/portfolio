"use client";
import GithubDisplay from "./components/GithubDisplay";
import Character from "./components/Character/Character";
import { useEffect, useRef, useState } from "react";

const LazyCharacter = ({ offset }: { offset: number }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "150% 0px 150% 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Character offset={offset} />
      ) : (
        <div className=" w-screen h-screen"></div>
      )}
    </div>
  );
};

const HomePage = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`home-container`}>
      <LazyCharacter offset={offset} />
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
