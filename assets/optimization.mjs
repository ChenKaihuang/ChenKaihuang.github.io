export const POLYGON = [
  [-2.4, -1.7], [0.2, -2.15], [2.35, -0.9],
  [2.1, 1.6], [-1.1, 2.15], [-2.4, 0.7],
];
export const ANGLE = -0.42;
const c = Math.cos(ANGLE);
const s = Math.sin(ANGLE);
export const Q = [c * c + 8 * s * s, -7 * c * s, s * s + 8 * c * c];
const gamma = 1 / Math.sqrt(8);
const multiply = (x) => [Q[0] * x[0] + Q[1] * x[1], Q[1] * x[0] + Q[2] * x[1]];
const difference = (x, y) => [x[0] - y[0], x[1] - y[1]];
const dot = (x, y) => x[0] * y[0] + x[1] * y[1];
const clamp = (x, low, high) => Math.max(low, Math.min(high, x));

export function isFeasible(point) {
  return POLYGON.every((a, i) => {
    const b = POLYGON[(i + 1) % POLYGON.length];
    return (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0]) >= -1e-10;
  });
}

export function project(point) {
  if (isFeasible(point)) return [...point];
  let best;
  let distance = Infinity;
  POLYGON.forEach((a, i) => {
    const edge = difference(POLYGON[(i + 1) % POLYGON.length], a);
    const t = clamp(dot(difference(point, a), edge) / dot(edge, edge), 0, 1);
    const candidate = [a[0] + t * edge[0], a[1] + t * edge[1]];
    const delta = difference(candidate, point);
    const d = dot(delta, delta);
    if (d < distance) { distance = d; best = candidate; }
  });
  return best;
}

export function objective(point, target) {
  const delta = difference(point, target);
  return 0.5 * dot(delta, multiply(delta));
}

export function optimum(target) {
  if (isFeasible(target)) return [...target];
  let best;
  let value = Infinity;
  POLYGON.forEach((a, i) => {
    const edge = difference(POLYGON[(i + 1) % POLYGON.length], a);
    const t = clamp(-dot(edge, multiply(difference(a, target))) / dot(edge, multiply(edge)), 0, 1);
    const candidate = [a[0] + t * edge[0], a[1] + t * edge[1]];
    const f = objective(candidate, target);
    if (f < value) { value = f; best = candidate; }
  });
  return best;
}

export function solveHPR(start, target, steps = 320) {
  const gradient = multiply(difference(start, target));
  const anchor = [start[0] + gamma * gradient[0], start[1] + gamma * gradient[1]];
  const a = 1 + gamma * Q[0];
  const b = gamma * Q[1];
  const d = 1 + gamma * Q[2];
  const determinant = a * d - b * b;
  const qt = multiply(target);
  const prox = (z) => {
    const rhs = [z[0] + gamma * qt[0], z[1] + gamma * qt[1]];
    return [(d * rhs[0] - b * rhs[1]) / determinant, (a * rhs[1] - b * rhs[0]) / determinant];
  };
  let z = [...anchor];
  const path = [[...start]];
  for (let k = 0; k < steps; k += 1) {
    const u = prox(z);
    const reflected = [2 * u[0] - z[0], 2 * u[1] - z[1]];
    const p = project(reflected);
    const weight = 1 / (k + 2);
    z = [
      weight * anchor[0] + (1 - weight) * (2 * p[0] - reflected[0]),
      weight * anchor[1] + (1 - weight) * (2 * p[1] - reflected[1]),
    ];
    path.push(prox(z));
  }
  return path;
}

