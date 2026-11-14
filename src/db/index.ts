import Dexie, { type Table } from 'dexie';
import {
  PrepEvent,
  Bag,
  Item,
  FamilyMember,
  DocumentVaultItem,
  HomeChecklistItem,
  ReturnAuditItem
} from '../types';

export class PrepDatabase extends Dexie {
  events!: Table<PrepEvent, string>;
  bags!: Table<Bag, string>;
  items!: Table<Item, string>;
  members!: Table<FamilyMember, string>;
  documents!: Table<DocumentVaultItem, string>;
  homeChecklist!: Table<HomeChecklistItem, string>;
  returnAudit!: Table<ReturnAuditItem, string>;

  constructor() {
    super('PrepDB');
    this.version(1).stores({
      events: 'id, category, readinessStatus, createdAt',
      bags: 'id, eventId, assignedMemberId',
      items: 'id, eventId, bagId, packed, category',
      members: 'id, role, isCurrentUser',
      documents: 'id, memberId, type, expiryDate',
      homeChecklist: 'id, eventId, completed',
      returnAudit: 'id, eventId, checkedReturn'
    });
  }
}

export const db = new PrepDatabase();

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'm-krish',
    name: 'Krish',
    role: 'Organizer',
    avatar: '👨‍💼',
    color: '#047857',
    isCurrentUser: true,
    packingStatus: 'Packing...'
  },
  {
    id: 'm-ananya',
    name: 'Ananya',
    role: 'Parent',
    avatar: '👩‍🏫',
    color: '#d97706',
    isCurrentUser: false,
    packingStatus: 'Done ✓'
  },
  {
    id: 'm-aarav',
    name: 'Aarav',
    role: 'Child',
    avatar: '👦',
    color: '#3b82f6',
    isCurrentUser: false,
    packingStatus: 'Not Started'
  }
];

export const INITIAL_EVENTS: PrepEvent[] = [
  {
    id: 'evt-delhi',
    title: 'Delhi Homecoming & Winter Family Trip',
    category: 'homecoming',
    destination: 'New Delhi, India',
    startDate: '2026-12-15',
    endDate: '2026-12-22',
    notes: 'Visiting brother and family. Reserve spare weight for mithai & winter woolens.',
    readinessStatus: 'packing',
    createdAt: '2026-11-14T10:00:00Z',
    icon: '✈️'
  },
  {
    id: 'evt-exam',
    title: "Aarav's Math & Science Finals",
    category: 'exam',
    destination: 'Greenwood High',
    startDate: '2026-11-20',
    endDate: '2026-11-20',
    notes: 'CBSE Board Rules: Clear transparent pouch, no digital watches, blue ballpoint pens only.',
    readinessStatus: 'packing',
    createdAt: '2026-11-14T11:00:00Z',
    icon: '📝'
  },
  {
    id: 'evt-clinic',
    title: 'Annual Family Wellness & Lab Checkup',
    category: 'doctor',
    destination: 'Apollo Medical Centre',
    startDate: '2026-11-25',
    endDate: '2026-11-25',
    notes: 'Carry previous prescription folios, fasting sugar meter, and insurance cards.',
    readinessStatus: 'planning',
    createdAt: '2026-11-14T12:00:00Z',
    icon: '🏥'
  }
];

export const INITIAL_BAGS: Bag[] = [
  {
    id: 'bag-delhi-checkin',
    eventId: 'evt-delhi',
    name: "Krish & Ananya's Trolley (Checked)",
    type: 'suitcase',
    maxWeightKg: 23.0,
    tareWeightKg: 3.8,
    assignedMemberId: 'm-krish',
    color: '#047857'
  },
  {
    id: 'bag-delhi-cabin',
    eventId: 'evt-delhi',
    name: 'Cabin Roller & Tech Bag',
    type: 'cabin',
    maxWeightKg: 7.0,
    tareWeightKg: 2.1,
    assignedMemberId: 'm-ananya',
    color: '#3b82f6'
  },
  {
    id: 'bag-exam-pouch',
    eventId: 'evt-exam',
    name: 'Clear Exam Pouch & School Bag',
    type: 'exam_pouch',
    maxWeightKg: 3.5,
    tareWeightKg: 0.3,
    assignedMemberId: 'm-aarav',
    color: '#8b5cf6'
  }
];

