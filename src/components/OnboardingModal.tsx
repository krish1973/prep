import React, { useState } from 'react';
import { 
  Sparkles, 
  Luggage, 
  GraduationCap, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Users, 
  Plus, 
  Trash2, 
  QrCode,
  Lock,
  RotateCcw
} from 'lucide-react';
import { FamilyMember } from '../types';
import { deviceService } from '../services/deviceService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
  onRemoveMember: (id: string) => Promise<void>;
  onClearSampleData: () => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  members,
  onAddMember,
  onRemoveMember,
  onClearSampleData
}) => {
  const [step, setStep] = useState(1);

  // Step 3 Interactive Sandbox state
  const [sandboxPacked, setSandboxPacked] = useState(false);
  const [sandboxAnimating, setSandboxAnimating] = useState(false);

  // Step 5 Household setup form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Parent' | 'Child' | 'Family'>('Family');
  const [newMemberAvatar, setNewMemberAvatar] = useState('🧑');
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handleSandboxToggle = () => {
    setSandboxAnimating(true);
    if (!sandboxPacked) {
      deviceService.playPackSound();
      setTimeout(() => {
        setSandboxPacked(true);
        setSandboxAnimating(false);
      }, 350);
    } else {
      deviceService.playUnpackSound();
      setTimeout(() => {
        setSandboxPacked(false);
        setSandboxAnimating(false);
      }, 300);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    await onAddMember({
      name: newMemberName.trim(),
      role: newMemberRole,
      avatar: newMemberAvatar,
      color: '#047857',
      isCurrentUser: false,
      packingStatus: 'Not Started'
    });
    setNewMemberName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-lg bg-warm-50 rounded-3xl border border-warm-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Progress indicator */}
        <div className="px-6 pt-5 pb-3 border-b border-warm-200/80 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              {step}/6
            </span>
            <span className="text-xs font-semibold text-warm-600 uppercase tracking-wider">
              {step === 1 && 'Welcome'}
              {step === 2 && 'Everyday & Travel'}
              {step === 3 && 'Try Packing'}
              {step === 4 && 'Peace-of-Mind'}
              {step === 5 && 'Household'}
              {step === 6 && 'Ready to Go'}
            </span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-emerald-600' : i < step ? 'w-2 bg-emerald-300' : 'w-2 bg-warm-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Warm Welcome */}
          {step === 1 && (
            <div className="space-y-4 text-center py-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-3xl shadow-sm">
                🎒
              </div>
              <h2 className="text-2xl font-bold text-warm-900 tracking-tight">
                Welcome to Prep
              </h2>
              <p className="text-warm-700 text-sm leading-relaxed max-w-sm mx-auto">
                Your calm, warm family companion for trips, exams, doctor visits, and weekend runs.
              </p>
              <div className="bg-white rounded-2xl p-4 border border-warm-200/90 text-left space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-warm-800 leading-snug">
                    <strong>Never leave anything behind:</strong> Adaptive virtual containers from checked suitcases to transparent exam pouches.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-warm-800 leading-snug">
                    <strong>Family synchronization:</strong> Keep everyone coordinated without nagging or duplicate items.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-warm-800 leading-snug">
                    <strong>Privacy-first:</strong> All your family documents, passports, and checklists stay offline on your device first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Scenarios */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-warm-900">Built for Every Moment</h3>
                <p className="text-xs text-warm-600 mt-1">
                  Prep shifts its rules and containers to fit what you're doing.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-warm-200 flex items-center gap-3.5 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl shrink-0">
                    <Luggage className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-warm-900">Vacations & Homecoming</h4>
                    <p className="text-xs text-warm-600 mt-0.5">
                      Airline luggage limits, lithium battery safety warnings, and spare weight for return gifts.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-warm-200 flex items-center gap-3.5 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl shrink-0">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-warm-900">School Exams & Sports</h4>
                    <p className="text-xs text-warm-600 mt-0.5">
                      Clear exam pouch requirements, admit cards, blue ballpoints, and zero smartwatches allowed.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-warm-200 flex items-center gap-3.5 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center text-2xl shrink-0">
                    <Stethoscope className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-warm-900">Doctor Visits & Errands</h4>
                    <p className="text-xs text-warm-600 mt-0.5">
                      Prescription folios, fasting test countdowns, ID cards, and reusable shopping totes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Interactive "Try Packing" Sandbox */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-warm-900">Try Packing an Item</h3>
                <p className="text-xs text-warm-600 mt-1">
                  Tap the winter jacket below to pack it into the virtual trolley.
                </p>
              </div>

              {/* Virtual Bag Container representation */}
              <div className="bg-white rounded-2xl p-4 border border-warm-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                      🧳
                    </div>
                    <div>
                      <p className="text-xs font-bold text-warm-900">Checked Family Trolley</p>
                      <p className="text-[11px] text-warm-500">Max limit: 23.0 kg (Tare: 3.8 kg)</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    sandboxPacked ? 'bg-emerald-100 text-emerald-800' : 'bg-warm-100 text-warm-700'
                  }`}>
                    {sandboxPacked ? '5.2 / 23.0 kg' : '3.8 / 23.0 kg'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-warm-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                    style={{ width: sandboxPacked ? '22%' : '16%' }}
                  />
                </div>
              </div>

              {/* Tap-to-pack Item Sandbox */}
              <div className="py-2">
                <div 
                  onClick={handleSandboxToggle}
                  className={`p-3.5 bg-white rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    sandboxPacked 
                      ? 'border-emerald-300 bg-emerald-50/50 shadow-xs' 
                      : 'border-warm-200 hover:border-emerald-400 hover:shadow-md'
                  } ${sandboxAnimating ? (sandboxPacked ? 'animate-unpack-lift' : 'animate-pack-drop') : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧥</span>
                    <div>
                      <p className="text-sm font-bold text-warm-900">Merino Wool Winter Jacket</p>
                      <p className="text-xs text-warm-500">Estimated weight: 1.4 kg</p>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    sandboxPacked 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-warm-100 text-warm-800 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}>
                    {sandboxPacked ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Packed in Trolley
                      </>
                    ) : (
                      <>
                        <Luggage className="w-3.5 h-3.5" />
                        Tap to Pack
                      </>
                    )}
                  </div>
                </div>
                <p className="text-center text-[11px] text-warm-500 mt-2">
                  {sandboxPacked 
                    ? "✓ Great! It's packed. Tap again anytime to unpack." 
                    : "Tap the card above to watch it pack into the trolley with audio feedback."}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Peace of Mind Safeguards */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-warm-900">Peace-of-Mind Safeguards</h3>
                <p className="text-xs text-warm-600 mt-1">
                  Three layers of protection so nothing is ever forgotten.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-2xl border border-warm-200 shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-warm-900">Before Leaving Home Check</h4>
                    <p className="text-[11px] text-warm-600 mt-0.5 leading-relaxed">
                      Water heaters off, gas valve locked, passports on the entryway console. Synced live across parents with check attribution.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-warm-200 shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-warm-900">Hotel Checkout "Return Audit"</h4>
                    <p className="text-[11px] text-warm-600 mt-0.5 leading-relaxed">
                      On the final day, Prep reverses your checklist so chargers left in wall outlets, washbags, and kids' favorite toys never stay behind.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-warm-200 shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 shrink-0 mt-0.5">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-warm-900">Offline Encrypted Document Vault</h4>
                    <p className="text-[11px] text-warm-600 mt-0.5 leading-relaxed">
                      Passports, flight tickets, and hall tickets stay stored in IndexedDB locally on your phone first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Household Setup */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-warm-900">Your Family Household</h3>
                <p className="text-xs text-warm-600 mt-1">
                  Assign bags, track who packed what, and share with family.
                </p>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-2xl border border-warm-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-warm-900">{m.name}</p>
                          {m.isCurrentUser && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-warm-500">{m.role}</p>
                      </div>
                    </div>

                    {!m.isCurrentUser && members.length > 1 && (
                      <button 
                        onClick={() => onRemoveMember(m.id)}
                        className="text-warm-400 hover:text-rose-600 p-1 rounded-lg"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add member form */}
              <form onSubmit={handleAddMemberSubmit} className="bg-white p-3.5 rounded-2xl border border-warm-200/90 space-y-2.5">
                <p className="text-xs font-bold text-warm-800">Add Another Family Member</p>
                <div className="flex gap-2">
                  <select 
                    value={newMemberAvatar} 
                    onChange={(e) => setNewMemberAvatar(e.target.value)}
                    className="bg-warm-50 border border-warm-200 rounded-xl px-2 py-1.5 text-lg"
                  >
                    <option value="👩‍🦰">👩‍🦰</option>
                    <option value="👨‍🦳">👨‍🦳</option>
                    <option value="👧">👧</option>
                    <option value="👶">👶</option>
                    <option value="🧑">🧑</option>
                    <option value="👵">👵</option>
                  </select>

                  <input 
                    type="text" 
                    placeholder="Member Name (e.g. Diya)"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="flex-1 bg-warm-50 border border-warm-200 rounded-xl px-3 py-1.5 text-xs text-warm-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="bg-warm-50 border border-warm-200 rounded-xl px-2.5 py-1.5 text-xs text-warm-800"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Family">Family</option>
                  </select>

                  <button 
                    type="submit"
                    className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-800 shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </form>

              {/* Family Invite Link / QR */}
              <div className="pt-1">
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="w-full py-2 bg-warm-100 hover:bg-warm-200/80 rounded-xl text-xs font-semibold text-warm-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-warm-700" />
                  {showQR ? 'Hide Family Invite QR' : 'Share Family Invite Link / QR Code'}
                </button>
                {showQR && (
                  <div className="mt-3 p-4 bg-white rounded-2xl border border-warm-200 text-center space-y-2">
                    <div className="w-32 h-32 mx-auto bg-stone-900 p-2 rounded-xl flex items-center justify-center text-white text-xs">
                      [QR: prep.family/join/{members[0]?.id || 'krish'}]
                    </div>
                    <p className="text-xs text-warm-600">Family members can scan to join this household sync instantly.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: Ready Transition */}
          {step === 6 && (
            <div className="space-y-4 text-center py-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-3xl shadow-sm">
                🎉
              </div>
              <h3 className="text-2xl font-bold text-warm-900">You're All Set!</h3>
              <p className="text-warm-700 text-xs leading-relaxed max-w-sm mx-auto">
                We've preloaded realistic sample events (Delhi Winter Homecoming, Aarav's Math Finals, and Family Health Checkup) so you can explore all features right away.
              </p>

              <div className="bg-white rounded-2xl p-4 border border-warm-200 text-left space-y-2 text-xs text-warm-800 shadow-xs">
                <p className="font-semibold text-warm-900">What you can try now:</p>
                <ul className="list-disc list-inside space-y-1 text-warm-600">
                  <li>Plan something new with natural language in <strong>Today</strong></li>
                  <li>Use the <strong>Camera Scanner</strong> to check airline liquid rules in <strong>Pack & Bags</strong></li>
                  <li>Find any misplaced item across all bags in <strong>Find Item</strong></li>
                  <li>Review 6-month passport alerts in <strong>Docs & Home</strong></li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    await onClearSampleData();
                    onComplete();
                  }}
                  className="text-xs text-warm-500 hover:text-rose-600 underline font-medium transition-colors"
                >
                  Clear sample data and start completely empty
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-white border-t border-warm-200/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-xl transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-warm-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 flex items-center gap-1.5 shadow-sm transition-all"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                deviceService.playSuccessSound();
                onComplete();
              }}
              className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all"
            >
              Start Exploring Prep
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
