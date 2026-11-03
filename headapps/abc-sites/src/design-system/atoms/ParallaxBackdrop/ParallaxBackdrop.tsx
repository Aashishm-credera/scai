'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

const PARALLAX_BLEED_VH = 12;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type MotionWindow = Pick<
  Window,
  | 'addEventListener'
  | 'removeEventListener'
  | 'cancelAnimationFrame'
  | 'innerHeight'
  | 'matchMedia'
  | 'requestAnimationFrame'
>;

export type ParallaxBackdropProps = {
  image: ReactNode;
  className?: string;
};

export const getParallaxOffset = (top: number, height: number, viewportHeight: number): number => {
  const travel = Math.max(1, viewportHeight + height);
  const progress = Math.min(1, Math.max(0, (viewportHeight - top) / travel));
  return -PARALLAX_BLEED_VH + progress * PARALLAX_BLEED_VH * 2;
};

/** Attaches the Figma-specified -12vh to +12vh scroll motion and returns its cleanup. */
export function attachParallaxMotion(
  viewport: Pick<HTMLElement, 'getBoundingClientRect'>,
  source: Pick<HTMLElement, 'style'>,
  motionWindow: MotionWindow = window
): () => void {
  const reducedMotion = motionWindow.matchMedia(REDUCED_MOTION_QUERY);
  let frame = 0;
  let listening = false;

  const update = () => {
    frame = 0;
    const rect = viewport.getBoundingClientRect();
    const offset = getParallaxOffset(rect.top, rect.height, motionWindow.innerHeight);
    source.style.transform = `translate3d(0, ${offset}vh, 0)`;
  };

  const schedule = () => {
    if (!frame) frame = motionWindow.requestAnimationFrame(update);
  };

  const start = () => {
    if (listening) return;
    listening = true;
    motionWindow.addEventListener('scroll', schedule, { passive: true });
    motionWindow.addEventListener('resize', schedule);
    schedule();
  };

  const stop = () => {
    if (!listening) return;
    listening = false;
    motionWindow.removeEventListener('scroll', schedule);
    motionWindow.removeEventListener('resize', schedule);
  };

  const applyMotionPreference = () => {
    if (reducedMotion.matches) {
      stop();
      if (frame) motionWindow.cancelAnimationFrame(frame);
      frame = 0;
      source.style.transform = 'translate3d(0, 0, 0)';
      return;
    }
    start();
  };

  reducedMotion.addEventListener?.('change', applyMotionPreference);
  applyMotionPreference();

  return () => {
    stop();
    reducedMotion.removeEventListener?.('change', applyMotionPreference);
    if (frame) motionWindow.cancelAnimationFrame(frame);
  };
}

export function ParallaxBackdrop({
  image,
  className,
}: ParallaxBackdropProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewportRef.current || !sourceRef.current) return undefined;
    return attachParallaxMotion(viewportRef.current, sourceRef.current);
  }, []);

  return (
    <div
      ref={viewportRef}
      className={[
        'relative overflow-hidden bg-(--abc-surface-default-secondary)',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-parallax-backdrop
    >
      <div
        ref={sourceRef}
        className="absolute inset-x-0 -inset-y-[12vh] will-change-transform motion-reduce:transform-none motion-reduce:will-change-auto"
      >
        <div className="absolute inset-0">{image}</div>
      </div>
      {/* Figma overlay gradient values have no matching design token. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0_/_20%)_0%,transparent_33.333%,transparent_66.667%,rgb(0_0_0_/_20%)_100%)] xl:bg-[linear-gradient(180deg,rgb(0_0_0_/_40%)_0%,transparent_20%,transparent_80%,rgb(0_0_0_/_40%)_100%)]"
        aria-hidden="true"
      />
    </div>
  );
}