export const INITIAL_ITEMS: Item[] = [
  // Delhi trip items
  {
    id: 'item-1',
    eventId: 'evt-delhi',
    bagId: 'bag-delhi-checkin',
    name: 'Warm Merino Wool Jacket',
    category: 'clothing',
    quantity: 1,
    estimatedWeightKg: 1.4,
    packed: true,
    packedByMemberId: 'm-krish',
    packedAt: '2026-11-14T11:30:00Z'
  },
  {
    id: 'item-2',
    eventId: 'evt-delhi',
    bagId: 'bag-delhi-checkin',
    name: 'Casual Winter Outfits (x4)',
    category: 'clothing',
    quantity: 4,
    estimatedWeightKg: 2.8,
    packed: true,
    packedByMemberId: 'm-krish',
    packedAt: '2026-11-14T11:45:00Z'
  },
  {
    id: 'item-3',
    eventId: 'evt-delhi',
    bagId: 'bag-delhi-cabin',
    name: '20,000mAh Laptop Power Bank',
    category: 'electronics',
    quantity: 1,
    estimatedWeightKg: 0.45,
    packed: true,
    packedByMemberId: 'm-ananya',
    packedAt: '2026-11-14T12:00:00Z',
    flagReason: 'Lithium battery: Cabin baggage only (Prohibited in checked bags)',
    securityCategory: 'cabin_only'
  },
  {
    id: 'item-4',
    eventId: 'evt-delhi',
    bagId: null,
    name: 'Winter Moisturizer & Shampoo (150ml)',
    category: 'toiletries',
    quantity: 1,
    estimatedWeightKg: 0.3,
    packed: false,
    flagReason: '>100ml liquid: Must be in Checked Baggage for flights',
    securityCategory: 'checked_only'
  },
  {
    id: 'item-5',
    eventId: 'evt-delhi',
    bagId: null,
    name: 'Return Gifts for Relatives (Dry Fruits & Souvenirs)',
    category: 'other',
    quantity: 2,
    estimatedWeightKg: 3.5,
    packed: false
  },
  {
    id: 'item-6',
    eventId: 'evt-delhi',
    bagId: null,
    name: 'Noise-Cancelling Headphones',
    category: 'electronics',
    quantity: 1,
    estimatedWeightKg: 0.35,
    packed: false,
    securityCategory: 'cabin_only'
  },
  {
    id: 'item-7',
    eventId: 'evt-delhi',
    bagId: null,
    name: 'Family Thermals & Shawls',
    category: 'clothing',
    quantity: 3,
    estimatedWeightKg: 1.8,
    packed: false
  },

  // Exam items
  {
    id: 'item-8',
    eventId: 'evt-exam',
    bagId: 'bag-exam-pouch',
    name: 'Printed Hall Ticket & School ID',
    category: 'documents',
    quantity: 1,
    estimatedWeightKg: 0.05,
    packed: true,
    packedByMemberId: 'm-aarav',
    packedAt: '2026-11-14T12:10:00Z'
  },
  {
    id: 'item-9',
    eventId: 'evt-exam',
    bagId: 'bag-exam-pouch',
    name: 'Geometry Box with 15cm Ruler',
    category: 'stationery',
    quantity: 1,
    estimatedWeightKg: 0.2,
    packed: true,
    packedByMemberId: 'm-aarav',
    packedAt: '2026-11-14T12:15:00Z'
  },
  {
    id: 'item-10',
    eventId: 'evt-exam',
    bagId: null,
    name: 'Blue Ballpoint Pens (x3) - No Gel',
    category: 'stationery',
    quantity: 3,
    estimatedWeightKg: 0.08,
    packed: false
  },
  {
    id: 'item-11',
    eventId: 'evt-exam',
    bagId: null,
    name: 'Digital Smartwatch',
    category: 'electronics',
    quantity: 1,
    estimatedWeightKg: 0.08,
    packed: false,
    flagReason: 'Prohibited in exam hall! Leave at home or switch to analog watch.',
    securityCategory: 'prohibited_exam'
  }
];

