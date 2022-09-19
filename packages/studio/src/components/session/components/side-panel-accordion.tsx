import React, { useState } from 'react';

import { useChartingThemeContext } from '../../charting/charting-theme-context';

export function Accordion({
  children,
  title,
  className
}: {
  children: any;
  title: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const { theme } = useChartingThemeContext();

  const chevronDown = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  const chevronUp = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div
      className={`${
        expanded ? 'flex-1' : ''
      } overflow-y-auto flex flex-col w-96 text-xs font-mono border-zinc-700 border-b`}
    >
      <div
        className="p-3 pb-2 flex opacity-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="grow">{title.toUpperCase()}</div>
        <div>{expanded ? chevronDown : chevronUp}</div>
      </div>
      {expanded && (
        <div
          className="border-zinc-700 border-t overflow-y-scroll grow"
          style={{
            background: `linear-gradient(${theme.backgroundTopColor}, ${theme.backgroundBottomColor})`
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
