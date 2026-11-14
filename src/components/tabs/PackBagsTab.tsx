import React, { useState, useRef } from 'react';
import { 
  Luggage, 
  Camera, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft, 
  Check, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  Scale, 
  X,
  Layers,
  Upload
} from 'lucide-react';
import { Bag, Item, FamilyMember, PrepEvent } from '../../types';
import { deviceService } from '../../services/deviceService';
import { aiService, ScannedItemResult } from '../../services/aiService';

interface PackBagsTabProps {
  activeEvent: PrepEvent | null;
  bags: Bag[];
  items: Item[];
  members: FamilyMember[];
  onTogglePackItem: (item: Item, targetBagId?: string) => Promise<void>;
  onAddItem: (newItem: Omit<Item, 'id'>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onAddBag: (newBag: Omit<Bag, 'id'>) => Promise<void>;
  onRebalanceItem: (itemId: string, targetBagId: string) => Promise<void>;
  onMarkUserDone: () => Promise<void>;
}

export const PackBagsTab: React.FC<PackBagsTabProps> = ({
  activeEvent,
  bags,
  items,
  members,
  onTogglePackItem,
  onAddItem,
  onDeleteItem,
  onAddBag,
  onRebalanceItem,
  onMarkUserDone
}) => {
  const currentMember = members.find((m) => m.isCurrentUser) || members[0];
  const [selectedBagId, setSelectedBagId] = useState<string>(bags[0]?.id || '');

  // Animate state map for tactile drops/lifts
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null);
  const [animatingDirection, setAnimatingDirection] = useState<'pack' | 'unpack'>('pack');

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scannedItemName, setScannedItemName] = useState('');
  const [scanResult, setScanResult] = useState<ScannedItemResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // New item modal state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('clothing');
  const [newItemWeight, setNewItemWeight] = useState('0.5');

  // New bag modal state
  const [showAddBagModal, setShowAddBagModal] = useState(false);
  const [newBagName, setNewBagName] = useState('');
  const [newBagType, setNewBagType] = useState<Bag['type']>('suitcase');
  const [newBagMaxWeight, setNewBagMaxWeight] = useState('23.0');
  const [newBagTareWeight, setNewBagTareWeight] = useState('3.5');

  const selectedBag = bags.find((b) => b.id === selectedBagId) || bags[0];

  // Calculate weights for the selected bag
  const bagItems = items.filter((i) => i.bagId === selectedBag?.id && i.packed);
  const itemsWeight = bagItems.reduce((acc, curr) => acc + (curr.estimatedWeightKg * (curr.quantity || 1)), 0);
  const totalBagWeight = Number(((selectedBag?.tareWeightKg || 0) + itemsWeight).toFixed(2));
  const maxLimit = selectedBag?.maxWeightKg || 23.0;
  const weightPercent = Math.min(100, Math.round((totalBagWeight / maxLimit) * 100));
  const isOverweight = totalBagWeight > maxLimit;
  const isNearLimit = totalBagWeight >= maxLimit * 0.85 && !isOverweight;

  // Unpacked items for this event
  const unpackedItems = items.filter((i) => !i.packed);

  // Find under-loaded bags for rebalancing
  const otherBags = bags.filter((b) => b.id !== selectedBag?.id);
  const heaviestItemInBag = [...bagItems].sort((a, b) => b.estimatedWeightKg - a.estimatedWeightKg)[0];

  // Tactile pack action
  const handlePack = async (item: Item) => {
    if (!selectedBag) return;
    setAnimatingItemId(item.id);
    setAnimatingDirection('pack');
    deviceService.playPackSound();

    setTimeout(async () => {
      await onTogglePackItem(item, selectedBag.id);
      setAnimatingItemId(null);
    }, 320);
  };

  // Tactile unpack action
  const handleUnpack = async (item: Item) => {
    setAnimatingItemId(item.id);
    setAnimatingDirection('unpack');
    deviceService.playUnpackSound();

    setTimeout(async () => {
      await onTogglePackItem(item);
      setAnimatingItemId(null);
    }, 300);
  };

  // Camera scanner handlers
  const openCameraScanner = async () => {
    setIsCameraOpen(true);
    setScanResult(null);
    setScannedItemName('');
    const stream = await deviceService.getCameraStream();
    if (stream) {
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const closeCameraScanner = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleSimulateScan = (itemName: string) => {
    setScannedItemName(itemName);
    const analysis = aiService.analyzeScannedItem(itemName);
    setScanResult(analysis);
    deviceService.playSuccessSound();
  };

  const handleAddScannedItem = async () => {
    if (!scanResult || !activeEvent || !selectedBag) return;
    await onAddItem({
      eventId: activeEvent.id,
      bagId: selectedBag.id,
      name: scanResult.name,
      category: scanResult.category,
      quantity: 1,
      estimatedWeightKg: scanResult.estimatedWeightKg,
      packed: true,
      packedByMemberId: currentMember.id,
      packedAt: new Date().toISOString(),
      flagReason: scanResult.flagReason,
      securityCategory: scanResult.securityCategory
    });
    closeCameraScanner();
    deviceService.playPackSound();
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* 1. Bags Horizontal Carousel & Switcher */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Luggage className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-warm-900">Virtual Containers</h2>
          </div>
          <button
            onClick={() => setShowAddBagModal(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Bag
          </button>
        </div>

        {/* Carousel buttons */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-1">
          {bags.map((bag) => {
            const isSelected = (selectedBag?.id || bags[0]?.id) === bag.id;
            const assigned = members.find((m) => m.id === bag.assignedMemberId);
            const bItems = items.filter((i) => i.bagId === bag.id && i.packed);
            const bWeight = Number((bag.tareWeightKg + bItems.reduce((acc, curr) => acc + (curr.estimatedWeightKg * (curr.quantity || 1)), 0)).toFixed(1));
            const bOver = bWeight > bag.maxWeightKg;

            return (
              <button
                key={bag.id}
                onClick={() => setSelectedBagId(bag.id)}
                className={`flex-shrink-0 min-w-[200px] text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
                    : 'bg-white/80 border-warm-200 hover:border-warm-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">
                    {bag.type === 'cabin' ? '🧳' : bag.type === 'exam_pouch' ? '✏️' : bag.type === 'document_folio' ? '📁' : bag.type === 'tote' ? '🛍️' : '🧳'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bOver
                        ? 'bg-rose-100 text-rose-800'
                        : isSelected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-warm-100 text-warm-700'
                    }`}
                  >
                    {bWeight} / {bag.maxWeightKg} kg
                  </span>
                </div>

                <h3 className="text-xs font-bold text-warm-900 mt-2 truncate">{bag.name}</h3>
                <p className="text-[11px] text-warm-500 mt-0.5">
                  {assigned ? `${assigned.avatar} ${assigned.name}` : 'Family Bag'} • {bItems.length} packed
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Selected Bag Live Weight Gauge & Overweight Alert */}
      {selectedBag && (
        <section className="bg-white rounded-3xl p-5 border border-warm-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-warm-500 uppercase tracking-wider">
                Active Bag Weight Guard
              </span>
              <h3 className="text-base font-bold text-warm-900 mt-0.5">{selectedBag.name}</h3>
              <p className="text-xs text-warm-500">
                Empty tare: {selectedBag.tareWeightKg} kg • Items: {itemsWeight.toFixed(2)} kg
              </p>
            </div>

            <div className="text-right">
              <span
                className={`text-xl font-extrabold ${
                  isOverweight
                    ? 'text-rose-600'
                    : isNearLimit
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {totalBagWeight}
                <span className="text-xs font-bold text-warm-500"> / {maxLimit} kg</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                {isOverweight ? (
                  <span className="text-rose-600">⚠️ OVERWEIGHT</span>
                ) : isNearLimit ? (
                  <span className="text-amber-600">Near Limit</span>
                ) : (
                  <span className="text-emerald-600">Safe Allowance</span>
                )}
              </p>
            </div>
          </div>

          {/* Color-shifting Weight Gauge Bar */}
          <div className="w-full bg-warm-100 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverweight
                  ? 'bg-rose-500 animate-pulse'
                  : isNearLimit
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, weightPercent)}%` }}
            />
          </div>

          {/* Proactive 1-Tap Rebalance Alert */}
          {isOverweight && heaviestItemInBag && otherBags.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-pop-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-xs text-rose-900 font-bold">
                  Overweight by {(totalBagWeight - maxLimit).toFixed(1)} kg!
                </p>
                <p className="text-xs text-rose-700 leading-snug">
                  Rebalance suggestion: Move heavy item <strong>"{heaviestItemInBag.name}" ({heaviestItemInBag.estimatedWeightKg} kg)</strong> to{' '}
                  <strong>{otherBags[0].name}</strong> with one tap.
                </p>
                <button
                  onClick={async () => {
                    await onRebalanceItem(heaviestItemInBag.id, otherBags[0].id);
                    deviceService.playSuccessSound();
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Move to {otherBags[0].name}
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions: "Show & Pack" Camera + Add Custom Item */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={openCameraScanner}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              "Show & Pack" Camera
            </button>

            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-4 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-900 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </section>
      )}

      {/* 3. Items to Pack (Unpacked Checklist) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-warm-900">Items to Pack</h3>
            <p className="text-xs text-warm-500">
              Tap any item to pack it into {selectedBag?.name || 'bag'}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            {unpackedItems.length} remaining
          </span>
        </div>

        {unpackedItems.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-warm-200 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <p className="text-sm font-bold text-warm-900">All items are packed!</p>
            <p className="text-xs text-warm-500">
              Everything assigned for this event has been packed into containers.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {unpackedItems.map((item) => {
              const isDropping = animatingItemId === item.id && animatingDirection === 'pack';

              return (
                <div
                  key={item.id}
                  onClick={() => handlePack(item)}
                  className={`p-3.5 bg-white rounded-2xl border border-warm-200/90 hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between group ${
                    isDropping ? 'animate-pack-drop' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-xl border-2 border-warm-300 group-hover:border-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="opacity-0 group-hover:opacity-100 text-emerald-600 text-xs font-bold">✓</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-warm-900 leading-snug">{item.name}</p>
                        {item.quantity > 1 && (
                          <span className="text-[10px] font-bold text-warm-500 bg-warm-100 px-1.5 py-0.2 rounded-md">
                            x{item.quantity}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] text-warm-500">
                          {item.estimatedWeightKg} kg • {item.category}
                        </span>

                        {/* Airline / Exam Safety Warning Badges */}
                        {item.flagReason && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            {item.flagReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="text-warm-300 hover:text-rose-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Packed Items in Current Bag */}
      {selectedBag && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-warm-900">Packed in {selectedBag.name}</h3>
              <p className="text-xs text-warm-500">Tap to unpack back into checklist</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {bagItems.length} packed
            </span>
          </div>

          {bagItems.length === 0 ? (
            <div className="p-6 bg-warm-50 rounded-2xl border border-dashed border-warm-300 text-center text-xs text-warm-500">
              No items packed in this container yet. Tap items above to pack them.
            </div>
          ) : (
            <div className="space-y-2">
              {bagItems.map((item) => {
                const isLifting = animatingItemId === item.id && animatingDirection === 'unpack';
                const packer = members.find((m) => m.id === item.packedByMemberId);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleUnpack(item)}
                    className={`p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 hover:bg-emerald-100/50 cursor-pointer transition-all flex items-center justify-between ${
                      isLifting ? 'animate-unpack-lift' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-warm-900 line-through opacity-85">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-warm-500">
                          {item.estimatedWeightKg} kg • Packed by {packer?.name || 'You'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                      Unpack
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 5. "Mark [Name] Done" Confirmation Button */}
      <section className="pt-4">
        <button
          onClick={async () => {
            await onMarkUserDone();
            deviceService.playSuccessSound();
          }}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark {currentMember.name} Done ✓
        </button>
      </section>

      {/* MODAL 1: "Show & Pack" Camera Scanner */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-pop-in">
          <div className="w-full max-w-md bg-warm-50 rounded-3xl border border-warm-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-white border-b border-warm-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-warm-900">"Show & Pack" Camera Scanner</h3>
              </div>
              <button
                onClick={closeCameraScanner}
                className="text-warm-400 hover:text-warm-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {/* Camera Preview Box */}
              <div className="relative aspect-video bg-stone-950 rounded-2xl overflow-hidden flex items-center justify-center border border-warm-300">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-2xl flex items-center justify-center">
                  <div className="w-48 h-32 border-2 border-emerald-400/80 rounded-xl" />
                </div>
              </div>

              {/* Quick Item Recognition Buttons */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-warm-600">Simulate Item Recognition:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '20,000mAh Power Bank',
                    'Shampoo Bottle 200ml',
                    'Noise Cancelling Headphones',
                    'Winter Jacket',
                    'Admit Card / Hall Ticket',
                    'Prescription Box'
                  ].map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSimulateScan(name)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-warm-200 rounded-xl text-[11px] font-medium text-warm-800 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Scan Analysis Result */}
              {scanResult && (
                <div className="p-4 bg-white rounded-2xl border border-warm-200 space-y-3 animate-pop-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Recognized
                      </span>
                      <h4 className="text-sm font-bold text-warm-900 mt-1">{scanResult.name}</h4>
                      <p className="text-xs text-warm-500">
                        Estimated Weight: {scanResult.estimatedWeightKg} kg • {scanResult.category}
                      </p>
                    </div>
                  </div>

                  {/* Safety & Security Category */}
                  {scanResult.flagReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-snug flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Security Rule Check: </span>
                        {scanResult.flagReason}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddScannedItem}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Log & Pack into {selectedBag?.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Custom Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-pop-in">
          <div className="w-full max-w-sm bg-warm-50 rounded-3xl border border-warm-200 overflow-hidden shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-warm-900">Add Item to Checklist</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-warm-400 hover:text-warm-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newItemName.trim() || !activeEvent) return;
                await onAddItem({
                  eventId: activeEvent.id,
                  bagId: null,
                  name: newItemName.trim(),
                  category: newItemCategory,
                  quantity: 1,
                  estimatedWeightKg: parseFloat(newItemWeight) || 0.5,
                  packed: false
                });
                setNewItemName('');
                setShowAddItemModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Travel Iron, Extra Sneakers"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-warm-700 block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
                  >
                    <option value="clothing">Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="documents">Documents</option>
                    <option value="toiletries">Toiletries</option>
                    <option value="medicine">Medicine</option>
                    <option value="stationery">Stationery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-warm-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newItemWeight}
                    onChange={(e) => setNewItemWeight(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Add to Checklist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Bag Container */}
      {showAddBagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-pop-in">
          <div className="w-full max-w-sm bg-warm-50 rounded-3xl border border-warm-200 overflow-hidden shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-warm-900">Add New Container</h3>
              <button onClick={() => setShowAddBagModal(false)} className="text-warm-400 hover:text-warm-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newBagName.trim() || !activeEvent) return;
                await onAddBag({
                  eventId: activeEvent.id,
                  name: newBagName.trim(),
                  type: newBagType,
                  maxWeightKg: parseFloat(newBagMaxWeight) || 23.0,
                  tareWeightKg: parseFloat(newBagTareWeight) || 3.0,
                  assignedMemberId: currentMember.id,
                  color: '#047857'
                });
                setNewBagName('');
                setShowAddBagModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">Container Name</label>
                <input
                  type="text"
                  placeholder="e.g. Blue Duffle Bag, Kids Backpack"
                  value={newBagName}
                  onChange={(e) => setNewBagName(e.target.value)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">Container Type</label>
                <select
                  value={newBagType}
                  onChange={(e) => setNewBagType(e.target.value as any)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
                >
                  <option value="suitcase">Suitcase (Checked)</option>
                  <option value="cabin">Cabin Roller</option>
                  <option value="backpack">Backpack</option>
                  <option value="school_bag">School Bag</option>
                  <option value="exam_pouch">Exam Pouch</option>
                  <option value="document_folio">Document Folio</option>
                  <option value="tote">Shopping Tote</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-warm-700 block mb-1">Max Limit (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBagMaxWeight}
                    onChange={(e) => setNewBagMaxWeight(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-warm-700 block mb-1">Tare (Empty) kg</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBagTareWeight}
                    onChange={(e) => setNewBagTareWeight(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Create Container
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
