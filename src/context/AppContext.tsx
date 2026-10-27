import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import {
  ActivityLog,
  AppNotification,
  Booking,
  CommissionRequest,
  DateOverride,
  Guard,
  GuardPermissions,
  CoordinatorPermissions,
  Marketer,
  MarketerPermissions,
  MessageTemplates,
  Property,
  PropertySection,
  ToastData,
  UserAccount,
  UserRole,
  AdminBroadcastMessage,
  BroadcastTargetGroup,
  BroadcastPriority,
  BroadcastCategory,
  SeasonalPricing,
  AdministrativeFees,
  PropertyBreakfastPricing,
  CoordinatorServiceItem,
} from '../types';
import { STORAGE_KEYS, StorageService } from '../lib/storage';
import {
  INITIAL_BOOKINGS,
  INITIAL_GUARD,
  INITIAL_GUARDS_LIST,
  INITIAL_LOGS,
  INITIAL_MARKETERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROPERTIES,
  INITIAL_TEMPLATES,
  INITIAL_USER_ACCOUNTS,
  INITIAL_ADMIN_BROADCASTS,
  INITIAL_COORDINATOR_SERVICES,
} from '../data/mock';
import {
  getBrowserNotificationPermission,
  playChimeSound,
  requestBrowserNotificationPermission,
  triggerSystemNotification,
} from '../lib/sound';
import {
  getSavedSpreadsheetInfo,
  appendBookingToSheet,
} from '../services/googleSheetsService';

export type ActiveTab = 'calendar' | 'bookings' | 'dashboard' | 'properties' | 'marketers' | 'more';
export type AuthModalMode = 'quick_select' | 'login' | 'change_password' | 'roles';

export interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  currentMarketerId: string;
  currentMarketer: Marketer | null;
  guard: Guard;
  isAdmin: boolean;
  isGuard: boolean;
  activePermissions: MarketerPermissions;
  switchUser: (role: UserRole, marketerId?: string) => void;
  updateGuardProfile: (data: Partial<Guard>) => void;
  updateGuardPermissions: (perms: Partial<GuardPermissions>) => void;
  toggleGuardPermission: (key: keyof GuardPermissions) => void;
  userAccounts: UserAccount[];
  currentUserAccount: UserAccount;
  loginWithGmailAndPassword: (email: string, pass: string) => { success: boolean; message: string };
  loginWithGoogleQuick: (accountId: string) => void;
  changePassword: (accountId: string, newPass: string) => { success: boolean; message: string };
  updateUserAccount: (accountId: string, data: Partial<UserAccount>) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: AuthModalMode;
  setAuthModalMode: (mode: AuthModalMode) => void;
  openAuthModal: (mode?: AuthModalMode) => void;

  canCreateContract: boolean;
  canEditDeposit: boolean;
  canViewCalendar: boolean;
  canViewProperties: boolean;
  canViewDashboard: boolean;
  canViewMarketers: boolean;
  canManageTemplates: boolean;
  canViewRentalContract: boolean;
  canViewActivityLogs: boolean;

  grantAllMarketersContractAndDepositPermissions: () => void;
  updateWaitingDepositAmount: (propertyId: string, dates: string[], amount: number) => void;

  properties: Property[];
  selectedPropertyId: string;
  selectedProperty: Property;
  setSelectedPropertyId: (id: string) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  updatePropertySection: (propertyId: string, sectionId: string, data: Partial<PropertySection>) => void;
  togglePropertyPublished: (propertyId: string) => void;
  guardsList: Guard[];
  updatePropertyGuard: (propertyId: string, guardData: { guardId?: string; guardName: string; guardPhone: string; guardNotes?: string }) => void;
  updatePropertyPhotos: (propertyId: string, photos: { coverImage?: string; images: string[] }) => void;
  deletePropertyPhoto: (propertyId: string, photoUrl: string) => void;
  addPropertyPhotos: (propertyId: string, newPhotoUrls: string[]) => void;
  setPropertyCoverPhoto: (propertyId: string, photoUrl: string) => void;
  switchGuardAssignedProperty: (propertyId: string) => void;
  updatePropertySeasonalPricing: (propertyId: string, seasonalPricing: SeasonalPricing) => void;
  updatePropertyBreakfastPrice: (propertyId: string, defaultBreakfastPrice: number) => void;
  updatePropertyBreakfastPricing: (propertyId: string, breakfastPricing: PropertyBreakfastPricing) => void;
  updatePropertyAdministrativeFees: (propertyId: string, administrativeFees: AdministrativeFees) => void;

  coordinatorServices: CoordinatorServiceItem[];
  addCoordinatorService: (service: Omit<CoordinatorServiceItem, 'id'>) => CoordinatorServiceItem;
  updateCoordinatorService: (id: string, updates: Partial<CoordinatorServiceItem>) => void;
  deleteCoordinatorService: (id: string) => void;

  marketers: Marketer[];
  updateMarketerPermissions: (id: string, perms: Partial<MarketerPermissions>) => void;
  updateMarketerProfile: (id: string, data: Partial<Marketer>) => void;
  addMarketer: (data: { name: string; email: string; phone: string; nationalId?: string; falLicenseNumber?: string; bankAccount?: string; bankName?: string }) => void;
  deleteMarketer: (marketerId: string) => { success: boolean; message: string };
  addAdminAccount: (data: { name: string; email: string; phone?: string }) => { success: boolean; message: string; password?: string };
  deleteUserAccount: (accountId: string) => { success: boolean; message: string };
  setMarketerAccountRole: (marketerId: string, role: UserRole) => { success: boolean; message: string };
  payMarketerCommission: (bookingId: string) => void;
  payoutAllMarketerCommissions: (marketerId: string) => void;

  bookings: Booking[];
  filteredBookings: Booking[];
  todayArrivals: Booking[];
  todayDepartures: Booking[];
  addBooking: (booking: Partial<Booking> & { propertyId: string; customerName: string; customerPhone: string; checkInDate: string; checkOutDate: string }) => Booking;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => void;
  sendCheckoutReminder: (bookingId: string) => { whatsappUrl: string; message: string };
  sendPaymentCompletionRequest: (bookingId: string) => { whatsappUrl: string; message: string };
  sendCoordinatorWhatsAppNotification: (bookingId: string) => { whatsappUrl: string; message: string; coordinatorName: string; coordinatorPhone: string } | null;
  markCheckedOut: (bookingId: string) => void;
  guardMarkArrived: (bookingId: string) => void;
  guardReceiveInsurance: (bookingId: string) => void;
  guardRequestInsuranceReturn: (bookingId: string) => void;
  returnInsuranceDeposit: (bookingId: string) => void;
  requestInsuranceRefundViaBank: (params: {
    bookingId: string;
    bankReceiptName?: string;
    bankReceiptDataUrl?: string;
    customerIban?: string;
    notes?: string;
  }) => void;
  requestInsuranceRefundViaGuardCash: (params: {
    bookingId: string;
    notes?: string;
  }) => void;
  finishBookingAndReturnInsurance: (params: {
    bookingId: string;
    receiptName?: string;
    receiptDataUrl?: string;
    notes?: string;
  }) => void;
  completeBookingPayment: (bookingId: string, receiptName: string, receiptDataUrl?: string) => void;
  recordCustomerArrival: (params: {
    bookingId: string;
    paymentMethod: 'receipt' | 'cash';
    receiptName?: string;
    receiptDataUrl?: string;
    notes?: string;
  }) => void;
  recordInsuranceReceived: (params: {
    bookingId: string;
    paymentMethod: 'receipt' | 'cash';
    receiptName?: string;
    receiptDataUrl?: string;
    notes?: string;
  }) => void;
  notifyGuardForCashPayment: (params: {
    bookingId: string;
    notes?: string;
  }) => void;
  guardProcessDeparture: (params: {
    bookingId: string;
    result: 'full_refund' | 'deduction';
    deductionAmount?: number;
    damageDescription?: string;
    damagePhotos?: { name: string; dataUrl: string }[];
    notes?: string;
  }) => void;
  confirmAttendanceByGuard: (bookingId: string) => void;
  confirmCashInsuranceByGuard: (params: string | {
    bookingId: string;
    receivedAmount?: number;
    notes?: string;
  }) => void;
  notifyGuardForCashInsurance: (params: {
    bookingId: string;
    insuranceAmount?: number;
    notes?: string;
  }) => void;
  uploadDigitalInsuranceReceipt: (params: {
    bookingId: string;
    receiptName: string;
    receiptDataUrl: string;
    notes?: string;
  }) => void;
  approveCleanlinessAndExit: (params: {
    bookingId: string;
    result: 'full_refund' | 'deduction';
    deductionAmount?: number;
    damageDescription?: string;
    damagePhotos?: { name: string; dataUrl: string }[];
    notes?: string;
  }) => void;
  toggleAdminCommissionApproval: (bookingId: string) => void;
  uploadRemainingPaymentReceipt: (params: {
    bookingId: string;
    receiptName: string;
    receiptDataUrl: string;
    notes?: string;
  }) => void;
  toggleGuestArrivalStatus: (bookingId: string) => { isArrived: boolean };

  dateOverrides: Record<string, DateOverride>;
  setDateOverride: (propertyId: string, date: string, override: Partial<DateOverride>, sectionId?: string) => void;
  setDateOverridesBulk: (propertyId: string, dates: string[], override: Partial<DateOverride>, sectionId?: string) => void;
  applySeasonalPricingPattern: (propertyId: string, dates: string[], season: keyof Property['seasonalPricing'], sectionId?: string) => void;

  requestDeposit: (params: {
    propertyId: string;
    dates: string[];
    customerName: string;
    customerPhone: string;
    depositAmount: number;
    totalPrice: number;
    nightsCount: number;
    marketerId?: string;
    commissionRatePercent?: number;
    sectionName?: string;
    breakfastOption?: string;
    breakfastPrice?: number;
    coordinatorName?: string;
    coordinatorService?: string;
    coordinatorPrice?: number;
    baseNightlyTotal?: number;
  }) => { whatsappUrl: string; message: string };
  cancelDepositWait: (propertyId: string, dates: string[]) => void;
  confirmBookingWithReceipt: (params: {
    propertyId: string;
    dates: string[];
    customerName: string;
    customerPhone: string;
    depositPaid: number;
    totalPrice: number;
    remainingAmount: number;
    insuranceAmount: number;
    receiptFileName: string;
    receiptDataUrl?: string;
    marketerId?: string;
    commissionRatePercent?: number;
    notes?: string;
    sectionId?: string;
    sectionName?: string;
    breakfastOption?: string;
    breakfastPrice?: number;
    coordinatorName?: string;
    coordinatorService?: string;
    coordinatorPrice?: number;
    baseNightlyTotal?: number;
  }) => { booking: Booking; whatsappContractUrl: string; contractText: string };

  notifications: AppNotification[];
  filteredNotifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;

  commissionRequests: CommissionRequest[];
  getEligibleCommissionBookings: (marketerId: string, fromDate: string, toDate: string) => Booking[];
  createCommissionRequest: (params: { fromDate: string; toDate: string }) => { ok: boolean; message: string };
  markCommissionTransferred: (requestId: string, receiptFileName?: string, receiptDataUrl?: string) => void;
  rejectCommissionRequest: (requestId: string, note?: string) => void;
  markCommissionRequestSeen: (requestId: string) => void;

  activityLogs: ActivityLog[];
  logActivity: (actorName: string, actorRole: string, action: string, details: string) => void;

  bookingModalOpen: boolean;
  setBookingModalOpen: (open: boolean) => void;
  preselectedDateForBooking: string | null;
  setPreselectedDateForBooking: (date: string | null) => void;
  preselectedSectionForBooking: string | null;
  setPreselectedSectionForBooking: (sectionId: string | null) => void;

  messageTemplates: MessageTemplates;
  updateMessageTemplates: (templates: Partial<MessageTemplates>) => void;
  resetMessageTemplates: () => void;
  templatesModalOpen: boolean;
  setTemplatesModalOpen: (open: boolean) => void;
  activeTemplateTab: keyof MessageTemplates;
  openTemplatesModal: (tab?: keyof MessageTemplates) => void;

  resetAllData: () => void;
  nowTimestamp: number;

  browserNotificationPermission: NotificationPermission | 'unsupported';
  requestBrowserNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  activeToast: ToastData | null;
  dismissToast: () => void;
  triggerBrowserNotification: (title: string, body: string, type?: ToastData['type']) => void;
  sendTestNotification: () => void;

  adminBroadcasts: AdminBroadcastMessage[];
  sendAdminBroadcast: (params: {
    title: string;
    content: string;
    targetGroup: BroadcastTargetGroup;
    targetGroupName?: string;
    targetPropertyId?: string;
    targetPropertyName?: string;
    targetGuardId?: string;
    targetMarketerIds?: string[];
    priority: BroadcastPriority;
    category: BroadcastCategory;
    effectiveDate?: string;
    sendWhatsapp?: boolean;
  }) => { ok: boolean; message: string; broadcastId: string; whatsappUrl?: string };
  deleteAdminBroadcast: (broadcastId: string) => void;
  acknowledgeBroadcast: (broadcastId: string) => void;
  adminBroadcastModalOpen: boolean;
  setAdminBroadcastModalOpen: (open: boolean) => void;
  activeUrgentBroadcast: AdminBroadcastMessage | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const fillTemplate = (template: string, vars: Record<string, string | number | undefined>): string => {
  let result = template;
  Object.entries(vars).forEach(([k, v]) => {
    const regex = new RegExp(`{\\s*${k}\\s*}`, 'g');
    result = result.replace(regex, String(v ?? ''));
  });
  return result;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [userRole, setUserRole] = useState<UserRole>(() =>
    StorageService.getString(STORAGE_KEYS.USER_ROLE, 'admin') as UserRole
  );
  const [currentMarketerId, setCurrentMarketerId] = useState<string>(() =>
    StorageService.getString(STORAGE_KEYS.MARKETER_ID, 'm1')
  );

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = StorageService.get<UserAccount[]>(STORAGE_KEYS.USER_ACCOUNTS, INITIAL_USER_ACCOUNTS);
    // Remove deprecated admin.amasa@gmail.com user
    const filtered = (Array.isArray(saved) ? saved : INITIAL_USER_ACCOUNTS).filter(
      (acc) => acc.email !== 'admin.amasa@gmail.com' && acc.id !== 'admin'
    );
    const list = [...filtered];
    INITIAL_USER_ACCOUNTS.forEach((acc) => {
      if (!list.some((it) => it.id === acc.id || it.email === acc.email)) list.push(acc);
    });
    StorageService.set(STORAGE_KEYS.USER_ACCOUNTS, list);
    return list;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('quick_select');

  const [guard, setGuard] = useState<Guard>(() => {
    const saved = StorageService.get<Guard>(STORAGE_KEYS.GUARD, INITIAL_GUARD);
    if (!saved.assignedPropertyId) {
      return { ...saved, assignedPropertyId: 'al-taraf', assignedPropertyName: 'الترف' };
    }
    return saved;
  });

  const [guardsList, setGuardsList] = useState<Guard[]>(() =>
    StorageService.get<Guard[]>(STORAGE_KEYS.GUARDS_LIST, INITIAL_GUARDS_LIST)
  );

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = StorageService.get<Property[]>(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
    const hasOldAlmaNaya = saved.some((p) => p.id === 'alma' || p.id === 'naya');
    const hamranSaved = saved.find((p) => p.id === 'hamran');
    const hamranHasBothUnits = hamranSaved?.sections && hamranSaved.sections.some((s) => s.id === 'hamran-alma');

    if (hasOldAlmaNaya || !hamranHasBothUnits) {
      StorageService.set(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
      return INITIAL_PROPERTIES;
    }

    return saved.map((prop) => {
      const init = INITIAL_PROPERTIES.find((p) => p.id === prop.id);
      let updated = { ...prop };
      if (!updated.assignedGuardName && init?.assignedGuardName) {
        updated.assignedGuardId = init.assignedGuardId;
        updated.assignedGuardName = init.assignedGuardName;
        updated.assignedGuardPhone = init.assignedGuardPhone;
        updated.assignedGuardNotes = init.assignedGuardNotes;
      }
      if (!updated.defaultBreakfastPrice) {
        updated.defaultBreakfastPrice = init?.defaultBreakfastPrice || 150;
      }
      if (init?.sections) {
        if (!prop.sections || prop.sections.length === 0 || prop.id === 'al-taraf' || prop.id === 'hamran') {
          updated = { ...updated, sections: init.sections, subUnitsCount: init.subUnitsCount, subtitle: init.subtitle };
        }
      }
      return updated;
    });
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(() => {
    const savedId = StorageService.getString(STORAGE_KEYS.SELECTED_PROPERTY, 'al-taraf');
    if (savedId === 'alma' || savedId === 'naya') {
      StorageService.set(STORAGE_KEYS.SELECTED_PROPERTY, 'hamran');
      return 'hamran';
    }
    return savedId;
  });

  const [marketers, setMarketers] = useState<Marketer[]>(() =>
    StorageService.get<Marketer[]>(STORAGE_KEYS.MARKETERS, INITIAL_MARKETERS)
  );

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = StorageService.get<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    let migrated = false;
    const mapped = saved.map((b) => {
      if (b.propertyId === 'alma') {
        migrated = true;
        return {
          ...b,
          propertyId: 'hamran',
          propertyName: 'حمران',
          sectionId: 'hamran-alma',
          sectionName: 'وحدة الما',
        };
      }
      if (b.propertyId === 'naya') {
        migrated = true;
        return {
          ...b,
          propertyId: 'hamran',
          propertyName: 'حمران',
          sectionId: 'hamran-naya',
          sectionName: 'وحدة نايا',
        };
      }
      return b;
    });

    // Strictly deduplicate by id so no two bookings can ever have the same ID
    const seenIds = new Set<string>();
    const deduplicatedResult: Booking[] = [];
    for (const b of mapped) {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        deduplicatedResult.push(b);
      } else {
        migrated = true;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const todaySampleIds = ['bk-today-in', 'bk-today-hamran', 'bk-today-hamran-alma'];
    todaySampleIds.forEach((sid) => {
      const existing = deduplicatedResult.find((b) => b.id === sid);
      if (existing) {
        if (existing.checkInDate !== todayStr) {
          existing.checkInDate = todayStr;
          existing.checkOutDate = tomorrowStr;
          migrated = true;
        }
      } else {
        const sample = INITIAL_BOOKINGS.find((b) => b.id === sid);
        if (sample) {
          deduplicatedResult.unshift({
            ...sample,
            checkInDate: todayStr,
            checkOutDate: tomorrowStr,
          });
          migrated = true;
        }
      }
    });

    if (migrated) {
      StorageService.set(STORAGE_KEYS.BOOKINGS, deduplicatedResult);
    }
    return deduplicatedResult;
  });

  const [dateOverrides, setDateOverrides] = useState<Record<string, DateOverride>>(() =>
    StorageService.get<Record<string, DateOverride>>(STORAGE_KEYS.OVERRIDES, {})
  );

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    StorageService.get<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS)
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    StorageService.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  const [commissionRequests, setCommissionRequests] = useState<CommissionRequest[]>(() =>
    StorageService.get<CommissionRequest[]>(STORAGE_KEYS.COMMISSION_REQUESTS, [])
  );

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedDateForBooking, setPreselectedDateForBooking] = useState<string | null>(null);
  const [preselectedSectionForBooking, setPreselectedSectionForBooking] = useState<string | null>(null);

  const [messageTemplates, setMessageTemplates] = useState<MessageTemplates>(() =>
    StorageService.get<MessageTemplates>(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES)
  );

  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<keyof MessageTemplates>('depositRequest');

  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getBrowserNotificationPermission()
  );

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return val !== null ? val === 'true' : true;
  });

  const [activeToast, setActiveToast] = useState<ToastData | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  const [adminBroadcasts, setAdminBroadcasts] = useState<AdminBroadcastMessage[]>(() =>
    StorageService.get<AdminBroadcastMessage[]>(STORAGE_KEYS.ADMIN_BROADCASTS, INITIAL_ADMIN_BROADCASTS)
  );

  const [acknowledgedBroadcastIds, setAcknowledgedBroadcastIds] = useState<string[]>(() =>
    StorageService.get<string[]>(STORAGE_KEYS.ACKNOWLEDGED_BROADCASTS, [])
  );

  const [adminBroadcastModalOpen, setAdminBroadcastModalOpen] = useState(false);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.ADMIN_BROADCASTS, adminBroadcasts);
  }, [adminBroadcasts]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.ACKNOWLEDGED_BROADCASTS, acknowledgedBroadcastIds);
  }, [acknowledgedBroadcastIds]);

  const [coordinatorServices, setCoordinatorServices] = useState<CoordinatorServiceItem[]>(() =>
    StorageService.get<CoordinatorServiceItem[]>(STORAGE_KEYS.COORDINATOR_SERVICES, INITIAL_COORDINATOR_SERVICES)
  );

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.COORDINATOR_SERVICES, coordinatorServices);
  }, [coordinatorServices]);

  // Keep nowTimestamp updated every 1s for the 15-minute countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save states to StorageService
  useEffect(() => {
    StorageService.set(STORAGE_KEYS.USER_ROLE, userRole);
    StorageService.set(STORAGE_KEYS.MARKETER_ID, currentMarketerId);
  }, [userRole, currentMarketerId]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.GUARD, guard);
  }, [guard]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.GUARDS_LIST, guardsList);
  }, [guardsList]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.PROPERTIES, properties);
  }, [properties]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.SELECTED_PROPERTY, selectedPropertyId);
  }, [selectedPropertyId]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.MARKETERS, marketers);
  }, [marketers]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.BOOKINGS, bookings);
  }, [bookings]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.OVERRIDES, dateOverrides);
  }, [dateOverrides]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.LOGS, activityLogs);
  }, [activityLogs]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.USER_ACCOUNTS, userAccounts);
  }, [userAccounts]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.COMMISSION_REQUESTS, commissionRequests);
  }, [commissionRequests]);

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.TEMPLATES, messageTemplates);
  }, [messageTemplates]);

  const logActivity = useCallback((actorName: string, actorRole: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleString('ar-SA', { hour12: false }),
      actorName,
      actorRole,
      action,
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, []);

  // Check expiration of 15-minute deposit holds
  useEffect(() => {
    let hasChanges = false;
    const updated = { ...dateOverrides };

    Object.entries(dateOverrides).forEach(([key, override]) => {
      if (
        override.status === 'waiting_deposit' &&
        override.waitingDepositExpiresAt &&
        override.waitingDepositExpiresAt <= nowTimestamp
      ) {
        hasChanges = true;
        updated[key] = {
          ...override,
          status: 'available',
          waitingDepositExpiresAt: undefined,
          waitingCustomerName: undefined,
          waitingCustomerPhone: undefined,
          waitingDepositAmount: undefined,
        };

        const [propId, dateKey] = key.split('_');
        const propName = properties.find((p) => p.id === propId)?.name || propId;

        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}-${Math.random()}`,
            title: 'انتهت مهلة تحويل العربون (15 دقيقة)',
            description: `انتهى عداد مهلة العربون لعقار ${propName} في تاريخ ${dateKey}، وعاد اليوم متاحاً للحجز تلقائياً (اللون الأخضر).`,
            timestamp: 'الآن',
            read: false,
            type: 'deposit_expired',
            targetAudience: 'all',
          },
          ...prev,
        ]);

        logActivity(
          'النظام التلقائي',
          'system',
          'انتهاء مهلة العربون',
          `انتهت مهلة الـ 15 دقيقة لتحويل العربون لعقار ${propName} في تاريخ ${dateKey}، وعاد التاريخ متاحاً.`
        );
      }
    });

    if (hasChanges) {
      setDateOverrides(updated);
    }
  }, [nowTimestamp, dateOverrides, properties, logActivity]);

  const isAdmin = userRole === 'admin';
  const isGuard = userRole === 'guard';

  const currentMarketer = useMemo(() => {
    return marketers.find((m) => m.id === currentMarketerId) || marketers[0] || null;
  }, [marketers, currentMarketerId]);

  const activePermissions = useMemo<MarketerPermissions>(() => {
    if (isAdmin) {
      return {
        canCreateBooking: true,
        canEditPrices: true,
        canViewAllBookings: true,
        canBlockDates: true,
        canViewCustomerContacts: true,
        canExportReports: true,
        canViewFinancials: true,
        canCreateContract: true,
        canEditDeposit: true,
        canViewCalendar: true,
        canViewProperties: true,
        canViewDashboard: true,
        canViewMarketers: true,
        canManageTemplates: true,
        canViewRentalContract: true,
        canViewActivityLogs: true,
      };
    }
    if (isGuard) {
      const gPerms = guard.permissions || {
        canViewCalendar: false,
        canViewCustomerContacts: true,
        canConfirmArrival: true,
        canReceiveInsurance: true,
        canInspectUnit: true,
        canRefundInsurance: true,
        canViewDashboard: true,
        canViewBookings: true,
        canBlockDates: false,
      };
      return {
        canCreateBooking: false,
        canEditPrices: false,
        canViewAllBookings: false,
        canBlockDates: !!gPerms.canBlockDates,
        canViewCustomerContacts: gPerms.canViewCustomerContacts !== false,
        canExportReports: false,
        canViewFinancials: false,
        canCreateContract: false,
        canEditDeposit: false,
        canViewCalendar: !!gPerms.canViewCalendar,
        canViewProperties: false,
        canViewDashboard: gPerms.canViewDashboard !== false,
        canViewMarketers: false,
        canManageTemplates: false,
        canViewRentalContract: false,
        canViewActivityLogs: false,
      };
    }
    return (
      currentMarketer?.permissions || {
        canCreateBooking: true,
        canEditPrices: false,
        canViewAllBookings: false,
        canBlockDates: false,
        canViewCustomerContacts: true,
        canExportReports: false,
        canViewFinancials: false,
        canCreateContract: true,
        canEditDeposit: true,
        canViewCalendar: true,
        canViewProperties: true,
        canViewDashboard: true,
        canViewMarketers: true,
        canManageTemplates: true,
        canViewRentalContract: true,
        canViewActivityLogs: true,
      }
    );
  }, [isAdmin, isGuard, currentMarketer, guard.permissions]);

  const canCreateContract = isAdmin || !!activePermissions.canCreateContract;
  const canEditDeposit = isAdmin || !!activePermissions.canEditDeposit;
  const canViewCalendar = isAdmin || (isGuard ? !!guard.permissions?.canViewCalendar : activePermissions.canViewCalendar !== false);
  const canViewProperties = isAdmin || activePermissions.canViewProperties !== false;
  const canViewDashboard = isAdmin || activePermissions.canViewDashboard !== false;
  const canViewMarketers = isAdmin || activePermissions.canViewMarketers !== false;
  const canManageTemplates = isAdmin || activePermissions.canManageTemplates !== false;
  const canViewRentalContract = isAdmin || activePermissions.canViewRentalContract !== false;
  const canViewActivityLogs = isAdmin || activePermissions.canViewActivityLogs !== false;

  const currentUserAccount = useMemo(() => {
    if (isAdmin) {
      return (
        userAccounts.find((a) => a.role === 'admin' && a.email === 'sakt2008@gmail.com') ||
        userAccounts.find((a) => a.role === 'admin') ||
        INITIAL_USER_ACCOUNTS[0]
      );
    }
    if (isGuard) {
      return userAccounts.find((a) => a.role === 'guard') || INITIAL_USER_ACCOUNTS[1];
    }
    return (
      userAccounts.find((a) => a.marketerId === currentMarketerId) ||
      userAccounts.find((a) => a.id === currentMarketerId) ||
      userAccounts.find((a) => a.role === 'marketer') ||
      INITIAL_USER_ACCOUNTS[2]
    );
  }, [userAccounts, isAdmin, isGuard, currentMarketerId]);

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || properties[0];
  }, [properties, selectedPropertyId]);

  const filteredBookings = useMemo(() => {
    const list = (isAdmin || activePermissions.canViewAllBookings)
      ? bookings
      : bookings.filter((b) => b.marketerId === currentMarketerId);
    const seen = new Set<string>();
    return list.filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [bookings, isAdmin, activePermissions.canViewAllBookings, currentMarketerId]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayArrivals = useMemo(() => {
    const list = bookings.filter(
      (b) =>
        (b.checkInDate === todayStr ||
          b.id === 'bk-today-in' ||
          b.id === 'bk-today-hamran' ||
          b.id === 'bk-today-hamran-alma' ||
          b.checkInDate === '2026-10-06') &&
        b.status !== 'cancelled'
    );
    const seen = new Set<string>();
    return list.filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [bookings, todayStr]);

  const todayDepartures = useMemo(() => {
    const list = bookings.filter(
      (b) =>
        (b.checkOutDate === todayStr || b.id === 'bk-today-out' || b.checkOutDate === '2026-10-06') &&
        b.status !== 'cancelled'
    );
    const seen = new Set<string>();
    return list.filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [bookings, todayStr]);

  // Notifications filtering strictly by targetAudience, groupType, and role
  const filteredNotifications = useMemo(() => {
    if (isAdmin) {
      return notifications;
    }
    if (isGuard) {
      return notifications.filter((n) => {
        if (
          n.targetAudience === 'admin_only' ||
          n.targetAudience === 'marketer' ||
          n.targetAudience === 'marketers' ||
          n.groupType === 'all_marketers' ||
          n.groupType === 'female_marketers'
        ) {
          return false;
        }

        // Broadcast directly to all guards
        if (n.targetAudience === 'guards' || n.groupType === 'all_guards') {
          return true;
        }

        // Broadcast to a specific guard by ID
        if (n.targetGuardId) {
          return n.targetGuardId === guard.id;
        }

        const guardPropId = guard.assignedPropertyId;
        // If the notification is bound to a property
        if (n.propertyId) {
          return guardPropId ? n.propertyId === guardPropId : false;
        }
        if (n.linkToBookingId) {
          const bk = bookings.find((b) => b.id === n.linkToBookingId);
          if (bk?.propertyId) {
            return guardPropId ? bk.propertyId === guardPropId : false;
          }
        }

        // General notifications without a specific property binding
        return n.targetAudience === 'all' || n.targetAudience === 'admin_and_guard';
      });
    }

    // Marketer
    const femaleNames = ['سارة', 'ريم', 'نورة', 'منيرة', 'هند', 'مها', 'عبير', 'خلود', 'فاطمة', 'عائشة', 'لطيفة', 'أمل', 'شهد'];
    const currentMkt = marketers.find((m) => m.id === currentMarketerId);
    const isFemaleMarketer = currentMkt
      ? femaleNames.some((fn) => currentMkt.name.includes(fn)) ||
        currentMkt.id === 'm2' ||
        currentMkt.id === 'm4' ||
        currentMkt.id === 'm5'
      : false;

    return notifications.filter((n) => {
      if (
        n.targetAudience === 'admin_only' ||
        n.targetAudience === 'admin_and_guard' ||
        n.targetAudience === 'guards' ||
        n.groupType === 'all_guards' ||
        n.groupType === 'specific_guard'
      ) {
        return false;
      }

      // Check female marketers group
      if (n.groupType === 'female_marketers') {
        return isFemaleMarketer;
      }

      // Check custom marketer IDs list
      if (n.targetMarketerIds && n.targetMarketerIds.length > 0) {
        return n.targetMarketerIds.includes(currentMarketerId);
      }

      if (n.targetMarketerId && n.targetMarketerId !== currentMarketerId) {
        return false;
      }

      return true;
    });
  }, [notifications, isAdmin, isGuard, currentMarketerId, guard.assignedPropertyId, guard.id, bookings, marketers]);

  // Active urgent broadcast calculation for high-visibility banner
  const activeUrgentBroadcast = useMemo(() => {
    const urgentList = adminBroadcasts.filter(
      (b) => b.priority === 'urgent' && !acknowledgedBroadcastIds.includes(b.id)
    );
    if (urgentList.length === 0) return null;

    if (isAdmin) {
      return urgentList[0];
    }

    if (isGuard) {
      const guardPropId = guard.assignedPropertyId;
      return (
        urgentList.find((b) => {
          if (b.targetGroup === 'all') return true;
          if (b.targetGroup === 'all_guards') return true;
          if (b.targetGroup === 'specific_guard') {
            return (
              (b.targetGuardId && b.targetGuardId === guard.id) ||
              (b.targetPropertyId && b.targetPropertyId === guardPropId)
            );
          }
          return false;
        }) || null
      );
    }

    // Marketer
    const femaleNames = ['سارة', 'ريم', 'نورة', 'منيرة', 'هند', 'مها', 'عبير', 'خلود', 'فاطمة', 'عائشة', 'لطيفة', 'أمل', 'شهد'];
    const currentMkt = marketers.find((m) => m.id === currentMarketerId);
    const isFemale = currentMkt
      ? femaleNames.some((fn) => currentMkt.name.includes(fn)) ||
        currentMkt.id === 'm2' ||
        currentMkt.id === 'm4' ||
        currentMkt.id === 'm5'
      : false;

    return (
      urgentList.find((b) => {
        if (b.targetGroup === 'all') return true;
        if (b.targetGroup === 'all_marketers') return true;
        if (b.targetGroup === 'female_marketers') return isFemale;
        if (b.targetGroup === 'custom' && b.targetMarketerIds) {
          return b.targetMarketerIds.includes(currentMarketerId);
        }
        return false;
      }) || null
    );
  }, [adminBroadcasts, acknowledgedBroadcastIds, isAdmin, isGuard, guard.assignedPropertyId, guard.id, currentMarketerId, marketers]);

  const unreadNotificationsCount = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read).length;
  }, [filteredNotifications]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(next));
      if (next) playChimeSound(true);
      return next;
    });
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const triggerBrowserNotification = useCallback(
    (title: string, body: string, type: ToastData['type'] = 'booking') => {
      setActiveToast({
        id: `toast-${Date.now()}-${Math.random()}`,
        title,
        body,
        type,
      });
      if (isSoundEnabled) {
        playChimeSound(true);
      }
      triggerSystemNotification(title, {
        body,
        playSound: false,
        tag: `amasa-booking-${Date.now()}`,
      });
    },
    [isSoundEnabled]
  );

  const sendTestNotification = useCallback(() => {
    triggerBrowserNotification(
      '🔔 تجربة نظام تنبيهات المتصفح (Web Notification)',
      'هذا تنبيه تجريبي لتأكيد وصول إشعارات الحجوزات ودفع العربون فوراً للموظفين مع نغمة التنبيه الموسيقية!',
      'deposit_confirmed'
    );
  }, [triggerBrowserNotification]);

  const switchUser = useCallback(
    (role: UserRole, marketerId?: string) => {
      setUserRole(role);
      if (marketerId) {
        setCurrentMarketerId(marketerId);
      }
      const roleName =
        role === 'admin'
          ? 'الإدارة (المدير العام)'
          : role === 'guard'
          ? guard.name
          : marketers.find((m) => m.id === marketerId)?.name || 'مسوق';

      logActivity(
        roleName,
        role,
        'تبديل الحساب',
        `تم تسجيل الدخول بصلاحية: ${role === 'admin' ? 'الإدارة' : role === 'guard' ? 'الحارس' : 'مسوق'}`
      );
    },
    [guard.name, marketers, logActivity]
  );

  const updateGuardProfile = useCallback(
    (data: Partial<Guard>) => {
      if (!isAdmin) return;
      setGuard((prev) => ({ ...prev, ...data }));
      logActivity('الإدارة', 'admin', 'تحديث بيانات الحارس', `تم تحديث بيانات الحارس ${data.name || guard.name}`);
    },
    [isAdmin, guard.name, logActivity]
  );

  const updateGuardPermissions = useCallback(
    (perms: Partial<GuardPermissions>) => {
      if (!isAdmin) return;
      setGuard((prev) => {
        const currentPerms = prev.permissions || {
          canViewCalendar: false,
          canViewCustomerContacts: true,
          canConfirmArrival: true,
          canReceiveInsurance: true,
          canInspectUnit: true,
          canRefundInsurance: true,
          canViewDashboard: true,
          canViewBookings: true,
          canBlockDates: false,
        };
        const next = {
          ...prev,
          permissions: {
            ...currentPerms,
            ...perms,
          },
        };
        return next;
      });
      logActivity(
        'الإدارة',
        'admin',
        'تعديل مصفوفة صلاحيات الحارس',
        `تم تحديث صلاحيات الحارس الميداني ${guard.name}`
      );
    },
    [isAdmin, guard.name, logActivity]
  );

  const toggleGuardPermission = useCallback(
    (key: keyof GuardPermissions) => {
      if (!isAdmin) return;
      setGuard((prev) => {
        const currentPerms = prev.permissions || {
          canViewCalendar: false,
          canViewCustomerContacts: true,
          canConfirmArrival: true,
          canReceiveInsurance: true,
          canInspectUnit: true,
          canRefundInsurance: true,
          canViewDashboard: true,
          canViewBookings: true,
          canBlockDates: false,
        };
        const currentVal = currentPerms[key];
        const nextVal = currentVal === undefined ? false : !currentVal;
        const next = {
          ...prev,
          permissions: {
            ...currentPerms,
            [key]: nextVal,
          },
        };
        return next;
      });
      logActivity(
        'الإدارة',
        'admin',
        'تعديل صلاحية الحارس',
        `تم تبديل صلاحية (${key}) للحارس ${guard.name}`
      );
    },
    [isAdmin, guard.name, logActivity]
  );

  const loginWithGmailAndPassword = useCallback(
    (email: string, pass: string) => {
      const target = email.trim().toLowerCase();
      const account = userAccounts.find((u) => u.email.trim().toLowerCase() === target);
      if (!account) {
        return {
          success: false,
          message: 'البريد الإلكتروني غير مسجل في النظام. تأكد من إدخال بريد Gmail الصحيح.',
        };
      }
      if (account.password && account.password !== pass) {
        return {
          success: false,
          message: 'كلمة المرور غير صحيحة. يمكنك إنشاء كلمة سر جديدة أو استعادتها.',
        };
      }
      setUserRole(account.role);
      if (account.marketerId) {
        setCurrentMarketerId(account.marketerId);
      }
      logActivity(
        account.name,
        account.role,
        'تسجيل الدخول عبر Gmail',
        `تم تسجيل الدخول بنجاح عبر بريد Gmail (${account.email}) بصلاحية: ${
          account.role === 'admin' ? 'الإدارة' : account.role === 'guard' ? 'الحارس' : 'مسوق'
        }`
      );
      triggerBrowserNotification(
        '👋 مرحباً بك في AMASA',
        `تم تسجيل الدخول بنجاح بحساب (${account.name})`,
        'system'
      );
      return {
        success: true,
        message: `مرحباً بك ${account.name}، تم تسجيل الدخول بنجاح!`,
      };
    },
    [userAccounts, logActivity, triggerBrowserNotification]
  );

  const loginWithGoogleQuick = useCallback(
    (accountId: string) => {
      const account = userAccounts.find((u) => u.id === accountId);
      if (account) {
        setUserRole(account.role);
        if (account.marketerId) {
          setCurrentMarketerId(account.marketerId);
        }
        logActivity(account.name, account.role, 'دخول سريع عبر Google', `تم تسجيل الدخول السريع بحساب (${account.email})`);
        triggerBrowserNotification('👋 مرحباً بك في AMASA', `تم تسجيل الدخول بحساب (${account.name})`, 'system');
      }
    },
    [userAccounts, logActivity, triggerBrowserNotification]
  );

  const changePassword = useCallback(
    (accountId: string, newPass: string) => {
      if (!newPass || newPass.trim().length < 2) {
        return { success: false, message: 'يرجى كتابة كلمة مرور صالحة (مكونة من خانتين على الأقل).' };
      }
      let accName = '';
      const emailLower = accountId.trim().toLowerCase();

      setUserAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === accountId || acc.email.trim().toLowerCase() === emailLower) {
            accName = acc.name;
            return { ...acc, password: newPass, updatedAt: new Date().toISOString() };
          }
          return acc;
        })
      );

      setMarketers((prev) =>
        prev.map((m) => {
          if (m.id === accountId || m.email.trim().toLowerCase() === emailLower) {
            return { ...m, password: newPass };
          }
          return m;
        })
      );

      if (guard.id === accountId || guard.email.trim().toLowerCase() === emailLower) {
        setGuard((prev) => ({ ...prev, password: newPass }));
      }

      logActivity(accName || 'المستخدم', userRole, 'تحديث كلمة المرور', `تم تعيين كلمة مرور جديدة ومخصصة للحساب: ${accName || emailLower}`);
      triggerBrowserNotification('🔑 تحديث كلمة المرور', `تم حفظ وتعيين كلمة المرور الجديدة للحساب (${accName || emailLower}) بنجاح!`, 'system');
      return { success: true, message: `تم تحديث كلمة المرور للحساب ${accName || emailLower} بنجاح!` };
    },
    [guard.id, guard.email, userRole, logActivity, triggerBrowserNotification]
  );

  const updateUserAccount = useCallback((accountId: string, data: Partial<UserAccount>) => {
    setUserAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, ...data, updatedAt: new Date().toISOString() } : acc))
    );
  }, []);

  const logout = useCallback(() => {
    setUserRole('admin');
    setIsAuthModalOpen(true);
    setAuthModalMode('login');
    logActivity('المستخدم', 'admin', 'تسجيل الخروج', 'تم تسجيل الخروج من الحساب');
  }, [logActivity]);

  const openAuthModal = useCallback((mode: AuthModalMode = 'quick_select') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const grantAllMarketersContractAndDepositPermissions = useCallback(() => {
    setMarketers((prev) =>
      prev.map((m) => ({
        ...m,
        permissions: {
          ...m.permissions,
          canCreateContract: true,
          canEditDeposit: true,
        },
      }))
    );
    logActivity(
      'الإدارة',
      'admin',
      'تفعيل صلاحيات العقود والعربون',
      'تم منح وتفعيل صلاحيات إنشاء العقد وتعديل العربون لجميع الموظفين والمسوقين'
    );
    triggerBrowserNotification(
      '📜 صلاحيات الموظفين المحدثة',
      'تم منح وتفعيل صلاحيات إنشاء العقود وتعديل العربون لجميع الموظفين بنجاح',
      'permission'
    );
  }, [logActivity, triggerBrowserNotification]);

  const updateWaitingDepositAmount = useCallback(
    (propertyId: string, dates: string[], amount: number) => {
      setDateOverrides((prev) => {
        const next = { ...prev };
        dates.forEach((d) => {
          const k = `${propertyId}_${d}`;
          if (next[k]) {
            next[k] = { ...next[k], waitingDepositAmount: amount };
          }
        });
        return next;
      });

      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'موظف',
        userRole,
        'تعديل مبلغ العربون قبل التأكيد',
        `تم تعديل مبلغ العربون المطلوب إلى ${amount} ريال للتواريخ المعلقة (${dates.join(', ')})`
      );

      triggerBrowserNotification(
        '✏️ تم تعديل مبلغ العربون',
        `تم تحديث مبلغ العربون إلى ${amount} ريال قبل تأكيد الحجز`,
        'deposit_request'
      );
    },
    [isAdmin, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const updateProperty = useCallback(
    (id: string, data: Partial<Property>) => {
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      logActivity(isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق', userRole, 'تحديث بيانات عقار', `تم تحديث تفاصيل العقار: ${properties.find((p) => p.id === id)?.name || id}`);
    },
    [isAdmin, currentMarketer?.name, userRole, properties, logActivity]
  );

  const updatePropertyGuard = useCallback(
    (propertyId: string, guardData: { guardId?: string; guardName: string; guardPhone: string; guardNotes?: string }) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? {
                ...p,
                assignedGuardId: guardData.guardId || p.assignedGuardId,
                assignedGuardName: guardData.guardName,
                assignedGuardPhone: guardData.guardPhone,
                assignedGuardNotes: guardData.guardNotes,
              }
            : p
        )
      );

      // If current guard matches or is assigned to this property, sync active guard state
      setGuard((prev) => {
        if (prev.assignedPropertyId === propertyId || (guardData.guardId && prev.id === guardData.guardId)) {
          return {
            ...prev,
            name: guardData.guardName,
            phone: guardData.guardPhone,
            assignedPropertyId: propertyId,
            assignedPropertyName: propObj?.name || prev.assignedPropertyName,
          };
        }
        return prev;
      });

      // Also update in guardsList
      setGuardsList((prev) =>
        prev.map((g) => {
          if (g.assignedPropertyId === propertyId || (guardData.guardId && g.id === guardData.guardId)) {
            return {
              ...g,
              name: guardData.guardName,
              phone: guardData.guardPhone,
              assignedPropertyId: propertyId,
              assignedPropertyName: propObj?.name || g.assignedPropertyName,
            };
          }
          return g;
        })
      );

      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعيين حارس للعقار',
        `تم تعيين الحارس (${guardData.guardName} - جوال: ${guardData.guardPhone}) مسؤولاً عن عقار ${propObj?.name || propertyId} واستلام إشعاراته حصرياً`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const updatePropertyPhotos = useCallback(
    (propertyId: string, photos: { coverImage?: string; images: string[] }) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          const nextImages = photos.images.length > 0 ? photos.images : p.images;
          const nextCover = photos.coverImage || (nextImages.length > 0 ? nextImages[0] : p.coverImage);
          return {
            ...p,
            images: nextImages,
            coverImage: nextCover,
          };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعديل صور العقار',
        `تم تحديث ألبوم صور عقار ${propObj?.name || propertyId} (إجمالي: ${photos.images.length} صورة)`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const deletePropertyPhoto = useCallback(
    (propertyId: string, photoUrl: string) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          const filtered = p.images.filter((img) => img !== photoUrl);
          const nextCover = p.coverImage === photoUrl ? (filtered[0] || '') : p.coverImage;
          return {
            ...p,
            images: filtered,
            coverImage: nextCover,
          };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'حذف صورة من العقار',
        `تم حذف صورة من ألبوم عقار ${propObj?.name || propertyId}`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const addPropertyPhotos = useCallback(
    (propertyId: string, newPhotoUrls: string[]) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          const combined = [...p.images, ...newPhotoUrls];
          return {
            ...p,
            images: combined,
            coverImage: p.coverImage || combined[0],
          };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'إضافة صور جديدة للعقار',
        `تمت إضافة ${newPhotoUrls.length} صورة جديدة لعقار ${propObj?.name || propertyId}`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const setPropertyCoverPhoto = useCallback(
    (propertyId: string, photoUrl: string) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          const images = p.images.includes(photoUrl) ? p.images : [photoUrl, ...p.images];
          return {
            ...p,
            coverImage: photoUrl,
            images,
          };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعيين غلاف العقار',
        `تم تعيين صورة رئيسية جديدة لعقار ${propObj?.name || propertyId}`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const switchGuardAssignedProperty = useCallback(
    (propertyId: string) => {
      const propObj = properties.find((p) => p.id === propertyId);
      if (!propObj) return;
      setGuard((prev) => ({
        ...prev,
        assignedPropertyId: propertyId,
        assignedPropertyName: propObj.name,
      }));
      logActivity(
        guard.name,
        'guard',
        'تغيير العقار المسؤول عنه الحارس',
        `قام الحارس ${guard.name} باختيار متابعة عقار ${propObj.name}`
      );
    },
    [properties, guard.name, logActivity]
  );

  const updatePropertySection = useCallback(
    (propertyId: string, sectionId: string, data: Partial<PropertySection>) => {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          const nextSections = (p.sections || []).map((sec) =>
            sec.id === sectionId ? { ...sec, ...data } : sec
          );
          return { ...p, sections: nextSections };
        })
      );
      const propObj = properties.find((p) => p.id === propertyId);
      const secObj = propObj?.sections?.find((s) => s.id === sectionId);
      const secName = secObj?.name || (sectionId === 'hamran-alma' ? 'وحدة الما' : sectionId === 'hamran-naya' ? 'وحدة نايا' : 'القسم');
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تحديث معلومات وسعر القسم',
        `تم تحديث مواصفات وسعر ${secName} لعقار ${propObj?.name || 'العقار'} بنجاح`
      );
    },
    [isAdmin, currentMarketer?.name, userRole, logActivity, properties]
  );

  const updatePropertySeasonalPricing = useCallback(
    (propertyId: string, seasonalPricing: SeasonalPricing) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          return { ...p, seasonalPricing: { ...p.seasonalPricing, ...seasonalPricing } };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعديل وحفظ أسعار أنماط المواسم',
        `تم حفظ أسعار المواسم لعقار ${propObj?.name || propertyId} (وسط الأسبوع: ${seasonalPricing.weekday}، الويكند: ${seasonalPricing.weekend}، الصيف: ${seasonalPricing.summer}، الأعياد: ${seasonalPricing.eid}، الإجازات: ${seasonalPricing.vacation} ر.س)`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const updatePropertyBreakfastPrice = useCallback(
    (propertyId: string, defaultBreakfastPrice: number) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          return { ...p, defaultBreakfastPrice };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعديل سعر الإفطار الافتراضي',
        `تم تعديل سعر الإفطار لعقار ${propObj?.name || propertyId} إلى ${defaultBreakfastPrice} ر.س`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const updatePropertyBreakfastPricing = useCallback(
    (propertyId: string, breakfastPricing: PropertyBreakfastPricing) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          return {
            ...p,
            defaultBreakfastPrice: breakfastPricing.weekday,
            breakfastPricing,
          };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعديل وحفظ إعدادات وأسعار الإفطار للعقار',
        `تم حفظ إعدادات وأسعار الإفطار لعقار ${propObj?.name || propertyId} (مفعل: ${breakfastPricing.enabled ? 'نعم' : 'لا'}، وسط الأسبوع: ${breakfastPricing.weekday}، الويكند: ${breakfastPricing.weekend}، الصيف: ${breakfastPricing.summer}، الأعياد: ${breakfastPricing.eid}، الإجازات المطولة: ${breakfastPricing.vacation} ر.س)`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const updatePropertyAdministrativeFees = useCallback(
    (propertyId: string, administrativeFees: AdministrativeFees) => {
      const propObj = properties.find((p) => p.id === propertyId);
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          return { ...p, administrativeFees };
        })
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعديل وحفظ أسعار الرسوم الإدارية',
        `تم حفظ أسعار الرسوم الإدارية لعقار ${propObj?.name || propertyId} (وسط الأسبوع: ${administrativeFees.weekday}، الويكند: ${administrativeFees.weekend}، الصيف: ${administrativeFees.summer}، الأعياد: ${administrativeFees.eid}، الإجازات المطولة: ${administrativeFees.vacation} ر.س)`
      );
    },
    [properties, isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const addCoordinatorService = useCallback(
    (serviceData: Omit<CoordinatorServiceItem, 'id'>) => {
      const newService: CoordinatorServiceItem = {
        ...serviceData,
        id: `cs-${Date.now()}`,
        isActive: serviceData.isActive !== undefined ? serviceData.isActive : true,
      };
      setCoordinatorServices((prev) => [newService, ...prev]);
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'إدراج خدمة منسقة جديدة',
        `تمت إضافة خدمة "${newService.title}" بسعر ${newService.price} ر.س للمنسقة ${newService.coordinatorName}`
      );
      return newService;
    },
    [isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const updateCoordinatorService = useCallback(
    (id: string, updates: Partial<CoordinatorServiceItem>) => {
      setCoordinatorServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'تعديل خدمة منسقة',
        `تم تحديث بيانات الخدمة رقم ${id}`
      );
    },
    [isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const deleteCoordinatorService = useCallback(
    (id: string) => {
      setCoordinatorServices((prev) => prev.filter((s) => s.id !== id));
      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'حذف خدمة منسقة',
        `تم حذف الخدمة رقم ${id}`
      );
    },
    [isAdmin, currentMarketer?.name, userRole, logActivity]
  );

  const togglePropertyPublished = useCallback(
    (propertyId: string) => {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === propertyId) {
            const nextPublished = !p.isPublished;
            logActivity(
              'الإدارة',
              'admin',
              nextPublished ? 'فتح العقار لجميع الأيام' : 'إيقاف العقار كامل لجميع الأيام',
              nextPublished
                ? `تم فتح العقار (${p.name}) كامل لجميع الأيام واستكمال إنشاء الحجوزات`
                : `تم إيقاف العقار (${p.name}) كامل لجميع الأيام وتعطيل إنشاء الحجوزات`
            );
            return { ...p, isPublished: nextPublished };
          }
          return p;
        })
      );
    },
    [logActivity]
  );

  const updateMarketerPermissions = useCallback((id: string, perms: Partial<MarketerPermissions>) => {
    setMarketers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, permissions: { ...m.permissions, ...perms } } : m))
    );
  }, []);

  const updateMarketerProfile = useCallback(
    (id: string, data: Partial<Marketer>) => {
      setMarketers((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...data,
                contract: data.contract ? { ...m.contract, ...data.contract } : m.contract,
              }
            : m
        )
      );
      setUserAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id || acc.marketerId === id
            ? {
                ...acc,
                name: data.name ?? acc.name,
                email: data.email ?? acc.email,
                phone: data.phone ?? acc.phone,
              }
            : acc
        )
      );
      logActivity('الإدارة', 'admin', 'تحديث بيانات المسوق', `تم تحديث الملف الشخصي وبيانات العقد للمسوق: ${data.name || id}`);
    },
    [logActivity]
  );

  const addMarketer = useCallback(
    (data: { name: string; email: string; phone: string; nationalId?: string; falLicenseNumber?: string; bankAccount?: string; bankName?: string }) => {
      const code = `MK-${100 + marketers.length + 1}`;
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newMarketer: Marketer = {
        id: `m${Date.now()}`,
        name: data.name,
        email: data.email,
        password: '123',
        phone: data.phone,
        bankAccount: data.bankAccount || '',
        bankName: data.bankName || 'مصرف الراجحي',
        nationalId: data.nationalId || '1000000000',
        falLicenseNumber: data.falLicenseNumber || '1100028491',
        avatar: `https://images.unsplash.com/photo-${1530000000000 + marketers.length}?auto=format&fit=crop&w=200&q=80`,
        code,
        commissionRate: 0.05,
        joinDate: today,
        contract: {
          contractNumber: `MKT-CTR-2026-${100 + marketers.length + 1}`,
          contractDate: today,
          expiryDate: expiry,
          commissionRatePercent: 5,
          status: 'active',
          firstParty: 'إدارة استراحات وشاليهات ماسة (AMASA)',
          firstPartyRepresentative: 'المدير العام التنفيذي',
          secondParty: data.name,
          secondPartyPhone: data.phone,
          secondPartyEmail: data.email,
          secondPartyNationalId: data.nationalId || '1000000000',
          secondPartyFalLicense: data.falLicenseNumber || '1100028491',
          terms: [
            'يستحق المسوق عمولة تسويق ثابتة قدرها 5% من القيمة الإجمالية لكل حجز مؤكد ومكتمل يتم إبرامه عبر رمزه التسويقي المعتمد.',
            'يتم تحويل العمولات المستحقة دورياً وفورياً إلى الحساب البنكي المعتمد للمسوق.',
            'يلتزم المسوق بالترويج بالأسعار الرسمية المعتمدة والحفاظ على سرية وخصوصية بيانات العملاء.',
            'يمنح المسوق صلاحية إصدار عقود الإيجار المعتمدة وتعديل مبالغ العربون المبدئي لتسهيل الحجوزات.',
          ],
          isSigned: true,
          signedDate: today,
          notes: 'عقد وساطة وتسويق موثق إلكترونياً',
        },
        permissions: {
          canCreateBooking: true,
          canEditPrices: false,
          canViewAllBookings: false,
          canBlockDates: false,
          canViewCustomerContacts: true,
          canExportReports: true,
          canViewFinancials: false,
          canCreateContract: true,
          canEditDeposit: true,
          canViewCalendar: true,
          canViewProperties: true,
          canViewDashboard: true,
          canViewMarketers: true,
          canManageTemplates: true,
          canViewRentalContract: true,
          canViewActivityLogs: true,
        },
      };

      setMarketers((prev) => [...prev, newMarketer]);
      setUserAccounts((prev) => [
        ...prev,
        {
          id: newMarketer.id,
          role: 'marketer',
          marketerId: newMarketer.id,
          name: data.name,
          email: data.email,
          password: '123',
          phone: data.phone,
          avatar: newMarketer.avatar,
          createdAt: new Date().toISOString(),
        },
      ]);

      logActivity('الإدارة', 'admin', 'إضافة مسوق جديد', `تم تسجيل المسوق الجديد: ${data.name} بنسبة عمولة 5% وإصدار العقد الرسمي`);
    },
    [marketers.length, logActivity]
  );

  const addAdminAccount = useCallback(
    (data: { name: string; email: string; phone?: string }) => {
      const emailNorm = data.email.trim().toLowerCase();
      if (!/^[^\s@]+@gmail\.com$/i.test(emailNorm)) {
        return { success: false, message: 'أدخل بريد Gmail صحيحاً (name@gmail.com).' };
      }
      if (userAccounts.some((acc) => acc.email.toLowerCase() === emailNorm)) {
        return { success: false, message: 'هذا البريد مسجل مسبقاً لحساب آخر.' };
      }

      const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
      const arr = new Uint8Array(8);
      crypto.getRandomValues(arr);
      const autoPass = Array.from(arr, (b) => chars[b % chars.length]).join('');

      setUserAccounts((prev) => [
        ...prev,
        {
          id: `admin-${Date.now()}`,
          role: 'admin',
          name: data.name,
          email: emailNorm,
          password: autoPass,
          phone: data.phone,
          createdAt: new Date().toISOString(),
        },
      ]);

      logActivity('الإدارة', 'admin', 'إضافة عضو إدارة', `تم إضافة عضو إدارة بكامل الصلاحيات: ${data.name}`);
      return { success: true, message: 'تمت إضافة عضو الإدارة بكامل الصلاحيات', password: autoPass };
    },
    [userAccounts, logActivity]
  );

  const setMarketerAccountRole = useCallback(
    (marketerId: string, newRole: UserRole) => {
      const acc = userAccounts.find((a) => a.marketerId === marketerId || a.id === marketerId);
      const marketerObj = marketers.find((m) => m.id === marketerId);
      if (!acc || !marketerObj) {
        return { success: false, message: 'لم يتم العثور على حساب هذا المسوق.' };
      }
      if (acc.role === newRole) {
        return { success: true, message: newRole === 'admin' ? 'الحساب إدارة بالفعل.' : 'الحساب مسوق بالفعل.' };
      }

      setUserAccounts((prev) => prev.map((a) => (a.id === acc.id ? { ...a, role: newRole } : a)));

      logActivity(
        'الإدارة',
        'admin',
        newRole === 'admin' ? 'ترقية مسوق إلى إدارة' : 'إرجاع عضو إدارة إلى مسوق',
        newRole === 'admin'
          ? `تمت ترقية ${marketerObj.name} إلى الإدارة بكامل الصلاحيات.`
          : `تم إرجاع ${marketerObj.name} إلى صلاحيات مسوق.`
      );

      return {
        success: true,
        message:
          newRole === 'admin'
            ? `تمت ترقية ${marketerObj.name} إلى الإدارة.`
            : `تم إرجاع ${marketerObj.name} إلى مسوق.`,
      };
    },
    [userAccounts, marketers, logActivity]
  );

  const deleteUserAccount = useCallback(
    (accountId: string) => {
      const target = userAccounts.find((a) => a.id === accountId);
      if (!target) {
        return { success: false, message: 'الحساب غير موجود.' };
      }
      if (target.email === 'sakt2008@gmail.com') {
        return { success: false, message: 'لا يمكن حذف حساب المالك الأساسي للنظام.' };
      }
      const adminCount = userAccounts.filter((a) => a.role === 'admin').length;
      if (target.role === 'admin' && adminCount <= 1) {
        return { success: false, message: 'لا يمكن حذف الحساب الإداري الوحيد المتبقي.' };
      }

      setUserAccounts((prev) => prev.filter((a) => a.id !== accountId));
      if (target.marketerId) {
        setMarketers((prev) => prev.filter((m) => m.id !== target.marketerId));
      }

      logActivity('الإدارة', 'admin', 'حذف حساب مستخدم', `تم حذف حساب (${target.name}) - ${target.email}`);
      triggerBrowserNotification('🗑️ تم حذف الحساب', `تم حذف حساب ${target.name} بنجاح من النظام`, 'system');
      return { success: true, message: `تم حذف حساب (${target.name}) بنجاح.` };
    },
    [userAccounts, logActivity, triggerBrowserNotification]
  );

  const deleteMarketer = useCallback(
    (marketerId: string) => {
      const target = marketers.find((m) => m.id === marketerId);
      if (!target) {
        return { success: false, message: 'المسوق غير موجود.' };
      }
      setMarketers((prev) => prev.filter((m) => m.id !== marketerId));
      setUserAccounts((prev) => prev.filter((a) => a.marketerId !== marketerId && a.id !== marketerId));

      logActivity('الإدارة', 'admin', 'حذف مسوق', `تم حذف المسوق (${target.name}) وجميع بيانات دخوله`);
      triggerBrowserNotification('🗑️ تم حذف المسوق', `تم حذف المسوق ${target.name} بنجاح`, 'system');
      return { success: true, message: `تم حذف المسوق (${target.name}) بنجاح.` };
    },
    [marketers, logActivity, triggerBrowserNotification]
  );

  const setDateOverride = useCallback((propertyId: string, date: string, override: Partial<DateOverride>, sectionId?: string) => {
    setDateOverrides((prev) => {
      const next = { ...prev };
      if (propertyId === 'al-taraf') {
        if (!sectionId || sectionId === 'all') {
          next[`${propertyId}_${date}`] = { ...next[`${propertyId}_${date}`], ...override };
          next[`${propertyId}_section-1_${date}`] = { ...next[`${propertyId}_section-1_${date}`], ...override };
          next[`${propertyId}_section-2_${date}`] = { ...next[`${propertyId}_section-2_${date}`], ...override };
        } else {
          next[`${propertyId}_${sectionId}_${date}`] = { ...next[`${propertyId}_${sectionId}_${date}`], ...override };
          next[`${propertyId}_${date}`] = { ...next[`${propertyId}_${date}`], ...override };
        }
      } else if (propertyId === 'hamran') {
        if (!sectionId || sectionId === 'all') {
          next[`${propertyId}_${date}`] = { ...next[`${propertyId}_${date}`], ...override };
          next[`${propertyId}_hamran-alma_${date}`] = { ...next[`${propertyId}_hamran-alma_${date}`], ...override };
          next[`${propertyId}_hamran-naya_${date}`] = { ...next[`${propertyId}_hamran-naya_${date}`], ...override };
        } else {
          next[`${propertyId}_${sectionId}_${date}`] = { ...next[`${propertyId}_${sectionId}_${date}`], ...override };
          next[`${propertyId}_${date}`] = { ...next[`${propertyId}_${date}`], ...override };
        }
      } else {
        const k = sectionId && sectionId !== 'all' ? `${propertyId}_${sectionId}_${date}` : `${propertyId}_${date}`;
        next[k] = { ...next[k], ...override };
      }
      return next;
    });
  }, []);

  const setDateOverridesBulk = useCallback((propertyId: string, dates: string[], override: Partial<DateOverride>, sectionId?: string) => {
    setDateOverrides((prev) => {
      const next = { ...prev };
      dates.forEach((d) => {
        if (propertyId === 'al-taraf') {
          if (!sectionId || sectionId === 'all') {
            next[`${propertyId}_${d}`] = { ...next[`${propertyId}_${d}`], ...override };
            next[`${propertyId}_section-1_${d}`] = { ...next[`${propertyId}_section-1_${d}`], ...override };
            next[`${propertyId}_section-2_${d}`] = { ...next[`${propertyId}_section-2_${d}`], ...override };
          } else {
            next[`${propertyId}_${sectionId}_${d}`] = { ...next[`${propertyId}_${sectionId}_${d}`], ...override };
            next[`${propertyId}_${d}`] = { ...next[`${propertyId}_${d}`], ...override };
          }
        } else if (propertyId === 'hamran') {
          if (!sectionId || sectionId === 'all') {
            next[`${propertyId}_${d}`] = { ...next[`${propertyId}_${d}`], ...override };
            next[`${propertyId}_hamran-alma_${d}`] = { ...next[`${propertyId}_hamran-alma_${d}`], ...override };
            next[`${propertyId}_hamran-naya_${d}`] = { ...next[`${propertyId}_hamran-naya_${d}`], ...override };
          } else {
            next[`${propertyId}_${sectionId}_${d}`] = { ...next[`${propertyId}_${sectionId}_${d}`], ...override };
            next[`${propertyId}_${d}`] = { ...next[`${propertyId}_${d}`], ...override };
          }
        } else {
          const k = sectionId && sectionId !== 'all' ? `${propertyId}_${sectionId}_${d}` : `${propertyId}_${d}`;
          next[k] = { ...next[k], ...override };
        }
      });
      return next;
    });
  }, []);

  const applySeasonalPricingPattern = useCallback(
    (propertyId: string, dates: string[], season: keyof Property['seasonalPricing'], sectionId?: string) => {
      const prop = properties.find((p) => p.id === propertyId) || selectedProperty;
      let price = prop.seasonalPricing[season] || prop.basePriceWeekday;
      if (sectionId && sectionId !== 'all') {
        const sec = prop.sections?.find((s) => s.id === sectionId);
        if (sec) {
          if (season === 'weekday') price = sec.priceWeekday;
          else if (season === 'weekend') price = sec.priceWeekend;
          else if (season === 'summer') price = Math.round(sec.priceWeekday * 1.1);
          else if (season === 'eid') price = Math.round(sec.priceWeekend * 1.5);
          else if (season === 'vacation') price = Math.round(sec.priceWeekday * 1.25);
        }
      }
      setDateOverridesBulk(propertyId, dates, { price, season: String(season) }, sectionId);
    },
    [properties, selectedProperty, setDateOverridesBulk]
  );

  const requestDeposit = useCallback(
    ({
      propertyId,
      dates,
      customerName,
      customerPhone,
      depositAmount,
      totalPrice,
      nightsCount,
      marketerId,
      commissionRatePercent,
      sectionName,
      breakfastOption,
      breakfastPrice,
      coordinatorName,
      coordinatorService,
      coordinatorPrice,
      baseNightlyTotal,
    }: {
      propertyId: string;
      dates: string[];
      customerName: string;
      customerPhone: string;
      depositAmount: number;
      totalPrice: number;
      nightsCount: number;
      marketerId?: string;
      commissionRatePercent?: number;
      sectionName?: string;
      breakfastOption?: string;
      breakfastPrice?: number;
      coordinatorName?: string;
      coordinatorService?: string;
      coordinatorPrice?: number;
      baseNightlyTotal?: number;
    }) => {
      const prop = properties.find((p) => p.id === propertyId) || selectedProperty;
      const displayName = sectionName ? `${prop.name} (${sectionName})` : prop.name;
      const targetMarketer = marketers.find((m) => m.id === (marketerId || currentMarketerId));
      const expiresAt = Date.now() + 900 * 1000; // 15 minutes = 900 seconds
      const todayStr = new Date().toISOString().split('T')[0];
      const validDates = dates.filter((d) => d >= todayStr);
      if (validDates.length === 0) {
        return { whatsappUrl: '', message: '' };
      }

      setDateOverrides((prev) => {
        const next = { ...prev };
        validDates.forEach((d) => {
          const k = `${propertyId}_${d}`;
          next[k] = {
            ...next[k],
            status: 'waiting_deposit',
            waitingDepositExpiresAt: expiresAt,
            waitingCustomerName: customerName,
            waitingCustomerPhone: customerPhone,
            waitingDepositAmount: depositAmount,
            waitingMarketerName: targetMarketer?.name,
            waitingMarketerId: targetMarketer?.id,
            waitingCommissionRate: commissionRatePercent === 7 ? 7 : 5,
          };
        });
        return next;
      });

      const notifDesc = `⚠️ طلب عربون جديد لعقار (${displayName}) للعميل ${customerName} بمبلغ ${depositAmount} ريال. التواريخ معلقة باللون الأصفر لمدة 15 دقيقة للتحويل!`;

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `طلب عربون جديد (مهلة 15 دقيقة) - ${displayName}`,
          description: notifDesc,
          timestamp: 'الآن',
          read: false,
          type: 'deposit_request',
          targetAudience: 'all',
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `⏳ طلب عربون جديد (مهلة 15 دقيقة) - ${displayName}`,
        `تم طلب عربون بقيمة ${depositAmount} ريال للعميل ${customerName} لعقار ${displayName} لحفظ الحجز فوراً`,
        'deposit_request'
      );

      let msg = fillTemplate(messageTemplates.depositRequest, {
        اسم_العميل: customerName,
        رقم_الجوال: customerPhone,
        اسم_العقار: displayName,
        عدد_الليالي: nightsCount,
        مبلغ_العربون: depositAmount,
        المبلغ_الإجمالي: totalPrice,
        المبلغ_المتبقي: totalPrice - depositAmount,
        مبلغ_التأمين: prop.insuranceAmount,
        اسم_البنك: prop.bankName,
        اسم_الحساب: prop.accountHolder,
        رقم_الآيبان: prop.iban,
        مهلة_الدفع: '15 دقيقة',
      });

      // إدراج تفصيل مالي منفصل للإقامة، الفطور، وخدمة المنسقة مع مجموع الحجز الإجمالي
      if ((breakfastPrice && breakfastPrice > 0) || (coordinatorPrice && coordinatorPrice > 0) || baseNightlyTotal) {
        let breakdown = '\n📊 *تفاصيل الحساب المالي والتسعير المعتمد:*';
        const nightsPrice = baseNightlyTotal || (totalPrice - (breakfastPrice || 0) - (coordinatorPrice || 0));
        breakdown += `\n• سعر الإقامة (${nightsCount} ليلة): ${nightsPrice} ريال`;
        if (breakfastPrice && breakfastPrice > 0) {
          breakdown += `\n• وجبة الإفطار (${breakfastOption || 'مع الفطور'}): ${breakfastPrice} ريال`;
        }
        if (coordinatorPrice && coordinatorPrice > 0) {
          breakdown += `\n• خدمة طلب المنسقة والتجهيز (${coordinatorName || 'المنسقة'}${coordinatorService ? ` - ${coordinatorService}` : ''}): ${coordinatorPrice} ريال`;
        }
        breakdown += `\n• *مجموع الحجز الإجمالي:* ${totalPrice} ريال`;

        if (msg.includes('📋 *تفاصيل الحساب المالي:*')) {
          msg = msg.replace('📋 *تفاصيل الحساب المالي:*', `📋 *تفاصيل الحساب المالي:*\n${breakdown}\n`);
        } else {
          msg = `${msg}\n${breakdown}`;
        }
      }

      const cleanPhone = customerPhone.replace(/\D/g, '').replace(/^0/, '966');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

      return { whatsappUrl, message: msg };
    },
    [properties, selectedProperty, marketers, currentMarketerId, messageTemplates, triggerBrowserNotification]
  );

  const cancelDepositWait = useCallback((propertyId: string, dates: string[]) => {
    setDateOverrides((prev) => {
      const next = { ...prev };
      dates.forEach((d) => {
        const k = `${propertyId}_${d}`;
        next[k] = {
          ...next[k],
          status: 'available',
          waitingDepositExpiresAt: undefined,
          waitingCustomerName: undefined,
          waitingCustomerPhone: undefined,
          waitingDepositAmount: undefined,
        };
      });
      return next;
    });
  }, []);

  const confirmBookingWithReceipt = useCallback(
    ({
      propertyId,
      dates,
      customerName,
      customerPhone,
      depositPaid,
      totalPrice,
      remainingAmount,
      insuranceAmount,
      receiptFileName,
      receiptDataUrl,
      marketerId,
      commissionRatePercent,
      notes,
      sectionId,
      sectionName,
      breakfastOption,
      breakfastPrice,
      coordinatorName,
      coordinatorService,
      coordinatorPrice,
      baseNightlyTotal,
    }: {
      propertyId: string;
      dates: string[];
      customerName: string;
      customerPhone: string;
      depositPaid: number;
      totalPrice: number;
      remainingAmount: number;
      insuranceAmount: number;
      receiptFileName: string;
      receiptDataUrl?: string;
      marketerId?: string;
      commissionRatePercent?: number;
      notes?: string;
      sectionId?: string;
      sectionName?: string;
      breakfastOption?: string;
      breakfastPrice?: number;
      coordinatorName?: string;
      coordinatorService?: string;
      coordinatorPrice?: number;
      baseNightlyTotal?: number;
    }) => {
      const prop = properties.find((p) => p.id === propertyId) || selectedProperty;
      const displayName = sectionName ? `${prop.name} (${sectionName})` : prop.name;
      const targetMarketer = marketers.find((m) => m.id === (marketerId || currentMarketerId));

      const todayStr = new Date().toISOString().split('T')[0];
      const validDates = dates.filter((d) => d >= todayStr);
      const sortedDates = [...(validDates.length > 0 ? validDates : dates)].sort();
      const checkInDate = sortedDates[0];
      const lastNight = sortedDates[sortedDates.length - 1];
      const checkOutDateObj = new Date(lastNight);
      checkOutDateObj.setDate(checkOutDateObj.getDate() + 1);
      const checkOutDate = checkOutDateObj.toISOString().split('T')[0];

      const nightsCount = sortedDates.length;
      const nightsPrice = baseNightlyTotal || (totalPrice - (breakfastPrice || 0) - (coordinatorPrice || 0));
      const nightlyPrice = Math.round(nightsPrice / Math.max(1, nightsCount));
      const rate = commissionRatePercent === 7 ? 7 : 5;
      const commissionAmount = targetMarketer ? Math.round(nightsPrice * (rate / 100)) : 0;

      const checkInDateObj = new Date(checkInDate);
      const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

      const inDayName = daysAr[checkInDateObj.getDay()];
      const inDayNum = checkInDateObj.getDate();
      const inMonthNum = checkInDateObj.getMonth() + 1;
      const inMonthName = monthsAr[checkInDateObj.getMonth()];
      const inYear = checkInDateObj.getFullYear();

      const outDayName = daysAr[checkOutDateObj.getDay()];
      const outDayNum = checkOutDateObj.getDate();
      const outMonthNum = checkOutDateObj.getMonth() + 1;
      const outMonthName = monthsAr[checkOutDateObj.getMonth()];
      const outYear = checkOutDateObj.getFullYear();

      const termsText = prop.contractTerms.map((t, idx) => `${idx + 1}. ${t}`).join('\n');

      let contractText = fillTemplate(messageTemplates.contract, {
        اسم_العقار: prop.name === 'كوخ البيلسان' ? 'كوخ زهرة البيلسان 🏕️' : `${displayName} 🏕️`,
        اسم_العميل: customerName,
        رقم_الجوال: customerPhone,
        تاريخ_الدخول: `${inDayName} ${inDayNum} ${inMonthName} ( ${inMonthNum} ) ${inYear} م`,
        وقت_الدخول: prop.checkInTimeText,
        تاريخ_الخروج: `${outDayName} ${outDayNum} ${outMonthName} ( ${outMonthNum} ) ${outYear} م`,
        وقت_الخروج: prop.checkOutTimeText,
        المبلغ_الإجمالي: totalPrice,
        مبلغ_العربون: depositPaid,
        المبلغ_المتبقي: remainingAmount,
        مبلغ_التأمين: insuranceAmount,
        شروط_العقد: termsText,
      });

      // تفصيل سعر الإقامة، الفطور، ورسوم المنسقة في العقد بشكل منفصل
      if ((breakfastPrice && breakfastPrice > 0) || (coordinatorPrice && coordinatorPrice > 0) || baseNightlyTotal) {
        let pricingBreakdown = '\n📊 تفاصيل الحساب والتسعير المعتمد:\n';
        pricingBreakdown += `• سعر الإقامة (${nightsCount} ليلة): ${nightsPrice} ريال\n`;
        if (breakfastPrice && breakfastPrice > 0) {
          pricingBreakdown += `• وجبة الإفطار (${breakfastOption || 'مع الفطور'}): ${breakfastPrice} ريال\n`;
        }
        if (coordinatorPrice && coordinatorPrice > 0) {
          pricingBreakdown += `• خدمة طلب المنسقة والتجهيز (${coordinatorName || 'المنسقة'}${coordinatorService ? ` - ${coordinatorService}` : ''}): ${coordinatorPrice} ريال\n`;
        }
        pricingBreakdown += `• إجمالي المبلغ المتفق عليه: ${totalPrice} ريال\n`;

        if (contractText.includes('المبلغ المتفق عليه:')) {
          contractText = contractText.replace('المبلغ المتفق عليه:', `${pricingBreakdown}المبلغ المتفق عليه:`);
        } else {
          contractText += `\n${pricingBreakdown}`;
        }
      }

      if (!contractText.includes('الشروط والأحكام') && !contractText.includes(termsText)) {
        contractText += `\n\n📌 الشروط والأحكام:\n${termsText}`;
      }

      const totalAdminFee = sortedDates.reduce((sum, d) => {
        const k = sectionId ? `${propertyId}_${sectionId}_${d}` : `${propertyId}_${d}`;
        const ov = dateOverrides[k] || dateOverrides[`${propertyId}_${d}`];
        if (ov?.adminFee !== undefined) return sum + ov.adminFee;
        const dayOfWeek = new Date(d).getDay();
        const isWknd = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6;
        const defaultRate = isWknd ? (prop.administrativeFees?.weekend ?? 100) : (prop.administrativeFees?.weekday ?? 50);
        return sum + defaultRate;
      }, 0);

      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        bookingNumber: `BK-2026-${100 + bookings.length + 1}`,
        propertyId,
        propertyName: displayName,
        sectionId,
        sectionName,
        customerName,
        customerPhone,
        checkInDate,
        checkOutDate,
        nightsCount,
        nightlyPrice,
        totalPrice,
        adminFee: totalAdminFee,
        taxAmount: 0,
        discount: 0,
        depositPaid,
        remainingAmount,
        insuranceAmount,
        depositReceiptUrl: receiptDataUrl || receiptFileName,
        marketerId: targetMarketer?.id,
        marketerName: targetMarketer?.name,
        marketerCommission: commissionAmount,
        commissionRatePercent: rate,
        bookingType: rate === 7 ? 'full' : 'partial',
        breakfastOption,
        breakfastPrice: breakfastPrice || 0,
        coordinatorName,
        coordinatorService,
        coordinatorPrice: coordinatorPrice || 0,
        baseNightlyTotal: nightsPrice,
        commissionStatus: 'pending',
        status: 'confirmed',
        createdAt: new Date().toISOString().split('T')[0],
        notes: notes || `تم تأكيد الحجز بإرفاق الإيصال: ${receiptFileName}`,
        contractSigned: true,
        contractMessage: contractText,
        checkedOut: false,
        insuranceReturned: false,
      };

      setBookings((prev) => [newBooking, ...prev]);

      // Turn dates RED (booked)
      setDateOverrides((prev) => {
        const next = { ...prev };
        sortedDates.forEach((d) => {
          const k = `${propertyId}_${d}`;
          next[k] = {
            ...next[k],
            status: 'booked',
            waitingDepositExpiresAt: undefined,
            waitingCustomerName: undefined,
            waitingCustomerPhone: undefined,
            waitingDepositAmount: undefined,
          };
        });
        return next;
      });

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `🎉 تأكيد حجز جديد - ${prop.name}`,
          description: `تم تأكيد الحجز ${newBooking.bookingNumber} للعميل ${customerName} واستلام الإيصال (${receiptFileName}) وإرسال العقد عبر واتساب`,
          timestamp: 'الآن',
          read: false,
          type: 'deposit_confirmed',
          targetAudience: 'all',
          linkToBookingId: newBooking.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `💰 تأكيد دفع عربون - ${prop.name}`,
        `تم استلام وتأكيد سداد العربون (${depositPaid} ريال) للعميل ${customerName} (${newBooking.bookingNumber}) واعتماد العقد!`,
        'deposit_confirmed'
      );

      const cleanPhone = customerPhone.replace(/\D/g, '').replace(/^0/, '966');
      const whatsappContractUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(contractText)}`;

      return { booking: newBooking, whatsappContractUrl, contractText };
    },
    [properties, selectedProperty, marketers, currentMarketerId, bookings.length, messageTemplates.contract, triggerBrowserNotification]
  );

  const addBooking = useCallback(
    (params: Partial<Booking> & { propertyId: string; customerName: string; customerPhone: string; checkInDate: string; checkOutDate: string }) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const validCheckIn = params.checkInDate < todayStr ? todayStr : params.checkInDate;
      const validCheckOut =
        params.checkOutDate <= validCheckIn
          ? new Date(new Date(validCheckIn).getTime() + 86400000).toISOString().split('T')[0]
          : params.checkOutDate;

      const prop = properties.find((p) => p.id === params.propertyId) || selectedProperty;
      const marketerId = params.marketerId || (isAdmin ? undefined : currentMarketerId);
      const marketerObj = marketers.find((m) => m.id === marketerId);
      const netTotal = (params.totalPrice || prop.basePriceWeekday) - (params.discount || 0);
      const nightsPrice = params.baseNightlyTotal || (params.totalPrice || prop.basePriceWeekday);
      const rate = params.commissionRatePercent === 7 ? 7 : 5;
      const commission = marketerObj ? Math.round(nightsPrice * (rate / 100)) : 0;
      const deposit = params.depositPaid || prop.defaultDeposit;
      const remaining = params.remainingAmount !== undefined ? params.remainingAmount : netTotal - deposit;
      const insurance = params.insuranceAmount || prop.insuranceAmount;

      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        bookingNumber: `BK-2026-${100 + bookings.length + 1}`,
        propertyId: params.propertyId,
        propertyName: prop.name,
        sectionId: params.sectionId,
        sectionName: params.sectionName,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerNationalId: params.customerNationalId || `10${Math.floor(10000000 + Math.random() * 90000000)}`,
        checkInDate: validCheckIn,
        checkOutDate: validCheckOut,
        nightsCount: params.nightsCount || 1,
        nightlyPrice: params.nightlyPrice || prop.basePriceWeekday,
        totalPrice: netTotal,
        adminFee:
          params.adminFee !== undefined
            ? params.adminFee
            : (() => {
                const checkInDay = new Date(validCheckIn).getDay();
                const isWknd = checkInDay === 4 || checkInDay === 5 || checkInDay === 6;
                const defaultRate = isWknd ? (prop.administrativeFees?.weekend ?? 100) : (prop.administrativeFees?.weekday ?? 50);
                return defaultRate * Math.max(1, params.nightsCount || 1);
              })(),
        taxAmount: 0,
        discount: params.discount || 0,
        depositPaid: deposit,
        remainingAmount: remaining,
        insuranceAmount: insurance,
        marketerId: marketerObj?.id,
        marketerName: marketerObj?.name,
        marketerCommission: commission,
        commissionRatePercent: rate,
        bookingType: rate === 7 ? 'full' : 'partial',
        commissionStatus: 'pending',
        status: 'confirmed',
        createdAt: new Date().toISOString().split('T')[0],
        notes: params.notes || '',
        contractSigned: true,
        checkedOut: false,
        insuranceReturned: false,
      };

      setBookings((prev) => [newBooking, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `🎉 حجز جديد - ${prop.name}`,
          description: `تم استلام حجز جديد برقم ${newBooking.bookingNumber} للعميل ${params.customerName} بقيمة ${netTotal} ر.س`,
          timestamp: 'الآن',
          read: false,
          type: 'booking',
          targetAudience: 'all',
          linkToBookingId: newBooking.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `🎉 استلام حجز جديد - ${prop.name}`,
        `تم استلام حجز جديد (${newBooking.bookingNumber}) للعميل ${params.customerName} بقيمة ${netTotal} ر.س ومسوق: ${marketerObj?.name || 'مباشر'}`,
        'booking'
      );

      // Auto-sync to connected Google Sheets / AppSheet if enabled
      try {
        const sheetInfo = getSavedSpreadsheetInfo();
        if (sheetInfo.connected && sheetInfo.autoSync && sheetInfo.spreadsheetId) {
          appendBookingToSheet(sheetInfo.spreadsheetId, newBooking).catch((err) => {
            console.warn('Auto-sync to Google Sheets failed:', err);
          });
        }
      } catch (err) {
        console.warn('Auto-sync check failed:', err);
      }

      return newBooking;
    },
    [properties, selectedProperty, isAdmin, currentMarketerId, marketers, bookings.length, triggerBrowserNotification]
  );

  const updateBookingStatus = useCallback(
    (id: string, status: Booking['status']) => {
      let affectedBooking: Booking | null = null;
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === id) {
            affectedBooking = b;
            const nextCommStatus = status === 'completed' && b.marketerId ? 'ready_for_payout' : b.commissionStatus;
            return { ...b, status, commissionStatus: nextCommStatus };
          }
          return b;
        })
      );

      if (affectedBooking) {
        const b = affectedBooking as Booking;
        const statusLabels: Record<string, string> = {
          confirmed: 'مؤكد',
          waiting_deposit: 'قيد الانتظار',
          pending: 'قيد الانتظار',
          pending_payment: 'قيد الانتظار',
          cancelled: 'ملغي',
          completed: 'مكتمل',
        };
        const label = statusLabels[status] || status;
        logActivity(
          isGuard ? 'حارس العقار' : isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
          userRole,
          'تحديث حالة الحجز',
          `تم تغيير حالة الحجز ${b.bookingNumber} (${b.propertyName}) إلى: ${label}`
        );

        // Synchronize dateOverrides
        setDateOverrides((prev) => {
          const next = { ...prev };
          if (b.checkInDate && b.checkOutDate) {
            const start = new Date(b.checkInDate);
            const end = new Date(b.checkOutDate);
            const curr = new Date(start);
            while (curr < end) {
              const dStr = curr.toISOString().split('T')[0];
              const k = b.sectionId ? `${b.propertyId}_${b.sectionId}_${dStr}` : `${b.propertyId}_${dStr}`;
              if (status === 'cancelled') {
                if (next[k]?.status === 'booked' || next[k]?.status === 'waiting_deposit') {
                  next[k] = { ...next[k], status: 'available' };
                }
              } else if (status === 'confirmed') {
                next[k] = { ...next[k], status: 'booked' };
              } else if (status === 'waiting_deposit' || status === 'pending') {
                next[k] = { ...next[k], status: 'waiting_deposit' };
              }
              curr.setDate(curr.getDate() + 1);
            }
          }
          return next;
        });

        triggerBrowserNotification(
          'تحديث حالة الحجز',
          `تم تغيير حالة الحجز ${b.bookingNumber} للعميل ${b.customerName} إلى (${label}) بنجاح.`,
          'system'
        );
      }
    },
    [isGuard, isAdmin, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const cancelBooking = useCallback(
    (id: string) => {
      updateBookingStatus(id, 'cancelled');
    },
    [updateBookingStatus]
  );

  const payMarketerCommission = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, commissionStatus: 'paid' } : b))
    );
  }, []);

  const payoutAllMarketerCommissions = useCallback((marketerId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.marketerId === marketerId &&
        (b.commissionStatus === 'ready_for_payout' || b.commissionStatus === 'pending')
          ? { ...b, commissionStatus: 'paid' }
          : b
      )
    );
  }, []);

  const sendCheckoutReminder = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      const prop = properties.find((p) => p.id === bk?.propertyId) || selectedProperty;
      const defaultCheckoutTpl = `عذراً عن الإزعاج ومنعاً للإحراج، نود تذكيركم أخي الكريم {اسم_العميل} بأن موعد تسجيل الخروج اليوم من ({اسم_العقار}) في تمام {وقت_الخروج}.
