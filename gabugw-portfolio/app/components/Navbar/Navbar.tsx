"use client";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-blur-layer">
        <div className="container">
          {/* <div className="nav-brand">GABUGW</div> */}

          <button
            ref={toggleRef}
            className={`mobile-toggle ${open ? "active" : ""}`}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>

          <ul ref={menuRef} className={`nav-menu ${open ? "active" : ""}`}>
            <li>{/* <a href="#home">Home</a> */}</li>
            <li>
              <Link href="/me">TECH</Link>
            </li>
            <li>
              <Link href="/me">CREATIVE</Link>
            </li>
            <li>
              <Link href="/me">ME</Link>
            </li>
            <li>{/* <a href="#video">Video</a> */}</li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
