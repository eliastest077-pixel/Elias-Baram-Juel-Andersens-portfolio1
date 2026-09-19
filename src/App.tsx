import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { BestsellersBookShowcase } from "@designcodeio/threeui/components/BestsellersBookShowcase";
import RadialMenu from "./components/RadialMenu";
import VerticalSideStrips from "./components/VerticalSideStrips";
import WorkShowcase from "./components/WorkShowcase";
import MedievalSoundController from "./components/MedievalSoundController";
import WaxStampOverlay from "./components/WaxStampOverlay";
import "@designcodeio/threeui/style.css";

export function WorkPage() {
  return (
    <div className="min-h-screen bg-[#1a1712] text-[#f2ebd9] flex flex-col items-center justify-center p-6 relative">
      <Link
        to="/"
        className="absolute top-6 left-6 text-xs text-[#c3a47b] border border-[#c3a47b]/40 px-3 py-1.5 rounded-full hover:bg-[#c3a47b]/20 transition-all font-mono"
      >
        ← Back to Portfolio
      </Link>
      <div className="w-full max-w-lg mt-10">
        <WorkShowcase />
      </div>
    </div>
  );
}

export function Scene() {

  useEffect(() => {
    const originalTitle = "Elias Baram Juel Andersen's portfolio";
    const awayTitle = "Coffee☕?";

    document.title = originalTitle;

    const handleBlur = () => {
      document.title = awayTitle;
    };

    const handleFocus = () => {
      document.title = originalTitle;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = awayTitle;
      } else {
        document.title = originalTitle;
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="shader-frame" id="shader-frame" style={{ position: "relative", width: "100%", height: "100%" }}>
      <VerticalSideStrips />
      <RadialMenu />
      <BestsellersBookShowcase
        headingFont="iowan-old-style"
        bodyFont="instrument-serif"
        headingWeight="500"
        bodyWeight="400"
        primaryColor="#c3a47b"
        headingSize={408}
        bodySize={15}
        headingLetterSpacing={-0.085}
      />
    </div>
  );
}

export default function App() {
  return (
    <>
      <WaxStampOverlay />
      <MedievalSoundController />
      <Routes>
        <Route path="/work" element={<WorkPage />} />
        <Route path="*" element={<Scene />} />
      </Routes>
    </>
  );
}


