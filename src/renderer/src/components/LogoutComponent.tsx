'use client';

import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface LogoutIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LogoutIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const LogoutIcon = forwardRef<LogoutIconHandle, LogoutIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useImperativeHandle(ref, () => ({
      startAnimation: () => {
        if (svgRef.current) {
          svgRef.current.classList.add('logout-animate');
        }
      },
      stopAnimation: () => {
        if (svgRef.current) {
          svgRef.current.classList.remove('logout-animate');
        }
      },
    }));

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (svgRef.current) {
          svgRef.current.classList.add('logout-animate');
        }
        onMouseEnter?.(e);
      },
      [onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (svgRef.current) {
          svgRef.current.classList.remove('logout-animate');
        }
        onMouseLeave?.(e);
      },
      [onMouseLeave]
    );

    return (
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline
            points="16 17 21 12 16 7"
            className="logout-arrow"
          />
          <line
            x1="21"
            x2="9"
            y1="12"
            y2="12"
            className="logout-arrow"
          />
        </svg>
      </div>
    );
  }
);

LogoutIcon.displayName = 'LogoutIcon';

export { LogoutIcon };
