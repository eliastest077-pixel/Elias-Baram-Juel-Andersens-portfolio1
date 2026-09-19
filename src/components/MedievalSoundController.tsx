import React, { useEffect, useState } from "react";
import { medievalAudio } from "../audio/medievalAudio";
import { Volume2, VolumeX, Music, BookOpen, Play, Pause } from "lucide-react";

export default function MedievalSoundController() {
  const [audioState, setAudioState] = useState(medievalAudio.getState());
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const unsubscribe = medievalAudio.subscribe(setAudioState);

    // Modern browsers require user interaction to unlock AudioContext.
    // Start chill medieval background music smoothly on first interaction!
    const unlockOnGesture = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        // Play a crisp initial page flutter to confirm audio is active
        medievalAudio.playPageTurn("flutter");
        // Start the medieval chill background music
        medievalAudio.startMusic();
      }
      window.removeEventListener("click", unlockOnGesture);
      window.removeEventListener("keydown", unlockOnGesture);
    };

    window.addEventListener("click", unlockOnGesture, { once: true });
    window.addEventListener("keydown", unlockOnGesture, { once: true });

    // Listen for book interactions forwarded from the 3D showcase iframe
    const handleWindowMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "BOOK_PAGE_TURN") {
        const action = e.data.action || "flip";
        medievalAudio.playPageTurn(action);
      }
    };
    window.addEventListener("message", handleWindowMessage);

    return () => {
      unsubscribe();
      window.removeEventListener("click", unlockOnGesture);
      window.removeEventListener("keydown", unlockOnGesture);
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [hasInteracted]);

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    medievalAudio.toggleMusic();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    medievalAudio.toggleMute();
  };

  const handleTestPageTurn = (e: React.MouseEvent) => {
    e.stopPropagation();
    medievalAudio.playPageTurn("open");
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    medievalAudio.setVolume(val);
  };

  return (
    <div
      id="medieval-sound-controller"
      className="fixed top-5 right-5 z-[99999] flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Main floating pill button */}
      <div className="flex items-center gap-1.5 bg-[#1a1712]/90 backdrop-blur-md border border-[#c3a47b]/40 rounded-full px-3 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:border-[#c3a47b]/80">
        {/* Play/Pause Music button */}
        <button
          type="button"
          id="toggle-medieval-music-btn"
          onClick={handleToggleMusic}
          className="flex items-center gap-2 text-[#c3a47b] hover:text-[#f1e6d0] text-xs font-mono tracking-wider transition-colors pr-1.5"
          title={audioState.isPlaying ? "Pause Medieval Chill Music" : "Play Medieval Chill Music"}
          aria-label={audioState.isPlaying ? "Pause Medieval Chill Music" : "Play Medieval Chill Music"}
        >
          {audioState.isPlaying ? (
            <div className="flex items-center gap-1">
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-[#c3a47b] animate-pulse rounded-full" />
                <span className="w-0.5 h-3 bg-[#c3a47b] animate-pulse rounded-full [animation-delay:150ms]" />
                <span className="w-0.5 h-1.5 bg-[#c3a47b] animate-pulse rounded-full [animation-delay:300ms]" />
              </span>
              <span className="text-[11px] font-serif uppercase tracking-widest hidden sm:inline">
                Medieval Lute
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 opacity-80">
              <Play className="w-3 h-3 fill-current text-[#c3a47b]" />
              <span className="text-[11px] font-serif uppercase tracking-widest hidden sm:inline">
                Play Lute
              </span>
            </div>
          )}
        </button>

        <span className="text-[#c3a47b]/30">|</span>

        {/* Page turn sound trigger */}
        <button
          type="button"
          id="sound-page-turn-btn"
          onClick={handleTestPageTurn}
          className="p-1 text-[#c3a47b]/80 hover:text-[#f1e6d0] hover:scale-105 transition-all"
          title="Turn Page Sound Effect"
          aria-label="Turn Page Sound Effect"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>

        {/* Volume / Mute button */}
        <button
          type="button"
          id="toggle-sound-mute-btn"
          onClick={handleToggleMute}
          className="p-1 text-[#c3a47b]/80 hover:text-[#f1e6d0] hover:scale-105 transition-all"
          title={audioState.isMuted ? "Unmute" : "Mute"}
          aria-label={audioState.isMuted ? "Unmute" : "Mute"}
        >
          {audioState.isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Expand small volume drawer button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowControls(!showControls);
          }}
          className="text-[#c3a47b]/60 hover:text-[#c3a47b] text-[10px] font-mono px-0.5"
          title="Audio Settings"
        >
          {showControls ? "▴" : "▾"}
        </button>
      </div>

      {/* Expanded drawer for volume & details */}
      {showControls && (
        <div className="mt-2 bg-[#1a1712]/95 backdrop-blur-md border border-[#c3a47b]/30 rounded-xl p-3 shadow-2xl flex flex-col gap-2 w-48 text-[11px] font-mono text-[#d4c5a9]">
          <div className="flex items-center justify-between text-[#c3a47b]">
            <span className="flex items-center gap-1.5">
              <Music className="w-3 h-3" /> Chill Atmosphere
            </span>
            <span>{Math.round((audioState.isMuted ? 0 : audioState.volume) * 100)}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={audioState.isMuted ? 0 : audioState.volume}
            onChange={handleVolumeChange}
            className="w-full accent-[#c3a47b] h-1 bg-[#332c22] rounded-lg cursor-pointer"
            aria-label="Volume level"
          />

          <div className="pt-1.5 border-t border-[#c3a47b]/20 flex items-center justify-between">
            <span className="text-[10px] text-[#a09079]">Page Flutter</span>
            <button
              type="button"
              onClick={handleTestPageTurn}
              className="text-[10px] px-2 py-0.5 border border-[#c3a47b]/40 rounded hover:bg-[#c3a47b]/20 text-[#c3a47b]"
            >
              Flip Sound
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