export const INITIAL_DOCUMENTS: DocumentVaultItem[] = [
  {
    id: 'doc-1',
    memberId: 'm-krish',
    type: 'passport',
    title: "Krish's Republic Passport",
    documentNumber: 'Z8472910',
    expiryDate: '2027-04-10',
    issuedDate: '2017-04-11',
    notes: 'Valid for next 5 months. Alert trigger active if international trip is planned.',
    isEncrypted: false
  },
  {
    id: 'doc-2',
    memberId: 'm-aarav',
    type: 'hall_ticket',
    title: 'Aarav CBSE Term-End Hall Ticket',
    documentNumber: 'CBSE-2026-99382',
    expiryDate: '2026-11-30',
    notes: 'Roll No: 120495. Seat allocated in Block B, Room 204.',
    isEncrypted: false
  },
  {
    id: 'doc-3',
    memberId: 'm-ananya',
    type: 'flight_ticket',
    title: 'IndiGo Delhi Round-Trip (6E-204)',
    documentNumber: 'PNR: W7KR9P',
    expiryDate: '2026-12-22',
    baggageAllowanceKg: 23,
    notes: 'Check-in: 23kg per person. Cabin: 7kg + 1 small laptop bag.',
    isEncrypted: false
  }
];

export const INITIAL_HOME_CHECKLIST: HomeChecklistItem[] = [
  {
    id: 'home-1',
    eventId: 'evt-delhi',
    task: 'Turn off all water heaters and main kitchen gas valve',
    completed: true,
    checkedByMemberId: 'm-krish',
    checkedAt: '2026-11-14T09:00:00Z'
  },
  {
    id: 'home-2',
    eventId: 'evt-delhi',
    task: 'Lock balcony sliding doors and verify window latches',
    completed: false
  },
  {
    id: 'home-3',
    eventId: 'evt-delhi',
    task: 'Keep physical passports & original IDs by the front entryway console',
    completed: false
  },
  {
    id: 'home-4',
    eventId: 'evt-delhi',
    task: 'Set automated plant drip system & unplug idle power strips',
    completed: false
  }
];

export const INITIAL_RETURN_AUDIT: ReturnAuditItem[] = [
  {
    id: 'ret-1',
    eventId: 'evt-delhi',
    name: 'Multi-port USB-C Wall Charger & Long Cords',
    category: 'electronics',
    checkedReturn: false,
    notes: 'Check hotel bedside wall outlet and desk sockets'
  },
  {
    id: 'ret-2',
    eventId: 'evt-delhi',
    name: "Aarav's Favorite Teddy & Sleep Pajamas",
    category: 'kids',
    checkedReturn: false,
    notes: 'Check under pillows and behind bedhead'
  },
  {
    id: 'ret-3',
    eventId: 'evt-delhi',
    name: 'Bathroom Washbag & Toothbrushes',
    category: 'toiletries',
    checkedReturn: false,
    notes: 'Check shower ledge and towel hooks'
  }
];

export async function seedInitialDataIfEmpty() {
  const eventCount = await db.events.count();
  if (eventCount === 0) {
    await db.members.bulkAdd(INITIAL_MEMBERS);
    await db.events.bulkAdd(INITIAL_EVENTS);
    await db.bags.bulkAdd(INITIAL_BAGS);
    await db.items.bulkAdd(INITIAL_ITEMS);
    await db.documents.bulkAdd(INITIAL_DOCUMENTS);
    await db.homeChecklist.bulkAdd(INITIAL_HOME_CHECKLIST);
    await db.returnAudit.bulkAdd(INITIAL_RETURN_AUDIT);
  }
}

export async function resetDatabaseToSample() {
  await db.transaction('rw', [db.events, db.bags, db.items, db.members, db.documents, db.homeChecklist, db.returnAudit], async () => {
    await db.events.clear();
    await db.bags.clear();
    await db.items.clear();
    await db.members.clear();
    await db.documents.clear();
    await db.homeChecklist.clear();
    await db.returnAudit.clear();

    await db.members.bulkAdd(INITIAL_MEMBERS);
    await db.events.bulkAdd(INITIAL_EVENTS);
    await db.bags.bulkAdd(INITIAL_BAGS);
    await db.items.bulkAdd(INITIAL_ITEMS);
    await db.documents.bulkAdd(INITIAL_DOCUMENTS);
    await db.homeChecklist.bulkAdd(INITIAL_HOME_CHECKLIST);
    await db.returnAudit.bulkAdd(INITIAL_RETURN_AUDIT);
  });
}

export async function clearAllUserData() {
  await db.transaction('rw', [db.events, db.bags, db.items, db.members, db.documents, db.homeChecklist, db.returnAudit], async () => {
    await db.events.clear();
    await db.bags.clear();
    await db.items.clear();
    await db.documents.clear();
    await db.homeChecklist.clear();
    await db.returnAudit.clear();
  });
}