⚠️ نرجو التكرم بالاستعداد للخروج في الوقت المحدد لتفادي أي خصم من مبلغ التأمين كما هو موضح في العقد المبرم، ولإتاحة المجال للحارس ({اسم_الحارس}) لمعاينة وتجهيز المكان.
شاكرين لكم حسن تعاونكم وممتنين لاختياركم لنا 🌿`;

      const rawTpl = messageTemplates.checkoutReminder || defaultCheckoutTpl;

      const msg = fillTemplate(rawTpl, {
        اسم_العميل: bk?.customerName || '',
        رقم_الجوال: bk?.customerPhone || '',
        اسم_العقار: bk?.propertyName || prop.name,
        وقت_الخروج: prop.checkOutTimeText || 'الساعة 2 م',
        مبلغ_التأمين: bk?.insuranceAmount || prop.insuranceAmount || 500,
        اسم_الحارس: prop.assignedGuardName || guard.name || 'أبو راشد',
      });

      const cleanPhone = (bk?.customerPhone || '0550000000').replace(/\D/g, '').replace(/^0/, '966');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, checkoutReminderSent: true, checkoutReminderSentAt: timeStr }
            : b
        )
      );

      logActivity(
        isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'المسوقة',
        userRole,
        'إرسال تذكير خروج (المسوقة)',
        `تم إرسال تذكير الخروج والتحذير من خصم التأمين عبر واتساب للعميل ${bk?.customerName} لعقار ${bk?.propertyName}`
      );

      return { whatsappUrl, message: msg };
    },
    [bookings, properties, selectedProperty, messageTemplates.checkoutReminder, logActivity, isAdmin, isGuard, guard.name, currentMarketer?.name, userRole]
  );

  const sendPaymentCompletionRequest = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return { whatsappUrl: '', message: '' };
      const prop = properties.find((p) => p.id === bk.propertyId) || selectedProperty;

      const totalRequired = (bk.remainingAmount || 0) + (bk.insurancePaymentMethod ? 0 : bk.insuranceAmount);

      const defaultPaymentCompletionTpl = `أهلاً وسهلاً بك أخي الكريم {اسم_العميل} 🌿
