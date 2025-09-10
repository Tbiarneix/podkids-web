"use client";

import Image from "next/image";

export type EpisodeCoverWithPlayProps = {
  cover: string;
  onPlay: () => void;
  onToggle?: () => void;
  isActive?: boolean;
  isCurrent?: boolean;
  coverSizePx?: number;
  buttonSizePct?: number;
  episodeName: string;
};

export function EpisodeCoverWithPlay({
  cover,
  onPlay,
  onToggle,
  isActive,
  isCurrent,
  coverSizePx,
  buttonSizePct = 0.35,
  episodeName,
}: EpisodeCoverWithPlayProps) {
  const wrapperStyle: React.CSSProperties | undefined = coverSizePx
    ? { width: coverSizePx, height: coverSizePx }
    : undefined;

  const btnSizeStyle: React.CSSProperties = coverSizePx
    ? {
        width: Math.max(0, coverSizePx * buttonSizePct),
        height: Math.max(0, coverSizePx * buttonSizePct),
      }
    : { width: `${buttonSizePct * 100}%`, height: `${buttonSizePct * 100}%` };

  const innerIconStyle: React.CSSProperties = { width: "75%", height: "75%" };

  return (
    <div
      className="group relative mb-2 aspect-square w-full overflow-hidden rounded-xl"
      style={wrapperStyle}
    >
      <Image
        src={cover}
        alt=""
        role="presentation"
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover"
        unoptimized
      />
      <button
        type="button"
        title={
          isCurrent ? (isActive ? "Mettre en pause" : `Lire ${episodeName}`) : `Lire ${episodeName}`
        }
        aria-label={
          isCurrent ? (isActive ? "Mettre en pause" : `Lire ${episodeName}`) : `Lire ${episodeName}`
        }
        aria-pressed={isCurrent ? !!isActive : undefined}
        className={
          "absolute left-1/2 top-1/2 z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-2 border-yellow-400 bg-background/80 text-yellow-400 shadow-lg backdrop-blur transition-opacity duration-200 " +
          (isActive ? "opacity-100" : "focus:opacity-100 md:opacity-0 md:group-hover:opacity-100")
        }
        style={btnSizeStyle}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isCurrent && onToggle) onToggle();
          else onPlay();
        }}
      >
        {isActive ? (
          <div className="relative" style={innerIconStyle}>
            {/* Equalizer */}
            <svg
              viewBox="0 0 64 64"
              className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-0"
              fill="none"
              aria-hidden
            >
              <g transform="translate(0,-10)" stroke="none" fill="currentColor">
                <rect x="18" y="38" width="4" height="10" rx="2">
                  <animate
                    attributeName="height"
                    values="6;12;8;14;6"
                    dur="1.1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y"
                    values="42;36;40;34;42"
                    dur="1.1s"
                    repeatCount="indefinite"
                  />
                </rect>
                <rect x="24" y="34" width="5" height="18" rx="2.5">
                  <animate
                    attributeName="height"
                    values="10;22;12;20;14;18;10"
                    dur="1.25s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y"
                    values="40;30;38;32;36;34;40"
                    dur="1.25s"
                    repeatCount="indefinite"
                  />
                </rect>
                <rect x="30" y="28" width="6" height="28" rx="3">
                  <animate
                    attributeName="height"
                    values="18;30;16;28;20;26;18"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y"
                    values="36;26;38;30;34;32;36"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </rect>
                <rect x="38" y="34" width="5" height="18" rx="2.5">
                  <animate
                    attributeName="height"
                    values="12;20;14;22;16;18;12"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y"
                    values="40;32;38;30;34;36;40"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                </rect>
                <rect x="44" y="38" width="4" height="10" rx="2">
                  <animate
                    attributeName="height"
                    values="6;12;8;14;6"
                    dur="1.15s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="y"
                    values="42;36;40;34;42"
                    dur="1.15s"
                    repeatCount="indefinite"
                  />
                </rect>
              </g>
            </svg>

            {/* Pause icon */}
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 m-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              fill="currentColor"
              aria-hidden
              style={innerIconStyle}
            >
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          </div>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" style={innerIconStyle}>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        <span className="sr-only" aria-hidden={!!isActive}>
          Lire {episodeName}
        </span>
        <span className="sr-only" aria-hidden={!isActive}>
          Mettre en pause
        </span>
      </button>
      {isCurrent ? (
        <span className="sr-only" role="status" aria-live="polite">
          {isActive ? "Lecture en cours" : "Lecture en pause"}
        </span>
      ) : null}
    </div>
  );
}
