import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Menu, User, Briefcase, Mail } from "lucide-react";
import { medievalAudio } from "../audio/medievalAudio";
import "./RadialMenu.css";

export default function RadialMenu() {
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isOpenRef = useRef(false);

  const buildTimeline = () => {
    if (tlRef.current) {
      tlRef.current.kill();
    }

    const items = gsap.utils.toArray<HTMLElement>(".fab-item");
    if (!items || items.length === 0) return;

    gsap.set(items, { x: 0, y: 0, scale: 0, opacity: 0 });

    const radius = window.innerWidth <= 640 ? 95 : 120;
    const startAngle = 180;
    const endAngle = 270;
    const angleStep = (endAngle - startAngle) / (items.length - 1);

    const tl = gsap.timeline({ paused: true });

    items.forEach((item, i) => {
      const angle = (startAngle + angleStep * i) * (Math.PI / 180);
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;

      tl.to(
        item,
        {
          x: tx,
          y: ty,
          scale: 1,
          opacity: 1,
          duration: 0.55,
          ease: "elastic.out(1, 0.5)"
        },
        i * 0.05
      );
    });

    tl.to(
      "#fabBtn svg",
      {
        rotation: 90,
        duration: 0.3,
        ease: "back.out(1.7)"
      },
      0
    );

    tlRef.current = tl;
    isOpenRef.current = false;
    const btn = document.querySelector("#fabBtn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  };

  useEffect(() => {
    buildTimeline();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenRef.current) {
        toggleMenu();
      }
    };

    const handleResize = () => {
      if (!isOpenRef.current) {
        buildTimeline();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (tlRef.current) tlRef.current.kill();
    };
  }, []);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    medievalAudio.playPageTurn("flutter");
    const fabBtn = document.querySelector("#fabBtn");

    if (isOpenRef.current) {
      tl.timeScale(1.4).reverse();
      if (fabBtn) fabBtn.setAttribute("aria-expanded", "false");
      isOpenRef.current = false;
    } else {
      tl.timeScale(1).play();
      if (fabBtn) fabBtn.setAttribute("aria-expanded", "true");
      isOpenRef.current = true;
    }
  };

  const handleItemClick = (bookKey?: string, isShare?: boolean) => {
    medievalAudio.playPageTurn("open");
    if (bookKey) {
      try {
        const iframe = document.querySelector<HTMLIFrameElement>("iframe");
        if (iframe) {
          // 1. PostMessage (reliable cross-frame communication)
          iframe.contentWindow?.postMessage({ type: "SELECT_BOOK", book: bookKey }, "*");

          // 2. Direct function call if available
          const iframeWin = iframe.contentWindow as any;
          if (iframeWin && typeof iframeWin.selectBookByName === "function") {
            iframeWin.selectBookByName(bookKey);
            return;
          }

          // 3. Fallback to DOM element click
          if (iframe.contentDocument) {
            const card = iframe.contentDocument.querySelector<HTMLElement>(
              `.book-card[data-book="${bookKey}"]`
            );
            if (card) {
              card.click();
            }
          }
        }
      } catch {
        // ignore cross-origin error if any
      }
    } else if (isShare) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  return (
    <div className="fab-wrap" id="fabWrap">
      <button
        type="button"
        className="fab-item"
        aria-label="About"
        title="About"
        onClick={() => handleItemClick("claude")}
      >
        <User size={19} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="fab-item"
        aria-label="Work"
        title="Work"
        onClick={() => handleItemClick("cursor")}
      >
        <Briefcase size={19} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="fab-item"
        aria-label="Contact"
        title="Contact"
        onClick={() => handleItemClick("codex")}
      >
        <Mail size={19} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="fab"
        id="fabBtn"
        aria-label="Toggle actions menu"
        aria-expanded="false"
        onClick={toggleMenu}
        style={{ backgroundColor: "#C4A482" }}
      >
        <Menu size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}
