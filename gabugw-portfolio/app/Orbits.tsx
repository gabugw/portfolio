import type { NextPage } from "next";
import React, { useState, useRef, useEffect, useCallback } from "react";

const PHI = 1.618;
const NODE_COUNT = 5;
const massScale = [
  1, // base
  PHI, // 1.618
  PHI * PHI, // ≈ 2.618
  PHI ** 3, // ≈ 4.236
  PHI ** 4, // ≈ 6.854
];

function createNodes(width: number, height: number) {
  return ["A", "B", "C", "D", "E"].map((label, i) => {
    // quasi-random sequence using golden ratio
    const t = (i + Math.random()) / NODE_COUNT; // 0–1 but shuffled each render
    let xNorm = (t * PHI) % 1;
    let yNorm = (t * PHI * PHI) % 1;

    // bias upward
    yNorm = Math.pow(yNorm, 1.5);

    // bias outward from center
    const cx = 0.5,
      cy = 0.5;
    xNorm = cx + (xNorm - cx) * 1.3;
    yNorm = cy + (yNorm - cy) * 1.3;

    // clamp to [0,1]
    xNorm = Math.min(Math.max(xNorm, 0), 1);
    yNorm = Math.min(Math.max(yNorm, 0), 1);

    const padding = 80;
    const x = padding + xNorm * (width - 2 * padding);
    const y = padding + yNorm * (height - 2 * padding);

    return {
      id: i + 1,
      x,
      y,
      vx: Math.random() - 0.5,
      vy: Math.random() - 0.5,
      label,
      mass: massScale[i],
      color: ["#C5DAC4", "#FF326C", "#B1B824", "#FFE799", "#FF4747"][i],
    };
  });
}

const FRICTION = 1 - 0.0001;
const G = 0.5;
const BOUNCE = 0.7;
const PADDING = 60;