يسعدنا استقبالكم في ({اسم_العقار}). وحرصاً على سرعة تسليمكم المفتاح وتجهيز الدخول، نرجو التكرم بسداد إكمال المتبقي والتأمين:

📋 *تفاصيل الحساب المالي المطلوب:*
• رقم الحجز: {رقم_الحجز}
• المبلغ المتبقي للإقامة: *{المبلغ_المتبقي} ريال*
• مبلغ التأمين المسترد: *{مبلغ_التأمين} ريال*
• إجمالي المطلوب سداده الآن: *{المجموع_المطلوب} ريال*

🏦 *بيانات الحساب البنكي المعتمد للتحويل:*
• اسم البنك: {اسم_البنك}
• المستفيد: {اسم_الحساب}
• رقم الآيبان (IBAN):
*{رقم_الآيبان}*

💡 *ملاحظة:*
في حال تفضيلكم دفع مبلغ التأمين نقداً، يمكنكم تسليمه مباشرة للحارس ({اسم_الحارس}) عند البوابة.
نتمنى لكم إقامة سعيدة وممتعة! ✨`;

      const rawTpl = messageTemplates.paymentCompletion || defaultPaymentCompletionTpl;

      const msg = fillTemplate(rawTpl, {
        اسم_العميل: bk.customerName,
        رقم_الجوال: bk.customerPhone,
        اسم_العقار: bk.propertyName,
        رقم_الحجز: bk.bookingNumber,
        تاريخ_الدخول: bk.checkInDate,
        وقت_الدخول: prop.checkInTimeText,
        تاريخ_الخروج: bk.checkOutDate,
        وقت_الخروج: prop.checkOutTimeText,
        عدد_الليالي: bk.nightsCount,
        المبلغ_الإجمالي: bk.totalPrice,
        مبلغ_العربون: bk.depositPaid,
        المبلغ_المتبقي: bk.remainingAmount,
        مبلغ_التأمين: bk.insuranceAmount,
        المجموع_المطلوب: totalRequired,
        اسم_البنك: prop.bankName,
        اسم_الحساب: prop.accountHolder,
        رقم_الآيبان: prop.iban,
        اسم_الحارس: prop.assignedGuardName || guard.name || 'أبو راشد',
      });

      const cleanPhone = (bk.customerPhone || '0550000000').replace(/\D/g, '').replace(/^0/, '966');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

      logActivity(
        isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'المسوقة',
        userRole,
        'إرسال رسالة إكمال المتبقي والتأمين عبر واتساب',
        `تم إرسال طلب إكمال المتبقي (${bk.remainingAmount} ريال) والتأمين (${bk.insuranceAmount} ريال) عبر واتساب للعميل ${bk.customerName} لحجز ${bk.bookingNumber}`
      );

      return { whatsappUrl, message: msg };
    },
    [bookings, properties, selectedProperty, messageTemplates.paymentCompletion, logActivity, isAdmin, isGuard, guard.name, currentMarketer?.name, userRole]
  );

  const sendCoordinatorWhatsAppNotification = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return null;
      const prop = properties.find((p) => p.id === bk.propertyId) || selectedProperty;

      const coordName = bk.coordinatorName || (bk.coordinatorServicesList && bk.coordinatorServicesList[0]?.coordinatorName) || 'المنسقة';
      const coordPhone = bk.coordinatorPhone || (bk.coordinatorServicesList && bk.coordinatorServicesList[0]?.coordinatorPhone) || '0550000000';
      const servicesListStr = bk.coordinatorServicesList && bk.coordinatorServicesList.length > 0
        ? bk.coordinatorServicesList.map((s) => `${s.title} (${s.price} ر.س)`).join(' + ')
        : (bk.coordinatorService || 'خدمة تنسيق المناسبات');
      const totalServicesPrice = bk.coordinatorPrice || (bk.coordinatorServicesList ? bk.coordinatorServicesList.reduce((sum, s) => sum + s.price, 0) : 0);

      const rawTpl = messageTemplates.coordinatorService || INITIAL_TEMPLATES.coordinatorService || '';
      const msg = fillTemplate(rawTpl, {
        اسم_المنسقة: coordName,
        اسم_العقار: bk.propertyName || prop.name,
        رقم_الحجز: bk.bookingNumber,
        تاريخ_الحجز: bk.checkInDate,
        وقت_الدخول: prop.checkInTimeText || 'الساعة 4:00 عصراً',
        الساعة: prop.checkInTimeText || 'الساعة 4:00 عصراً',
        اسم_العميل: bk.customerName,
        جوال_العميل: bk.customerPhone,
        الخدمة_المطلوبة: servicesListStr,
        سعر_الخدمة: totalServicesPrice,
      });

      const cleanPhone = coordPhone.replace(/\D/g, '').replace(/^0/, '966');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
        userRole,
        'إرسال إشعار للمنسقة عبر واتساب',
        `تم تجهيز وإرسال تفاصيل حجز ${bk.bookingNumber} وخدمات التنسيق إلى المنسقة ${coordName}`
      );

      return {
        whatsappUrl,
        message: msg,
        coordinatorName: coordName,
        coordinatorPhone: coordPhone,
      };
    },
    [bookings, properties, selectedProperty, messageTemplates.coordinatorService, logActivity, isAdmin, currentMarketer?.name, userRole]
  );

  const markCheckedOut = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, checkedOut: true, checkedOutAt: timeStr, status: 'completed' }
            : b
        )
      );

      setNotifications((prev) => [
        ...(bk.marketerId
          ? [
              {
                id: `notif-empcheckout-${Date.now()}`,
                title: `🚪 خرج العميل - ${bk.propertyName}`,
                description: `خرج العميل (${bk.customerName}) من عقار ${bk.propertyName} في تمام الساعة ${timeStr}.`,
                timestamp: 'الآن',
                read: false,
                type: 'checkout' as const,
                targetAudience: 'marketer' as const,
                targetMarketerId: bk.marketerId,
                propertyId: bk.propertyId,
                linkToBookingId: bk.id,
              },
            ]
          : []),
        {
          id: `notif-checkout-${Date.now()}`,
          title: `🚪 تم خروج النزيل - ${bk.propertyName}`,
          description: `أكد النزيل (${bk.customerName}) خروجه من عقار ${bk.propertyName} في تمام الساعة ${timeStr} وجاري معاينة المكان من قبل الحارس.`,
          timestamp: 'الآن',
          read: false,
          type: 'checkout' as const,
          targetAudience: 'admin_and_guard' as const,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      logActivity(
        isAdmin ? 'الإدارة' : isGuard ? guard.name : 'موظف',
        userRole,
        'تسجيل خروج النزيل',
        `تم تسجيل خروج العميل ${bk.customerName} من عقار ${bk.propertyName} وإشعار الحارس والإدارة والموظف.`
      );
    },
    [bookings, logActivity, isAdmin, isGuard, guard.name, userRole]
  );

  const confirmAttendanceByGuard = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                guestArrived: true,
                guestArrivedAt: timeStr,
                arrivalConfirmedAt: timeStr,
                arrivalConfirmedBy: guard.name || 'الحارس',
              }
            : b
        )
      );

      setNotifications((prev) => [
        {
          id: `notif-arrived-${Date.now()}`,
          title: `📍 تأكيد الحضور: وصل العميل - ${bk.propertyName}`,
          description: `أكّد الحارس (${guard.name || 'الحارس'}) حضور العميل (${bk.customerName}) إلى عقار (${bk.propertyName}) في تمام الساعة ${timeStr}. يُرجى من المسوقة (${bk.marketerName || 'المسؤولة'}) النقر على زر "إكمال المتبقي والتأمين" أدناه لإرسال رسالة الواتساب للعميل فوراً.`,
          timestamp: 'الآن',
          read: false,
          type: 'booking',
          targetAudience: 'all',
          targetMarketerId: bk.marketerId,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `📍 تأكيد الحضور: وصل العميل - ${bk.propertyName}`,
        `أكد الحارس (${guard.name || 'الحارس'}) حضور (${bk.customerName}) - إشعار للمسوقة (${bk.marketerName || 'المسؤولة'}) لإرسال إكمال المتبقي والتأمين`
      );
      playChimeSound();

      logActivity(
        guard.name || 'الحارس',
        'guard',
        'تأكيد الحضور من الحارس',
        `أكّد الحارس ${guard.name || 'الحارس'} حضور العميل ${bk.customerName} إلى ${bk.propertyName} في تمام ${timeStr} وتم إرسال إشعار فوري للمسوقة.`
      );
    },
    [bookings, logActivity, guard.name, triggerBrowserNotification]
  );

  const guardMarkArrived = confirmAttendanceByGuard;

  const notifyGuardForCashPayment = useCallback(
    (params: {
      bookingId: string;
      notes?: string;
    }) => {
      const { bookingId, notes } = params;
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;

      const actor = isAdmin ? 'الإدارة' : currentMarketer?.name || 'المسوقة';
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const remainingPrev = bk.remainingAmount;

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            depositPaid: b.depositPaid + remainingPrev,
            remainingAmount: 0,
            paymentCompleted: true,
            paymentCompletedAt: timeStr,
            paymentCompletedBy: actor,
            arrivalPaymentMethod: 'cash',
            notes: notes ? (b.notes ? `${b.notes} | ${notes}` : notes) : b.notes,
          };
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-cash-guard-${Date.now()}`,
          title: `🚨 تنبيه للحارس: توجه لاستلام المبلغ كاش (${remainingPrev} ر.س) - ${bk.propertyName}`,
          description: `تنبيه من المسوقة (${actor}): يرجى من الحارس (${guard.name}) التوجه فوراً للعميل (${bk.customerName} - جوال: ${bk.customerPhone}) في (${bk.propertyName}) لاستلام المبلغ المتبقي كاش وقدره (${remainingPrev} ريال).`,
          timestamp: 'الآن',
          read: false,
          type: 'booking',
          targetAudience: 'all',
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `🚨 تنبيه للحارس: استلام كاش (${remainingPrev} ر.س)`,
        `يرجى التوجه للعميل (${bk.customerName}) في (${bk.propertyName}) لاستلام المبلغ المتبقي كاش وقدره (${remainingPrev} ريال).`
      );
      playChimeSound();

      logActivity(
        actor,
        userRole,
        'إشعار الحارس لاستلام المتبقي كاش',
        `تم إشعار الحارس ${guard.name} بالتوجه لاستلام المبلغ المتبقي (${remainingPrev} ريال) كاش من العميل ${bk.customerName}.`
      );
    },
    [bookings, isAdmin, guard.name, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const approveCleanlinessAndExit = useCallback(
    (params: {
      bookingId: string;
      result: 'full_refund' | 'deduction';
      deductionAmount?: number;
      damageDescription?: string;
      damagePhotos?: { name: string; dataUrl: string }[];
      notes?: string;
    }) => {
      const { bookingId, result, deductionAmount = 0, damageDescription, damagePhotos, notes } = params;
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

      const isRefund = result === 'full_refund';

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            checkedOut: true,
            checkedOutAt: timeStr,
            cleanlinessApproved: true,
            cleanlinessApprovedAt: timeStr,
            cleanlinessApprovedBy: guard.name || 'الحارس',
            status: 'completed',
            guardInspectionResult: result,
            insuranceReturned: isRefund,
            insuranceReturnedAt: isRefund ? timeStr : undefined,
            insuranceDeductionAmount: isRefund ? 0 : deductionAmount,
            damageDescription: isRefund ? undefined : damageDescription,
            damagePhotos: isRefund ? undefined : damagePhotos,
            notes: notes ? (b.notes ? `${b.notes} | ${notes}` : notes) : b.notes,
          };
        })
      );

      // Send notifications to marketer and admin
      if (isRefund) {
        setNotifications((prev) => [
          {
            id: `notif-checkout-clean-${Date.now()}`,
            title: `✨ تأكيد النظافة والخروج وإغلاق الحجز - ${bk.propertyName}`,
            description: `أكّد الحارس (${guard.name || 'الحارس'}) نظافة الاستراحة تماماً وخروج العميل (${bk.customerName}) في تمام الساعة ${timeStr}، وتم إغلاق دورة الحجز بنجاح وإعادة مبلغ التأمين كاملاً (${bk.insuranceAmount} ر.س).`,
            timestamp: 'الآن',
            read: false,
            type: 'checkout',
            targetAudience: 'all',
            targetMarketerId: bk.marketerId,
            propertyId: bk.propertyId,
            linkToBookingId: bk.id,
          },
          ...prev,
        ]);
        triggerBrowserNotification(
          `✨ تأكيد النظافة والخروج - ${bk.propertyName}`,
          `الاستراحة نظيفة وسليمة، وتم تأكيد خروج العميل (${bk.customerName}) وإعادة التأمين (${bk.insuranceAmount} ر.س).`
        );
      } else {
        setNotifications((prev) => [
          {
            id: `notif-checkout-damage-${Date.now()}`,
            title: `⚠️ تأكيد الخروج مع خصم أضرار (${deductionAmount} ر.س) - ${bk.propertyName}`,
            description: `أكّد الحارس (${guard.name || 'الحارس'}) خروج العميل (${bk.customerName}) مع رصد ملاحظات أضرار: ${damageDescription || 'تلفيات بالاستراحة'}، وتم تقرير خصم مبلغ (${deductionAmount} ر.س) من التأمين مع إرفاق صور التوثيق وإغلاق دورة الحجز.`,
            timestamp: 'الآن',
            read: false,
            type: 'checkout',
            targetAudience: 'all',
            targetMarketerId: bk.marketerId,
            propertyId: bk.propertyId,
            linkToBookingId: bk.id,
          },
          ...prev,
        ]);
        triggerBrowserNotification(
          `⚠️ خروج مع خصم أضرار (${deductionAmount} ر.س) - ${bk.propertyName}`,
          `تم رصد أضرار: ${damageDescription || 'تلفيات'}، وخصم (${deductionAmount} ر.س) مع إرفاق صور التوثيق وإغلاق الحجز.`
        );
      }

      playChimeSound();

      logActivity(
        guard.name || 'الحارس',
        userRole,
        isRefund ? 'تأكيد النظافة والخروج وإعادة التأمين' : 'تأكيد الخروج مع خصم أضرار',
        isRefund
          ? `أكّد الحارس ${guard.name || 'الحارس'} نظافة الاستراحة وخروج العميل ${bk.customerName} من ${bk.propertyName} وإغلاق دورة الحجز وإعادة التأمين (${bk.insuranceAmount} ريال).`
          : `أكّد الحارس ${guard.name || 'الحارس'} خروج العميل ${bk.customerName} من ${bk.propertyName} مع خصم أضرار (${deductionAmount} ريال) وإغلاق دورة الحجز.`
      );
    },
    [bookings, guard.name, userRole, logActivity, triggerBrowserNotification]
  );

  const guardProcessDeparture = approveCleanlinessAndExit;

  const toggleAdminCommissionApproval = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;
      const willApprove = !bk.adminApprovedFullBooking;
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const newRate = willApprove ? 7 : 5;
      const calendarNightlyTotal = bk.baseNightlyTotal || (bk.nightsCount > 0 && bk.nightlyPrice > 0 ? bk.nightlyPrice * bk.nightsCount : bk.totalPrice);
      const newCommission = Math.round(calendarNightlyTotal * (newRate / 100));

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            adminApprovedFullBooking: willApprove,
            adminApprovedAt: willApprove ? timeStr : undefined,
            adminApprovedBy: willApprove ? 'الإدارة' : undefined,
            commissionRatePercent: newRate,
            marketerCommission: newCommission,
            bookingType: willApprove ? 'full' : 'partial',
          };
        })
      );

      if (willApprove) {
        setNotifications((prev) => [
          {
            id: `notif-comm7-${Date.now()}`,
            title: `🌟 موافقة الإدارة: اعتماد نسبة 7% (حجز كامل) - ${bk.propertyName}`,
            description: `وافقت الإدارة على اعتماد الحجز (${bk.bookingNumber}) للعميل (${bk.customerName}) كـ "حجز كامل" واحتساب عمولة المسوقة بنسبة 7% بمبلغ (${newCommission} ر.س) من الصافي بعد الرسوم الإدارية.`,
            timestamp: 'الآن',
            read: false,
            type: 'booking',
            targetAudience: 'all',
            linkToBookingId: bk.id,
          },
          ...prev,
        ]);
        triggerBrowserNotification(
          `🌟 اعتماد نسبة 7% (حجز كامل)`,
          `وافقت الإدارة على اعتماد نسبة 7% بمبلغ (${newCommission} ر.س) للمسوقة (${bk.marketerName || 'المسؤولة'}).`
        );
        playChimeSound();
      }

      logActivity(
        'الإدارة',
        userRole,
        willApprove ? 'موافقة الإدارة على نسبة 7% (حجز كامل)' : 'إلغاء اعتماد نسبة 7% والعودة لـ 5%',
        `تم ${willApprove ? 'اعتماد' : 'إلغاء اعتماد'} نسبة 7% لحجز ${bk.bookingNumber} للعميل ${bk.customerName}، العمولة المحدثة: ${newCommission} ريال.`
      );
    },
    [bookings, userRole, logActivity, triggerBrowserNotification]
  );

  const confirmCashInsuranceByGuard = useCallback(
    (params: string | { bookingId: string; receivedAmount?: number; notes?: string }) => {
      const bookingId = typeof params === 'string' ? params : params.bookingId;
      const customAmount = typeof params === 'string' ? undefined : params.receivedAmount;
      const customNotes = typeof params === 'string' ? undefined : params.notes;

      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const finalAmount = customAmount !== undefined ? customAmount : bk.insuranceAmount;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                insuranceReceivedCash: true,
                cashInsuranceConfirmedByGuard: true,
                insurancePaymentMethod: 'cash',
                insuranceReceived: true,
                insuranceReceivedAmount: finalAmount,
                insuranceReceivedAt: timeStr,
                insuranceReceivedBy: guard.name || 'حارس العقار',
                notes: customNotes ? (b.notes ? `${b.notes} | استلام كاش: ${customNotes}` : `استلام كاش: ${customNotes}`) : b.notes,
              }
            : b
        )
      );

      setNotifications((prev) => [
        {
          id: `notif-insrecv-${Date.now()}`,
          title: `💵 تأكيد استلام التأمين كاش (${finalAmount} ر.س) - ${bk.propertyName}`,
          description: `أكّد الحارس (${guard.name || 'الحارس'}) رسمياً استلام مبلغ التأمين (${finalAmount} ريال) نقداً (كاش) من العميل (${bk.customerName}) وتم إثباته وتوثيقه بالنظام للإدارة والمسوقة.`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance',
          targetAudience: 'all',
          targetMarketerId: bk.marketerId,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `💵 تأكيد استلام التأمين كاش (${finalAmount} ر.س) - ${bk.propertyName}`,
        `استلم الحارس (${guard.name || 'الحارس'}) مبلغ التأمين (${finalAmount} ر.س) نقداً (كاش) من العميل (${bk.customerName})`
      );
      playChimeSound();

      logActivity(
        guard.name || 'الحارس',
        'guard',
        'تأكيد استلام التأمين كاش رسمياً',
        `أكّد الحارس ${guard.name || 'الحارس'} استلام مبلغ التأمين (${finalAmount} ريال) كاش من العميل ${bk.customerName} وتم تسجيله رسمياً بالنظام وإشعار الإدارة والمسوقة.`
      );
    },
    [bookings, logActivity, guard.name, triggerBrowserNotification]
  );

  const guardReceiveInsurance = confirmCashInsuranceByGuard;

  const notifyGuardForCashInsurance = useCallback(
    (params: {
      bookingId: string;
      insuranceAmount?: number;
      notes?: string;
    }) => {
      const { bookingId, insuranceAmount, notes } = params;
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;

      const actor = isAdmin ? 'الإدارة' : currentMarketer?.name || 'المسوقة';
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const targetInsuranceAmount = insuranceAmount !== undefined ? insuranceAmount : bk.insuranceAmount;

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            insurancePaymentMethod: 'cash',
            insurancePendingCashCollection: true,
            insuranceNotifiedToGuardAt: timeStr,
            notes: notes ? (b.notes ? `${b.notes} | إشعار الحارس للتأمين: ${notes}` : `إشعار الحارس للتأمين: ${notes}`) : b.notes,
          };
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-cash-ins-guard-${Date.now()}`,
          title: `🛡️ إشعار للحارس: استلام التأمين كاش (${targetInsuranceAmount} ر.س) - ${bk.propertyName}`,
          description: `إشعار من المسوقة (${actor}): العميل (${bk.customerName} - جوال: ${bk.customerPhone}) سيقوم بدفع مبلغ التأمين كاش وقدره (${targetInsuranceAmount} ريال) للحارس (${guard.name || 'أبو راشد'}). يرجى التوجه لاستلامه وتأكيده بالنظام.`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance',
          targetAudience: 'all',
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `🛡️ تنبيه للحارس: استلام تأمين كاش (${targetInsuranceAmount} ر.س)`,
        `توجه للعميل (${bk.customerName}) في ${bk.propertyName} لاستلام التأمين كاش وقدره (${targetInsuranceAmount} ريال).`
      );
      playChimeSound();

      logActivity(
        actor,
        userRole,
        'إشعار الحارس باستلام التأمين كاش',
        `تم إشعار الحارس ${guard.name} بمبلغ التأمين (${targetInsuranceAmount} ريال) كاش المطلوب تحصيله من العميل ${bk.customerName} في ${bk.propertyName}.`
      );
    },
    [bookings, isAdmin, guard.name, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const uploadDigitalInsuranceReceipt = useCallback(
    (params: {
      bookingId: string;
      receiptName: string;
      receiptDataUrl: string;
      notes?: string;
    }) => {
      const { bookingId, receiptName, receiptDataUrl, notes } = params;
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;

      const actor = isAdmin ? 'الإدارة' : currentMarketer?.name || 'المسوقة';
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            insurancePaymentMethod: 'receipt',
            insuranceReceiptName: receiptName,
            insuranceReceiptDataUrl: receiptDataUrl,
            digitalInsuranceReceiptName: receiptName,
            digitalInsuranceReceiptUrl: receiptDataUrl,
            insuranceReceivedAt: timeStr,
            insuranceUploadedBy: actor,
            insuranceUploadedAt: timeStr,
            notes: notes ? (b.notes ? `${b.notes} | ${notes}` : notes) : b.notes,
          };
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-ins-digital-${Date.now()}`,
          title: `🛡️ تم توثيق إيصال التأمين بنكياً - ${bk.propertyName}`,
          description: `قامت المسوقة (${actor}) برفع وتوثيق إيصال تحويل التأمين البنكي (${bk.insuranceAmount} ريال) للعميل (${bk.customerName}). لا حاجة لمطالبة العميل بالتأمين كاش من قبل الحارس.`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance',
          targetAudience: 'all',
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `🛡️ اعتماد إيصال التأمين البنكي - ${bk.propertyName}`,
        `تم توثيق إيصال تحويل التأمين (${bk.insuranceAmount} ر.س) للعميل (${bk.customerName}) بنجاح`
      );
      playChimeSound();

      logActivity(
        actor,
        userRole,
        'رفع واعتماد إيصال تحويل التأمين البنكي',
        `قامت المسوقة ${actor} برفع وتوثيق إيصال تحويل التأمين (${bk.insuranceAmount} ريال) للعميل ${bk.customerName}.`
      );
    },
    [bookings, isAdmin, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const uploadRemainingPaymentReceipt = useCallback(
    (params: {
      bookingId: string;
      receiptName: string;
      receiptDataUrl: string;
      notes?: string;
    }) => {
      const { bookingId, receiptName, receiptDataUrl, notes } = params;
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;

      const actor = isAdmin ? 'الإدارة' : currentMarketer?.name || 'المسوقة';
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const remainingPrev = bk.remainingAmount;

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            depositPaid: b.depositPaid + remainingPrev,
            remainingAmount: 0,
            paymentCompleted: true,
            paymentReceiptName: receiptName,
            paymentReceiptDataUrl: receiptDataUrl,
            paymentCompletedAt: timeStr,
            paymentCompletedBy: actor,
            arrivalPaymentMethod: 'receipt',
            notes: notes ? (b.notes ? `${b.notes} | إيصال سداد متبقي: ${notes}` : `إيصال سداد متبقي: ${notes}`) : b.notes,
          };
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-rem-receipt-${Date.now()}`,
          title: `💳 إيصال سداد متبقي بنكي - ${bk.propertyName}`,
          description: `قامت المسوقة (${actor}) برفع إيصال سداد المبلغ المتبقي (${remainingPrev} ر.س) للعميل (${bk.customerName}) بحجز #${bk.bookingNumber}. تم إرسال الإيصال فوراً لمراجعة وحفظ وتدقيق الإدارة.`,
          timestamp: 'الآن',
          read: false,
          type: 'booking',
          targetAudience: 'admin_only',
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `💳 إيصال سداد متبقي - ${bk.propertyName}`,
        `تم رفع إيصال سداد المتبقي (${remainingPrev} ر.س) للعميل (${bk.customerName}) وإرساله للإدارة بنجاح`
      );
      playChimeSound();

      logActivity(
        actor,
        userRole,
        'رفع إيصال سداد المبلغ المتبقي',
        `قامت المسوقة ${actor} برفع صورة إيصال سداد المتبقي (${remainingPrev} ريال) للعميل ${bk.customerName} بحجز ${bk.bookingNumber} وتم إرساله للإدارة.`
      );
    },
    [bookings, isAdmin, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const toggleGuestArrivalStatus = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return { isArrived: false };

      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const actor = isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'المسوقة';
      const willBeArrived = !(bk.guestArrived || bk.arrivalConfirmedAt);

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            guestArrived: willBeArrived,
            guestArrivedAt: willBeArrived ? timeStr : undefined,
            arrivalConfirmedAt: willBeArrived ? timeStr : undefined,
            arrivalConfirmedBy: willBeArrived ? actor : undefined,
          };
        })
      );

      if (willBeArrived) {
        setNotifications((prev) => [
          {
            id: `notif-arrived-auto-${Date.now()}`,
            title: `📍 وصل العميل: ${bk.customerName} - ${bk.propertyName}`,
            description: `أكّد ${actor} وصول النزيل (${bk.customerName}) إلى (${bk.propertyName}) في تمام الساعة ${timeStr}. إشعار تلقائي فوري للحارس والإدارة لتسليم المفتاح وتجهيز الوحدة.`,
            timestamp: 'الآن',
            read: false,
            type: 'booking',
            targetAudience: 'all',
            propertyId: bk.propertyId,
            linkToBookingId: bk.id,
          },
          ...prev,
        ]);

        triggerBrowserNotification(
          `📍 وصل العميل: ${bk.customerName} - ${bk.propertyName}`,
          `أكد ${actor} وصول النزيل في ${timeStr} - إشعار تلقائي للحارس والإدارة`
        );
        playChimeSound();

        logActivity(
          actor,
          userRole,
          'تأكيد وصول النزيل',
          `أكّد ${actor} وصول العميل ${bk.customerName} إلى ${bk.propertyName} في تمام ${timeStr} وإرسال إشعار للحارس والإدارة.`
        );
      } else {
        logActivity(
          actor,
          userRole,
          'إلغاء تأكيد الوصول',
          `تم إلغاء حالة وصول العميل ${bk.customerName} وإعادته إلى (انتظار الوصول).`
        );
      }

      return { isArrived: willBeArrived };
    },
    [bookings, isAdmin, isGuard, guard.name, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const guardRequestInsuranceReturn = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk || bk.insuranceReturnRequested) return;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, insuranceReturnRequested: true } : b))
      );

      setNotifications((prev) => [
        {
          id: `notif-insreturnreq-${Date.now()}`,
          title: `🔔 جاهز لإعادة التأمين - ${bk.propertyName}`,
          description: `خرج العميل (${bk.customerName}) من عقار ${bk.propertyName} والتأمين (${bk.insuranceAmount} ريال) جاهز للإعادة بعد معاينة العقار.`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance',
          targetAudience: bk.marketerId ? 'marketer' : 'admin_only',
          targetMarketerId: bk.marketerId,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      logActivity(
        isAdmin ? 'الإدارة' : isGuard ? guard.name : 'موظف',
        userRole,
        'تنبيه الموظف لإعادة التأمين',
        `تم إرسال تنبيه للموظف لإعادة تأمين العميل ${bk.customerName} (${bk.insuranceAmount} ريال).`
      );
    },
    [bookings, logActivity, isAdmin, isGuard, guard.name, userRole]
  );

  const returnInsuranceDeposit = useCallback(
    (bookingId: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, insuranceReturned: true, insuranceReturnedAt: timeStr } : b
        )
      );

      setNotifications((prev) => [
        ...(bk.marketerId
          ? [
              {
                id: `notif-empinsret-${Date.now()}`,
                title: `💵 تمت إعادة التأمين كاش للعميل - ${bk.propertyName}`,
                description: `أعاد الحارس مبلغ التأمين (${bk.insuranceAmount} ريال) كاش للعميل ${bk.customerName} بعد معاينة عقار ${bk.propertyName} في تمام الساعة ${timeStr}.`,
                timestamp: 'الآن',
                read: false,
                type: 'insurance' as const,
                targetAudience: 'marketer' as const,
                targetMarketerId: bk.marketerId,
                propertyId: bk.propertyId,
                linkToBookingId: bk.id,
              },
            ]
          : []),
        {
          id: `notif-insurance-${Date.now()}`,
          title: `💵 تم تسليم وإرجاع التأمين - ${bk.propertyName}`,
          description: `تم استرجاع وتسليم مبلغ التأمين (${bk.insuranceAmount} ريال) للعميل ${bk.customerName} بعد فحص عقار ${bk.propertyName} والتأكد من خلوه من أي تلفيات.`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance' as const,
          targetAudience: 'admin_only' as const,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      logActivity(
        isAdmin ? 'الإدارة' : isGuard ? guard.name : 'موظف',
        userRole,
        'تسليم التأمين للعميل',
        `تم تسليم مبلغ التأمين (${bk.insuranceAmount} ريال) للعميل ${bk.customerName} وإشعار الإدارة والموظف.`
      );
    },
    [bookings, logActivity, isAdmin, isGuard, guard.name, userRole]
  );

  const requestInsuranceRefundViaBank = useCallback(
    (params: {
      bookingId: string;
      bankReceiptName?: string;
      bankReceiptDataUrl?: string;
      customerIban?: string;
      notes?: string;
    }) => {
      const bk = bookings.find((b) => b.id === params.bookingId);
      if (!bk) return;
      const deduction = bk.insuranceDeductionAmount || 0;
      const refundAmount = Math.max(0, bk.insuranceAmount - deduction);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === params.bookingId
            ? {
                ...b,
                insuranceRefundMethod: 'bank',
                customerBankReceiptName: params.bankReceiptName,
                customerBankReceiptUrl: params.bankReceiptDataUrl,
                customerIban: params.customerIban,
                insuranceRefundRequested: true,
                insuranceRefundNotifiedToAdmin: true,
              }
            : b
        )
      );

      setNotifications((prev) => [
        {
          id: `notif-ins-bank-${Date.now()}`,
          title: `🏦 طلب استرداد تأمين (تحويل بنكي) - ${bk.propertyName}`,
          description: `تم رفع صورة حساب/آيبان العميل ${bk.customerName} لاسترداد التأمين بقيمة (${refundAmount} ر.س) لحجز #${bk.bookingNumber}. يرجى التحويل والمراجعة.${params.customerIban ? ` الآيبان: ${params.customerIban}` : ''}`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance' as const,
          targetAudience: 'admin_only' as const,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'المسوقة',
        userRole,
        'طلب استرداد تأمين تحويل بنكي',
        `تم رفع صورة حساب العميل ${bk.customerName} لاسترداد التأمين (${refundAmount} ر.س) لحجز #${bk.bookingNumber} وإشعار الإدارة.`
      );
    },
    [bookings, logActivity, isAdmin, currentMarketer?.name, userRole]
  );

  const requestInsuranceRefundViaGuardCash = useCallback(
    (params: {
      bookingId: string;
      notes?: string;
    }) => {
      const bk = bookings.find((b) => b.id === params.bookingId);
      if (!bk) return;
      const deduction = bk.insuranceDeductionAmount || 0;
      const refundAmount = Math.max(0, bk.insuranceAmount - deduction);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === params.bookingId
            ? {
                ...b,
                insuranceRefundMethod: 'cash',
                insuranceRefundRequested: true,
                insuranceRefundNotifiedToGuard: true,
              }
            : b
        )
      );

      setNotifications((prev) => [
        {
          id: `notif-ins-guard-cash-${Date.now()}`,
          title: `💵 توجيه للحارس: تسليم التأمين كاش للنزيل - ${bk.propertyName}`,
          description: `يرجى تسليم مبلغ التأمين نقداً (${refundAmount} ر.س) للنزيل ${bk.customerName} عند الخروج من ${bk.propertyName}.${params.notes ? ` ملاحظات: ${params.notes}` : ''}`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance' as const,
          targetAudience: 'guards' as const,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        {
          id: `notif-ins-admin-cash-${Date.now()}`,
          title: `💵 تنبيه تسليم تأمين كاش للنزيل - ${bk.propertyName}`,
          description: `تم توجيه الحارس لتسليم مبلغ التأمين (${refundAmount} ر.س) كاش للنزيل ${bk.customerName} عند المغادرة.`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance' as const,
          targetAudience: 'admin_only' as const,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'المسوقة',
        userRole,
        'توجيه الحارس لتسليم التأمين كاش',
        `تم إشعار الحارس بتسليم مبلغ التأمين (${refundAmount} ر.س) كاش للنزيل ${bk.customerName}.`
      );
    },
    [bookings, logActivity, isAdmin, currentMarketer?.name, userRole]
  );

  const finishBookingAndReturnInsurance = useCallback(
    (params: {
      bookingId: string;
      receiptName?: string;
      receiptDataUrl?: string;
      notes?: string;
    }) => {
      const bk = bookings.find((b) => b.id === params.bookingId);
      if (!bk) return;
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const deduction = bk.insuranceDeductionAmount || 0;
      const refundAmount = Math.max(0, bk.insuranceAmount - deduction);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === params.bookingId
            ? {
                ...b,
                status: 'completed',
                checkedOut: true,
                checkedOutAt: b.checkedOutAt || timeStr,
                cleanlinessApproved: true,
                cleanlinessApprovedAt: b.cleanlinessApprovedAt || timeStr,
                insuranceReturned: true,
                insuranceReturnedAt: timeStr,
                insuranceRefundReceiptName: params.receiptName || b.insuranceRefundReceiptName,
                insuranceRefundReceiptUrl: params.receiptDataUrl || b.insuranceRefundReceiptUrl,
              }
            : b
        )
      );

      setNotifications((prev) => [
        ...(bk.marketerId
          ? [
              {
                id: `notif-marketer-finish-${Date.now()}`,
                title: `🎉 تم إنهاء الحجز وتوثيق استرداد التأمين - ${bk.propertyName}`,
                description: `تم إنهاء الحجز رقم #${bk.bookingNumber} للعميل ${bk.customerName} وتوثيق استرداد التأمين (${refundAmount} ر.س)${params.receiptName ? ' مع حفظ صورة الإيصال بنجاح.' : ' كاش عبر الحارس.'}`,
                timestamp: 'الآن',
                read: false,
                type: 'insurance' as const,
                targetAudience: 'marketer' as const,
                targetMarketerId: bk.marketerId,
                propertyId: bk.propertyId,
                linkToBookingId: bk.id,
              },
            ]
          : []),
        {
          id: `notif-admin-finish-${Date.now()}`,
          title: `✅ تم إغلاق وإنهاء الحجز - ${bk.propertyName}`,
          description: `تم إغلاق الحجز #${bk.bookingNumber} للعميل ${bk.customerName} بنجاح بعد استرداد التأمين وإتمام كافة إجراءات الخروج.`,
          timestamp: 'الآن',
          read: false,
          type: 'checkout' as const,
          targetAudience: 'admin_only' as const,
          propertyId: bk.propertyId,
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      logActivity(
        isAdmin ? 'الإدارة' : currentMarketer?.name || 'المسوقة',
        userRole,
        'إنهاء الحجز واسترداد التأمين',
        `تم إنهاء الحجز رقم #${bk.bookingNumber} للعميل ${bk.customerName} وإغلاق دورة التأمين بنجاح.`
      );
    },
    [bookings, logActivity, isAdmin, currentMarketer?.name, userRole]
  );

  const completeBookingPayment = useCallback(
    (bookingId: string, receiptName: string, receiptDataUrl?: string) => {
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;

      const actor = isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'موظف';
      const dateStr = new Date().toISOString().split('T')[0];

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                depositPaid: b.depositPaid + b.remainingAmount,
                remainingAmount: 0,
                paymentCompleted: true,
                paymentReceiptName: receiptName,
                paymentReceiptDataUrl: receiptDataUrl,
                paymentCompletedAt: dateStr,
                paymentCompletedBy: actor,
              }
            : b
        )
      );

      setNotifications((prev) => [
        {
          id: `notif-payment-${Date.now()}`,
          title: `✅ تم إكمال الدفع - ${bk.propertyName}`,
          description: `أكمل العميل ${bk.customerName} سداد المبلغ المتبقي (${bk.remainingAmount} ريال) لحجز ${bk.bookingNumber} بإيصال بنكي مرفق (${receiptName}) - سجّله ${actor}.`,
          timestamp: 'الآن',
          read: false,
          type: 'booking',
          targetAudience: 'admin_only',
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      logActivity(
        actor,
        userRole,
        'إكمال دفع حجز بإيصال بنكي',
        `تم إكمال دفع حجز ${bk.bookingNumber} للعميل ${bk.customerName} وإرفاق الإيصال: ${receiptName}.`
      );
    },
    [bookings, isAdmin, isGuard, guard.name, currentMarketer?.name, userRole, logActivity]
  );

  const recordCustomerArrival = useCallback(
    (params: {
      bookingId: string;
      paymentMethod: 'receipt' | 'cash';
      receiptName?: string;
      receiptDataUrl?: string;
      notes?: string;
    }) => {
      const { bookingId, paymentMethod, receiptName, receiptDataUrl, notes } = params;
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;

      const actor = isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'المسوق';
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const methodLabel = paymentMethod === 'receipt' ? 'إيصال بنكي مرفق' : 'دفع كاش مباشر';
      const remainingPrev = bk.remainingAmount;

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            guestArrived: true,
            guestArrivedAt: timeStr,
            arrivalPaymentMethod: paymentMethod,
            ...(remainingPrev > 0
              ? {
                  depositPaid: b.depositPaid + remainingPrev,
                  remainingAmount: 0,
                  paymentCompleted: true,
                  paymentCompletedAt: timeStr,
                  paymentCompletedBy: actor,
                  paymentReceiptName: receiptName || b.paymentReceiptName,
                  paymentReceiptDataUrl: receiptDataUrl || b.paymentReceiptDataUrl,
                }
              : {}),
            notes: notes ? (b.notes ? `${b.notes} | ${notes}` : notes) : b.notes,
          };
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-arrive-${Date.now()}`,
          title: `📍 تأكيد وصول العميل - ${bk.propertyName}`,
          description: `وصل العميل (${bk.customerName}) إلى عقار ${bk.propertyName} في تمام ${timeStr}. طريقة سداد المتبقي (${remainingPrev} ريال): ${methodLabel}. تم إشعار الحارس والإدارة فوراً.`,
          timestamp: 'الآن',
          read: false,
          type: 'booking',
          targetAudience: 'all',
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `📍 وصول العميل - ${bk.propertyName}`,
        `وصل العميل (${bk.customerName}) - طريقة السداد: ${methodLabel} (${remainingPrev} ريال)`
      );
      playChimeSound();

      logActivity(
        actor,
        userRole,
        'تسجيل وصول العميل وإشعار الحارس والإدارة',
        `تم تسجيل وصول العميل ${bk.customerName} في ${bk.propertyName} وسداد المتبقي (${remainingPrev} ريال) عبر ${methodLabel}.`
      );
    },
    [bookings, isAdmin, isGuard, guard.name, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const recordInsuranceReceived = useCallback(
    (params: {
      bookingId: string;
      paymentMethod: 'receipt' | 'cash';
      receiptName?: string;
      receiptDataUrl?: string;
      notes?: string;
    }) => {
      const { bookingId, paymentMethod, receiptName, receiptDataUrl, notes } = params;
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) return;

      const actor = isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'المسوق';
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const methodLabel = paymentMethod === 'receipt' ? 'إيصال بنكي مرفق' : 'دفع كاش مباشر';

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            insuranceReceivedCash: paymentMethod === 'cash',
            insurancePaymentMethod: paymentMethod,
            insuranceReceiptName: receiptName,
            insuranceReceiptDataUrl: receiptDataUrl,
            insuranceReceivedAt: timeStr,
            notes: notes ? (b.notes ? `${b.notes} | ${notes}` : notes) : b.notes,
          };
        })
      );

      setNotifications((prev) => [
        {
          id: `notif-ins-recv-${Date.now()}`,
          title: `🛡️ استلام مبلغ التأمين - ${bk.propertyName}`,
          description: `تم تأكيد استلام مبلغ التأمين (${bk.insuranceAmount} ريال) للعميل (${bk.customerName}) في ${bk.propertyName} عبر: ${methodLabel}. تم إشعار الحارس والإدارة فوراً.`,
          timestamp: 'الآن',
          read: false,
          type: 'insurance',
          targetAudience: 'all',
          linkToBookingId: bk.id,
        },
        ...prev,
      ]);

      triggerBrowserNotification(
        `🛡️ استلام التأمين - ${bk.propertyName}`,
        `استلام تأمين (${bk.insuranceAmount} ريال) للعميل (${bk.customerName}) عبر ${methodLabel}`
      );
      playChimeSound();

      logActivity(
        actor,
        userRole,
        'استلام وتأكيد مبلغ التأمين',
        `تم تأكيد استلام تأمين العميل ${bk.customerName} (${bk.insuranceAmount} ريال) عبر ${methodLabel} وإشعار الحارس والإدارة.`
      );
    },
    [bookings, isAdmin, isGuard, guard.name, currentMarketer?.name, userRole, logActivity, triggerBrowserNotification]
  );

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const getEligibleCommissionBookings = useCallback(
    (marketerId: string, fromDate: string, toDate: string): Booking[] => {
      const pendingReqBookingIds = new Set(
        commissionRequests.filter((r) => r.status === 'pending').flatMap((r) => r.bookingIds)
      );

      return bookings.filter(
        (b) =>
          b.marketerId === marketerId &&
          (b.status === 'confirmed' || b.status === 'completed') &&
          b.commissionStatus !== 'paid' &&
          !pendingReqBookingIds.has(b.id) &&
          b.checkInDate >= fromDate &&
          b.checkInDate <= toDate
      );
    },
    [bookings, commissionRequests]
  );

  const createCommissionRequest = useCallback(
    ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
      const targetMarketer = marketers.find((m) => m.id === currentMarketerId);
      if (!targetMarketer) {
        return { ok: false, message: 'لم يتم العثور على حساب الموظف' };
      }
      if (!fromDate || !toDate || fromDate > toDate) {
        return { ok: false, message: 'اختر فترة زمنية صحيحة (تاريخ البداية قبل النهاية)' };
      }

      const eligible = getEligibleCommissionBookings(targetMarketer.id, fromDate, toDate);
      if (eligible.length === 0) {
        return { ok: false, message: 'لا توجد حجوزات مؤكدة مستحقة العمولة في هذه الفترة' };
      }

      const totalComm = eligible.reduce((sum, b) => sum + (b.marketerCommission || 0), 0);
      const newReq: CommissionRequest = {
        id: `creq-${Date.now()}`,
        marketerId: targetMarketer.id,
        marketerName: targetMarketer.name,
        fromDate,
        toDate,
        bookingIds: eligible.map((b) => b.id),
        amount: totalComm,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setCommissionRequests((prev) => [newReq, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `طلب صرف عمولة جديد - ${targetMarketer.name}`,
          description: `طلب المسوق ${targetMarketer.name} صرف عمولة ${totalComm} ريال عن ${eligible.length} حجز للفترة من ${fromDate} إلى ${toDate}. بانتظار التدقيق.`,
          timestamp: 'الآن',
          read: false,
          type: 'commission',
          targetAudience: 'admin_only',
        },
        ...prev,
      ]);

      return {
        ok: true,
        message: `تم إرسال طلب العمولة (${totalComm} ريال) للإدارة للتدقيق`,
      };
    },
    [marketers, currentMarketerId, getEligibleCommissionBookings]
  );

  const markCommissionTransferred = useCallback(
    (requestId: string, receiptFileName?: string, receiptDataUrl?: string) => {
      const req = commissionRequests.find((r) => r.id === requestId);
      if (!req) return;

      setCommissionRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'transferred',
                processedAt: new Date().toISOString().split('T')[0],
                receiptFileName,
                receiptDataUrl,
                seenByMarketer: false,
              }
            : r
        )
      );

      // Mark associated bookings as paid
      setBookings((prev) =>
        prev.map((b) =>
          req.bookingIds.includes(b.id) ? { ...b, commissionStatus: 'paid' } : b
        )
      );

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'تم تحويل عمولتك',
          description: `حوّلت الإدارة عمولتك (${req.amount} ريال) للفترة من ${req.fromDate} إلى ${req.toDate}. يمكنك الاطلاع على إيصال التحويل البنكي من صفحة المزيد.`,
          timestamp: 'الآن',
          read: false,
          type: 'commission',
          targetAudience: 'marketer',
          targetMarketerId: req.marketerId,
        },
        ...prev,
      ]);
    },
    [commissionRequests]
  );

  const rejectCommissionRequest = useCallback(
    (requestId: string, note?: string) => {
      const req = commissionRequests.find((r) => r.id === requestId);
      if (!req) return;

      setCommissionRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'rejected',
                processedAt: new Date().toISOString().split('T')[0],
                adminNote: note || '',
                seenByMarketer: false,
              }
            : r
        )
      );

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'تم رفض طلب العمولة',
          description: `تم رفض طلب العمولة للفترة من ${req.fromDate} إلى ${req.toDate}.${note ? ' السبب: ' + note : ''}`,
          timestamp: 'الآن',
          read: false,
          type: 'commission',
          targetAudience: 'marketer',
          targetMarketerId: req.marketerId,
        },
        ...prev,
      ]);
    },
    [commissionRequests]
  );

  const markCommissionRequestSeen = useCallback((requestId: string) => {
    setCommissionRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, seenByMarketer: true } : r))
    );
  }, []);

  const updateMessageTemplates = useCallback((templates: Partial<MessageTemplates>) => {
    setMessageTemplates((prev) => ({ ...prev, ...templates }));
  }, []);

  const resetMessageTemplates = useCallback(() => {
    setMessageTemplates(INITIAL_TEMPLATES);
  }, []);

  const openTemplatesModal = useCallback((tab?: keyof MessageTemplates) => {
    if (tab) setActiveTemplateTab(tab);
    setTemplatesModalOpen(true);
  }, []);

  const sendAdminBroadcast = useCallback(
    (params: {
      title: string;
      content: string;
      targetGroup: BroadcastTargetGroup;
      targetGroupName?: string;
      targetPropertyId?: string;
      targetPropertyName?: string;
      targetGuardId?: string;
      targetMarketerIds?: string[];
      priority: BroadcastPriority;
      category: BroadcastCategory;
      effectiveDate?: string;
      sendWhatsapp?: boolean;
    }) => {
      const broadcastId = `bc-${Date.now()}`;
      const nowStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const todayDateStr = new Date().toISOString().split('T')[0];

      let groupLabel = params.targetGroupName;
      if (!groupLabel) {
        if (params.targetGroup === 'all') groupLabel = 'الجميع (المسوقين والحراس)';
        else if (params.targetGroup === 'all_marketers') groupLabel = 'جميع المسوقات والمسوقين';
        else if (params.targetGroup === 'all_guards') groupLabel = 'جميع حراس العقارات';
        else if (params.targetGroup === 'specific_guard') groupLabel = `حارس عقار ${params.targetPropertyName || ''}`;
        else if (params.targetGroup === 'female_marketers') groupLabel = 'فريق مسوقات حمران';
        else if (params.targetGroup === 'coordinators') groupLabel = 'فريق المنسقات الميدانيات';
        else if (params.targetGroup === 'custom') groupLabel = 'مجموعة مخصصة بالأسماء';
      }

      const newBroadcast: AdminBroadcastMessage = {
        id: broadcastId,
        title: params.title,
        content: params.content,
        targetGroup: params.targetGroup,
        targetGroupName: groupLabel || 'الجميع',
        targetPropertyId: params.targetPropertyId,
        targetPropertyName: params.targetPropertyName,
        targetGuardId: params.targetGuardId,
        targetMarketerIds: params.targetMarketerIds,
        priority: params.priority,
        category: params.category,
        effectiveDate: params.effectiveDate || todayDateStr,
        sentAt: `اليوم ${nowStr}`,
        senderName: 'الإدارة العامة',
        senderRole: 'admin',
        acknowledgedBy: [],
        whatsappShared: !!params.sendWhatsapp,
      };

      setAdminBroadcasts((prev) => [newBroadcast, ...prev]);

      let audience: AppNotification['targetAudience'] = 'all';
      if (params.targetGroup === 'all_marketers' || params.targetGroup === 'female_marketers') {
        audience = 'marketers';
      } else if (params.targetGroup === 'all_guards' || params.targetGroup === 'specific_guard') {
        audience = 'guards';
      }

      const categoryLabel =
        params.category === 'decision'
          ? '📜 قرار إداري'
          : params.category === 'alert'
          ? '🚨 تنبيه تشغيلي'
          : params.category === 'update'
          ? '🔄 تعديل شروط'
          : params.category === 'instruction'
          ? '💡 توجيهات عمل'
          : '📢 تعميم إداري';

      const priorityPrefix =
        params.priority === 'urgent'
          ? '🔴 عاجل: '
          : params.priority === 'important'
          ? '🟡 هام: '
          : '';

      const notifTitle = `${priorityPrefix}${categoryLabel} - ${params.title}`;

      const newNotif: AppNotification = {
        id: `notif-${broadcastId}`,
        title: notifTitle,
        description: `${params.content} (توجيه لـ: ${groupLabel} - ساري: ${params.effectiveDate || 'فوراً'})`,
        timestamp: 'الآن',
        read: false,
        type: 'broadcast',
        targetAudience: audience,
        broadcastId: broadcastId,
        groupType: params.targetGroup,
        groupName: groupLabel,
        priority: params.priority,
        category: params.category,
        effectiveDate: params.effectiveDate || todayDateStr,
        propertyId: params.targetPropertyId,
        targetGuardId: params.targetGuardId,
        targetMarketerIds: params.targetMarketerIds,
        requiresAcknowledgment: params.priority === 'urgent',
      };

      setNotifications((prev) => [newNotif, ...prev]);

      playChimeSound(true);
      triggerBrowserNotification(notifTitle, params.content, 'system');

      logActivity(
        'الإدارة العامة',
        'admin',
        'إرسال تعميم / قرار إداري للفرق',
        `تم إرسال تعميم "${params.title}" موجه إلى (${groupLabel}) بأولوية (${params.priority}).`
      );

      const formattedMsg = `*📢 إعلان وتعميم إداري - إدارة شاليهات واستراحات ماسة (AMASA)*\n\n*📌 الموضوع:* ${params.title}\n*🏷️ التصنيف:* ${categoryLabel}\n*👥 الفئة المستهدفة:* ${groupLabel}\n*⏰ تاريخ وساعة السريان:* ${params.effectiveDate || 'فوراً'}\n\n*📝 نص القرار والتوجيهات:*\n${params.content}\n\n------------------------\n_نرجو من الجميع الالتزام والاطلاع الفوري ومتابعة المستجدات عبر التطبيق._`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(formattedMsg)}`;

      return {
        ok: true,
        message: `تم إرسال التعميم والقرار بنجاح إلى (${groupLabel})`,
        broadcastId,
        whatsappUrl,
      };
    },
    [playChimeSound, triggerBrowserNotification, logActivity]
  );

  const deleteAdminBroadcast = useCallback(
    (broadcastId: string) => {
      setAdminBroadcasts((prev) => prev.filter((b) => b.id !== broadcastId));
      setNotifications((prev) => prev.filter((n) => n.broadcastId !== broadcastId));
      logActivity('الإدارة العامة', 'admin', 'حذف تعميم إداري', `تم حذف التعميم الإداري رقم ${broadcastId}`);
    },
    [logActivity]
  );

  const acknowledgeBroadcast = useCallback(
    (broadcastId: string) => {
      const userId = isGuard ? guard.id : isAdmin ? 'admin' : currentMarketerId;
      setAcknowledgedBroadcastIds((prev) =>
        prev.includes(broadcastId) ? prev : [...prev, broadcastId]
      );
      setAdminBroadcasts((prev) =>
        prev.map((b) => {
          if (b.id !== broadcastId) return b;
          const acks = b.acknowledgedBy || [];
          return {
            ...b,
            acknowledgedBy: acks.includes(userId) ? acks : [...acks, userId],
          };
        })
      );
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.broadcastId !== broadcastId) return n;
          const acks = n.acknowledgedBy || [];
          return {
            ...n,
            read: true,
            acknowledgedBy: acks.includes(userId) ? acks : [...acks, userId],
          };
        })
      );
    },
    [isGuard, guard.id, isAdmin, currentMarketerId]
  );

  const resetAllData = useCallback(() => {
    StorageService.clear();
    setProperties(INITIAL_PROPERTIES);
    setMarketers(INITIAL_MARKETERS);
    setGuard(INITIAL_GUARD);
    setGuardsList(INITIAL_GUARDS_LIST);
    setBookings(INITIAL_BOOKINGS);
    setDateOverrides({});
    setActivityLogs(INITIAL_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMessageTemplates(INITIAL_TEMPLATES);
    setAdminBroadcasts(INITIAL_ADMIN_BROADCASTS);
    setAcknowledgedBroadcastIds([]);
    setCoordinatorServices(INITIAL_COORDINATOR_SERVICES);
    setUserRole('admin');
    setCurrentMarketerId('m1');
    setSelectedPropertyId('al-taraf');
    setActiveTab('calendar');
  }, []);

  const requestBrowserNotificationPermissionHandler = useCallback(async () => {
    const res = await requestBrowserNotificationPermission();
    setBrowserNotificationPermission(res);
    if (res === 'granted') {
      triggerBrowserNotification(
        '🔔 تم تفعيل إشعارات المتصفح بنجاح!',
        'ستصلك تنبيهات فورية عند وصول أي حجز جديد أو تأكيد دفع عربون لتنبيه الموظفين والمسوقين فوراً.',
        'deposit_confirmed'
      );
    }
    return res;
  }, [triggerBrowserNotification]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        currentMarketerId,
        currentMarketer,
        guard,
        isAdmin,
        isGuard,
        activePermissions,
        switchUser,
        updateGuardProfile,
        updateGuardPermissions,
        toggleGuardPermission,
        userAccounts,
        currentUserAccount,
        loginWithGmailAndPassword,
        loginWithGoogleQuick,
        changePassword,
        updateUserAccount,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,

        canCreateContract,
        canEditDeposit,
        canViewCalendar,
        canViewProperties,
        canViewDashboard,
        canViewMarketers,
        canManageTemplates,
        canViewRentalContract,
        canViewActivityLogs,

        grantAllMarketersContractAndDepositPermissions,
        updateWaitingDepositAmount,

        properties,
        selectedPropertyId,
        selectedProperty,
        setSelectedPropertyId,
        updateProperty,
        updatePropertySection,
        togglePropertyPublished,
        guardsList,
        updatePropertyGuard,
        updatePropertyPhotos,
        deletePropertyPhoto,
        addPropertyPhotos,
        setPropertyCoverPhoto,
        switchGuardAssignedProperty,
        updatePropertySeasonalPricing,
        updatePropertyBreakfastPrice,
        updatePropertyBreakfastPricing,
        updatePropertyAdministrativeFees,

        coordinatorServices,
        addCoordinatorService,
        updateCoordinatorService,
        deleteCoordinatorService,

        marketers,
        updateMarketerPermissions,
        updateMarketerProfile,
        addMarketer,
        deleteMarketer,
        addAdminAccount,
        deleteUserAccount,
        setMarketerAccountRole,
        payMarketerCommission,
        payoutAllMarketerCommissions,

        bookings,
        filteredBookings,
        todayArrivals,
        todayDepartures,
        addBooking,
        updateBookingStatus,
        cancelBooking,
        sendCheckoutReminder,
        sendPaymentCompletionRequest,
        sendCoordinatorWhatsAppNotification,
        markCheckedOut,
        guardMarkArrived,
        guardReceiveInsurance,
        guardRequestInsuranceReturn,
        returnInsuranceDeposit,
        requestInsuranceRefundViaBank,
        requestInsuranceRefundViaGuardCash,
        finishBookingAndReturnInsurance,
        completeBookingPayment,
        recordCustomerArrival,
        recordInsuranceReceived,
        notifyGuardForCashPayment,
        guardProcessDeparture,
        confirmAttendanceByGuard,
        confirmCashInsuranceByGuard,
        notifyGuardForCashInsurance,
        uploadDigitalInsuranceReceipt,
        approveCleanlinessAndExit,
        toggleAdminCommissionApproval,
        uploadRemainingPaymentReceipt,
        toggleGuestArrivalStatus,

        dateOverrides,
        setDateOverride,
        setDateOverridesBulk,
        applySeasonalPricingPattern,

        requestDeposit,
        cancelDepositWait,
        confirmBookingWithReceipt,

        notifications,
        filteredNotifications,
        unreadNotificationsCount,
        markNotificationsAsRead,

        commissionRequests,
        getEligibleCommissionBookings,
        createCommissionRequest,
        markCommissionTransferred,
        rejectCommissionRequest,
        markCommissionRequestSeen,

        activityLogs,
        logActivity,

        bookingModalOpen,
        setBookingModalOpen,
        preselectedDateForBooking,
        setPreselectedDateForBooking,
        preselectedSectionForBooking,
        setPreselectedSectionForBooking,

        messageTemplates,
        updateMessageTemplates,
        resetMessageTemplates,
        templatesModalOpen,
        setTemplatesModalOpen,
        activeTemplateTab,
        openTemplatesModal,

        resetAllData,
        nowTimestamp,

        browserNotificationPermission,
        requestBrowserNotificationPermission: requestBrowserNotificationPermissionHandler,
        isSoundEnabled,
        toggleSound,
        activeToast,
        dismissToast,
        triggerBrowserNotification,
        sendTestNotification,

        adminBroadcasts,
        sendAdminBroadcast,
        deleteAdminBroadcast,
        acknowledgeBroadcast,
        adminBroadcastModalOpen,
        setAdminBroadcastModalOpen,
        activeUrgentBroadcast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
