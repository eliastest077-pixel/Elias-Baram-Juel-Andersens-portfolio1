import React, { useState } from "react";
import TiltedCard from "./TiltedCard";
import { ExternalLink, Sparkles, Layers } from "lucide-react";
import { medievalAudio } from "../audio/medievalAudio";

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  altText: string;
  captionText: string;
  tags: string[];
  link?: string;
}

const projects: ProjectItem[] = [
  {
    id: "operation-weserubung",
    title: "Operation Weserübung",
    subtitle: "Passport & Interactive Travel Hub",
    description:
      "Interactive digital passport issuance modal for Operation Weserübung, featuring Reisebass credentials, playful mascot interactions, and responsive 3D card perspective tilt.",
    imageSrc: "/operation_weserubung.jpg",
    altText: "Operation Weserübung Reisepass UI",
    captionText: "Operation Weserübung",
    tags: ["Travel Passport", "React Bits", "Interactive UI", "3D Tilt"]
  },
  {
    id: "f1-grand-prix",
    title: "F1 Grand Prix",
    subtitle: "3D Racing & Realtime Multiplayer",
    description:
      "High-speed 3D Formula 1 web racing experience featuring real-time multiplayer grid leaderboards, telemetry HUD, dynamic track minimap, nitro boost mechanics, and responsive camera perspectives.",
    imageSrc: "/f1_grand_prix.jpg",
    altText: "F1 Grand Prix 3D Web Game",
    captionText: "F1 Grand Prix",
    tags: ["Three.js / 3D", "Web Game", "Multiplayer Grid", "Interactive HUD"]
  },
  {
    id: "crazy-cube",
    title: "Crazy Cube Game",
    subtitle: "Arcade Survival & Stark Mono",
    description:
      "High-intensity grid survival arcade web game featuring Stark Mono aesthetics, dynamic threat avoidance, score multipliers, and reactive keyboard controls.",
    imageSrc: "/crazy_cube_game.jpg",
    altText: "Crazy Cube Arcade Game",
    captionText: "Crazy Cube Game",
    tags: ["Arcade Game", "Canvas / 2D", "Stark Mono", "Survival Mechanics"]
  },
  {
    id: "this-website",
    title: "This website",
    subtitle: "Interactive 3D Portfolio & Field Manuals",
    description:
      "A digital portfolio crafted with Three.js, React Bits, and Tailwind CSS. Features tactile 3D books, custom shaders, radial menus, vertical typography strips, and responsive card physics.",
    imageSrc: "/this_website.jpg",
    altText: "This website portfolio showcase",
    captionText: "This website",
    tags: ["Three.js", "React Bits", "Interactive 3D", "Tailwind CSS", "Portfolio"]
  }
];

export default function WorkShowcase() {
  const [activeProject, setActiveProject] = useState<ProjectItem>(projects[0]);

  return (
    <div className="work-showcase-container w-full text-[#e0d6c3] flex flex-col gap-6 py-2">
      {/* Header kicker */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#c3a47b]">
        <Layers size={14} />
        <span>Selected Works & Interactive Cards</span>
      </div>

      {/* Main interactive TiltedCard preview */}
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-[#c3a47b]/20 shadow-2xl relative overflow-hidden group">
        <div className="py-2 w-full flex justify-center items-center">
          <TiltedCard
            imageSrc={activeProject.imageSrc}
            altText={activeProject.altText}
            captionText={activeProject.captionText}
            containerHeight="320px"
            containerWidth="100%"
            imageHeight="280px"
            imageWidth="280px"
            rotateAmplitude={30}
            scaleOnHover={1.12}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <p className="tilted-card-demo-text">
                {activeProject.title}
              </p>
            }
          />
        </div>
        <p className="text-[11px] text-[#a19682] mt-2 flex items-center gap-1">
          <Sparkles size={12} className="text-[#c3a47b]" />
          Hover and tilt with cursor to test 3D perspective
        </p>
      </div>

      {/* Project selector cards */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-[#9b8d78]">
          Switch Project Showcase
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {projects.map((p) => {
            const isSelected = p.id === activeProject.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  medievalAudio.playPageTurn("flip");
                  setActiveProject(p);
                }}
                className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#c3a47b]/15 border-[#c3a47b] text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-[#d0c6b4] hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="text-xs font-semibold">{p.title}</div>
                <div className="text-[11px] text-[#a09480] line-clamp-1">
                  {p.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active project details */}
      <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
        <h4 className="text-base font-medium text-[#f2ebd9]">
          {activeProject.title}
        </h4>
        <p className="text-xs leading-relaxed text-[#b5a995]">
          {activeProject.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {activeProject.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#c3a47b]/20 text-[#e6d8c3] border border-[#c3a47b]/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
