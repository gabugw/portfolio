import type { NextPage } from "next";
import React, { useState, useRef, useEffect, useCallback } from "react";

const DEFAULT_NODES = [
  {
    id: 1,
    x: 200,
    y: 200,
    vx: 0,
    vy: 0,
    label: "A",
    mass: 1,
    color: "#C5DAC4",
  },
  {
    id: 2,
    x: 500,
    y: 300,
    vx: 0,
    vy: 0,
    label: "B",
    mass: 1,
    color: "#B1B824",
  },
  {
    id: 3,
    x: 350,
    y: 450,
    vx: 0,
    vy: 0,
    label: "C",
    mass: 2,
    color: "#FFE799",
  },
  {
    id: 4,
    x: 400,
    y: 600,
    vx: 1,
    vy: 0,
    label: "D",
    mass: 40,
    color: "#2D485E",
  },

  {
    id: 5,
    x: 1000,
    y: 0,
    vx: 2,
    vy: 0,
    label: "E",
    mass: 100,
    color: "#FF326C",
  },
];

const FRICTION = 1 - 0.0001;
const G = 0.5;
const BOUNCE = 0.7;
const PADDING = 60;

const AboutMe: NextPage = () => {
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
          const radius = 10 + node.mass * 4;
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

  // Track mouse on document for robust drag
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

      if (lastPos.current && lastTime.current) {
        const dt = (now - lastTime.current) / 1000; // in seconds
        const dx = xClamped + dragging.offsetX - lastPos.current.x;
        const dy = yClamped + dragging.offsetY - lastPos.current.y;
        const averageMass = 3; // approximate average mass of your nodes
        const baseDamping = 0.0005;
        const vx = dx / dt;
        const vy = dy / dt;

        setNodes((prev) =>
          prev.map((node) =>
            node.id === dragging.id
              ? {
                  ...node,
                  x: xClamped + dragging.offsetX,
                  y: yClamped + dragging.offsetY,
                  vx: (vx * baseDamping * averageMass) / node.mass,
                  vy: (vy * baseDamping * averageMass) / node.mass,
                }
              : node
          )
        );
      } else {
        // On first move or no last position, just update position without velocity
        setNodes((prev) =>
          prev.map((node) =>
            node.id === dragging.id
              ? {
                  ...node,
                  x: xClamped + dragging.offsetX,
                  y: yClamped + dragging.offsetY,
                  vx: 0,
                  vy: 0,
                }
              : node
          )
        );
      }

      lastPos.current = {
        x: xClamped + dragging.offsetX,
        y: yClamped + dragging.offsetY,
      };
      lastTime.current = now;
    };

    const handleUp = (e: MouseEvent) => {
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
        className="flex-1 relative cursor-grab overflow-hidden select-none"
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
                    stroke="hsla(0, 0%, 100%, 1.00)"
                    strokeWidth={pull * 1.5}
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={other.x}
                    y2={other.y}
                    stroke="rgba(0, 0, 0, 0.6)"
                    strokeWidth={Math.max(0.5, pull)}
                    strokeLinecap="round"
                  />
                </g>
              );
            })
          )}
        </svg>
        {nodes.map((node) => {
          const radius = (10 + node.mass) ^ ((3 / 2) * 12);
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
                    ? `0 0 40px rgba(255,255,255,0.8), inset 0 0 20px rgba(255,255,255,0.2), 0 0 60px rgba(100,150,255,0.6)`
                    : undefined,
                fontSize: `${Math.max(10, radius * 0.8)}px`,
                cursor: "grab",
                opacity: 0.9,
              }}
            ></div>
          );
        })}
        {/* Info panel */}
        <div className="absolute top-4 right-4 text-slate-300 text-xs font-mono bg-slate-950/80 p-3 rounded backdrop-blur border border-slate-700">
          <div className="text-slate-400 mb-2 font-bold">System Info</div>
          <div className="space-y-1">
            {nodes.map((node) => {
              const speed = Math.hypot(node.vx, node.vy);
              return (
                <div key={node.id} className="text-slate-400">
                  {node.label}: M={node.mass.toFixed(1)} V={speed.toFixed(2)}
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700 text-slate-500">
            Dragging:{" "}
            {dragging ? nodes.find((n) => n.id === dragging.id)?.label : "None"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
