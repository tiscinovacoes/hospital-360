'use client';

import React from 'react';
import Link from 'next/link';
import { UserRole } from '../contexts/UserContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme, roleThemes } from '../contexts/ThemeContext';
import {
  Lock,
  ArrowUpRight,
  Bell,
  AlertCircle,
} from 'lucide-react';

type LucideIcon = React.ComponentType<{ size?: string | number; className?: string; [key: string]: unknown }>;

interface ProfileCardProps {
  role: UserRole;
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badgeLabel?: string;
}

export function ProfileCard({
  role,
  href,
  icon: Icon,
  title,
  description,
  badgeLabel,
}: ProfileCardProps) {
  const { hasAccess } = useUser();
  const { counts, getUrgentCount } = useNotifications();
  const { setActiveRole } = useTheme();

  const isAllowed = hasAccess(role);
  const theme = roleThemes[role];
  const totalCount = counts[role] || 0;
  const urgentCount = getUrgentCount(role);

  const handleClick = (e: React.MouseEvent) => {
    if (!isAllowed) {
      e.preventDefault();
      return;
    }
    setActiveRole(role);
  };

  return (
    <Link
      href={isAllowed ? href : '#'}
      onClick={handleClick}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 text-left bg-white ${
        isAllowed
          ? 'hover:-translate-y-1 hover:shadow-xl hover:border-transparent cursor-pointer'
          : 'opacity-50 grayscale hover:grayscale-0 cursor-not-allowed border-[#E5E7EB] bg-[#F9FAFB]'
      }`}
      style={{
        borderColor: isAllowed ? '#E5E7EB' : undefined,
      }}
    >
      {/* Top row: Icon & Status / Badges */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              backgroundColor: isAllowed ? theme.lightColor : '#F3F4F6',
              color: isAllowed ? theme.primaryColor : '#9CA3AF',
            }}
          >
            <Icon className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {!isAllowed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7280] border border-[#D1D5DB]">
                <Lock className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {badgeLabel && (
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                    }}
                  >
                    {badgeLabel}
                  </span>
                )}
                {totalCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF0FB] text-[#1A56DB] border border-[#BFDBFE]">
                    <Bell className="w-3 h-3" />
                    <span>{totalCount}</span>
                  </span>
                )}
                {urgentCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FDE8E8] text-[#C81E1E] border border-[#FCA5A5] animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span>{urgentCount} urg.</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3
          className="text-lg font-bold text-[#111928] group-hover:text-[#1A56DB] transition-colors mb-1.5 flex items-center gap-1.5"
          style={{
            color: isAllowed ? undefined : '#4B5563',
          }}
        >
          <span>{title}</span>
          {isAllowed && (
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#1A56DB]" />
          )}
        </h3>
        <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Bottom Bar: Access Action */}
      <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs font-medium">
        <span className="text-[#6B7280]">
          {isAllowed ? 'Acessar módulo' : 'Sem permissão no perfil atual'}
        </span>
        <span
          className="font-bold flex items-center gap-1 transition-colors"
          style={{
            color: isAllowed ? theme.primaryColor : '#9CA3AF',
          }}
        >
          {isAllowed ? 'Entrar →' : 'Restrito'}
        </span>
      </div>
    </Link>
  );
}
