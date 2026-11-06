import test from "node:test";
import assert from "node:assert/strict";
import { POLYGON, Q, isFeasible, project, objective, optimum, solveHPR } from "../assets/optimization.mjs";

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

test("Euclidean projection is feasible and satisfies the projection variational inequality", () => {
  for (const point of [[0, 0], [-4, 4], [5, -2], [2.8, 1.35]]) {
    const p = project(point);
    assert.ok(isFeasible(p));
    for (const vertex of POLYGON) {
      const residual = (point[0] - p[0]) * (vertex[0] - p[0]) + (point[1] - p[1]) * (vertex[1] - p[1]);
      assert.ok(residual <= 1e-9);
    }
    if (isFeasible(point)) assert.deepEqual(p, point);
  }
});

test("quadratic optimum satisfies first-order optimality for every vertex", () => {
  for (const x of [-3.2, -1, 0, 1, 3.2]) {
    for (const y of [-2.5, -1, 0, 1, 2.5]) {
      const target = [x, y];
      const p = optimum(target);
      const dx = p[0] - x;
      const dy = p[1] - y;
      const gradient = [Q[0] * dx + Q[1] * dy, Q[1] * dx + Q[2] * dy];
      assert.ok(isFeasible(p));
      for (const vertex of POLYGON) {
        const directionalDerivative = gradient[0] * (vertex[0] - p[0]) + gradient[1] * (vertex[1] - p[1]);
        assert.ok(directionalDerivative >= -1e-8);
        assert.ok(objective(p, target) <= objective(vertex, target) + 1e-9);
      }
      if (isFeasible(target)) assert.deepEqual(p, target);
    }
  }
});

test("HPR shadow starts at the chosen point and converges toward the independent optimum", () => {
  for (const target of [[0, 0], [2.8, 1.35], [-3, 2.5], [3, -2.5], [-1, -2.5]]) {
    for (const start of [[-2, 1.15], [3, -2.5], [0, 0]]) {
      const exact = optimum(target);
      const short = solveHPR(start, target, 80);
      const long = solveHPR(start, target, 1600);
      assert.deepEqual(long[0], start);
      assert.ok(long.every((p) => p.every(Number.isFinite)));
      assert.ok(distance(long.at(-1), exact) < 0.009);
      assert.ok(distance(long.at(-1), exact) <= distance(short.at(-1), exact) + 1e-9);
    }
  }
});
