import React, { useRef } from "react";

/**
 * Wraps children in a 3D tilt container that follows the mouse.
 * Glass-friendly: adds perspective, preserve-3d, and layered depth.
 */
export default function TiltCard({ children, max = 10, scale = 1.02, className = "", style = {}, ...rest }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform .4s cubic-bezier(.2,.8,.2,1)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}