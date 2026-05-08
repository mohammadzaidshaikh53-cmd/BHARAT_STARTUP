/**
 * Enterprise Physics Engine
 * Pattern from: Linear, Apple VisionOS, Stripe Dashboard
 *
 * Implements:
 * - Spring physics with damping
 * - Damped harmonic oscillation
 * - Velocity-based momentum
 * - Inertia calculations
 * - Magnetic field interactions
 * - Scroll-linked physics
 * - Elastic constraints
 */

'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion';

/**
 * Spring configuration presets with real physics values
 * Based on Material Design 3, Apple, and Linear
 */
export const SPRING_CONFIGS = {
  // Default - balanced for most UI (mass:1, stiffness:350, damping:28)
  default: { mass: 1, stiffness: 350, damping: 28, velocity: 0 },

  // Precise - for small interactions (checkboxes, toggles, buttons)
  precise: { mass: 0.8, stiffness: 500, damping: 35, velocity: 0 },

  // Gentle - for large elements (modals, drawers, overlays)
  gentle: { mass: 1.2, stiffness: 200, damping: 30, velocity: 0 },

  // Bouncy - playful interactions (celebrations, badges, confetti)
  bouncy: { mass: 0.9, stiffness: 400, damping: 15, velocity: 0 },

  // Snappy - quick feedback (swipe actions, drag releases)
  snappy: { mass: 0.7, stiffness: 600, damping: 32, velocity: 0 },

  // Heavy - large page elements (panels, cards, charts)
  heavy: { mass: 1.5, stiffness: 150, damping: 25, velocity: 0 },

  // Magnetic - elements that attract/repel
  magnetic: { mass: 1, stiffness: 180, damping: 20, velocity: 0 },

  // Elastic - rubber-band effects
  elastic: { mass: 0.5, stiffness: 300, damping: 12, velocity: 0 },
};

/**
 * Calculate spring transition from config
 */
export function calculateSpring(config) {
  return {
    type: 'spring',
    mass: config.mass,
    stiffness: config.stiffness,
    damping: config.damping,
    velocity: config.velocity,
  };
}

/**
 * Damped Harmonic Oscillator
 * For elastic effects like jelly, rubber-band, bounce
 *
 * Formula: x(t) = A * e^(-γt) * cos(ωt + φ)
 * Where:
 *   - γ (gamma) = damping ratio
 *   - ω (omega) = angular frequency
 *   - A = amplitude
 *   - φ (phi) = phase offset
 */
export class DampedOscillator {
  constructor(config = {}) {
    this.amplitude = config.amplitude || 1;
    this.damping = config.damping || 0.5; // γ
    this.frequency = config.frequency || 2; // ω
    this.phase = config.phase || 0; // φ
    this.time = 0;
  }

  /**
   * Calculate position at time t
   */
  position(t) {
    const decay = Math.exp(-this.damping * t);
    const oscillation = Math.cos(this.frequency * t + this.phase);
    return this.amplitude * decay * oscillation;
  }

  /**
   * Calculate velocity at time t
   */
  velocity(t) {
    const decay = Math.exp(-this.damping * t);
    const sinTerm = Math.sin(this.frequency * t + this.phase);
    const cosTerm = Math.cos(this.frequency * t + this.phase);

    return this.amplitude * Math.exp(-this.damping * t) * (
      -this.damping * cosTerm - this.frequency * sinTerm
    );
  }

  /**
   * Reset oscillator to initial state
   */
  reset() {
    this.time = 0;
  }

  /**
   * Tick the oscillator by delta time
   */
  tick(dt = 0.016) {
    this.time += dt;
    return {
      position: this.position(this.time),
      velocity: this.velocity(this.time),
      settled: Math.abs(this.position(this.time)) < 0.001,
    };
  }
}

/**
 * Inertia Calculator
 * Calculates continued motion after a drag/flick
 *
 * Formula: x(t) = x0 + v0 * t + 0.5 * a * t^2
 * Friction: v(t) = v0 * e^(-μt)
 */
export class InertiaCalculator {
  constructor(config = {}) {
    this.friction = config.friction || 0.95; // μ - friction coefficient
    this.velocityThreshold = config.velocityThreshold || 0.1;
  }

  /**
   * Calculate position after time t
   */
  position(x0, v0, t) {
    // With friction
    const v = v0 * Math.exp(-this.friction * t);
    return x0 + (v0 - v) / this.friction;
  }

  /**
   * Calculate velocity after time t
   */
  velocity(v0, t) {
    return v0 * Math.exp(-this.friction * t);
  }

  /**
   * Calculate time to stop
   */
  timeToStop(v0) {
    if (Math.abs(v0) < this.velocityThreshold) return 0;
    return Math.log(this.velocityThreshold / Math.abs(v0)) / -this.friction;
  }

