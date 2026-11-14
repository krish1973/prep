import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  CircleDashed, 
  Calendar, 
  Plus, 
  ExternalLink, 
  Key, 
  HelpCircle,
  Plane
} from 'lucide-react';
import { FamilyMember, PrepEvent } from '../types';

interface HeaderProps {
  events: PrepEvent[];
  activeEvent: PrepEvent | null;
  onSelectEvent: (event: PrepEvent) => void;
  onOpenNewEventModal: () => void;
  members: FamilyMember[];
  onOpenExitSummary: () => void;
  onOpenSettings: () => void;
  onReplayOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onOpenNewEventModal,
  members,
  onOpenExitSummary,
  onOpenSettings,
  onReplayOnboarding
}) => {
  return (
    <header className="sticky top-0 z-30 bg-warm-50/90 backdrop-blur-md border-b border-warm-200/80 px-4 pt-3 pb-2.5 safe-top">
      <div className="max-w-2xl mx-auto space-y-2.5">
        {/* Top row: Brand + Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-warm-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-warm-900 leading-none">
                  Prep
                </h1>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Family PWA
                </span>
              </div>
              <p className="text-[11px] text-warm-500 font-medium leading-tight">
                Calm Readiness & Packing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Departure Summary / Exit View trigger button */}
            <button
              onClick={onOpenExitSummary}
              className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
              title="Departure Summary & Bag Weights"
            >
              <Plane className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Departure</span> Summary
            </button>

            {/* AI API Config */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-warm-500 hover:text-warm-900 hover:bg-warm-200/60 rounded-xl transition-colors"
              title="Settings & AI API Key"
            >
              <Key className="w-4 h-4" />
            </button>

            {/* Help / Walkthrough */}
            <button
              onClick={onReplayOnboarding}
              className="p-1.5 text-warm-500 hover:text-warm-900 hover:bg-warm-200/60 rounded-xl transition-colors"
              title="Replay Onboarding Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second row: Active Event Switcher & Family Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {/* Event Picker */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="flex items-center gap-1.5 bg-white border border-warm-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <select
                value={activeEvent?.id || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onOpenNewEventModal();
                  } else {
                    const found = events.find((ev) => ev.id === e.target.value);
                    if (found) onSelectEvent(found);
                  }
                }}
                className="w-full text-xs font-bold text-warm-900 bg-transparent focus:outline-none cursor-pointer truncate"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.icon || '📌'} {ev.title} ({ev.startDate})
                  </option>
                ))}
                <option value="__new__">+ Plan Something New...</option>
              </select>
            </div>
          </div>

          {/* Quick family readiness strip */}
          <div className="flex items-center gap-1.5 bg-white/90 border border-warm-200 rounded-xl px-2.5 py-1 shadow-xs">
            <span className="text-[10px] font-bold text-warm-500 uppercase tracking-wider hidden xs:inline">
              Family:
            </span>
            <div className="flex items-center gap-1.5">
              {members.map((m) => {
                const isDone = m.packingStatus === 'Done ✓';
                const isPacking = m.packingStatus === 'Packing...';
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-lg bg-warm-50 border border-warm-200"
                    title={`${m.name}: ${m.packingStatus}`}
                  >
                    <span>{m.avatar}</span>
                    <span className="text-warm-800">{m.name}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : isPacking ? (
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                    ) : (
                      <CircleDashed className="w-3 h-3 text-warm-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
