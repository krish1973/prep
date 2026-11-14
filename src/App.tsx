import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  seedInitialDataIfEmpty, 
  resetDatabaseToSample, 
  clearAllUserData 
} from './db';
import { 
  PrepEvent, 
  Bag, 
  Item, 
  FamilyMember, 
  DocumentVaultItem, 
  HomeChecklistItem, 
  ReturnAuditItem 
} from './types';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { TodayTab } from './components/tabs/TodayTab';
import { PackBagsTab } from './components/tabs/PackBagsTab';
import { FindItemTab } from './components/tabs/FindItemTab';
import { DocsHomeTab } from './components/tabs/DocsHomeTab';
import { OnboardingModal } from './components/OnboardingModal';
import { DepartureSummaryModal } from './components/modals/DepartureSummaryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { NewEventModal } from './components/modals/NewEventModal';
import { GeneratedPlan } from './services/aiService';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isExitSummaryOpen, setIsExitSummaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  // Live Queries from Dexie IndexedDB
  const events = useLiveQuery(() => db.events.toArray(), []) || [];
  const bags = useLiveQuery(() => db.bags.toArray(), []) || [];
  const items = useLiveQuery(() => db.items.toArray(), []) || [];
  const members = useLiveQuery(() => db.members.toArray(), []) || [];
  const documents = useLiveQuery(() => db.documents.toArray(), []) || [];
  const homeChecklist = useLiveQuery(() => db.homeChecklist.toArray(), []) || [];
  const returnAudit = useLiveQuery(() => db.returnAudit.toArray(), []) || [];

  // Seed initial data if empty on first launch
  useEffect(() => {
    seedInitialDataIfEmpty().then(() => {
      const onboarded = localStorage.getItem('prep_onboarded_v1');
      if (!onboarded) {
        setIsOnboardingOpen(true);
      }
    });
  }, []);

  // Determine active event
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  // Filter items and bags for active event
  const currentEventItems = activeEvent ? items.filter((i) => i.eventId === activeEvent.id) : [];
  const currentEventBags = activeEvent ? bags.filter((b) => b.eventId === activeEvent.id) : [];
  const currentEventUnpackedCount = currentEventItems.filter((i) => !i.packed).length;

  // Onboarding completion
  const handleCompleteOnboarding = () => {
    localStorage.setItem('prep_onboarded_v1', 'true');
    setIsOnboardingOpen(false);
  };

  // 1. Pack / Unpack Toggle
  const handleTogglePackItem = async (item: Item, targetBagId?: string) => {
    const currentMember = members.find((m) => m.isCurrentUser) || members[0];
    if (item.packed) {
      // Unpack
      await db.items.update(item.id, {
        packed: false,
        packedAt: undefined,
        packedByMemberId: undefined
      });
    } else {
      // Pack into bag
      await db.items.update(item.id, {
        packed: true,
        bagId: targetBagId || item.bagId || currentEventBags[0]?.id || null,
        packedAt: new Date().toISOString(),
        packedByMemberId: currentMember?.id || 'm-krish'
      });
    }
  };

  // 2. Add / Delete Item
  const handleAddItem = async (newItem: Omit<Item, 'id'>) => {
    const id = `item-${Date.now()}`;
    await db.items.add({ ...newItem, id });
  };

  const handleDeleteItem = async (itemId: string) => {
    await db.items.delete(itemId);
  };

  // 3. Add Bag
  const handleAddBag = async (newBag: Omit<Bag, 'id'>) => {
    const id = `bag-${Date.now()}`;
    await db.bags.add({ ...newBag, id });
  };

  // 4. Rebalance Item to other bag
  const handleRebalanceItem = async (itemId: string, targetBagId: string) => {
    await db.items.update(itemId, {
      bagId: targetBagId
    });
  };

  // 5. Member status update
  const handleUpdateMemberStatus = async (
    memberId: string, 
    status: 'Not Started' | 'Packing...' | 'Done ✓'
  ) => {
    await db.members.update(memberId, { packingStatus: status });
  };

  // 6. Mark Current User Done
  const handleMarkUserDone = async () => {
    const current = members.find((m) => m.isCurrentUser) || members[0];
    if (current) {
      await db.members.update(current.id, { packingStatus: 'Done ✓' });
    }
  };

  // 7. Create Event from Conversational AI Plan
  const handleCreateEventFromPlan = async (
    plan: GeneratedPlan, 
    startDate: string, 
    endDate?: string
  ) => {
    const eventId = `evt-${Date.now()}`;
    let icon = '✈️';
    if (plan.category === 'exam') icon = '📝';
    if (plan.category === 'doctor') icon = '🏥';
    if (plan.category === 'errands') icon = '🛍️';
    if (plan.category === 'weekend') icon = '🌲';

    const newEvent: PrepEvent = {
      id: eventId,
      title: plan.title,
      category: plan.category,
      destination: plan.destination,
      startDate,
      endDate,
      notes: plan.contextualAdvice,
      readinessStatus: 'packing',
      createdAt: new Date().toISOString(),
      icon
    };

    await db.events.add(newEvent);

    // Create bags
    const bagIds: string[] = [];
    const currentMember = members.find((m) => m.isCurrentUser) || members[0];
    for (let i = 0; i < plan.bags.length; i++) {
      const b = plan.bags[i];
      const bagId = `bag-${Date.now()}-${i}`;
      bagIds.push(bagId);
      await db.bags.add({
        id: bagId,
        eventId,
        name: b.name,
        type: b.type,
        maxWeightKg: b.maxWeightKg,
        tareWeightKg: b.tareWeightKg,
        assignedMemberId: currentMember?.id || 'm-krish',
        color: '#047857'
      });
    }

    // Create items
    for (let j = 0; j < plan.items.length; j++) {
      const itm = plan.items[j];
      const targetBagId = bagIds[itm.targetBagIndex] || bagIds[0] || null;
      await db.items.add({
        id: `item-${Date.now()}-${j}`,
        eventId,
        bagId: targetBagId,
        name: itm.name,
        category: itm.category,
        quantity: itm.quantity,
        estimatedWeightKg: itm.estimatedWeightKg,
        packed: false,
        flagReason: itm.flagReason,
        securityCategory: itm.securityCategory
      });
    }

    // Create home tasks
    if (plan.homeTasks) {
      for (let k = 0; k < plan.homeTasks.length; k++) {
        await db.homeChecklist.add({
          id: `home-${Date.now()}-${k}`,
          eventId,
          task: plan.homeTasks[k],
          completed: false
        });
      }
    }

    setActiveEventId(eventId);
    setActiveTab('pack');
  };

  // 8. Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    await db.events.delete(eventId);
    const relatedBags = await db.bags.where('eventId').equals(eventId).toArray();
    for (const b of relatedBags) await db.bags.delete(b.id);
    const relatedItems = await db.items.where('eventId').equals(eventId).toArray();
    for (const i of relatedItems) await db.items.delete(i.id);
  };

  // 9. Document Actions
  const handleAddDocument = async (doc: Omit<DocumentVaultItem, 'id'>) => {
    const id = `doc-${Date.now()}`;
    await db.documents.add({ ...doc, id });
  };

  const handleDeleteDocument = async (docId: string) => {
    await db.documents.delete(docId);
  };

  const handleSyncBaggageToBags = async (allowanceKg: number) => {
    if (!activeEvent) return;
    const eventSuitcases = currentEventBags.filter((b) => b.type === 'suitcase');
    for (const b of eventSuitcases) {
      await db.bags.update(b.id, { maxWeightKg: allowanceKg });
    }
  };

  // 10. Home Checklist & Return Audit toggles
  const handleToggleHomeTask = async (task: HomeChecklistItem) => {
    const current = members.find((m) => m.isCurrentUser) || members[0];
    await db.homeChecklist.update(task.id, {
      completed: !task.completed,
      checkedByMemberId: !task.completed ? current?.id : undefined,
      checkedAt: !task.completed ? new Date().toISOString() : undefined
    });
  };

  const handleAddHomeTask = async (taskText: string) => {
    if (!activeEvent) return;
    await db.homeChecklist.add({
      id: `home-${Date.now()}`,
      eventId: activeEvent.id,
      task: taskText,
      completed: false
    });
  };

  const handleToggleReturnItem = async (item: ReturnAuditItem) => {
    await db.returnAudit.update(item.id, {
      checkedReturn: !item.checkedReturn
    });
  };

  // 11. Household Member Add / Remove
  const handleAddMember = async (memberData: Omit<FamilyMember, 'id'>) => {
    const id = `m-${Date.now()}`;
    await db.members.add({ ...memberData, id });
  };

  const handleRemoveMember = async (id: string) => {
    await db.members.delete(id);
  };

  return (
    <div className="min-h-screen bg-warm-50 text-warm-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Sticky Top Header */}
      <Header
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={(e) => setActiveEventId(e.id)}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        members={members}
        onOpenExitSummary={() => setIsExitSummaryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReplayOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4">
        {activeTab === 'today' && (
          <TodayTab
            events={events}
            activeEvent={activeEvent}
            items={items}
            bags={bags}
            members={members}
            onSelectEvent={(e) => {
              setActiveEventId(e.id);
              setActiveTab('pack');
            }}
            onUpdateMemberStatus={handleUpdateMemberStatus}
            onCreateEventFromPlan={handleCreateEventFromPlan}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'pack' && (
          <PackBagsTab
            activeEvent={activeEvent}
            bags={currentEventBags}
            items={currentEventItems}
            members={members}
            onTogglePackItem={handleTogglePackItem}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onAddBag={handleAddBag}
            onRebalanceItem={handleRebalanceItem}
            onMarkUserDone={handleMarkUserDone}
          />
        )}

        {activeTab === 'find' && (
          <FindItemTab
            items={items}
            bags={bags}
            members={members}
            events={events}
          />
        )}

        {activeTab === 'docs' && (
          <DocsHomeTab
            documents={documents}
            homeChecklist={homeChecklist}
            returnAudit={returnAudit}
            members={members}
            activeEvent={activeEvent}
            bags={currentEventBags}
            onToggleHomeTask={handleToggleHomeTask}
            onAddHomeTask={handleAddHomeTask}
            onToggleReturnItem={handleToggleReturnItem}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onSyncBaggageToBags={handleSyncBaggageToBags}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unpackedCount={currentEventUnpackedCount}
      />

      {/* Onboarding Walkthrough Modal (6 steps) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        members={members}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onClearSampleData={clearAllUserData}
      />

      {/* Departure Summary / Exit View Modal */}
      <DepartureSummaryModal
        isOpen={isExitSummaryOpen}
        onClose={() => setIsExitSummaryOpen(false)}
        activeEvent={activeEvent}
        bags={bags}
        items={items}
        members={members}
        documents={documents}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetSampleData={resetDatabaseToSample}
        onClearAllData={clearAllUserData}
      />

      {/* New Event Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreateEvent={async (newEvent) => {
          const id = `evt-${Date.now()}`;
          await db.events.add({ ...newEvent, id, createdAt: new Date().toISOString() });
          // Add default bag for the event
          await db.bags.add({
            id: `bag-${Date.now()}`,
            eventId: id,
            name: `${newEvent.title} Main Bag`,
            type: newEvent.category === 'exam' ? 'exam_pouch' : newEvent.category === 'doctor' ? 'document_folio' : 'suitcase',
            maxWeightKg: newEvent.category === 'exam' ? 4 : 23,
            tareWeightKg: newEvent.category === 'exam' ? 0.3 : 3.5,
            assignedMemberId: members[0]?.id || 'm-krish',
            color: '#047857'
          });
          setActiveEventId(id);
          setActiveTab('pack');
        }}
      />

    </div>
  );
}
export default App;
