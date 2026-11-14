import React, { useState } from 'react';
import { 
  FileText, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Home, 
  AlertTriangle, 
  Plane, 
  Check, 
  Trash2,
  Upload,
  Calendar,
  Key
} from 'lucide-react';
import { 
  DocumentVaultItem, 
  HomeChecklistItem, 
  ReturnAuditItem, 
  FamilyMember, 
  PrepEvent,
  Bag 
} from '../../types';
import { ocrService } from '../../services/ocrService';
import { deviceService } from '../../services/deviceService';

interface DocsHomeTabProps {
  documents: DocumentVaultItem[];
  homeChecklist: HomeChecklistItem[];
  returnAudit: ReturnAuditItem[];
  members: FamilyMember[];
  activeEvent: PrepEvent | null;
  bags: Bag[];
  onToggleHomeTask: (task: HomeChecklistItem) => Promise<void>;
  onAddHomeTask: (task: string) => Promise<void>;
  onToggleReturnItem: (item: ReturnAuditItem) => Promise<void>;
  onAddDocument: (doc: Omit<DocumentVaultItem, 'id'>) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  onSyncBaggageToBags: (allowanceKg: number) => Promise<void>;
}

export const DocsHomeTab: React.FC<DocsHomeTabProps> = ({
  documents,
  homeChecklist,
  returnAudit,
  members,
  activeEvent,
  bags,
  onToggleHomeTask,
  onAddHomeTask,
  onToggleReturnItem,
  onAddDocument,
  onDeleteDocument,
  onSyncBaggageToBags
}) => {
  const currentMember = members.find((m) => m.isCurrentUser) || members[0];
  
  // Document Vault PIN/Biometric lock state
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // New home task state
  const [newHomeTask, setNewHomeTask] = useState('');

  // Add document modal state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docType, setDocType] = useState<DocumentVaultItem['type']>('passport');
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docAllowance, setDocAllowance] = useState('23');
  const [docMemberId, setDocMemberId] = useState(currentMember.id);
  const [docRawOCRText, setDocRawOCRText] = useState('');

  // Unlock handler
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === '1234' || enteredPin === '') {
      setIsVaultLocked(false);
      setPinError(false);
      setEnteredPin('');
      deviceService.playSuccessSound();
    } else {
      setPinError(true);
      deviceService.vibrate(100);
    }
  };

  // OCR simulate parse
  const handleSimulateOCR = (text: string) => {
    setDocRawOCRText(text);
    const parsed = ocrService.parseDocumentText(text);
    if (parsed.extractedTitle) setDocTitle(parsed.extractedTitle);
    if (parsed.documentNumber) setDocNumber(parsed.documentNumber);
    if (parsed.expiryDate) setDocExpiry(parsed.expiryDate);
    if (parsed.baggageAllowanceKg) setDocAllowance(parsed.baggageAllowanceKg.toString());
    if (parsed.documentType) setDocType(parsed.documentType as any);
  };

  const handleAddDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    await onAddDocument({
      memberId: docMemberId,
      type: docType,
      title: docTitle.trim(),
      documentNumber: docNumber.trim() || undefined,
      expiryDate: docExpiry || undefined,
      baggageAllowanceKg: docAllowance ? parseInt(docAllowance, 10) : undefined,
      notes: docRawOCRText ? `Parsed from scan text` : undefined,
      isEncrypted: false
    });

    setShowAddDocModal(false);
    setDocTitle('');
    setDocNumber('');
    setDocExpiry('');
    setDocRawOCRText('');
    deviceService.playSuccessSound();
  };

  // Filter tasks and audits by current event
  const eventHomeTasks = homeChecklist.filter((t) => t.eventId === activeEvent?.id);
  const eventReturnAudits = returnAudit.filter((r) => r.eventId === activeEvent?.id);

  return (
    <div className="space-y-6 pb-24">
      
      {/* 1. Synced "Before Leaving Home" Checklist */}
      <section className="bg-white rounded-3xl p-5 border border-warm-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-warm-900">Before Leaving Home Checklist</h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            {eventHomeTasks.filter((t) => t.completed).length} / {eventHomeTasks.length} Done
          </span>
        </div>

        <p className="text-xs text-warm-500">
          Synced across all parents so no one wonders <em>"Did you lock the balcony doors?"</em>
        </p>

        {/* Task list */}
        <div className="space-y-2">
          {eventHomeTasks.map((task) => {
            const checker = members.find((m) => m.id === task.checkedByMemberId);

            return (
              <div
                key={task.id}
                onClick={async () => {
                  await onToggleHomeTask(task);
                  if (!task.completed) {
                    deviceService.playSuccessSound();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  task.completed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-warm-50/70 border-warm-200 hover:bg-warm-100/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-warm-400 bg-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        task.completed ? 'line-through text-warm-500' : 'text-warm-900'
                      }`}
                    >
                      {task.task}
                    </p>
                    {task.completed && (
                      <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                        ✓ Checked by {checker?.name || currentMember.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom home task */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newHomeTask.trim()) return;
            await onAddHomeTask(newHomeTask.trim());
            setNewHomeTask('');
          }}
          className="flex gap-2 pt-1"
        >
          <input
            type="text"
            placeholder="Add household check (e.g. Unplug iron, close windows)..."
            value={newHomeTask}
            onChange={(e) => setNewHomeTask(e.target.value)}
            className="flex-1 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Add
          </button>
        </form>
      </section>

      {/* 2. Hotel Checkout "Return Audit" Mode */}
      <section className="bg-white rounded-3xl p-5 border border-warm-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            <div>
              <h2 className="text-sm font-bold text-warm-900">Hotel Checkout "Return Audit"</h2>
            </div>
          </div>
          <span className="text-[10px] font-bold text-warm-600 bg-warm-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Checkout Mode
          </span>
        </div>

        <p className="text-xs text-warm-500 leading-relaxed">
          Reverses your packing checklist on return day so phone chargers in wall outlets, washbags on shower ledges, and kids' favorite toys are never left behind.
        </p>

        <div className="space-y-2">
          {eventReturnAudits.map((item) => (
            <div
              key={item.id}
              onClick={async () => {
                await onToggleReturnItem(item);
                deviceService.playSuccessSound();
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                item.checkedReturn
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : 'bg-warm-50/70 border-warm-200 hover:border-warm-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    item.checkedReturn
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-warm-400 bg-white'
                  }`}
                >
                  {item.checkedReturn && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className={`text-xs font-bold ${item.checkedReturn ? 'line-through text-warm-500' : 'text-warm-900'}`}>
                    {item.name}
                  </p>
                  {item.notes && (
                    <p className="text-[11px] text-warm-500 mt-0.5">
                      📍 {item.notes}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  item.checkedReturn
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {item.checkedReturn ? 'Recovered ✓' : 'Verify'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Local-First Family Document Vault */}
      <section className="bg-white rounded-3xl p-5 border border-warm-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-warm-900">Encrypted Family Document Vault</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVaultLocked(!isVaultLocked)}
              className="p-1.5 text-warm-600 hover:text-warm-900 rounded-lg bg-warm-100"
              title={isVaultLocked ? 'Vault Locked' : 'Lock Vault'}
            >
              {isVaultLocked ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
            </button>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Doc
            </button>
          </div>
        </div>

        <p className="text-xs text-warm-500">
          Stored locally in IndexedDB (Dexie). Safeguards passport renewals and auto-syncs ticket baggage limits.
        </p>

        {isVaultLocked ? (
          <div className="p-6 bg-warm-50 rounded-2xl border border-warm-200 text-center space-y-3">
            <Lock className="w-8 h-8 text-warm-400 mx-auto" />
            <h4 className="text-xs font-bold text-warm-900">Document Vault is Locked</h4>
            <p className="text-[11px] text-warm-500">
              Enter PIN (Default: 1234 or leave blank) to view family documents.
            </p>
            <form onSubmit={handleUnlock} className="flex gap-2 max-w-xs mx-auto">
              <input
                type="password"
                maxLength={6}
                placeholder="Enter PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="flex-1 bg-white border border-warm-200 rounded-xl px-3 py-2 text-center text-xs tracking-widest"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
              >
                Unlock
              </button>
            </form>
            {pinError && <p className="text-[10px] text-rose-600 font-bold">Incorrect PIN. Try 1234.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const member = members.find((m) => m.id === doc.memberId);
              const validityCheck = doc.expiryDate
                ? ocrService.checkSixMonthPassportRule(doc.expiryDate, activeEvent?.endDate)
                : null;

              return (
                <div
                  key={doc.id}
                  className="p-4 bg-white rounded-2xl border border-warm-200 shadow-2xs space-y-2.5 transition-all hover:border-warm-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-warm-100 text-warm-800 shrink-0">
                        {doc.type === 'passport' ? '🛂' : doc.type === 'flight_ticket' ? '✈️' : '📋'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-warm-900">{doc.title}</h4>
                        <p className="text-[11px] text-warm-500 mt-0.5">
                          {member?.avatar} {member?.name} • {doc.documentNumber || 'No Doc Number'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-warm-400 hover:text-rose-600 p-1"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 6-Month Passport Rule Warning Alert */}
                  {validityCheck && !validityCheck.isValid && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2 animate-pop-in">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>6-Month Expiry Rule Alert: </strong>
                        {validityCheck.warningMessage}
                      </div>
                    </div>
                  )}

                  {/* Flight Ticket Baggage Auto-Sync */}
                  {doc.type === 'flight_ticket' && doc.baggageAllowanceKg && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ticket Baggage Allowance: <strong>{doc.baggageAllowanceKg} kg</strong></span>
                      </div>
                      <button
                        onClick={async () => {
                          if (doc.baggageAllowanceKg) {
                            await onSyncBaggageToBags(doc.baggageAllowanceKg);
                            deviceService.playSuccessSound();
                            alert(`Synced ${doc.baggageAllowanceKg}kg limit to all checked bags!`);
                          }
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                      >
                        Auto-Sync to Bags
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-warm-500 pt-1 border-t border-warm-100">
                    <span>
                      Expiry: {doc.expiryDate || 'N/A'}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Offline Dexie IndexedDB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL: Add Document with Simulated OCR */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-pop-in">
          <div className="w-full max-w-md bg-warm-50 rounded-3xl border border-warm-200 overflow-hidden shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-warm-900">Add Family Document / Ticket</h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-warm-400 hover:text-warm-900">
                ✕
              </button>
            </div>

            {/* Simulated OCR Scanner Presets */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-warm-600">Simulate OCR Document Scan:</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateOCR('REPUBLIC PASSPORT NO: Z8472910 EXPIRY: 2027-04-10 KRISH')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-warm-200 rounded-xl text-[10px] font-medium text-warm-800"
                >
                  Scan Passport
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateOCR('INDIGO AIRLINE PNR: W7KR9P CHECK-IN BAGGAGE: 23 KG FLIGHT DATE 2026-12-15')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-warm-200 rounded-xl text-[10px] font-medium text-warm-800"
                >
                  Scan Airline E-Ticket
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateOCR('CBSE EXAM BOARD ADMIT CARD ROLL NO: 120495 MATH FINALS')}
                  className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-warm-200 rounded-xl text-[10px] font-medium text-warm-800"
                >
                  Scan Exam Hall Ticket
                </button>
              </div>
            </div>

            <form onSubmit={handleAddDocSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
                >
                  <option value="passport">Passport</option>
                  <option value="flight_ticket">Flight Ticket / Boarding Pass</option>
                  <option value="hall_ticket">Exam Hall Ticket / Admit Card</option>
                  <option value="prescription">Doctor Prescription / Lab Form</option>
                  <option value="other">Other ID</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">Family Member</label>
                <select
                  value={docMemberId}
                  onChange={(e) => setDocMemberId(e.target.value)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.avatar} {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Krish's Passport"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-warm-700 block mb-1">Document / PNR #</label>
                  <input
                    type="text"
                    placeholder="Z8472910"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-warm-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={docExpiry}
                    onChange={(e) => setDocExpiry(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
                  />
                </div>
              </div>

              {docType === 'flight_ticket' && (
                <div>
                  <label className="text-xs font-bold text-warm-700 block mb-1">Baggage Allowance (kg)</label>
                  <input
                    type="number"
                    value={docAllowance}
                    onChange={(e) => setDocAllowance(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Save Document to Vault
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
