import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Compass, 
  Luggage, 
  GraduationCap, 
  Stethoscope, 
  ShoppingBag, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  Trash2,
  Users
} from 'lucide-react';
import { PrepEvent, FamilyMember, Item, Bag } from '../../types';
import { aiService, GeneratedPlan } from '../../services/aiService';
import { deviceService } from '../../services/deviceService';

interface TodayTabProps {
  events: PrepEvent[];
  activeEvent: PrepEvent | null;
  items: Item[];
  bags: Bag[];
  members: FamilyMember[];
  onSelectEvent: (event: PrepEvent) => void;
  onUpdateMemberStatus: (memberId: string, status: 'Not Started' | 'Packing...' | 'Done ✓') => Promise<void>;
  onCreateEventFromPlan: (plan: GeneratedPlan, startDate: string, endDate?: string) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  events,
  activeEvent,
  items,
  bags,
  members,
  onSelectEvent,
  onUpdateMemberStatus,
  onCreateEventFromPlan,
  onDeleteEvent
}) => {
  const [nlInput, setNlInput] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [planStartDate, setPlanStartDate] = useState('2026-12-15');
  const [planEndDate, setPlanEndDate] = useState('2026-12-22');

  const handlePlanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlInput.trim()) return;

    setIsPlanning(true);
    setGeneratedPlan(null);

    try {
      const plan = await aiService.generateEventPlan(nlInput);
      setGeneratedPlan(plan);
      deviceService.playSuccessSound();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleQuickStart = (type: string) => {
    let prompt = '';
    switch (type) {
      case 'weekend':
        prompt = 'Weekend getaway to hill station with family from Friday to Sunday';
        break;
      case 'international':
        prompt = 'International flight to London for 10 days vacation with 23kg baggage limit';
        break;
      case 'homecoming':
        prompt = 'Trip to Delhi to meet brother and parents for winter family homecoming';
        break;
      case 'exam':
        prompt = 'Math & Science board exam finals tomorrow at 9 AM';
        break;
      case 'doctor':
        prompt = 'Doctor clinic visit for full family health checkup and fasting blood test';
        break;
      case 'shopping':
        prompt = 'Weekend mega grocery and winter essentials shopping run';
        break;
      default:
        prompt = 'Family travel event';
    }
    setNlInput(prompt);
  };

  const handleConfirmAddEvent = async () => {
    if (!generatedPlan) return;
    await onCreateEventFromPlan(generatedPlan, planStartDate, planEndDate);
    setGeneratedPlan(null);
    setNlInput('');
    deviceService.playSuccessSound();
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Conversational Planner Card */}
      <section className="bg-white rounded-3xl p-5 border border-warm-200/90 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-warm-900">Plan Something New</h2>
            <p className="text-xs text-warm-500">
              Type naturally — e.g. <em>"Delhi trip with family in Dec"</em> or <em>"Math exam tomorrow"</em>
            </p>
          </div>
        </div>

        <form onSubmit={handlePlanSubmit} className="relative">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder="Where are you going, or what are you preparing for?"
            className="w-full bg-warm-50 border border-warm-200 rounded-2xl pl-4 pr-12 py-3 text-xs text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={isPlanning || !nlInput.trim()}
            className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 disabled:opacity-40 flex items-center justify-center transition-all"
          >
            {isPlanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Routine Starters */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">
            One-Tap Routine Starters
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'homecoming', label: 'Homecoming / Delhi', icon: '✈️' },
              { id: 'exam', label: 'School Exam', icon: '📝' },
              { id: 'doctor', label: 'Doctor / Lab Checkup', icon: '🏥' },
              { id: 'weekend', label: 'Weekend Getaway', icon: '🌲' },
              { id: 'international', label: 'International Flight', icon: '🌍' },
              { id: 'shopping', label: 'Shopping Run', icon: '🛍️' }
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuickStart(q.id)}
                className="px-2.5 py-1.5 rounded-xl bg-warm-50 hover:bg-warm-100 border border-warm-200/80 text-[11px] font-medium text-warm-800 flex items-center gap-1.5 transition-colors"
              >
                <span>{q.icon}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversational AI Response Preview */}
        {generatedPlan && (
          <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 animate-pop-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 uppercase tracking-wider">
                  Tailored Plan Ready
                </span>
                <h3 className="text-sm font-bold text-warm-900 mt-1">{generatedPlan.title}</h3>
                <p className="text-xs text-warm-600">{generatedPlan.destination}</p>
              </div>
            </div>

            {/* Contextual Weather & Rules Advice */}
            <div className="p-3 bg-white rounded-xl border border-emerald-200/70 text-xs text-warm-800 leading-relaxed shadow-2xs">
              <span className="font-bold text-emerald-800">Prep Advisory: </span>
              {generatedPlan.contextualAdvice}
            </div>

            {/* Bags and items count */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-warm-200">
                <span className="text-[10px] text-warm-500 font-semibold uppercase">Containers</span>
                <p className="font-bold text-warm-900">{generatedPlan.bags.length} suggested bags</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-warm-200">
                <span className="text-[10px] text-warm-500 font-semibold uppercase">Pack Items</span>
                <p className="font-bold text-warm-900">{generatedPlan.items.length} items to pack</p>
              </div>
            </div>

            {/* Dates row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-warm-500 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={planStartDate}
                  onChange={(e) => setPlanStartDate(e.target.value)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-2 py-1 text-xs text-warm-900"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-warm-500 block mb-1">End Date</label>
                <input
                  type="date"
                  value={planEndDate}
                  onChange={(e) => setPlanEndDate(e.target.value)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-2 py-1 text-xs text-warm-900"
                />
              </div>
            </div>

            <button
              onClick={handleConfirmAddEvent}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              Add This Event to Prep
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 2. Live Family Readiness Strip */}
      <section className="bg-white rounded-3xl p-5 border border-warm-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-warm-900">Live Family Readiness</h3>
          </div>
          <span className="text-[11px] text-warm-500">Tap status to cycle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {members.map((m) => {
            const isDone = m.packingStatus === 'Done ✓';
            const isPacking = m.packingStatus === 'Packing...';

            const cycleStatus = () => {
              if (m.packingStatus === 'Not Started') {
                onUpdateMemberStatus(m.id, 'Packing...');
              } else if (m.packingStatus === 'Packing...') {
                onUpdateMemberStatus(m.id, 'Done ✓');
                deviceService.playSuccessSound();
              } else {
                onUpdateMemberStatus(m.id, 'Not Started');
              }
            };

            return (
              <div
                key={m.id}
                onClick={cycleStatus}
                className="p-3 rounded-2xl border border-warm-200/90 bg-warm-50 hover:bg-warm-100/70 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{m.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-warm-900">{m.name}</p>
                      {m.isCurrentUser && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-warm-500">{m.role}</p>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isPacking
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-warm-200 text-warm-700'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3 h-3" />}
                  {isPacking && <Clock className="w-3 h-3" />}
                  <span>{m.packingStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Active Events Feed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-warm-900">Upcoming Family Events</h3>
          <span className="text-xs text-warm-500">{events.length} active</span>
        </div>

        <div className="space-y-3">
          {events.map((evt) => {
            const isSelected = activeEvent?.id === evt.id;
            const eventItems = items.filter((i) => i.eventId === evt.id);
            const packedCount = eventItems.filter((i) => i.packed).length;
            const totalCount = eventItems.length;
            const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
            const eventBags = bags.filter((b) => b.eventId === evt.id);

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-white border-warm-200 hover:border-warm-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-1 bg-warm-50 rounded-2xl border border-warm-200/80">
                      {evt.icon || '📌'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-warm-900">{evt.title}</h4>
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-warm-500 mt-0.5">
                        {evt.destination || 'Family Event'} • {evt.startDate}
                      </p>
                      {evt.notes && (
                        <p className="text-[11px] text-warm-600 mt-1 italic line-clamp-1">
                          "{evt.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {events.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove event "${evt.title}"?`)) {
                          onDeleteEvent(evt.id);
                        }
                      }}
                      className="text-warm-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warm-600 font-medium">
                      {eventBags.length} containers • {packedCount} of {totalCount} items packed
                    </span>
                    <span className="font-bold text-emerald-800">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-warm-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
