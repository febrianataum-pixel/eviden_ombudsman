export type UserRole = 'admin' | 'verifikator' | 'operator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  lastLogin: string;
  createdAt: string;
}

export interface Dimension {
  id: string;
  code: string;
  title: string;
  description: string;
  order: number;
  isSecondaryData?: boolean;
}

export interface Indicator {
  id: string;
  dimensionId: string;
  number: number;
  code: string;
  title: string;
  description?: string;
  category?: string;
  specialNote?: string;
  isSecondaryData?: boolean;
}

export interface DocumentRequirement {
  id: string;
  dimensionId: string;
  indicatorId: string;
  number: number;
  title: string;
  description: string;
  required: boolean;
}

export type VerificationStatus = 'pending' | 'verified' | 'needs_revision';
export type EvidenceType = 'upload' | 'link';

export interface Evidence {
  id: string;
  requirementId: string;
  indicatorId: string;
  dimensionId: string;
  type: EvidenceType;
  fileName: string;
  driveFileId?: string;
  driveUrl?: string;
  externalUrl?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  verifiedBy?: string | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  version: number;
}

export interface EvidenceHistory {
  id: string;
  evidenceId: string;
  requirementId: string;
  type: EvidenceType;
  fileName: string;
  driveFileId?: string;
  driveUrl?: string;
  externalUrl?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  action: 'uploaded' | 'updated' | 'replaced' | 'revised';
  note?: string;
}

export interface CommunityTrustUnit {
  id: string;
  unitName: string;
  targetRespondents: number;
  currentRespondents: number;
  questionnaireUrl: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface FilterOptions {
  searchQuery?: string;
  dimensionId?: string;
  indicatorId?: string;
  status?: string;
  uploadedBy?: string;
}