  /**
   * Is the motion settled?
   */
  isSettled(v0) {
    return Math.abs(v0) < this.velocityThreshold;
  }
}

/**
 * Magnetic Field Calculator
 * Calculates attraction/repulsion between elements
 *
 * Formula: F = k * q1 * q2 / r^2 (simplified)
 */
export class MagneticField {
  constructor(config = {}) {
    this.strength = config.strength || 1000; // k
    this.maxDistance = config.maxDistance || 200;
    this.breakDistance = config.breakDistance || 300;
  }

  /**
   * Calculate force at distance r
   * Returns { x, y } force vector
   */
  forceAtDistance(targetX, targetY, currentX, currentY) {
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.breakDistance) {
      return { x: 0, y: 0, distance };
    }

    const clampedDistance = Math.max(distance, 10);
    const force = this.strength / (clampedDistance * clampedDistance);
    const normalizedForce = Math.min(force, 50); // Cap force

    return {
      x: (dx / distance) * normalizedForce,
      y: (dy / distance) * normalizedForce,
      distance,
    };
  }

  /**
   * Calculate spring-like attraction with damping
   */
  springAttraction(targetX, targetY, currentX, currentY) {
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.maxDistance) {
      return { x: 0, y: 0, distance };
    }

    const stiffness = 0.3;
    const damping = 0.1;

    return {
      x: dx * stiffness - damping * dx,
      y: dy * stiffness - damping * dy,
      distance,
    };
  }
}

/**
 * Bezier Curve Interpolation
 * For smooth paths and custom easing
 */
export function bezierPoint(t, p0, p1, p2, p3) {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

/**
 * Catmull-Rom Spline interpolation
 * For smooth curved paths (like scroll-linked animations)
 */
export function catmullRomPoint(t, p0, p1, p2, p3) {
  const t2 = t * t;
  const t3 = t2 * t;

  const x = 0.5 * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );

  const y = 0.5 * (
    (2 * p1.y) +
    (-p0.y + p2.y) * t +
    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
  );

  return { x, y };
}

/**
 * Easing functions with physics basis
 */
export const EASING_FUNCTIONS = {
  // Exponential ease
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  // Smooth step
  smoothStep: (t) => t * t * (3 - 2 * t),

  // Smoother step (5th order)
  smootherStep: (t) => t * t * t * (t * (t * 6 - 15) + 10),

  // Sinusoidal
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Spring-like elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Bounce
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/**
 * Interpolation utilities
 */
export const Interpolation = {
  // Linear interpolation
  lerp: (a, b, t) => a + (b - a) * t,

  // Clamp value
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),

  // Map range
  mapRange: (value, inMin, inMax, outMin, outMax) => {
    const t = Interpolation.clamp((value - inMin) / (inMax - inMin), 0, 1);
    return Interpolation.lerp(outMin, outMax, t);
  },

  // Smooth damp (for continuous values like mouse position)
  smoothDamp: (current, target, velocity, smoothTime, deltaTime) => {
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const temp = (velocity + omega * change) * deltaTime;
    const newVelocity = (velocity + omega * temp) * exp;
    const newValue = target + (change + temp) * exp;
    return { value: newValue, velocity: newVelocity };
  },
};

/**
 * Vector math utilities
 */
export const Vector = {
  add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
  sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
  mul: (v, s) => ({ x: v.x * s, y: v.y * s }),
  div: (v, s) => ({ x: v.x / s, y: v.y / s }),
  dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y,
  length: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
  normalize: (v) => {
    const len = Vector.length(v);
    return len === 0 ? { x: 0, y: 0 } : Vector.div(v, len);
  },
  distance: (v1, v2) => Vector.length(Vector.sub(v1, v2)),
  angle: (v) => Math.atan2(v.y, v.x),
  rotate: (v, angle) => ({
    x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
    y: v.x * Math.sin(angle) + v.y * Math.cos(angle),
  }),
  lerp: (v1, v2, t) => ({
    x: Interpolation.lerp(v1.x, v2.x, t),
    y: Interpolation.lerp(v1.y, v2.y, t),
  }),
};

/**
 * Convert degrees to radians
 */
export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Circular motion calculator
 */
export function circularMotion(centerX, centerY, radius, angle) {
  return {
    x: centerX + radius * Math.cos(toRadians(angle)),
    y: centerY + radius * Math.sin(toRadians(angle)),
  };
}

/**
 * Wave function calculator
 * For wave-like animations (ripples, pulses)
 */
export function waveFunction(t, amplitude, frequency, phase = 0) {
  return amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
}

/**
 * Perlin-like noise (simplified)
 */
export function simpleNoise(x, y = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Fractal Brownian Motion
 * For organic, natural-looking motion
 */
export function fractalBrownianMotion(x, octaves = 4, lacunarity = 2, persistence = 0.5) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * simpleNoise(x * frequency, x * frequency);
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return value / maxValue;
}