function mountDemo(demo) {
  const stage = demo.querySelector(".optimization-stage");
  const svg = demo.querySelector("svg");
  const contours = demo.querySelector("[data-contours]");
  const polygon = demo.querySelector("[data-feasible]");
  const trajectory = demo.querySelector("[data-trajectory]");
  const iterate = demo.querySelector("[data-iterate]");
  const minimum = demo.querySelector("[data-minimum]");
  const startDot = demo.querySelector("[data-start-dot]");
  const targetCross = demo.querySelector("[data-target-cross]");
  const labels = {
    start: demo.querySelector("[data-start-label]"),
    target: demo.querySelector("[data-target-label]"),
    minimum: demo.querySelector("[data-minimum-label]"),
  };
  const startHandle = demo.querySelector("[data-handle=start]");
  const targetHandle = demo.querySelector("[data-handle=target]");
  const replay = demo.querySelector("[data-replay]");
  const counter = demo.querySelector("[data-counter]");
  const status = demo.querySelector("[data-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { start: [-2, 1.15], target: [2.8, 1.35] };
  let points = solveHPR(state.start, state.target);
  let index = points.length - 1;
  let frame = 0;
  let size = { width: 520, height: 480, scale: 65 };

  const screen = (p) => [size.width / 2 + p[0] * size.scale, size.height / 2 - p[1] * size.scale];
  const pointAt = (event) => {
    const bounds = stage.getBoundingClientRect();
    return [
      clamp((event.clientX - bounds.left - size.width / 2) / size.scale, -3.2, 3.2),
      clamp((size.height / 2 - event.clientY + bounds.top) / size.scale, -2.5, 2.5),
    ];
  };
  const circle = (element, point) => {
    const [x, y] = screen(point);
    element.setAttribute("cx", x);
    element.setAttribute("cy", y);
  };
  const label = (element, point, dx, dy, anchor) => {
    const [x, y] = screen(point);
    element.setAttribute("text-anchor", anchor);
    const width = element.getComputedTextLength();
    element.setAttribute("x", clamp(x + dx, anchor === "end" ? width + 12 : 12, anchor === "end" ? size.width - 12 : size.width - width - 12));
    element.setAttribute("y", clamp(y + dy, 20, size.height - 12));
  };
  const placeHandle = (element, point) => {
    const [x, y] = screen(point);
    element.style.left = x + "px";
    element.style.top = y + "px";
    element.setAttribute("aria-label", (element === startHandle ? "Starting point" : "Objective center") + ", x " + point[0].toFixed(1) + ", y " + point[1].toFixed(1));
  };
  const paintPath = () => {
    const visible = points.slice(0, index + 1);
    trajectory.setAttribute("d", visible.map((p, i) => (i ? "L" : "M") + screen(p).map((v) => v.toFixed(2)).join(",")).join(" "));
    circle(iterate, points[index]);
    counter.textContent = "k = " + index;
  };
  const paint = () => {
    const [tx, ty] = screen(state.target);
    const rotation = -ANGLE * 180 / Math.PI;
    contours.querySelectorAll("ellipse").forEach((ellipse, i) => {
      const radius = (0.55 + i * 0.78) * size.scale;
      ellipse.setAttribute("cx", tx);
      ellipse.setAttribute("cy", ty);
      ellipse.setAttribute("rx", radius);
      ellipse.setAttribute("ry", radius / Math.sqrt(8));
      ellipse.setAttribute("transform", "rotate(" + rotation + " " + tx + " " + ty + ")");
    });
    polygon.setAttribute("points", POLYGON.map((p) => screen(p).join(",")).join(" "));
    circle(startDot, state.start);
    targetCross.setAttribute("d", "M" + (tx - 6) + "," + ty + "h12 M" + tx + "," + (ty - 6) + "v12");
    const solution = optimum(state.target);
    circle(minimum, solution);
    const separation = Math.hypot(solution[0] - state.target[0], solution[1] - state.target[1]);
    const nearTarget = separation * size.scale < 30;
    labels.target.textContent = separation < 1e-8 ? "Target / x*" : "Target";
    labels.minimum.style.display = nearTarget ? "none" : "";
    label(labels.start, state.start, -14, 24, "end");
    const targetOnRight = tx > size.width * 0.6;
    label(labels.target, state.target, targetOnRight ? -14 : 14, -30, targetOnRight ? "end" : "start");
    label(labels.minimum, solution, -12, 24, "end");
    placeHandle(startHandle, state.start);
    placeHandle(targetHandle, state.target);
    paintPath();
  };
  const finish = () => {
    cancelAnimationFrame(frame);
    index = points.length - 1;
    paintPath();
    status.textContent = "Halpern Peaceman–Rachford iteration finished. The filled point marks the constrained minimum.";
  };
  const animate = () => {
    cancelAnimationFrame(frame);
    status.textContent = "";
    if (reducedMotion.matches || document.hidden) { finish(); return; }
    const began = performance.now();
    const step = (now) => {
      const progress = clamp((now - began) / 2800, 0, 1);
      index = Math.floor(Math.pow(progress, 1.8) * (points.length - 1));
      paintPath();
      if (progress < 1) frame = requestAnimationFrame(step);
      else finish();
    };
    index = 0;
    paintPath();
    frame = requestAnimationFrame(step);
  };
  const recompute = (play) => {
    cancelAnimationFrame(frame);
    points = solveHPR(state.start, state.target);
    index = points.length - 1;
    paint();
    if (play) animate();
  };

  [startHandle, targetHandle].forEach((handle) => {
    const key = handle.dataset.handle;
    let dragging = false;
    handle.hidden = false;
    handle.disabled = false;
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      handle.focus({ preventScroll: true });
      dragging = true;
      cancelAnimationFrame(frame);
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      state[key] = pointAt(event);
      recompute(false);
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      animate();
    };
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
    handle.addEventListener("lostpointercapture", endDrag);
    handle.addEventListener("keydown", (event) => {
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const step = event.shiftKey ? 0.4 : 0.12;
      state[key] = [clamp(state[key][0] + step * direction[0], -3.2, 3.2), clamp(state[key][1] + step * direction[1], -2.5, 2.5)];
      recompute(true);
    });
  });
  svg.addEventListener("click", (event) => {
    state.start = pointAt(event);
    recompute(true);
  });
  replay.disabled = false;
  replay.addEventListener("click", animate);
  reducedMotion.addEventListener("change", () => { if (reducedMotion.matches) finish(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) finish(); });
  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (!width || !height) return;
    size = { width, height, scale: Math.min((width - 40) / 7.2, (height - 40) / 5.6) };
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    demo.querySelector("[data-clip]").setAttribute("width", width);
    demo.querySelector("[data-clip]").setAttribute("height", height);
    paint();
  }).observe(stage);
  paint();
  animate();
}

if (typeof document !== "undefined") {
  const demo = document.querySelector("[data-optimization-demo]");
  if (demo) mountDemo(demo);
}
