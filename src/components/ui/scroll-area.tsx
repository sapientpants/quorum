"use client";

import * as React from "react";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly className?: string;
  readonly children: React.ReactNode;
}

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div className={`relative overflow-auto ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}
