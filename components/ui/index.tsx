'use client';

import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args: Parameters<typeof clsx>) {
  return twMerge(clsx(...args));
}

// ─── Button ────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, leftIcon, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ov-bg disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-ov-green text-ov-bg hover:bg-ov-green-dim focus:ring-ov-green shadow-green-glow',
    secondary: 'bg-ov-elevated border border-ov-border text-ov-text hover:border-ov-border-bright hover:bg-ov-card focus:ring-ov-border-bright',
    ghost: 'text-ov-muted hover:text-ov-text hover:bg-ov-elevated focus:ring-ov-border',
    danger: 'bg-ov-red/10 border border-ov-red/30 text-ov-red hover:bg-ov-red/20 focus:ring-ov-red',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
    </button>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-ov-card border border-ov-border rounded-2xl shadow-card',
        hover && 'transition-all duration-200 hover:border-ov-border-bright hover:shadow-card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'purple' | 'cyan' | 'amber' | 'red' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    green: 'bg-ov-green/10 text-ov-green border-ov-green/20',
    purple: 'bg-ov-purple/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-ov-cyan/10 text-ov-cyan border-ov-cyan/20',
    amber: 'bg-ov-amber/10 text-ov-amber border-ov-amber/20',
    red: 'bg-ov-red/10 text-ov-red border-ov-red/20',
    neutral: 'bg-ov-elevated text-ov-muted border-ov-border',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <svg className={cn('animate-spin text-ov-green', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── ProgressBar ───────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  colorClass?: string;
}

export function ProgressBar({ value, max = 100, label, colorClass = 'bg-ov-green' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-ov-muted">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-ov-elevated rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-ov-border', className)} />;
}

// ─── Tooltip ───────────────────────────────────────────────────────────────

export function ConfidenceDot({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-ov-green' : score >= 50 ? 'bg-ov-amber' : 'bg-ov-red';
  const label = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full', color)} />
      <span className="text-xs text-ov-muted">{label} confidence</span>
    </span>
  );
}
