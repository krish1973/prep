import React from 'react';
import { Calendar, Luggage, Search, ShieldCheck } from 'lucide-react';

export type ActiveTab = 'today' | 'pack' | 'find' | 'docs';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unpackedCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unpackedCount
}) => {
  const tabs = [
    { id: 'today' as ActiveTab, label: 'Today', icon: Calendar },
    { id: 'pack' as ActiveTab, label: 'Pack & Bags', icon: Luggage, badge: unpackedCount > 0 ? unpackedCount : undefined },
    { id: 'find' as ActiveTab, label: 'Find Item', icon: Search },
    { id: 'docs' as ActiveTab, label: 'Docs & Home', icon: ShieldCheck }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-warm-50/95 backdrop-blur-lg border-t border-warm-200/80 safe-bottom">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-warm-500 hover:text-warm-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-emerald-700 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-warm-50">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
