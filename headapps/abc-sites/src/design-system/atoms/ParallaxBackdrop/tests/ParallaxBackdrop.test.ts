import { describe, expect, it, vi } from 'vitest';

import { attachParallaxMotion, getParallaxOffset } from '@/design-system/atoms/ParallaxBackdrop';

type Listener = () => void;

const createMotionWindow = (reduced = false) => {
  const listeners = new Map<string, Listener>();
  const mediaListeners = new Map<string, Listener>();
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 1;

  const mediaQuery = {
    matches: reduced,
    addEventListener: vi.fn((name: string, listener: Listener) =>
      mediaListeners.set(name, listener)
    ),
    removeEventListener: vi.fn((name: string) => mediaListeners.delete(name)),
  };
  const motionWindow = {
    innerHeight: 1000,
    addEventListener: vi.fn((name: string, listener: Listener) => listeners.set(name, listener)),
    removeEventListener: vi.fn((name: string) => listeners.delete(name)),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    }),
    cancelAnimationFrame: vi.fn((id: number) => frames.delete(id)),
    matchMedia: vi.fn(() => mediaQuery),
  };

  return { motionWindow, mediaQuery, listeners, mediaListeners, frames };
};

describe('getParallaxOffset', () => {
  it('maps entry, centre, and exit positions to the Figma -12/0/+12vh states', () => {
    expect(getParallaxOffset(1000, 500, 1000)).toBe(-12);
    expect(getParallaxOffset(250, 500, 1000)).toBe(0);
    expect(getParallaxOffset(-500, 500, 1000)).toBe(12);
  });

  it('clamps positions outside the story and handles a zero travel distance', () => {
    expect(getParallaxOffset(5000, 500, 1000)).toBe(-12);
    expect(getParallaxOffset(-5000, 500, 1000)).toBe(12);
    expect(getParallaxOffset(0, 0, 0)).toBe(-12);
  });
});

describe('attachParallaxMotion', () => {
  it('schedules efficient scroll updates and removes listeners and frames on cleanup', () => {
    const { motionWindow, listeners, mediaListeners, frames } = createMotionWindow();
    const source = { style: { transform: '' } };
    const viewport = { getBoundingClientRect: () => ({ top: 250, height: 500 }) };

    const cleanup = attachParallaxMotion(
      viewport as Pick<HTMLElement, 'getBoundingClientRect'>,
      source as Pick<HTMLElement, 'style'>,
      motionWindow as unknown as Window
    );

    expect(listeners.has('scroll')).toBe(true);
    expect(listeners.has('resize')).toBe(true);
    expect(mediaListeners.has('change')).toBe(true);
    expect(frames.size).toBe(1);

    const firstFrame = [...frames.entries()][0];
    frames.delete(firstFrame[0]);
    firstFrame[1](0);
    expect(source.style.transform).toBe('translate3d(0, 0vh, 0)');

    listeners.get('scroll')?.();
    listeners.get('scroll')?.();
    expect(motionWindow.requestAnimationFrame).toHaveBeenCalledTimes(2);

    cleanup();
    expect(listeners.size).toBe(0);
    expect(mediaListeners.size).toBe(0);
    expect(motionWindow.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('renders a static centred crop for reduced motion without scroll listeners', () => {
    const { motionWindow, listeners, mediaListeners } = createMotionWindow(true);
    const source = { style: { transform: '' } };
    const viewport = { getBoundingClientRect: () => ({ top: 0, height: 500 }) };

    const cleanup = attachParallaxMotion(
      viewport as Pick<HTMLElement, 'getBoundingClientRect'>,
      source as Pick<HTMLElement, 'style'>,
      motionWindow as unknown as Window
    );

    expect(source.style.transform).toBe('translate3d(0, 0, 0)');
    expect(listeners.size).toBe(0);
    expect(mediaListeners.has('change')).toBe(true);
    expect(motionWindow.requestAnimationFrame).not.toHaveBeenCalled();

    cleanup();
    expect(mediaListeners.size).toBe(0);
  });

  it('responds to motion-preference changes without duplicating listeners', () => {
    const { motionWindow, mediaQuery, listeners, mediaListeners, frames } = createMotionWindow();
    const source = { style: { transform: '' } };
    const viewport = { getBoundingClientRect: () => ({ top: 250, height: 500 }) };
    const cleanup = attachParallaxMotion(
      viewport as Pick<HTMLElement, 'getBoundingClientRect'>,
      source as Pick<HTMLElement, 'style'>,
      motionWindow as unknown as Window
    );

    mediaQuery.matches = false;
    mediaListeners.get('change')?.();
    expect(motionWindow.addEventListener).toHaveBeenCalledTimes(2);

    mediaQuery.matches = true;
    mediaListeners.get('change')?.();
    expect(listeners.size).toBe(0);
    expect(source.style.transform).toBe('translate3d(0, 0, 0)');

    mediaQuery.matches = false;
    mediaListeners.get('change')?.();
    const pending = [...frames.entries()].at(-1);
    if (pending) {
      frames.delete(pending[0]);
      pending[1](0);
    }
    cleanup();
    expect(listeners.size).toBe(0);
  });
});