const Orbits: NextPage = () => {
  const DEFAULT_NODES = createNodes(window.innerWidth, window.innerHeight);
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [dragging, setDragging] = useState<{
    id: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const aniRef = useRef<number | null>(null);
  const boundsRef = useRef({ width: 0, height: 0 });
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const lastTime = useRef<number | null>(null);

  // On mount & resize, measure container
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        boundsRef.current = {
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        };
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Main physics loop
  useEffect(() => {
    let stop = false;
    const animate = () => {
      setNodes((prev) => {
        // Defensive copy and calc
        const updated = prev.map((node) => {
          // Skip update for dragging
          if (dragging?.id === node.id) return node;
          let { vx, vy } = node;
          vx *= FRICTION;
          vy *= FRICTION;

          // Gravity
          prev.forEach((other) => {
            if (other.id !== node.id) {
              let dx = other.x - node.x;
              let dy = other.y - node.y;
              let dist = Math.hypot(dx, dy);
              if (dist < 5) dist = 5; // Avoid divide by zero/blowup
              // F = G * m1 * m2 / r^2
              let force = (G * node.mass * other.mass) / (dist * dist);
              let angle = Math.atan2(dy, dx);
              vx += (Math.cos(angle) * force) / node.mass;
              vy += (Math.sin(angle) * force) / node.mass;
            }
          });

          // Boundaries
          let x = node.x + vx;
          let y = node.y + vy;
          const radius = node.mass * 30;
          const minX = PADDING + radius;
          const minY = PADDING + radius;
          const maxX = (boundsRef.current.width || 900) - (PADDING + radius);
          const maxY = (boundsRef.current.height || 600) - (PADDING + radius);

          // Clamp edge, bounce
          if (x < minX) {
            x = minX;
            vx = Math.abs(vx) * BOUNCE;
          }
          if (x > maxX) {
            x = maxX;
            vx = -Math.abs(vx) * BOUNCE;
          }
          if (y < minY) {
            y = minY;
            vy = Math.abs(vy) * BOUNCE;
          }
          if (y > maxY) {
            y = maxY;
            vy = -Math.abs(vy) * BOUNCE;
          }

          // Defensive NaN fix
          if (!isFinite(x)) x = node.x;
          if (!isFinite(y)) y = node.y;
          if (!isFinite(vx)) vx = 0;
          if (!isFinite(vy)) vy = 0;

          return { ...node, x, y, vx, vy };
        });
        return updated;
      });
      if (!stop) aniRef.current = requestAnimationFrame(animate);
    };
    aniRef.current = requestAnimationFrame(animate);
    return () => {
      stop = true;
      if (aniRef.current !== null) {
        cancelAnimationFrame(aniRef.current);
      }
    };
  }, [dragging]);

  // Mouse/touch drag handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: number) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = nodes.find((n) => n.id === nodeId);

    setDragging({ id: nodeId, offsetX: node!.x - x, offsetY: node!.y - y });
  };
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const xClamped = Math.max(
        PADDING,
        Math.min(
          e.clientX - rect.left,
          (boundsRef.current.width || 900) - PADDING
        )
      );

      const yClamped = Math.max(
        PADDING,
        Math.min(
          e.clientY - rect.top,
          (boundsRef.current.height || 600) - PADDING
        )
      );

      const now = performance.now();

      // ✔ DURING DRAG: position only (no physics!)
      setNodes((prev) =>
        prev.map((node) =>
          node.id === dragging.id
            ? {
                ...node,
                x: xClamped + dragging.offsetX,
                y: yClamped + dragging.offsetY,
                vx: 0, // keep velocity zero during drag
                vy: 0,
              }
            : node
        )
      );

      // ✔ always track last mouse pos & time for release velocity
      lastPos.current = {
        x: xClamped + dragging.offsetX,
        y: yClamped + dragging.offsetY,
      };
      lastTime.current = now;
    };

    const handleUp = (e: MouseEvent) => {
      // ------------------------------------------
      // ✔ ON RELEASE — compute proper fling velocity
      // ------------------------------------------
      if (lastPos.current && lastTime.current) {
        const now = performance.now();
        const dt = (now - lastTime.current) / 1000;

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const vx = ((x - lastPos.current.x) / dt) * 0.02;
          const vy = ((y - lastPos.current.y) / dt) * 0.02;

          setNodes((prev) =>
            prev.map((node) =>
              node.id === dragging.id
                ? { ...node, vx: vx / node.mass, vy: vy / node.mass }
                : node
            )
          );
        }
      }

      lastPos.current = null;
      lastTime.current = null;
      setDragging(null);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  // Gravity edge thickness
  const calculateGravitationalPull = (
    node1: { x: number; y: number; mass: number },
    node2: { x: number; y: number; mass: number }
  ) => {
    const dist = Math.max(5, Math.hypot(node1.x - node2.x, node1.y - node2.y));
    return Math.min(8, (G * node1.mass * node2.mass) / (dist * dist));
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden select-none"
      >
        {/* SVG for gravity lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <radialGradient id="gravityGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(100, 200, 255, 0.1)" />
              <stop offset="100%" stopColor="rgba(100, 200, 255, 0)" />
            </radialGradient>
          </defs>
          {nodes.map((node) => (
            <circle
              key={`field-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={Math.max(80, node.mass * 30)}
              fill="url(#gravityGradient)"
              pointerEvents="none"
            />
          ))}
          {nodes.map((node, i) =>
            nodes.slice(i + 1).map((other) => {
              const pull = calculateGravitationalPull(node, other);
              return (
                <g key={`edge-${node.id}-${other.id}`}>
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={other.x}
                    y2={other.y}
                    stroke="#fff67e"
                    strokeWidth={Math.sqrt(pull) * 100}
                    strokeLinecap="round"
                  />
                </g>
              );
            })
          )}
        </svg>
        {nodes.map((node) => {
          const radius = 10 + node.mass * 12;
          const speed = Math.hypot(node.vx, node.vy);
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              className={`absolute rounded-full transition-shadow hover:shadow-2xl flex items-center justify-center font-bold text-white`}
              style={{
                background: node.color,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                transform: `translate(${node.x - radius}px, ${
                  node.y - radius
                }px)`,
                boxShadow:
                  dragging?.id === node.id
                    ? `0 0 40px #fff67e60, inset 0 0 20px rgba(255,255,255,0.2), 0 0 60px rgba(100,150,255,0.6)`
                    : undefined,
                fontSize: `${Math.max(10, radius * 0.8)}px`,
                cursor: "grab",
                opacity: 0.9,
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default Orbits;
