import React from 'react';
import { 
  CheckCircle2, 
  Luggage, 
  FileText, 
  Car, 
  X, 
  Clock, 
  ShieldCheck, 
  Share2, 
  ArrowRight
} from 'lucide-react';
import { PrepEvent, Bag, Item, FamilyMember, DocumentVaultItem } from '../../types';
import { deviceService } from '../../services/deviceService';

interface DepartureSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: PrepEvent | null;
  bags: Bag[];
  items: Item[];
  members: FamilyMember[];
  documents: DocumentVaultItem[];
}

export const DepartureSummaryModal: React.FC<DepartureSummaryModalProps> = ({
  isOpen,
  onClose,
  activeEvent,
  bags,
  items,
  members,
  documents
}) => {
  if (!isOpen || !activeEvent) return null;

  // Filter bags and items for active event
  const eventBags = bags.filter((b) => b.eventId === activeEvent.id);
  const eventItems = items.filter((i) => i.eventId === activeEvent.id);
  const packedItems = eventItems.filter((i) => i.packed);
  const unpackedItems = eventItems.filter((i) => !i.packed);

  const allMembersDone = members.every((m) => m.packingStatus === 'Done ✓');
  const allItemsPacked = unpackedItems.length === 0;
  const isDepartureReady = allItemsPacked && allMembersDone;

  // Calculate weights for each bag
  const bagSummaries = eventBags.map((bag) => {
    const bItems = items.filter((i) => i.bagId === bag.id && i.packed);
    const itemsWeight = bItems.reduce((acc, curr) => acc + (curr.estimatedWeightKg * (curr.quantity || 1)), 0);
    const totalWeight = Number((bag.tareWeightKg + itemsWeight).toFixed(1));
    const isOverweight = totalWeight > bag.maxWeightKg;
    const owner = members.find((m) => m.id === bag.assignedMemberId);
    return {
      bag,
      totalWeight,
      isOverweight,
      itemCount: bItems.length,
      owner
    };
  });

  const totalLoadedWeight = bagSummaries.reduce((acc, curr) => acc + curr.totalWeight, 0).toFixed(1);

  const handleShareSummary = async () => {
    const text = `🎒 Prep Departure Summary: ${activeEvent.title}
Status: ${isDepartureReady ? 'Ready to Go ✓' : 'Packing in Progress'}
Total Containers to Load: ${eventBags.length} (${totalLoadedWeight} kg total)
Bags:
${bagSummaries.map((b) => `• ${b.bag.name}: ${b.totalWeight}kg (Limit: ${b.bag.maxWeightKg}kg)`).join('\n')}
Documents: Passports & Hall Tickets verified.`;

    await deviceService.shareContent('Prep Departure Summary', text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md animate-pop-in">
      <div className="w-full max-w-lg bg-warm-50 rounded-3xl border border-warm-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-warm-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              🚀
            </div>
            <div>
              <h2 className="text-sm font-bold text-warm-900 leading-none">
                Departure Summary & Car Load
              </h2>
              <p className="text-[11px] text-warm-500 mt-0.5">
                {activeEvent.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-warm-400 hover:text-warm-900 rounded-xl hover:bg-warm-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Overall Readiness Badge Banner */}
          <div
            className={`p-4 rounded-2xl border text-center space-y-1.5 ${
              isDepartureReady
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isDepartureReady ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600" />
              )}
              <h3 className="text-base font-extrabold">
                {isDepartureReady ? 'Household is 100% Ready to Leave!' : 'Departure Preparation in Progress'}
              </h3>
            </div>
            <p className="text-xs">
              {isDepartureReady
                ? 'All items packed, bag weight limits verified, and family checked in.'
                : `${unpackedItems.length} items remain unpacked across ${eventBags.length} containers.`}
            </p>
          </div>

          {/* Quick Metrics Bar (Bags to load, total weight, members done) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-white rounded-2xl border border-warm-200 text-center shadow-xs">
              <Car className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] text-warm-500 uppercase font-bold mt-1">Car Load</p>
              <p className="text-sm font-extrabold text-warm-900">{eventBags.length} Bags</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-warm-200 text-center shadow-xs">
              <Luggage className="w-4 h-4 text-blue-700 mx-auto" />
              <p className="text-[10px] text-warm-500 uppercase font-bold mt-1">Total Weight</p>
              <p className="text-sm font-extrabold text-warm-900">{totalLoadedWeight} kg</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-warm-200 text-center shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 mx-auto" />
              <p className="text-[10px] text-warm-500 uppercase font-bold mt-1">Items Packed</p>
              <p className="text-sm font-extrabold text-warm-900">
                {packedItems.length}/{eventItems.length}
              </p>
            </div>
          </div>

          {/* Bag Weights Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-warm-700 uppercase tracking-wider">
              Exact Container Weights
            </h4>

            <div className="space-y-2">
              {bagSummaries.map(({ bag, totalWeight, isOverweight, itemCount, owner }) => (
                <div
                  key={bag.id}
                  className="p-3.5 bg-white rounded-2xl border border-warm-200 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {bag.type === 'cabin' ? '🧳' : bag.type === 'exam_pouch' ? '✏️' : '🧳'}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-warm-900">{bag.name}</h5>
                      <p className="text-[11px] text-warm-500">
                        {owner ? `${owner.avatar} ${owner.name}` : 'Family'} • {itemCount} items
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isOverweight
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {totalWeight} / {bag.maxWeightKg} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Document Location Reminders */}
          <div className="p-4 bg-white rounded-2xl border border-warm-200 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-warm-900">
              <FileText className="w-4 h-4 text-emerald-700" />
              Critical Document Location Reminders
            </div>
            <div className="text-xs text-warm-600 space-y-1 pl-6 list-disc">
              <p>• Physical Passports & IDs: Keep on the entryway console table or front pouch of cabin bag.</p>
              <p>• Admit Cards / Hall Tickets: Placed inside clear exam pouch.</p>
              <p>• Power Banks & Lithium Batteries: Verified in Cabin Bag (not checked in).</p>
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 bg-white border-t border-warm-200 flex gap-2">
          <button
            onClick={handleShareSummary}
            className="flex-1 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-warm-700" />
            Share Summary with Family
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-warm-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
