'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Subset of the Network Information API (not in lib.dom; Chromium/Android only).
 * Every field is optional because Safari and Firefox do not expose `navigator.connection`.
 */
type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g']);
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** Below the `md` breakpoint we keep cellular data usage down by showing the poster only. */
const SMALL_SCREEN_QUERY = '(max-width: 767.98px)';

function getConnection(): NetworkInformationLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

/** True when the device, network or user preferences say we should not stream video. */
function shouldUsePosterOnly(): boolean {
  if (typeof window === 'undefined') return true;
  const connection = getConnection();
  if (connection?.saveData === true) return true;
  if (connection?.effectiveType && SLOW_CONNECTIONS.has(connection.effectiveType)) return true;
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return true;
  if (window.matchMedia(SMALL_SCREEN_QUERY).matches) return true;
  return false;
}

export type HeroVideoBackgroundProps = {
  /** Static first frame shown immediately and whenever video is skipped. */
  posterSrc?: string;
  webmSrc?: string;
  mp4Src?: string;
  /** Classes for the outer container (sizing, background colour, padding). */
  className?: string;
  /** Classes for the readability scrim between the media and the content. */
  overlayClassName?: string;
  children?: React.ReactNode;
};

/**
 * Decorative, low-bandwidth background video.
 *
 * - The poster `<img>` renders on the server, so the first paint (and LCP) is never blank.
 * - The `<video>` element is only mounted on the client after checking Save-Data, 2G
 *   connections, reduced-motion and small screens; when any of those apply nothing is downloaded.
 * - If the video fails to load or autoplay is refused, it is unmounted and the poster remains.
 */
export function HeroVideoBackground({
  posterSrc = '/media/hero-poster.webp',
  webmSrc = '/media/hero.webm',
  mp4Src = '/media/hero.mp4',
  className = '',
  overlayClassName = 'bg-gradient-to-r from-[#0b1724]/85 via-[#0b1724]/60 to-[#0b1724]/25',
  children,
}: HeroVideoBackgroundProps) {
  // Start with "poster only" so server and first client render match; decide after mount.
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const evaluate = () => setVideoAllowed(!shouldUsePosterOnly());
    evaluate();

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const smallScreen = window.matchMedia(SMALL_SCREEN_QUERY);
    const connection = getConnection();
    reducedMotion.addEventListener('change', evaluate);
    smallScreen.addEventListener('change', evaluate);
    connection?.addEventListener?.('change', evaluate);
    return () => {
      reducedMotion.removeEventListener('change', evaluate);
      smallScreen.removeEventListener('change', evaluate);
      connection?.removeEventListener?.('change', evaluate);
    };
  }, []);

  const showVideo = videoAllowed && !videoFailed;

  useEffect(() => {
    if (!showVideo) {
      setVideoPlaying(false);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    // `autoPlay` alone gives no signal when the browser refuses (e.g. iOS Low Power Mode),
    // so request playback explicitly and fall back to the poster if it is rejected.
    const attempt = video.play();
    if (attempt) attempt.catch(() => setVideoFailed(true));
  }, [showVideo]);

  const handleFailure = useCallback(() => setVideoFailed(true), []);

  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <img
        src={posterSrc}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full select-none object-cover"
      />

      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setVideoPlaying(true)}
          onError={handleFailure}
          className={`pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700 ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={webmSrc} type="video/webm" />
          {/* With <source> children, load failures fire on the sources, not on <video>; the last one failing means none worked. */}
          <source src={mp4Src} type="video/mp4" onError={handleFailure} />
        </video>
      )}

      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${overlayClassName}`} />

      {children}
    </div>
  );
}
