export type EventCategory = 
  | 'vacation' 
  | 'exam' 
  | 'doctor' 
  | 'errands' 
  | 'homecoming' 
  | 'weekend' 
  | 'custom';

export type ContainerType = 
  | 'suitcase' 
  | 'cabin' 
  | 'backpack' 
  | 'school_bag' 
  | 'exam_pouch' 
  | 'document_folio' 
  | 'tote' 
  | 'other';

export type SecurityCategory = 
  | 'cabin_only' 
  | 'checked_only' 
  | 'prohibited_exam' 
  | 'allowed';

export type MemberRole = 'Organizer' | 'Parent' | 'Child' | 'Family';

export type MemberPackingStatus = 'Not Started' | 'Packing...' | 'Done ✓';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  color: string;
  isCurrentUser: boolean;
  packingStatus: MemberPackingStatus;
}

export interface PrepEvent {
  id: string;
  title: string;
  category: EventCategory;
  destination?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  readinessStatus: 'planning' | 'packing' | 'ready' | 'archived';
  createdAt: string;
  icon?: string;
}

export interface Bag {
  id: string;
  eventId: string;
  name: string;
  type: ContainerType;
  maxWeightKg: number;
  tareWeightKg: number;
  assignedMemberId: string;
  color: string;
}

export interface Item {
  id: string;
  eventId: string;
  bagId: string | null;
  name: string;
  category: string;
  quantity: number;
  estimatedWeightKg: number;
  packed: boolean;
  packedByMemberId?: string;
  packedAt?: string;
  flagReason?: string;
  securityCategory?: SecurityCategory;
}

export interface DocumentVaultItem {
  id: string;
  memberId: string;
  type: 'passport' | 'visa' | 'flight_ticket' | 'hall_ticket' | 'prescription' | 'id_card' | 'other';
  title: string;
  documentNumber?: string;
  expiryDate?: string;
  issuedDate?: string;
  baggageAllowanceKg?: number;
  notes?: string;
  fileData?: string;
  isEncrypted: boolean;
}

export interface HomeChecklistItem {
  id: string;
  eventId: string;
  task: string;
  completed: boolean;
  checkedByMemberId?: string;
  checkedAt?: string;
}

export interface ReturnAuditItem {
  id: string;
  eventId: string;
  itemId?: string;
  name: string;
  category: string;
  checkedReturn: boolean;
  notes?: string;
}
