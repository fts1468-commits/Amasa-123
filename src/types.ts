export type UserRole = 'admin' | 'marketer' | 'guard';

export interface PropertySection {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  priceWeekday: number;
  priceWeekend: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  poolType: string;
  features: string[];
  images: string[];
  coverImage?: string;
  isAvailable?: boolean;
}

export interface SeasonalPricing {
  weekday: number;
  weekend: number;
  summer: number;
  eid: number;
  vacation: number;
}

export interface CustomFeeItem {
  id: string;
  name: string;
  amount: number;
}

export interface AdministrativeFees {
  weekday: number;
  weekend: number;
  summer: number;
  eid: number;
  vacation: number;
  customFees?: CustomFeeItem[];
}

export interface PropertyBreakfastPricing {
  enabled: boolean;
  weekday: number;
  weekend: number;
  summer: number;
  eid: number;
  vacation: number;
}

export interface Property {
  id: string;
  name: string;
  code: string;
  subUnitsCount: number;
  subtitle: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isPublished: boolean;
  basePriceWeekday: number;
  basePriceWeekend: number;
  seasonalPricing: SeasonalPricing;
  administrativeFees: AdministrativeFees;
  sections?: PropertySection[];
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  poolType: string;
  coverImage: string;
  images: string[];
  features: string[];
  contractTerms: string[];
  iban: string;
  bankName: string;
  accountHolder: string;
  defaultDeposit: number;
  insuranceAmount: number;
  checkInTimeText: string;
  checkOutTimeText: string;
  defaultBreakfastPrice?: number;
  breakfastPricing?: PropertyBreakfastPricing;
  assignedGuardId?: string;
  assignedGuardName?: string;
  assignedGuardPhone?: string;
  assignedGuardNotes?: string;
}

export interface MarketerPermissions {
  canCreateBooking: boolean;
  canEditPrices?: boolean;
  canViewAllBookings?: boolean;
  canBlockDates?: boolean;
  canViewCustomerContacts?: boolean;
  canExportReports?: boolean;
  canViewFinancials?: boolean;
  canCreateContract: boolean;
  canEditDeposit: boolean;
  canViewCalendar: boolean;
  canViewProperties: boolean;
  canViewDashboard: boolean;
  canViewMarketers: boolean;
  canManageTemplates: boolean;
  canViewRentalContract: boolean;
  canViewActivityLogs: boolean;
}

export interface MarketerContract {
  contractNumber: string;
  contractDate: string;
  expiryDate: string;
  commissionRatePercent: number;
  status: string;
  firstParty: string;
  firstPartyRepresentative: string;
  secondParty: string;
  secondPartyPhone: string;
  secondPartyEmail: string;
  secondPartyNationalId?: string;
  secondPartyFalLicense?: string;
  terms: string[];
  isSigned: boolean;
  signedDate: string;
  notes?: string;
}

export interface Marketer {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  avatar: string;
  code: string;
  commissionRate: number;
  joinDate: string;
  bankAccount: string;
  bankName: string;
  nationalId: string;
  falLicenseNumber?: string;
  contract: MarketerContract;
  permissions: MarketerPermissions;
}

export interface GuardPermissions {
  canViewCalendar: boolean;
  canViewCustomerContacts: boolean;
  canConfirmArrival: boolean;
  canReceiveInsurance: boolean;
  canInspectUnit: boolean;
  canRefundInsurance: boolean;
  canViewDashboard: boolean;
  canViewBookings: boolean;
  canBlockDates?: boolean;
}

export interface Guard {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  avatar: string;
  jobTitle?: string;
  nationalId?: string;
  startDate?: string;
  iban?: string;
  salary?: number;
  assignedPropertyId?: string;
  assignedPropertyName?: string;
  permissions?: GuardPermissions;
}

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  marketerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'waiting_deposit' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
export type CommissionStatus = 'pending' | 'ready_for_payout' | 'paid';

export interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyName: string;
  sectionId?: string;
  sectionName?: string;
  customerName: string;
  customerPhone: string;
  customerNationalId?: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  nightlyPrice: number;
  totalPrice: number;
  adminFee?: number;
  taxAmount: number;
  discount: number;
  depositPaid: number;
  remainingAmount: number;
  insuranceAmount: number;
  depositReceiptUrl?: string;
  marketerId?: string;
  marketerName?: string;
  marketerCommission: number;
  commissionRatePercent?: number;
  bookingType?: 'full' | 'partial';
  breakfastOption?: string;
  breakfastPrice?: number;
  withoutBreakfast?: boolean;
  breakfastDiscount?: number;
  coordinatorName?: string;
  coordinatorService?: string;
  coordinatorPrice?: number;
  coordinatorPhone?: string;
  coordinatorServicesList?: { id: string; title: string; price: number; coordinatorName: string; coordinatorPhone: string }[];
  baseNightlyTotal?: number;
  commissionStatus: CommissionStatus;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
  contractSigned: boolean;
  contractMessage?: string;
  checkedOut?: boolean;
  checkedOutAt?: string;
  insuranceReturned?: boolean;
  insuranceReturnedAt?: string;
  guestArrived?: boolean;
  guestArrivedAt?: string;
  insuranceReceivedCash?: boolean;
  insuranceReceivedAt?: string;
  insuranceReturnRequested?: boolean;
  insurancePaymentMethod?: 'receipt' | 'cash';
  insuranceReceiptName?: string;
  insuranceReceiptDataUrl?: string;
  paymentCompleted?: boolean;
  paymentReceiptName?: string;
  paymentReceiptDataUrl?: string;
  paymentCompletedAt?: string;
  paymentCompletedBy?: string;
  arrivalPaymentMethod?: 'receipt' | 'cash';
  checkoutReminderSent?: boolean;
  checkoutReminderSentAt?: string;
  guardInspectionResult?: 'full_refund' | 'deduction';
  insuranceDeductionAmount?: number;
  damageDescription?: string;
  damagePhotos?: { name: string; dataUrl: string }[];
  arrivalConfirmedBy?: string;
  arrivalConfirmedAt?: string;
  cashInsuranceConfirmedByGuard?: boolean;
  insuranceReceivedAmount?: number;
  insurancePendingCashCollection?: boolean;
  insuranceNotifiedToGuardAt?: string;
  digitalInsuranceReceiptUrl?: string;
  digitalInsuranceReceiptName?: string;
  insuranceUploadedBy?: string;
  insuranceUploadedAt?: string;
  cleanlinessApproved?: boolean;
  cleanlinessApprovedAt?: string;
  cleanlinessApprovedBy?: string;
  adminApprovedFullBooking?: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  insuranceRefundMethod?: 'bank' | 'cash';
  customerBankReceiptUrl?: string;
  customerBankReceiptName?: string;
  customerIban?: string;
  insuranceRefundReceiptUrl?: string;
  insuranceRefundReceiptName?: string;
  insuranceRefundRequested?: boolean;
  insuranceRefundNotifiedToAdmin?: boolean;
  insuranceRefundNotifiedToGuard?: boolean;
  insuranceRefundNotifiedToMarketer?: boolean;
  paymentNotes?: string;
  digitalInsurancePaymentMethod?: 'receipt' | 'cash';
  digitalInsuranceNotes?: string;
  insuranceRefundRequestedBy?: string;
  insuranceRefundRequestedAt?: string;
  insuranceRefundNotes?: string;
  insuranceRefundProcessedBy?: string;
  insuranceRefundProcessedAt?: string;
  guardCheckoutStaff?: string;
  guardDamageNotes?: string;
  guardDamagePhotos?: { name: string; dataUrl: string }[];
}

export interface DateOverride {
  status?: 'available' | 'booked' | 'blocked' | 'waiting_deposit';
  price?: number;
  adminFee?: number;
  breakfastPrice?: number;
  season?: string;
  bookingId?: string;
  waitingDepositExpiresAt?: number;
  waitingCustomerName?: string;
  waitingCustomerPhone?: string;
  waitingDepositAmount?: number;
  waitingMarketerName?: string;
  waitingMarketerId?: string;
  waitingCommissionRate?: number;
}

