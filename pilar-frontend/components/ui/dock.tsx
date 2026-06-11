'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type DockProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export const Dock = forwardRef<HTMLDivElement, DockProps>(({ children, style, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 10px',
      borderRadius: '999px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
      backdropFilter: 'blur(26px) saturate(200%)',
      WebkitBackdropFilter: 'blur(26px) saturate(200%)',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.55), ' +
        'inset 0 -1px 0 rgba(255,255,255,0.08), ' +
        '0 12px 40px rgba(0,0,0,0.10)',
      ...style,
    }}
  >
    {children}
  </div>
));
Dock.displayName = 'Dock';

type DockIconProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  label?: string;
};

export const DockIcon = forwardRef<HTMLDivElement, DockIconProps>(
  ({ children, label, style, onMouseEnter, onMouseLeave, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      onMouseEnter={e => {
        const el = e.currentTarget;
        const icon = el.querySelector('[data-dock-icon]') as HTMLElement | null;
        if (icon) icon.style.transform = 'translateY(-6px) scale(1.22)';
        const tip = el.querySelector('[data-dock-tip]') as HTMLElement | null;
        if (tip) { tip.style.opacity = '1'; tip.style.transform = 'translateX(-50%) translateY(0)'; }
        onMouseEnter?.(e);
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        const icon = el.querySelector('[data-dock-icon]') as HTMLElement | null;
        if (icon) icon.style.transform = 'translateY(0) scale(1)';
        const tip = el.querySelector('[data-dock-tip]') as HTMLElement | null;
        if (tip) { tip.style.opacity = '0'; tip.style.transform = 'translateX(-50%) translateY(4px)'; }
        onMouseLeave?.(e);
      }}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        ...style,
      }}
    >
      <div
        data-dock-icon
        style={{
          width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: '#0c4a6e',
          transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        {children}
      </div>
      {label && (
        <span
          data-dock-tip
          style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
            transform: 'translateX(-50%) translateY(4px)',
            padding: '4px 10px', fontSize: '11px', fontWeight: 500,
            color: '#0c4a6e', whiteSpace: 'nowrap',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px', opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  ),
);
DockIcon.displayName = 'DockIcon';
