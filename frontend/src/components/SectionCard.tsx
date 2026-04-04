'use client';

import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={`section-fade-in rounded-lg border border-border bg-card shadow-sm ${className}`}>
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          {icon}
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};