export interface CommissionRequest {
  id: string;
  marketerId: string;
  marketerName: string;
  fromDate: string;
  toDate: string;
  bookingIds: string[];
  amount: number;
  status: 'pending' | 'transferred' | 'rejected';
  createdAt: string;
  processedAt?: string;
  receiptFileName?: string;
  receiptDataUrl?: string;
  adminNote?: string;
  seenByMarketer?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
}

export type BroadcastTargetGroup =
  | 'all'
  | 'all_marketers'
  | 'all_guards'
  | 'specific_guard'
  | 'female_marketers'
  | 'coordinators'
  | 'custom';

export type BroadcastPriority = 'normal' | 'important' | 'urgent';

export type BroadcastCategory = 'decision' | 'alert' | 'update' | 'instruction' | 'general';

export interface AdminBroadcastMessage {
  id: string;
  title: string;
  content: string;
  targetGroup: BroadcastTargetGroup;
  targetGroupName: string;
  targetPropertyId?: string;
  targetPropertyName?: string;
  targetGuardId?: string;
  targetMarketerIds?: string[];
  priority: BroadcastPriority;
  category: BroadcastCategory;
  effectiveDate: string;
  sentAt: string;
  senderName: string;
  senderRole: string;
  acknowledgedBy?: string[];
  whatsappShared?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'deposit_request' | 'deposit_confirmed' | 'deposit_expired' | 'commission' | 'permission' | 'checkout' | 'insurance' | 'system' | 'broadcast';
  createdAt?: number | string;
  targetAudience?: 'all' | 'admin_only' | 'admin_and_guard' | 'marketer' | 'marketers' | 'guards' | 'all_staff';
  targetMarketerId?: string;
  targetMarketerIds?: string[];
  linkToBookingId?: string;
  propertyId?: string;
  targetGuardId?: string;
  broadcastId?: string;
  groupType?: BroadcastTargetGroup;
  groupName?: string;
  priority?: BroadcastPriority;
  category?: BroadcastCategory;
  effectiveDate?: string;
  requiresAcknowledgment?: boolean;
  acknowledgedBy?: string[];
  receiptUrl?: string;
  receiptName?: string;
  receiptType?: string;
}

export interface MessageTemplates {
  depositRequest: string;
  bookingConfirmation: string;
  paymentCompletion: string;
  contract: string;
  checkoutReminder: string;
  coordinatorService?: string;
  quickResponses?: Record<string, string>;
}

export interface ToastData {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'deposit_confirmed' | 'deposit_request' | 'commission' | 'permission' | 'checkout' | 'insurance' | 'system' | 'broadcast';
  targetAudienceText?: string;
  targetRole?: 'admin' | 'marketer' | 'guard' | 'all';
  receiptUrl?: string;
  receiptName?: string;
  linkToBookingId?: string;
  notificationId?: string;
}

export interface CoordinatorServiceItem {
  id: string;
  title: string;
  price: number;
  description: string;
  coordinatorId: string;
  coordinatorName: string;
  coordinatorPhone: string;
  category?: string;
  isActive?: boolean;
}

export interface CoordinatorPermissions {
  canViewCalendar: boolean;
  canViewAllBookings?: boolean;
  canViewCustomerContacts?: boolean;
}

export interface Coordinator {
  id: string;
  name: string;
  phone: string;
  email?: string;
  specialty: string;
  avatar: string;
  rating: number;
  completedTasks: number;
  status: 'available' | 'busy';
  bankName?: string;
  bankAccount?: string;
  nationalId?: string;
  permissions?: CoordinatorPermissions;
}

export interface CoordinationTask {
  id: string;
  bookingCode?: string;
  customerName: string;
  customerPhone: string;
  propertyName: string;
  date: string;
  serviceTitle: string;
  serviceDetails: string;
  coordinatorId: string;
  coordinatorName: string;
  coordinatorPhone: string;
  status: 'pending' | 'in_progress' | 'completed';
  price: number;
  notes?: string;
}
