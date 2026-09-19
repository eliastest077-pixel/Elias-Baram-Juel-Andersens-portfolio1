import React from 'react';
import TextLoop from './TextLoop';
import './VerticalSideStrips.css';

export interface VerticalSideStripsProps {
  text?: string;
  speed?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number | string;
  separator?: string;
}

export default function VerticalSideStrips({
  text = '13 year old web dev',
  speed = 45,
  color = '#C4A482',
  fontSize = 64,
  fontWeight = 700,
  separator = '✦',
}: VerticalSideStripsProps) {
  return (
    <>
      {/* Left side strip: text runs vertically along left margin */}
      <aside
        className="vertical-side-strip vertical-side-strip-left"
        aria-label="Left margin loop"
      >
        <div className="vertical-strip-rotator-left">
          <TextLoop
            text={text}
            shape="line"
            speed={speed}
            direction="forward"
            separator={separator}
            curviness={90}
            fontSize={fontSize}
            fontWeight={fontWeight}
            letterSpacing={3}
            uppercase={true}
            color={color}
            ribbon={false}
            pauseOnHover
          />
        </div>
      </aside>

      {/* Right side strip: text runs vertically along right margin */}
      <aside
        className="vertical-side-strip vertical-side-strip-right"
        aria-label="Right margin loop"
      >
        <div className="vertical-strip-rotator-right">
          <TextLoop
            text={text}
            shape="line"
            speed={speed}
            direction="reverse"
            separator={separator}
            curviness={90}
            fontSize={fontSize}
            fontWeight={fontWeight}
            letterSpacing={3}
            uppercase={true}
            color={color}
            ribbon={false}
            pauseOnHover
          />
        </div>
      </aside>
    </>
  );
}
