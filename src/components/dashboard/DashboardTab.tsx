import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Users,
  Eye,
  MessageCircle,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  Bell,
  DollarSign,
  Calendar,
  X,
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
  AlertTriangle,
  Phone,
  Building2,
  Coffee,
  Sparkles,
  UploadCloud,
  FileText,
  Wallet,
  Camera,
  Image,
  Trash2,
  Percent,
  ShieldAlert,
  ChevronDown,
  Home,
  Copy,
  Settings,
  Download,
  ExternalLink,
  FileDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';

interface GuardActionModalData {
  kind: 'arrive' | 'insrecv' | 'exit' | 'insret';
  booking: Booking;
}

interface ActiveReceiptViewerData {
  title: string;
  receiptType: 'remaining' | 'insurance' | 'deposit' | 'refund' | 'customer_account' | 'damage';
  receiptTypeName: string;
  receiptUrl?: string;
  receiptName?: string;
  booking?: Booking;
  uploadedBy?: string;
  uploadedAt?: string;
  notes?: string;
  amount?: number;
  customerIban?: string;
}

export const DashboardTab: React.FC = () => {
  const {
    properties,
    bookings,
    filteredBookings,
    todayArrivals,
    todayDepartures,
    sendCheckoutReminder,
    markCheckedOut,
    returnInsuranceDeposit,
    guardMarkArrived,
    guardReceiveInsurance,
    guardRequestInsuranceReturn,
    setBookingModalOpen,
    setSelectedPropertyId,
    setActiveTab,
    updateBookingStatus,
    isAdmin,
    isGuard,
    currentMarketerId,
    currentMarketer,
    completeBookingPayment,
    sendPaymentCompletionRequest,
    guard,
    guardsList,
    recordCustomerArrival,
    recordInsuranceReceived,
    notifyGuardForCashPayment,
    notifyGuardForCashInsurance,
    guardProcessDeparture,
    confirmAttendanceByGuard,
    confirmCashInsuranceByGuard,
    uploadDigitalInsuranceReceipt,
    approveCleanlinessAndExit,
    toggleAdminCommissionApproval,
    uploadRemainingPaymentReceipt,
    toggleGuestArrivalStatus,
    requestInsuranceRefundViaBank,
    requestInsuranceRefundViaGuardCash,
    finishBookingAndReturnInsurance,
  } = useApp();

  const [guardConfirm, setGuardConfirm] = useState<GuardActionModalData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [detailsTitle, setDetailsTitle] = useState('تفاصيل الحجز');

  // استرداد المحول (تأمين الحجز المسترد)
  const [refundModalBooking, setRefundModalBooking] = useState<Booking | null>(null);
  const [refundMethod, setRefundMethod] = useState<'bank' | 'cash'>('bank');
  const [refundBankImageFile, setRefundBankImageFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [refundBankImageError, setRefundBankImageError] = useState<string | null>(null);
  const [refundCustomerIban, setRefundCustomerIban] = useState<string>('');
  const [refundNotes, setRefundNotes] = useState<string>('');
  const [copiedGuardCashRefund, setCopiedGuardCashRefund] = useState<boolean>(false);

  // إنهاء الحجز مع رفع إيصال التأمين
  const [finishBookingModal, setFinishBookingModal] = useState<Booking | null>(null);
  const [finishReceiptFile, setFinishReceiptFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [finishFileError, setFinishFileError] = useState<string | null>(null);
  const [finishNotes, setFinishNotes] = useState<string>('');

  // 1. تذكير الحجز الترحيبي للعميل (الأيقونة الأولى)
  const [welcomeReminderBooking, setWelcomeReminderBooking] = useState<Booking | null>(null);
  const [welcomeReminderCustomText, setWelcomeReminderCustomText] = useState<string>('');
  const [copiedWelcome, setCopiedWelcome] = useState(false);

  // 2. سداد وتحصيل المتبقي (الأيقونة الثانية)
  const [remainingPaymentBooking, setRemainingPaymentBooking] = useState<Booking | null>(null);
  const [remainingPaymentTab, setRemainingPaymentTab] = useState<'receipt' | 'cash'>('receipt');
  const [remainingPaymentReceiptFile, setRemainingPaymentReceiptFile] = useState<{ name: string; dataUrl?: string } | null>(null);
  const [remainingPaymentFileError, setRemainingPaymentFileError] = useState<string | null>(null);
  const [remainingPaymentNotes, setRemainingPaymentNotes] = useState('');
  const [copiedRemainingCash, setCopiedRemainingCash] = useState(false);

  // 3. إدارة وتوثيق التأمين (الأيقونة الثالثة)
  const [insuranceActionBooking, setInsuranceActionBooking] = useState<Booking | null>(null);
  const [insuranceActionTab, setInsuranceActionTab] = useState<'receipt' | 'cash'>('receipt');
  const [insuranceActionReceiptFile, setInsuranceActionReceiptFile] = useState<{ name: string; dataUrl?: string } | null>(null);
  const [insuranceActionFileError, setInsuranceActionFileError] = useState<string | null>(null);
  const [insuranceActionCashAmount, setInsuranceActionCashAmount] = useState<number>(500);
  const [insuranceActionNotes, setInsuranceActionNotes] = useState('');
  const [copiedInsuranceCash, setCopiedInsuranceCash] = useState(false);

  // Guard Cash Insurance Modal State
  const [guardCashModalBooking, setGuardCashModalBooking] = useState<Booking | null>(null);
  const [guardCashReceivedAmount, setGuardCashReceivedAmount] = useState<number>(500);
  const [guardCashNotes, setGuardCashNotes] = useState<string>('');

  // Marketer Cash Insurance Alert Modal State
  const [marketerCashAlertBooking, setMarketerCashAlertBooking] = useState<Booking | null>(null);
  const [marketerCashAlertAmount, setMarketerCashAlertAmount] = useState<number>(500);
  const [marketerCashAlertNotes, setMarketerCashAlertNotes] = useState<string>('');

  // Complete payment modal state
  const [paymentModalBooking, setPaymentModalBooking] = useState<Booking | null>(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState<{ name: string; dataUrl?: string } | null>(null);
  const [paymentFileError, setPaymentFileError] = useState<string | null>(null);

  // Digital Insurance Receipt Uploader State
  const [digitalInsuranceBooking, setDigitalInsuranceBooking] = useState<Booking | null>(null);
  const [digitalInsuranceFile, setDigitalInsuranceFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [digitalInsuranceError, setDigitalInsuranceError] = useState<string | null>(null);
  const [digitalInsuranceNotes, setDigitalInsuranceNotes] = useState<string>('');

  // New Arrival Modal State
  const [arrivalModalBooking, setArrivalModalBooking] = useState<Booking | null>(null);
  const [arrivalPayMethod, setArrivalPayMethod] = useState<'receipt' | 'cash'>('receipt');
  const [arrivalReceiptFile, setArrivalReceiptFile] = useState<{ name: string; dataUrl?: string } | null>(null);
  const [arrivalFileError, setArrivalFileError] = useState<string | null>(null);
  const [arrivalNotes, setArrivalNotes] = useState('');

  // Marketer Complete Payment Modal State
  const [marketerPaymentModalBooking, setMarketerPaymentModalBooking] = useState<Booking | null>(null);
  const [marketerPaymentTab, setMarketerPaymentTab] = useState<'welcome' | 'payment'>('payment');
  const [marketerPayMethod, setMarketerPayMethod] = useState<'receipt' | 'cash'>('receipt');
  const [marketerReceiptFile, setMarketerReceiptFile] = useState<{ name: string; dataUrl?: string } | null>(null);
  const [marketerFileError, setMarketerFileError] = useState<string | null>(null);
  const [marketerWelcomeCustomText, setMarketerWelcomeCustomText] = useState('');

  // New Insurance Modal State
  const [insuranceModalBooking, setInsuranceModalBooking] = useState<Booking | null>(null);
  const [insurancePayMethod, setInsurancePayMethod] = useState<'receipt' | 'cash'>('receipt');
  const [insuranceReceiptFile, setInsuranceReceiptFile] = useState<{ name: string; dataUrl?: string } | null>(null);
  const [insuranceFileError, setInsuranceFileError] = useState<string | null>(null);
  const [insuranceNotes, setInsuranceNotes] = useState('');

  // Insurance confirmation modal (old quick confirm)
  const [insuranceConfirmBooking, setInsuranceConfirmBooking] = useState<Booking | null>(null);

  // Receipt view modal
  const [viewReceiptBooking, setViewReceiptBooking] = useState<Booking | null>(null);
  const [activeReceiptViewer, setActiveReceiptViewer] = useState<ActiveReceiptViewerData | null>(null);

  const handleDownloadReceipt = (dataUrl?: string, filename?: string) => {
    if (!dataUrl) {
      showToast('عذراً، ملف الإيصال غير متاح للتحميل');
      return;
    }
    try {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename || `receipt-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('تم حفظ وتحميل صورة الإيصال بنجاح ✓');
    } catch {
      window.open(dataUrl, '_blank');
    }
  };

  const openReceiptModal = (
    type: 'remaining' | 'insurance' | 'deposit' | 'refund' | 'customer_account' | 'damage',
    bk: Booking,
    damagePhoto?: { name: string; dataUrl: string }
  ) => {
    if (type === 'remaining') {
      setActiveReceiptViewer({
        title: `إيصال سداد المبلغ المتبقي - حجز #${bk.bookingNumber}`,
        receiptType: 'remaining',
        receiptTypeName: 'إيصال سداد المتبقي (تحويل بنكي)',
        receiptUrl: bk.paymentReceiptDataUrl,
        receiptName: bk.paymentReceiptName || `payment-${bk.bookingNumber}.png`,
        booking: bk,
        uploadedBy: bk.paymentCompletedBy || bk.marketerName || 'المسوقة',
        uploadedAt: bk.paymentCompletedAt,
        notes: bk.paymentNotes,
        amount: bk.totalPrice - bk.depositPaid,
      });
    } else if (type === 'insurance') {
      setActiveReceiptViewer({
        title: `إيصال التأمين - حجز #${bk.bookingNumber}`,
        receiptType: 'insurance',
        receiptTypeName: bk.digitalInsurancePaymentMethod === 'cash' || bk.insurancePaymentMethod === 'cash' ? 'توثيق تأمين كاش' : 'إيصال تحويل التأمين البنكي',
        receiptUrl: bk.digitalInsuranceReceiptUrl || bk.insuranceReceiptDataUrl,
        receiptName: bk.digitalInsuranceReceiptName || bk.insuranceReceiptName || `insurance-${bk.bookingNumber}.png`,
        booking: bk,
        uploadedBy: bk.insuranceUploadedBy || bk.marketerName || 'المسوقة',
        uploadedAt: bk.insuranceUploadedAt,
        notes: bk.digitalInsuranceNotes,
        amount: bk.insuranceAmount,
      });
    } else if (type === 'customer_account') {
      setActiveReceiptViewer({
        title: `صورة الحساب البنكي لاسترداد التأمين - حجز #${bk.bookingNumber}`,
        receiptType: 'customer_account',
        receiptTypeName: 'صورة الحساب البنكي / الآيبان للنزيل',
        receiptUrl: bk.customerBankReceiptUrl,
        receiptName: bk.customerBankReceiptName || `bank-account-${bk.bookingNumber}.png`,
        booking: bk,
        uploadedBy: bk.insuranceRefundRequestedBy || bk.marketerName || 'المسوقة',
        uploadedAt: bk.insuranceRefundRequestedAt,
        notes: bk.insuranceRefundNotes,
        amount: bk.insuranceAmount,
        customerIban: bk.customerIban,
      });
    } else if (type === 'refund') {
      setActiveReceiptViewer({
        title: `إيصال استرداد التأمين للنزيل - حجز #${bk.bookingNumber}`,
        receiptType: 'refund',
        receiptTypeName: 'إيصال تحويل استرداد التأمين البنكي',
        receiptUrl: bk.insuranceRefundReceiptUrl,
        receiptName: bk.insuranceRefundReceiptName || `refund-${bk.bookingNumber}.png`,
        booking: bk,
        uploadedBy: bk.insuranceRefundProcessedBy || 'الإدارة',
        uploadedAt: bk.insuranceRefundProcessedAt,
        notes: bk.insuranceRefundNotes,
        amount: bk.insuranceAmount,
      });
    } else if (type === 'deposit') {
      setActiveReceiptViewer({
        title: `إيصال العربون المبدئي - حجز #${bk.bookingNumber}`,
        receiptType: 'deposit',
        receiptTypeName: 'إيصال تحويل العربون',
        receiptUrl: bk.depositReceiptUrl,
        receiptName: `deposit-${bk.bookingNumber}.png`,
        booking: bk,
        uploadedBy: bk.marketerName || 'المسوقة',
        uploadedAt: bk.createdAt,
        amount: bk.depositPaid,
      });
    } else if (type === 'damage' && damagePhoto) {
      setActiveReceiptViewer({
        title: `صورة معاينة / أضرار الحارس - حجز #${bk.bookingNumber}`,
        receiptType: 'damage',
        receiptTypeName: 'صورة معاينة العبث والأضرار',
        receiptUrl: damagePhoto.dataUrl,
        receiptName: damagePhoto.name || `damage-${bk.bookingNumber}.png`,
        booking: bk,
        uploadedBy: bk.guardCheckoutStaff || 'الحارس',
        uploadedAt: bk.checkedOutAt,
        notes: bk.guardDamageNotes,
      });
    }
  };

  const renderBookingReceiptBadges = (bk: Booking) => {
    const hasRemaining = Boolean(bk.paymentReceiptDataUrl || bk.paymentReceiptName);
    const hasInsurance = Boolean(bk.digitalInsuranceReceiptUrl || bk.insuranceReceiptDataUrl || bk.insuranceReceiptName);
    const hasCustomerBank = Boolean(bk.customerBankReceiptUrl || bk.customerBankReceiptName);
    const hasRefund = Boolean(bk.insuranceRefundReceiptUrl || bk.insuranceRefundReceiptName);
    const hasDeposit = Boolean(bk.depositReceiptUrl);
    const photosList = bk.damagePhotos || bk.guardDamagePhotos || [];
    const hasDamagePhotos = photosList.length > 0;

    const hasAny = hasRemaining || hasInsurance || hasCustomerBank || hasRefund || hasDeposit || hasDamagePhotos;
    if (!hasAny) return null;

    return (
      <div className="bg-gradient-to-r from-purple-50/80 via-sky-50/70 to-emerald-50/80 border border-purple-200/90 rounded-xl p-2 sm:px-3 flex items-center justify-between gap-2 flex-wrap text-xs font-['Tajawal',sans-serif] shadow-2xs">
        <div className="flex items-center gap-1.5 text-purple-950 font-bold">
          <Paperclip className="w-3.5 h-3.5 text-purple-700 shrink-0" />
          <span className="text-[11px] sm:text-xs">المستندات والإيصالات المرفقة:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {hasRemaining && (
            <div className="inline-flex items-center rounded-lg overflow-hidden border border-emerald-300 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => openReceiptModal('remaining', bk)}
                className="px-2 py-1 text-emerald-800 hover:bg-emerald-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="معاينة إيصال سداد المتبقي"
              >
                <Eye className="w-3 h-3 text-emerald-600" />
                <span>إيصال المتبقي</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(bk.paymentReceiptDataUrl, bk.paymentReceiptName || `payment-${bk.bookingNumber}.png`)}
                className="px-1.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer border-r border-emerald-400 transition-colors"
                title="تحميل / حفظ صورة إيصال المتبقي بضغطة زر"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}

          {hasInsurance && (
            <div className="inline-flex items-center rounded-lg overflow-hidden border border-sky-300 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => openReceiptModal('insurance', bk)}
                className="px-2 py-1 text-sky-800 hover:bg-sky-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="معاينة إيصال تحويل التأمين"
              >
                <Eye className="w-3 h-3 text-sky-600" />
                <span>إيصال التأمين</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(bk.digitalInsuranceReceiptUrl || bk.insuranceReceiptDataUrl, bk.digitalInsuranceReceiptName || bk.insuranceReceiptName || `insurance-${bk.bookingNumber}.png`)}
                className="px-1.5 py-1 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer border-r border-sky-400 transition-colors"
                title="تحميل / حفظ صورة إيصال التأمين بضغطة زر"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}

          {hasCustomerBank && (
            <div className="inline-flex items-center rounded-lg overflow-hidden border border-purple-300 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => openReceiptModal('customer_account', bk)}
                className="px-2 py-1 text-purple-900 hover:bg-purple-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="معاينة صورة حساب/آيبان العميل لاسترداد التأمين"
              >
                <Eye className="w-3 h-3 text-purple-700" />
                <span>حساب العميل (استرداد)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(bk.customerBankReceiptUrl, bk.customerBankReceiptName || `iban-${bk.bookingNumber}.png`)}
                className="px-1.5 py-1 bg-purple-700 hover:bg-purple-800 text-white cursor-pointer border-r border-purple-500 transition-colors"
                title="تحميل / حفظ صورة حساب النزيل بضغطة زر"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}

          {hasRefund && (
            <div className="inline-flex items-center rounded-lg overflow-hidden border border-teal-300 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => openReceiptModal('refund', bk)}
                className="px-2 py-1 text-teal-800 hover:bg-teal-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="معاينة إيصال استرداد التأمين للعميل"
              >
                <Eye className="w-3 h-3 text-teal-600" />
                <span>إيصال الاسترداد</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(bk.insuranceRefundReceiptUrl, bk.insuranceRefundReceiptName || `refund-${bk.bookingNumber}.png`)}
                className="px-1.5 py-1 bg-teal-600 hover:bg-teal-700 text-white cursor-pointer border-r border-teal-400 transition-colors"
                title="تحميل / حفظ صورة إيصال الاسترداد بضغطة زر"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}

          {hasDeposit && (
            <div className="inline-flex items-center rounded-lg overflow-hidden border border-amber-300 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => openReceiptModal('deposit', bk)}
                className="px-2 py-1 text-amber-900 hover:bg-amber-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="معاينة إيصال العربون"
              >
                <Eye className="w-3 h-3 text-amber-600" />
                <span>إيصال العربون</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(bk.depositReceiptUrl, `deposit-${bk.bookingNumber}.png`)}
                className="px-1.5 py-1 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer border-r border-amber-400 transition-colors"
                title="تحميل / حفظ صورة العربون بضغطة زر"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}

          {hasDamagePhotos && photosList.map((photo: { name: string; dataUrl: string }, pIdx: number) => (
            <div key={pIdx} className="inline-flex items-center rounded-lg overflow-hidden border border-rose-300 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => openReceiptModal('damage', bk, photo)}
                className="px-2 py-1 text-rose-800 hover:bg-rose-50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title={`معاينة صورة معاينة الحارس #${pIdx + 1}`}
              >
                <Camera className="w-3 h-3 text-rose-600" />
                <span>صورة أضرار #{pIdx + 1}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(photo.dataUrl, photo.name || `damage-${bk.bookingNumber}-${pIdx + 1}.png`)}
                className="px-1.5 py-1 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer border-r border-rose-400 transition-colors"
                title="تحميل / حفظ صورة المعاينة بضغطة زر"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Guard Departure & Insurance Inspection Modal State (مغادرة اليوم: إعادة التأمين أو خصم مبلغ مع خانة إرفاق صور العبث والأضرار)
  const [guardInspectionBooking, setGuardInspectionBooking] = useState<Booking | null>(null);
  const [guardInspectionResult, setGuardInspectionResult] = useState<'full_refund' | 'deduction'>('full_refund');
  const [guardDeductionAmount, setGuardDeductionAmount] = useState<number>(0);
  const [guardDamageDesc, setGuardDamageDesc] = useState<string>('');
  const [guardDamagePhotos, setGuardDamagePhotos] = useState<{ name: string; dataUrl: string }[]>([]);
  const [guardInspectionError, setGuardInspectionError] = useState<string | null>(null);

  // Marketer Checkout Reminder Modal State (رسالة تذكير بالخروج تقوم المسوقة بذلك)
  const [reminderModalBooking, setReminderModalBooking] = useState<Booking | null>(null);
  const [customReminderMsg, setCustomReminderMsg] = useState<string>('');

  // Filter & search
  const [activeFilter, setActiveFilter] = useState<'all' | 'arrivals' | 'departures' | 'tracking'>('all');
  const [trackingSubFilter, setTrackingSubFilter] = useState<'all' | 'todayDepartures'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableProps, setShowAvailableProps] = useState(true);
  const [expandedBookingIds, setExpandedBookingIds] = useState<Record<string, boolean>>({});

  const toggleBookingExpanded = (id: string) => {
    setExpandedBookingIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Available today properties
  const availableTodayProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (!prop.isPublished) return false;
      const isBooked = bookings.some(
        (b) =>
          b.propertyId === prop.id &&
          b.status !== 'cancelled' &&
          todayStr >= b.checkInDate &&
          todayStr < b.checkOutDate
      );
      return !isBooked;
    });
  }, [properties, bookings, todayStr]);

  const activeBookings = useMemo(() => {
    return filteredBookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'waiting_deposit'
    );
  }, [filteredBookings]);

  // Marketer sees today's arrivals for their bookings only, Admin & Guard see all
  const visibleArrivals = useMemo(() => {
    const strictlyArrivalsToday = todayArrivals.filter(
      (b) => b.status !== 'cancelled' && (b.checkInDate ? b.checkInDate.split('T')[0].trim() : '') === todayStr
    );
    if (isAdmin) return strictlyArrivalsToday;
    if (isGuard) {
      if (!guard.assignedPropertyId) return strictlyArrivalsToday;
      return strictlyArrivalsToday.filter((b) => b.propertyId === guard.assignedPropertyId);
    }
    // Marketer: strictly show only their own bookings
    return strictlyArrivalsToday.filter(
      (b) => b.marketerId === currentMarketerId || (currentMarketer && b.marketerName === currentMarketer.name)
    );
  }, [todayArrivals, todayStr, isAdmin, isGuard, guard.assignedPropertyId, currentMarketerId, currentMarketer]);

  // Marketer sees today's departures for their bookings only, Admin & Guard see all
  const visibleDepartures = useMemo(() => {
    const strictlyDeparturesToday = todayDepartures.filter(
      (b) => b.status !== 'cancelled' && (b.checkOutDate ? b.checkOutDate.split('T')[0].trim() : '') === todayStr
    );
    if (isAdmin) return strictlyDeparturesToday;
    if (isGuard) {
      if (!guard.assignedPropertyId) return strictlyDeparturesToday;
      return strictlyDeparturesToday.filter((b) => b.propertyId === guard.assignedPropertyId);
    }
    // Marketer: strictly show only their own bookings
    return strictlyDeparturesToday.filter(
      (b) => b.marketerId === currentMarketerId || (currentMarketer && b.marketerName === currentMarketer.name)
    );
  }, [todayDepartures, todayStr, isAdmin, isGuard, guard.assignedPropertyId, currentMarketerId, currentMarketer]);

  // All bookings filtered strictly according to user role:
  // Admin sees all, Guard sees assigned property, Marketer sees only their own
  const roleFilteredBookings = useMemo(() => {
    if (isAdmin) return bookings;
    if (isGuard) {
      if (!guard.assignedPropertyId) return bookings;
      return bookings.filter((b) => b.propertyId === guard.assignedPropertyId);
    }
    // Marketer: strictly show only their own bookings
    return bookings.filter(
      (b) => b.marketerId === currentMarketerId || (currentMarketer && b.marketerName === currentMarketer.name)
    );
  }, [bookings, isAdmin, isGuard, guard.assignedPropertyId, currentMarketerId, currentMarketer]);

  // Tracking Bookings: support 'all' vs 'todayDepartures'
  const trackingBookings = useMemo(() => {
    let list = roleFilteredBookings.filter((b) => b.status !== 'cancelled');
    if (trackingSubFilter === 'todayDepartures') {
      list = list.filter((b) => (b.checkOutDate ? b.checkOutDate.split('T')[0].trim() : '') === todayStr);
    }
    return [...list].sort((a, b) => {
      const aCheckIn = a.checkInDate ? a.checkInDate.split('T')[0].trim() : '';
      const aCheckOut = a.checkOutDate ? a.checkOutDate.split('T')[0].trim() : '';
      const bCheckIn = b.checkInDate ? b.checkInDate.split('T')[0].trim() : '';
      const bCheckOut = b.checkOutDate ? b.checkOutDate.split('T')[0].trim() : '';
      const aIsToday = aCheckIn === todayStr || aCheckOut === todayStr ? 1 : 0;
      const bIsToday = bCheckIn === todayStr || bCheckOut === todayStr ? 1 : 0;
      if (aIsToday !== bIsToday) return bIsToday - aIsToday;
      return bCheckIn.localeCompare(aCheckIn);
    });
  }, [roleFilteredBookings, trackingSubFilter, todayStr]);

  const matchesSearch = (b: Booking) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      b.customerName.toLowerCase().includes(term) ||
      b.customerPhone.includes(term) ||
      b.propertyName.toLowerCase().includes(term) ||
      (b.marketerName && b.marketerName.toLowerCase().includes(term))
    );
  };

  const searchFilteredArrivals = useMemo(() => visibleArrivals.filter(matchesSearch), [visibleArrivals, searchTerm]);
  const searchFilteredDepartures = useMemo(() => visibleDepartures.filter(matchesSearch), [visibleDepartures, searchTerm]);
  const searchFilteredActive = useMemo(() => activeBookings.filter(matchesSearch), [activeBookings, searchTerm]);
  const searchFilteredTracking = useMemo(
    () => trackingBookings.filter(matchesSearch),
    [trackingBookings, searchTerm]
  );
  const waitingDepositBookings = useMemo(
    () => bookings.filter((b) => b.status === 'waiting_deposit').filter(matchesSearch),
    [bookings, searchTerm]
  );

  // مسار تتبع مراحل الحجز التلقائي (الـ 5 مراحل)
  const getBookingStages = (bk: Booking) => {
    // 1- تم الدخول (عند تسجيل دخول النزيل)
    const isEntered = Boolean(
      bk.guestArrived ||
      bk.arrivalConfirmedAt ||
      (bk.status !== 'cancelled' && bk.status !== 'waiting_deposit' && todayStr >= bk.checkInDate)
    );

    // 2- تم دفع المتبقي (فور سداد المبلغ المتبقي)
    const isRemainingPaid = Boolean(
      bk.remainingAmount <= 0 ||
      bk.paymentCompleted ||
      bk.arrivalPaymentMethod === 'receipt' ||
      bk.arrivalPaymentMethod === 'cash'
    );

    // 3- تم دفع التأمين (فور استلام أو دفع التأمين)
    const isInsurancePaid = Boolean(
      bk.insuranceReceivedCash ||
      bk.insurancePaymentMethod ||
      bk.cashInsuranceConfirmedByGuard ||
      bk.insuranceReceivedAmount ||
      bk.digitalInsuranceReceiptUrl
    );

    // 4- تم الخروج (فور تسجيل خروج النزيل)
    const isCheckedOut = Boolean(
      bk.checkedOut ||
      bk.cleanlinessApproved ||
      bk.status === 'completed'
    );

    // 5- تم استرجاع التأمين (فور إرجاع التأمين للنزيل)
    const isInsuranceRefunded = Boolean(
      bk.insuranceReturned
    );

    let completedCount = 0;
    if (isEntered) completedCount++;
    if (isRemainingPaid) completedCount++;
    if (isInsurancePaid) completedCount++;
    if (isCheckedOut) completedCount++;
    if (isInsuranceRefunded) completedCount++;

    return {
      isEntered,
      isRemainingPaid,
      isInsurancePaid,
      isCheckedOut,
      isInsuranceRefunded,
      completedCount,
    };
  };
  const completedBookingsCount = useMemo(
    () => bookings.filter((b) => b.status === 'completed').length,
    [bookings]
  );

  const handleCheckoutReminder = (bookingId: string) => {
    const { whatsappUrl } = sendCheckoutReminder(bookingId);
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
    showToast('تم فتح واتساب مع نص تذكير الخروج للعميل بنجاح');
  };

  const handlePaymentReminder = (bookingId: string) => {
    const { whatsappUrl } = sendPaymentCompletionRequest(bookingId);
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
    showToast('تم فتح واتساب مع نص تذكير الدفع للعميل');
  };

  const openPaymentModal = (b: Booking) => {
    setPaymentModalBooking(b);
    setPaymentReceiptFile(null);
    setPaymentFileError(null);
  };

  const handleReceiptFileChange = (file?: File) => {
    setPaymentFileError(null);
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setPaymentFileError('حجم الملف كبير، يرجى اختيار ملف أقل من 2 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentReceiptFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitPaymentCompletion = () => {
    if (!paymentModalBooking || !paymentReceiptFile) return;
    completeBookingPayment(paymentModalBooking.id, paymentReceiptFile.name, paymentReceiptFile.dataUrl);
    setPaymentModalBooking(null);
    setPaymentReceiptFile(null);
    showToast('تم حفظ الإيصال وتسجيل إكمال الدفع بنجاح');
  };

  const confirmInsuranceHandover = () => {
    if (insuranceConfirmBooking) {
      returnInsuranceDeposit(insuranceConfirmBooking.id);
      setInsuranceConfirmBooking(null);
      showToast('تم تسجيل تسليم التأمين للعميل بنجاح');
    }
  };

  const openArrivalModal = (bk: Booking) => {
    setArrivalModalBooking(bk);
    setArrivalPayMethod('receipt');
    setArrivalReceiptFile(null);
    setArrivalFileError(null);
    setArrivalNotes('');
  };

  const handleArrivalReceiptChange = (file?: File) => {
    setArrivalFileError(null);
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setArrivalFileError('حجم الملف كبير، يرجى اختيار ملف أقل من 3 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setArrivalReceiptFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitArrivalConfirmation = () => {
    if (!arrivalModalBooking) return;
    if (arrivalPayMethod === 'receipt' && arrivalModalBooking.remainingAmount > 0 && !arrivalReceiptFile) {
      setArrivalFileError('يرجى إرفاق صورة إيصال السداد البنكي للمتابعة.');
      return;
    }
    recordCustomerArrival({
      bookingId: arrivalModalBooking.id,
      paymentMethod: arrivalPayMethod,
      receiptName: arrivalReceiptFile?.name,
      receiptDataUrl: arrivalReceiptFile?.dataUrl,
      notes: arrivalNotes,
    });
    const targetBooking = arrivalModalBooking;
    setArrivalModalBooking(null);
    showToast(`تم تأكيد وصول العميل (${targetBooking.customerName}) وإرسال إشعار فوري للحارس والإدارة بنجاح ✓`);
  };

  const handleGuardArrivalClick = (bk: Booking) => {
    confirmAttendanceByGuard(bk.id);
    showToast(`تم [تأكيد الحضور] للعميل (${bk.customerName}) وإرسال إشعار فوري لمسوقة الحجز بنجاح ✓`);
  };

  const handleGuardConfirmAttendance = (bk: Booking) => {
    confirmAttendanceByGuard(bk.id);
    showToast(`تم [تأكيد الحضور] للعميل (${bk.customerName}) وإرسال إشعار فوري لمسوقة الحجز بنجاح ✓`);
  };

  const handleSendPaymentCompletionWhatsApp = (bk: Booking) => {
    const res = sendPaymentCompletionRequest(bk.id);
    if (res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank');
    }
    showToast(`تم فتح واتساب بقالب [إكمال المتبقي والتأمين] للعميل (${bk.customerName}) بنجاح ✓`);
  };

  const handleGuardConfirmCashInsurance = (bk: Booking) => {
    confirmCashInsuranceByGuard(bk.id);
    showToast(`تم [تأكيد استلام التأمين كاش] بمبلغ (${bk.insuranceAmount} ر.س) للعميل (${bk.customerName}) وتوثيقه بالنظام ✓`);
  };

  const handleMarketerSendCheckoutReminder = (bk: Booking) => {
    const res = sendCheckoutReminder(bk.id);
    if (res.whatsappUrl) {
      window.open(res.whatsappUrl, '_blank');
    }
    showToast(`تم إرسال [تذكير بالخروج] عبر واتساب للعميل (${bk.customerName}) وتنبيهه لتفادي خصم التأمين ✓`);
  };

  const handleGuardApproveCleanlinessAndExit = (bk: Booking) => {
    approveCleanlinessAndExit({
      bookingId: bk.id,
      result: 'full_refund',
    });
    showToast(`تم [تأكيد النظافة والخروج] للعميل (${bk.customerName}) وإغلاق دورة الحجز بنجاح ✓`);
  };

  const openMarketerPaymentModal = (bk: Booking, defaultTab: 'welcome' | 'payment' = 'payment') => {
    setMarketerPaymentModalBooking(bk);
    setMarketerPaymentTab(defaultTab);
    setMarketerPayMethod('receipt');
    setMarketerReceiptFile(null);
    setMarketerFileError(null);
    setMarketerWelcomeCustomText(
      `أهلاً وسهلاً بك أخي الكريم ${bk.customerName} في ${bk.propertyName} 🌿 يسعدنا ويشرفنا استقبالكم اليوم، ونتمنى لكم أوقاتاً ممتعة وسعيدة. لأي استفسار أو خدمة طوال إقامتكم نحن والحارس (${guard?.name || 'أبو راشد'}) بخدمتكم دائماً.`
    );
  };

  const handleMarketerReceiptChange = (file?: File) => {
    setMarketerFileError(null);
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setMarketerFileError('حجم الملف كبير، يرجى اختيار ملف أقل من 3 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMarketerReceiptFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitMarketerPayment = () => {
    if (!marketerPaymentModalBooking) return;
    const bk = marketerPaymentModalBooking;

    if (marketerPayMethod === 'receipt') {
      if (!marketerReceiptFile && bk.remainingAmount > 0) {
        setMarketerFileError('يرجى إرفاق صورة إيصال السداد البنكي للمتابعة.');
        return;
      }
      completeBookingPayment(bk.id, marketerReceiptFile?.name || 'إيصال سداد', marketerReceiptFile?.dataUrl);
      setMarketerPaymentModalBooking(null);
      showToast(`تم حفظ الإيصال وتأكيد إكمال الدفع للعميل (${bk.customerName}) بنجاح ✓`);
    } else {
      // تسليم المبلغ كاش: يرسل إشعار للحارس للذهاب لاستلام المبلغ وسعر المبلغ المتبقي
      notifyGuardForCashPayment({ bookingId: bk.id });
      setMarketerPaymentModalBooking(null);
      showToast(`تم إرسال إشعار عاجل للحارس (${guard?.name || 'أبو راشد'}) بالتوجه لاستلام المبلغ المتبقي (${bk.remainingAmount} ر.س) كاش ✓`);
    }
  };

  const sendWelcomeMessageWhatsApp = (bk: Booking, customMsg?: string) => {
    let clean = bk.customerPhone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '966' + clean.substring(1);
    else if (!clean.startsWith('966')) clean = '966' + clean;

    const text =
      customMsg ||
      `أهلاً وسهلاً بك أخي الكريم ${bk.customerName} في ${bk.propertyName} 🌿 يسعدنا ويشرفنا استقبالكم اليوم، ونتمنى لكم أوقاتاً ممتعة وسعيدة. لأي استفسار أو خدمة طوال إقامتكم نحن والحارس (${guard?.name || 'أبو راشد'}) بخدمتكم دائماً.`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
    showToast('تم فتح محادثة واتساب لإرسال رسالة الترحيب للعميل');
  };

  const copyTextToClipboard = (text: string, onSuccess: () => void) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        onSuccess();
        showToast('تم نسخ النص بنجاح للمراسلة عبر الواتساب والتطبيق ✓');
      }).catch(() => {
        fallbackCopy(text, onSuccess);
      });
    } else {
      fallbackCopy(text, onSuccess);
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      onSuccess();
      showToast('تم نسخ النص بنجاح للمراسلة عبر الواتساب والتطبيق ✓');
    } catch {
      showToast('تعذر النسخ التلقائي، يرجى التحديد والنسخ يدوياً');
    }
  };

  // الأيقونة الأولى: 💬 تذكير الحجز
  const openWelcomeReminderModal = (bk: Booking) => {
    const prop = properties.find((p) => p.id === bk.propertyId);
    const checkInTime = prop?.checkInTimeText || 'الساعة 5:00 عصراً';
    const propGuard = guardsList?.find((g) => g.assignedPropertyId === bk.propertyId) || guard;
    const defaultText = `أهلاً وسهلاً بك أخي الكريم ${bk.customerName} في (${bk.propertyName}) 🌿
يسعدنا ويشرفنا استقبالكم اليوم، ونود تذكيركم بتفاصيل موعد الدخول وتجهيز المكان:

• موعد الدخول: ${checkInTime}
• المبلغ المتبقي للإقامة: ${bk.remainingAmount} ر.س
• مبلغ التأمين المسترد: ${bk.insuranceAmount} ر.س (على نفس الحساب)

🏦 بيانات الحساب البنكي المعتمد للتحويل:
• اسم البنك: ${prop?.bankName || 'مصرف الراجحي'}
• المستفيد: ${prop?.accountHolder || 'استراحات وشاليهات ماسة'}
• رقم الآيبان (IBAN):
${prop?.iban || 'SA0380000201608010998877'}

نتمنى لكم إقامة سعيدة وممتعة! لأي استفسار نحن والحارس (${propGuard?.name || 'أبو راشد'}) بخدمتكم دائماً ✨`;

    setWelcomeReminderBooking(bk);
    setWelcomeReminderCustomText(defaultText);
    setCopiedWelcome(false);
  };

  // الأيقونة الثانية: 💳 المتبقي
  const openRemainingPaymentModal = (bk: Booking) => {
    setRemainingPaymentBooking(bk);
    setRemainingPaymentTab('receipt');
    setRemainingPaymentReceiptFile(null);
    setRemainingPaymentFileError(null);
    setRemainingPaymentNotes('');
    setCopiedRemainingCash(false);
  };

  const handleRemainingReceiptFileChange = (file?: File) => {
    setRemainingPaymentFileError(null);
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setRemainingPaymentFileError('حجم الملف كبير، يرجى اختيار ملف أقل من 4 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRemainingPaymentReceiptFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitRemainingReceiptToAdmin = () => {
    if (!remainingPaymentBooking) return;
    if (!remainingPaymentReceiptFile?.dataUrl) {
      setRemainingPaymentFileError('يرجى اختيار وإرفاق صورة إيصال السداد البنكي للمتابعة.');
      return;
    }
    uploadRemainingPaymentReceipt({
      bookingId: remainingPaymentBooking.id,
      receiptName: remainingPaymentReceiptFile.name,
      receiptDataUrl: remainingPaymentReceiptFile.dataUrl,
      notes: remainingPaymentNotes,
    });
    setRemainingPaymentBooking(null);
    showToast('تم رفع صورة الإيصال وإرسالها فوراً إلى «تنبيهات الإدارة» لحفظها ومراجعتها بنجاح ✓');
  };

  const submitRemainingCashToGuard = () => {
    if (!remainingPaymentBooking) return;
    notifyGuardForCashPayment({
      bookingId: remainingPaymentBooking.id,
      notes: remainingPaymentNotes,
    });
    setRemainingPaymentBooking(null);
    showToast(`تم إرسال إشعار فوري للوحة الحارس لاستلام المتبقي (${remainingPaymentBooking.remainingAmount} ر.س) كاش بنجاح ✓`);
  };

  const getRemainingCashGuardText = (bk: Booking) => {
    const propGuard = guardsList?.find((g) => g.assignedPropertyId === bk.propertyId) || guard;
    return `السلام عليكم يا ${propGuard?.name || 'أبو راشد'}، بخصوص حجز اليوم في ${bk.propertyName} للعميل ${bk.customerName} (جوال: ${bk.customerPhone}): يرجى التوجه واستلام المبلغ المتبقي كاش وقدره (${bk.remainingAmount} ر.س) وتأكيده بالنظام.${remainingPaymentNotes ? ` ملاحظات: ${remainingPaymentNotes}` : ''}`;
  };

  // الأيقونة الثالثة: 🛡️ التأمين
  const openInsuranceActionModal = (bk: Booking) => {
    setInsuranceActionBooking(bk);
    setInsuranceActionTab('receipt');
    setInsuranceActionReceiptFile(null);
    setInsuranceActionFileError(null);
    setInsuranceActionCashAmount(bk.insuranceAmount);
    setInsuranceActionNotes('');
    setCopiedInsuranceCash(false);
  };

  const handleInsuranceActionReceiptChange = (file?: File) => {
    setInsuranceActionFileError(null);
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setInsuranceActionFileError('حجم الملف كبير، يرجى اختيار ملف أقل من 4 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setInsuranceActionReceiptFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitInsuranceReceiptToAdmin = () => {
    if (!insuranceActionBooking) return;
    if (!insuranceActionReceiptFile?.dataUrl) {
      setInsuranceActionFileError('يرجى اختيار وإرفاق صورة إيصال التأمين البنكي للمتابعة.');
      return;
    }
    uploadDigitalInsuranceReceipt({
      bookingId: insuranceActionBooking.id,
      receiptName: insuranceActionReceiptFile.name,
      receiptDataUrl: insuranceActionReceiptFile.dataUrl,
      notes: insuranceActionNotes,
    });
    setInsuranceActionBooking(null);
    showToast('تم رفع صورة إيصال التأمين البنكي وإرسالها فوراً إلى «تنبيهات الإدارة» لحفظها ومراجعتها بنجاح ✓');
  };

  const submitInsuranceCashToGuard = () => {
    if (!insuranceActionBooking) return;
    const amount = insuranceActionCashAmount || insuranceActionBooking.insuranceAmount;
    notifyGuardForCashInsurance({
      bookingId: insuranceActionBooking.id,
      insuranceAmount: amount,
      notes: insuranceActionNotes,
    });
    setInsuranceActionBooking(null);
    showToast(`تم إرسال إشعار فوري للوحة الحارس لاستلام مبلغ التأمين (${amount} ر.س) كاش بنجاح ✓`);
  };

  const getInsuranceCashGuardText = (bk: Booking) => {
    const propGuard = guardsList?.find((g) => g.assignedPropertyId === bk.propertyId) || guard;
    const amount = insuranceActionCashAmount || bk.insuranceAmount;
    return `السلام عليكم يا ${propGuard?.name || 'أبو راشد'}، بخصوص حجز اليوم في ${bk.propertyName} للعميل ${bk.customerName} (جوال: ${bk.customerPhone}): يرجى التوجه واستلام مبلغ التأمين كاش وقدره (${amount} ر.س) وتأكيده بالنظام.${insuranceActionNotes ? ` ملاحظات: ${insuranceActionNotes}` : ''}`;
  };

  // مؤشر حالة الوصول: أداة سريعة
  const handleToggleArrival = (bk: Booking) => {
    const res = toggleGuestArrivalStatus(bk.id);
    if (res.isArrived) {
      showToast(`تم تأكيد وصول العميل (${bk.customerName}) وإرسال إشعار تلقائي فوري للحارس والإدارة بنجاح ✓`);
    } else {
      showToast(`تم إعادة حالة النزيل (${bk.customerName}) إلى (انتظار الوصول) بنجاح`);
    }
  };

  // استرداد المحول (تأمين الحجز المسترد)
  const openInsuranceRefundModal = (bk: Booking) => {
    setRefundModalBooking(bk);
    setRefundMethod(bk.insurancePaymentMethod === 'cash' || bk.insuranceReceivedCash ? 'cash' : 'bank');
    setRefundBankImageFile(
      bk.customerBankReceiptUrl
        ? { name: bk.customerBankReceiptName || 'صورة الحساب المحفوظة', dataUrl: bk.customerBankReceiptUrl }
        : null
    );
    setRefundCustomerIban(bk.customerIban || '');
    setRefundNotes('');
    setRefundBankImageError(null);
    setCopiedGuardCashRefund(false);
  };

  const handleRefundBankImageChange = (file?: File) => {
    setRefundBankImageError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setRefundBankImageError('حجم الصورة كبير، يرجى اختيار ملف أقل من 5 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRefundBankImageFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitRefundBankToAdmin = () => {
    if (!refundModalBooking) return;
    if (!refundBankImageFile && !refundCustomerIban.trim()) {
      setRefundBankImageError('يرجى رفع صورة الحساب البنكي / الآيبان أو كتابة رقم الآيبان للمتابعة.');
      return;
    }
    requestInsuranceRefundViaBank({
      bookingId: refundModalBooking.id,
      bankReceiptName: refundBankImageFile?.name,
      bankReceiptDataUrl: refundBankImageFile?.dataUrl,
      customerIban: refundCustomerIban.trim(),
      notes: refundNotes,
    });
    setRefundModalBooking(null);
    showToast('تم حفظ صورة الحساب وإرسال تنبيه فوري للإدارة لمراجعة التحويل بنجاح ✓');
  };

  const submitRefundCashToGuard = () => {
    if (!refundModalBooking) return;
    requestInsuranceRefundViaGuardCash({
      bookingId: refundModalBooking.id,
      notes: refundNotes,
    });
    setRefundModalBooking(null);
    showToast('تم إرسال توجيه فوري للوحة الحارس لتسليم التأمين كاش للنزيل بنجاح ✓');
  };

  const getGuardCashRefundText = (bk: Booking) => {
    const propGuard = guardsList?.find((g) => g.assignedPropertyId === bk.propertyId) || guard;
    const deduction = bk.insuranceDeductionAmount || 0;
    const refundAmount = Math.max(0, bk.insuranceAmount - deduction);
    return `السلام عليكم يا ${propGuard?.name || 'أبو راشد'}، بخصوص مغادرة اليوم في ${bk.propertyName} للعميل ${bk.customerName} (جوال: ${bk.customerPhone}): يرجى تسليم مبلغ التأمين كاش للنزيل وقدره (${refundAmount} ر.س) عند الخروج.${refundNotes ? ` ملاحظات: ${refundNotes}` : ''}`;
  };

  // إنهاء الحجز مع خيار رفع إيصال التأمين
  const openFinishBookingModal = (bk: Booking) => {
    setFinishBookingModal(bk);
    setFinishReceiptFile(
      bk.insuranceRefundReceiptUrl
        ? { name: bk.insuranceRefundReceiptName || 'إيصال التأمين المسترد', dataUrl: bk.insuranceRefundReceiptUrl }
        : null
    );
    setFinishFileError(null);
    setFinishNotes('');
  };

  const handleFinishReceiptChange = (file?: File) => {
    setFinishFileError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFinishFileError('حجم الملف كبير، يرجى اختيار ملف أقل من 5 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFinishReceiptFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitFinishBooking = () => {
    if (!finishBookingModal) return;
    finishBookingAndReturnInsurance({
      bookingId: finishBookingModal.id,
      receiptName: finishReceiptFile?.name,
      receiptDataUrl: finishReceiptFile?.dataUrl,
      notes: finishNotes,
    });
    setFinishBookingModal(null);
    showToast(`تم إنهاء الحجز #${finishBookingModal.bookingNumber} بنجاح وإرسال إشعار فوري للمسوقة والإدارة ✓`);
  };

  const openInsuranceModal = (bk: Booking) => {
    setInsuranceModalBooking(bk);
    setInsurancePayMethod('receipt');
    setInsuranceReceiptFile(null);
    setInsuranceFileError(null);
    setInsuranceNotes('');
  };

  const handleInsuranceReceiptChange = (file?: File) => {
    setInsuranceFileError(null);
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setInsuranceFileError('حجم الملف كبير، يرجى اختيار ملف أقل من 3 ميجابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setInsuranceReceiptFile({ name: file.name, dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const submitInsuranceConfirmation = () => {
    if (!insuranceModalBooking) return;
    if (insurancePayMethod === 'receipt' && !insuranceReceiptFile) {
      setInsuranceFileError('يجب إرفاق ملف إيصال التأمين البنكي للمتابعة!');
      return;
    }
    recordInsuranceReceived({
      bookingId: insuranceModalBooking.id,
      paymentMethod: insurancePayMethod,
      receiptName: insuranceReceiptFile?.name,
      receiptDataUrl: insuranceReceiptFile?.dataUrl,
      notes: insuranceNotes,
    });
    const targetBooking = insuranceModalBooking;
    setInsuranceModalBooking(null);
    showToast(`تم تأكيد استلام التأمين (${targetBooking.insuranceAmount} ر.س) وإرسال إشعار فوري للحارس والإدارة بنجاح ✓`);
  };

  const getWhatsAppCustomerUrl = (phone: string, name: string, prop: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '966' + clean.substring(1);
    else if (!clean.startsWith('966')) clean = '966' + clean;
    const text = `أهلاً بك أخي الكريم ${name}، يسعدنا استقبالكم اليوم في ${prop} الساعة 5 م. ونتمنى لكم إقامة ممتعة وسعيدة. لأي استفسار أو مساعدة نحن بخدمتكم دائماً.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppGuardUrl = (bk: Booking) => {
    let clean = (guard?.phone || '0598881234').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '966' + clean.substring(1);
    else if (!clean.startsWith('966')) clean = '966' + clean;
    const text = `السلام عليكم يا أبو راشد (${guard?.name || 'حارس الاستراحة'})، بخصوص حجز اليوم في ${bk.propertyName} للعميل ${bk.customerName} (جوال: ${bk.customerPhone}). حبيت أتابع معك موعد وصول النزيل وتجهيز الاستراحة واستلام التأمين (${bk.insuranceAmount} ريال).`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppAdminUrl = (bk: Booking) => {
    const text = `السلام عليكم إدارة ماسة (AMASA)، استفسار ومتابعة بخصوص حجز اليوم رقم ${bk.bookingNumber} في ${bk.propertyName} للعميل ${bk.customerName}. المتبقي للتحصيل: ${bk.remainingAmount} ر.س والتأمين: ${bk.insuranceAmount} ر.س.`;
    return `https://wa.me/966500000001?text=${encodeURIComponent(text)}`;
  };

  const openGuardInspectionModal = (bk: Booking) => {
    setGuardInspectionBooking(bk);
    setGuardInspectionResult('full_refund');
    setGuardDeductionAmount(0);
    setGuardDamageDesc('');
    setGuardDamagePhotos([]);
    setGuardInspectionError(null);
  };

  const handleDamagePhotoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGuardInspectionError(null);
    Array.from(files).forEach((file) => {
      if (file.size > 4 * 1024 * 1024) {
        setGuardInspectionError('تجاوزت بعض الصور الحد الأقصى المسموح (4 ميجابايت).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setGuardDamagePhotos((prev) => [...prev, { name: file.name, dataUrl: String(reader.result) }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDamagePhoto = (index: number) => {
    setGuardDamagePhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const submitGuardDepartureInspection = () => {
    if (!guardInspectionBooking) return;
    const bk = guardInspectionBooking;

    if (guardInspectionResult === 'deduction') {
      if (!guardDeductionAmount || guardDeductionAmount <= 0) {
        setGuardInspectionError('يرجى تحديد مبلغ الخصم بالريال السعودي.');
        return;
      }
      if (guardDeductionAmount > bk.insuranceAmount) {
        setGuardInspectionError(`مبلغ الخصم لا يمكن أن يتجاوز إجمالي مبلغ التأمين (${bk.insuranceAmount} ر.س).`);
        return;
      }
      if (!guardDamageDesc.trim()) {
        setGuardInspectionError('يرجى كتابة وصف موجز للعبث أو الأضرار المرصودة بالاستراحة.');
        return;
      }
    }

    guardProcessDeparture({
      bookingId: bk.id,
      result: guardInspectionResult,
      deductionAmount: guardInspectionResult === 'deduction' ? guardDeductionAmount : 0,
      damageDescription: guardInspectionResult === 'deduction' ? guardDamageDesc : undefined,
      damagePhotos: guardInspectionResult === 'deduction' ? guardDamagePhotos : undefined,
    });

    setGuardInspectionBooking(null);
    showToast(
      guardInspectionResult === 'full_refund'
        ? `تم تسجيل خروج النزيل تماماً وإشعار المسوقة والإدارة بسلامة الاستراحة وإعادة التأمين (${bk.insuranceAmount} ر.س) ✓`
        : `تم تسجيل خروج النزيل وتوثيق خصم (${guardDeductionAmount} ر.س) مع إرفاق الصور وإشعار المسوقة والإدارة فوراً ✓`
    );
  };

  const openMarketerReminderModal = (bk: Booking) => {
    const prop = properties.find((p) => p.id === bk.propertyId);
    const checkOutTime = prop?.checkOutTimeText || 'الساعة 2:00 ظهراً';
    const defaultText = `السلام عليكم ورحمة الله وبركاته، أخي الكريم ${bk.customerName} 🌿 نود تذكيركم بموعد تسجيل الخروج اليوم من (${bk.propertyName}) في تمام ${checkOutTime}، وتسليم المفتاح للحارس (${guard?.name || 'أبو راشد'}) لمعاينة الاستراحة واسترداد مبلغ التأمين (${bk.insuranceAmount} ر.س). شاكرين لكم وممتنين لاختياركم لنا.`;
    setReminderModalBooking(bk);
    setCustomReminderMsg(defaultText);
  };

  const sendMarketerReminder = (bk: Booking, customText?: string) => {
    const res = sendCheckoutReminder(bk.id);
    let url = res.whatsappUrl;
    if (customText) {
      const cleanPhone = (bk.customerPhone || '0550000000').replace(/\D/g, '').replace(/^0/, '966');
      url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customText)}`;
    }
    window.open(url, '_blank');
    setReminderModalBooking(null);
    showToast(`تم إرسال تذكير الخروج للنزيل (${bk.customerName}) عبر واتساب المسوقة بنجاح ✓`);
  };

  const getWhatsAppDirectUrl = (phone: string, name: string, prop: string, type: 'arrival' | 'departure') => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '966' + clean.substring(1);
    else if (!clean.startsWith('966')) clean = '966' + clean;

    const text =
      type === 'arrival'
        ? `أهلاً بك أخي الكريم ${name}، يسعدنا استقبالكم اليوم في ${prop} الساعة 5 م. ونتمنى لكم إقامة ممتعة وسعيدة. لأي استفسار نحن بخدمتكم دائماً.`
        : `أهلاً بك أخي الكريم ${name}، نأمل أن تكونوا قضيتم أوقاتاً ممتعة في ${prop}. نود تذكيركم بموعد المغادرة الساعة 2 م، وسيتم تسليم مبلغ التأمين عند الخروج. شكراً لكم.`;

    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="pb-28 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 space-y-5">
      {/* Guard Confirmation Modal - تنبيه تأكيد الإرسال لتجنب الخطأ بالضغط */}
      {guardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                  guardConfirm.kind === 'arrive'
                    ? 'bg-sky-600'
                    : guardConfirm.kind === 'insrecv'
                    ? 'bg-amber-600'
                    : guardConfirm.kind === 'exit'
                    ? 'bg-rose-600'
                    : 'bg-emerald-600'
                }`}>
                  <AlertTriangle className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    تنبيه تأكيد الإرسال
                  </h3>
                  <span className="text-[11px] text-purple-700 font-bold block">
                    {guardConfirm.kind === 'arrive'
                      ? 'إجراء: [تأكيد الحضور]'
                      : guardConfirm.kind === 'insrecv'
                      ? 'إجراء: [تأكيد استلام التأمين كاش]'
                      : guardConfirm.kind === 'exit'
                      ? 'إجراء: [تأكيد النظافة والخروج]'
                      : 'إجراء: إعادة التأمين كاش'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setGuardConfirm(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Note - لتجنب الخطأ بالضغط */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-950 leading-relaxed font-semibold">
                تنبيه لتجنب الخطأ بالضغط: هل أنت متأكد من رغبتك في إرسال هذا التنبيه للإدارة والموظف المسؤول؟
              </p>
            </div>

            {/* Target Booking Info Card */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium">اسم العميل:</span>
                <span className="font-bold text-slate-900">{guardConfirm.booking.customerName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium">العقار / الشاليه:</span>
                <span className="font-bold text-purple-900">{guardConfirm.booking.propertyName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium">رقم الجوال:</span>
                <span className="font-mono font-bold text-slate-800">{guardConfirm.booking.customerPhone}</span>
              </div>
              {(guardConfirm.kind === 'insrecv' || guardConfirm.kind === 'insret') && (
                <div className="flex items-center justify-between text-slate-700 pt-1.5 border-t border-slate-200/70">
                  <span className="text-slate-500 font-medium">مبلغ التأمين:</span>
                  <span className="font-mono font-bold text-amber-800">{guardConfirm.booking.insuranceAmount} ريال</span>
                </div>
              )}
            </div>

            {/* Explanation Message */}
            <p className="text-xs text-slate-600 leading-relaxed px-1">
              {guardConfirm.kind === 'arrive'
                ? `سيتم تأكيد حضور العميل (${guardConfirm.booking.customerName}) وإرسال إشعار فوري لمسوقة الحجز (${guardConfirm.booking.marketerName || 'المسؤولة'}) والإدارة بالنظام لإرسال قالب إكمال المتبقي والتأمين.`
                : guardConfirm.kind === 'insrecv'
                ? `سيتم تأكيد استلام التأمين نقداً (${guardConfirm.booking.insuranceAmount} ريال) كاش وتوثيقه رسمياً في النظام وإشعار المسوقة والإدارة.`
                : guardConfirm.kind === 'exit'
                ? `سيتم تأكيد النظافة والخروج للعميل (${guardConfirm.booking.customerName}) وإغلاق دورة الحجز النشط بنجاح.`
                : `سيتم إرسال إشعار فوري للإدارة والموظف بتأكيد تسليم وإعادة مبلغ التأمين (${guardConfirm.booking.insuranceAmount} ريال) كاش للعميل.`}
            </p>

            {/* Action Buttons: إرسال and إلغاء */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  const { kind, booking: bk } = guardConfirm;
                  if (kind === 'arrive') {
                    confirmAttendanceByGuard(bk.id);
                    showToast(`تم [تأكيد الحضور] للعميل (${bk.customerName}) وإرسال إشعار فوري لمسوقة الحجز بنجاح ✓`);
                  } else if (kind === 'insrecv') {
                    confirmCashInsuranceByGuard(bk.id);
                    showToast(`تم [تأكيد استلام التأمين كاش] بمبلغ (${bk.insuranceAmount} ر.س) وتوثيقه رسمياً في النظام ✓`);
                  } else if (kind === 'exit') {
                    approveCleanlinessAndExit({
                      bookingId: bk.id,
                      result: 'full_refund',
                    });
                    showToast(`تم [تأكيد النظافة والخروج] للعميل (${bk.customerName}) وإغلاق دورة الحجز بنجاح ✓`);
                  } else {
                    returnInsuranceDeposit(bk.id);
                    showToast('تم إرسال تنبيه إعادة التأمين كاش للعميل بنجاح ✓');
                  }
                  setGuardConfirm(null);
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 btn-beam-shine transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {guardConfirm.kind === 'arrive'
                    ? 'تأكيد الحضور'
                    : guardConfirm.kind === 'insrecv'
                    ? 'تأكيد استلام التأمين كاش'
                    : guardConfirm.kind === 'exit'
                    ? 'تأكيد النظافة والخروج'
                    : 'تأكيد الإرسال'}
                </span>
              </button>
              <button
                onClick={() => setGuardConfirm(null)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors border border-slate-200"
              >
                <X className="w-4 h-4" />
                <span>إلغاء</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:opacity-80 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Top Action Buttons Row */}
      <div className="bg-transparent flex items-center justify-between pt-0.5 px-0.5 font-['Tajawal',sans-serif]">
        <div className="flex items-center gap-2">
          {!isGuard && (
            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-mauve-shiny font-bold py-2 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-200" />
              <span className="leading-none">الحجز / بدون حجز +</span>
            </button>
          )}

          <button
            onClick={() => showToast('تم تحديث البيانات الحية بنجاح')}
            className="w-8.5 h-8.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
            title="تحديث البيانات"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Statistical KPI Cards (حجم متناسق ومضغوط ليتناسب تماماً مع أبعاد الشاشة) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 font-['Tajawal',sans-serif]" dir="rtl">
        {/* 1. دخول اليوم (Blue #0284c7) */}
        <div
          onClick={() => setActiveFilter('arrivals')}
          className={`bg-white rounded-2xl border transition-all p-3 sm:p-3.5 cursor-pointer text-right flex flex-col justify-between min-h-[84px] sm:min-h-[92px] select-none shadow-xs hover:shadow-md ${
            activeFilter === 'arrivals'
              ? 'border-[#0284c7] ring-2 ring-[#0284c7]/40 ring-offset-1'
              : 'border-slate-200/90 hover:border-[#0284c7]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm text-[#0284c7]">دخول اليوم</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shrink-0" />
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#0284c7] leading-none">
              {visibleArrivals.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#0284c7]/70 font-bold">
              {activeFilter === 'arrivals' ? '● معروض' : ''}
            </span>
          </div>
        </div>

        {/* 2. خروج اليوم (Red/Rose #e11d48) */}
        <div
          onClick={() => setActiveFilter('departures')}
          className={`bg-white rounded-2xl border transition-all p-3 sm:p-3.5 cursor-pointer text-right flex flex-col justify-between min-h-[84px] sm:min-h-[92px] select-none shadow-xs hover:shadow-md ${
            activeFilter === 'departures'
              ? 'border-[#e11d48] ring-2 ring-[#e11d48]/40 ring-offset-1'
              : 'border-slate-200/90 hover:border-[#e11d48]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm text-[#e11d48]">خروج اليوم</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48] shrink-0" />
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#e11d48] leading-none">
              {visibleDepartures.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#e11d48]/70 font-bold">
              {activeFilter === 'departures' ? '● معروض' : ''}
            </span>
          </div>
        </div>

        {/* 3. كافة المحجوزات (Amber/Brown #b45309) */}
        <div
          onClick={() => setActiveFilter('all')}
          className={`bg-white rounded-2xl border transition-all p-3 sm:p-3.5 cursor-pointer text-right flex flex-col justify-between min-h-[84px] sm:min-h-[92px] select-none shadow-xs hover:shadow-md ${
            activeFilter === 'all'
              ? 'border-[#b45309] ring-2 ring-[#b45309]/40 ring-offset-1'
              : 'border-slate-200/90 hover:border-[#b45309]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm text-[#b45309]">كافة المحجوزات</span>
            <Clock className="w-4 h-4 text-[#b45309] shrink-0" />
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#b45309] leading-none">
              {roleFilteredBookings.filter((b) => b.status !== 'cancelled').length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#b45309]/70 font-bold">
              {activeFilter === 'all' ? '● معروض' : ''}
            </span>
          </div>
        </div>

        {/* 4. تتبع الحجز (Orange #c2410c مع نزيل اليوم) */}
        <div
          onClick={() => setActiveFilter('tracking')}
          className={`bg-white rounded-2xl border transition-all p-3 sm:p-3.5 cursor-pointer text-right flex flex-col justify-between min-h-[84px] sm:min-h-[92px] select-none shadow-xs hover:shadow-md ${
            activeFilter === 'tracking'
              ? 'border-[#c2410c] ring-2 ring-[#c2410c]/40 ring-offset-1'
              : 'border-slate-200/90 hover:border-[#c2410c]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm text-[#c2410c]">تتبع الحجز</span>
            <Settings className="w-4 h-4 text-[#c2410c] shrink-0" />
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#c2410c] leading-none">
              {trackingBookings.length}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#c2410c]">
              نزيل اليوم
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-purple-100/90 flex flex-wrap items-center justify-between gap-2.5 font-['Tajawal',sans-serif]">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث سريع بالاسم أو رقم الجوال أو رقم الحجز..."
            className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <span>القسم المفعل:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
            {activeFilter === 'arrivals' && 'دخول اليوم'}
            {activeFilter === 'departures' && 'خروج اليوم'}
            {activeFilter === 'all' && 'كافة الحجوزات'}
            {activeFilter === 'tracking' && 'تتبع الحجز'}
          </span>
        </div>
      </div>

      {/* TODAY'S ARRIVALS SECTION (لوحة التحكم المركزية - إعادة ترتيب وتنسيق حركات دخول اليوم) */}
      {(activeFilter === 'arrivals' || activeFilter === 'all') && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm border border-purple-100/90 space-y-5 font-['Tajawal',sans-serif]">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-sky-700 font-bold bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span>مباشر اليوم</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                {isGuard ? 'حركات الاستقبال والتسليم' : ''}
              </span>
            </div>

            <div className="text-right">
              <h3 className="font-black text-base sm:text-xl text-slate-900 flex items-center justify-end gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>حركات دخول اليوم ({searchFilteredArrivals.length})</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 -mt-0.5">
              </p>
            </div>
          </div>

          {searchFilteredArrivals.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs sm:text-sm font-medium space-y-1.5">
              <Calendar className="w-9 h-9 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">لا توجد حركات دخول مسجلة لليوم مطابقة لخيارات البحث</p>
              <p className="text-xs text-slate-400">ستظهر هنا أي حجوزات جديدة يتم تسجيل موعد دخولها اليوم تلقائياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchFilteredArrivals.map((bk, idx) => {
                const arrKey = bk.id ? `arr-${bk.id}` : `arr-${idx}`;
                const isExpanded = Boolean(expandedBookingIds[arrKey]);
                const propGuard = guardsList?.find((g) => g.assignedPropertyId === bk.propertyId) || guard;
                const isHamran = bk.propertyId === 'hamran' || bk.propertyName.includes('حمران');
                const isInsurancePaid = Boolean(bk.insuranceReceivedCash || bk.insurancePaymentMethod);
                const isPaidInFull = bk.remainingAmount <= 0;

                return (
                  <div
                    key={`${bk.id || 'arr'}-${idx}`}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4 lg:p-5 font-['Tajawal',sans-serif] space-y-3.5"
                  >
                    {/* 1. رأس البطاقة (المعلومات الأساسية) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      {/* (اسم العقار / الوحدة) */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/90 shadow-2xs shrink-0">
                          <Home className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm sm:text-base text-slate-900">
                              {bk.propertyName} {bk.sectionName ? `(${bk.sectionName})` : ''}
                            </span>
                            <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200 font-bold whitespace-nowrap">
                              #{bk.bookingNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* (اسم العميل ورقم التواصل) و (اسم المسوق) */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* اسم العميل ورقم التواصل */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-200 to-indigo-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {bk.customerName.charAt(0)}
                          </div>
                          <div className="flex items-baseline gap-1.5 text-xs">
                            <span className="font-bold text-slate-900">{bk.customerName}</span>
                            <span className="font-mono text-slate-500 text-[11px] dir-ltr">{bk.customerPhone}</span>
                          </div>
                        </div>

                        {/* اسم المسوق */}
                        {bk.marketerName && (
                          <div className="flex items-center gap-1.5 bg-purple-50/80 border border-purple-200/80 px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-900 shadow-2xs">
                            <Users className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                            <span className="text-slate-500 font-normal">المسوق:</span>
                            <span>{bk.marketerName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* شرط خاص بفلل حُمران فقط: إظهار خانة تنبيهات الخدمات الفرعية ديناميكياً وتشمل: حالة وجبة الفطور (بفطور) أو بدون فطور). يوجد اليوم تنسيق للفيلا */}
                    {isHamran && (
                      <div className="bg-gradient-to-r from-amber-50/80 via-purple-50/60 to-pink-50/80 border border-amber-200/90 rounded-xl p-2.5 sm:px-3 flex items-center justify-between gap-2.5 flex-wrap text-xs shadow-2xs">
                        <div className="flex items-center gap-2 text-amber-950 font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs font-black">تنبيهات الخدمات الفرعية (فلل حُمران):</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* حالة وجبة الفطور (بفطور / بدون فطور) */}
                          {bk.withoutBreakfast || (!bk.breakfastOption && !bk.breakfastPrice) ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs">
                              <Coffee className="w-3.5 h-3.5 text-slate-400" />
                              <span>بدون فطور</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs shadow-2xs">
                              <Coffee className="w-3.5 h-3.5 text-amber-700" />
                              <span>بفطور: {bk.breakfastOption || 'فطور شامي فاخر'} {bk.breakfastPrice ? `(${bk.breakfastPrice} ر.س)` : ''}</span>
                            </span>
                          )}

                          {/* التنسيق: يوجد اليوم تنسيق للفيلا أو بدون تنسيق */}
                          {bk.coordinatorName || bk.coordinatorService ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-100 border border-pink-300 text-pink-950 font-bold text-xs shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5 text-pink-700" />
                              <span>يوجد اليوم تنسيق للفيلا ({bk.coordinatorName || 'المنسقة'}{bk.coordinatorService ? ` - ${bk.coordinatorService}` : ''})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-slate-300 text-slate-600 font-medium text-xs shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                              <span>بدون تنسيق للفيلا</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. صف الأيقونات التفاعلية (أفقي في صف واحد مرتب حسب الطلب) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50/80 p-2 sm:p-2.5 rounded-xl border border-slate-200/80">
                      {/* 1- تذكير الحجز */}
                      <button
                        type="button"
                        onClick={() => openWelcomeReminderModal(bk)}
                        className="py-2.5 px-3 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-900 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
                        title="تذكير الحجز والترحيب بالعميل مع تفاصيل الدخول والمتبقي والتأمين عبر واتساب"
                      >
                        <MessageCircle className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="truncate">💬 تذكير الحجز</span>
                      </button>

                      {/* 2- انتظار الوصول */}
                      <button
                        type="button"
                        onClick={() => handleToggleArrival(bk)}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-95 ${
                          bk.guestArrived || bk.arrivalConfirmedAt
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                        title={
                          bk.guestArrived || bk.arrivalConfirmedAt
                            ? `تم تأكيد الوصول الساعة ${bk.guestArrivedAt || bk.arrivalConfirmedAt} (انقر للتبديل)`
                            : 'انقر لتأكيد وصول العميل وإرسال إشعار تلقائي فوري للحارس والإدارة'
                        }
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${bk.guestArrived || bk.arrivalConfirmedAt ? 'bg-white animate-pulse' : 'bg-amber-500'}`} />
                        <span className="truncate">
                          {bk.guestArrived || bk.arrivalConfirmedAt
                            ? `وصل العميل ✓ (${bk.guestArrivedAt || bk.arrivalConfirmedAt})`
                            : 'انتظار الوصول'}
                        </span>
                      </button>

                      {/* 3- المتبقي */}
                      <button
                        type="button"
                        onClick={() => openRemainingPaymentModal(bk)}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 ${
                          isPaidInFull
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                        title="المتبقي: خيار دفع إيصال بنكي أو تسليم كاش للحارس"
                      >
                        <DollarSign className={`w-4 h-4 shrink-0 ${isPaidInFull ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span className="truncate">
                          {isPaidInFull ? '💳 المتبقي مسدد ✓' : `💳 المتبقي (${bk.remainingAmount} ر.س)`}
                        </span>
                      </button>

                      {/* 4- التأميين */}
                      <button
                        type="button"
                        onClick={() => openInsuranceActionModal(bk)}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 ${
                          isInsurancePaid
                            ? 'bg-sky-50 text-sky-900 border-sky-300'
                            : 'bg-white hover:bg-sky-50 text-sky-900 border-sky-300'
                        }`}
                        title="التأمين: خيار دفع إيصال بنكي أو تسليم كاش للحارس"
                      >
                        <ShieldCheck className={`w-4 h-4 shrink-0 ${isInsurancePaid ? 'text-sky-600' : 'text-sky-700'}`} />
                        <span className="truncate">
                          {isInsurancePaid
                            ? (bk.cashInsuranceConfirmedByGuard || bk.insurancePaymentMethod === 'cash' || bk.insuranceReceivedCash
                                ? '🛡️ تأمين كاش مستلم ✓'
                                : '🛡️ تأمين محول بنكياً ✓')
                            : `🛡️ التأمين (${bk.insuranceAmount} ر.س)`}
                        </span>
                      </button>
                    </div>

                    {/* المستندات والإيصالات المرفقة (معاينة وتحميل فوري بضغطة زر) */}
                    {renderBookingReceiptBadges(bk)}

                    {/* 3. الشريط المنسدل (أسفل البطاقة): تفاصيل الحجز */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleBookingExpanded(arrKey)}
                        className={`w-full py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                          isExpanded
                            ? 'bg-purple-100 text-purple-950 border-purple-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title="عرض تفاصيل الحجز والملخص المالي"
                      >
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-purple-700" />
                          <span>تفاصيل الحجز والملخص المالي</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* القائمة المنسدلة عند الفتح */}
                      {isExpanded && (
                        <div className="mt-2.5 p-3 bg-slate-50 border border-purple-100 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* زر تفاصيل الحجز الكاملة */}
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setDetailsTitle('تفاصيل الحجز الكاملة');
                                setSelectedBookingForDetails(bk);
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-purple-950 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                              title="عرض كافة تفاصيل الحجز والعقد والخدمات"
                            >
                              <Eye className="w-4 h-4 text-purple-200" />
                              <span>عرض تفاصيل الحجز الكاملة</span>
                            </button>
                          </div>

                          {/* شريط الملخص المالي التفصيلي */}
                          <div className="grid grid-cols-4 gap-1.5 text-center text-xs bg-white p-2 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">الإجمالي</span>
                              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{bk.totalPrice} <span className="text-[9px] font-sans">ر.س</span></span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">العربون</span>
                              <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">{bk.depositPaid} <span className="text-[9px] font-sans">ر.س</span></span>
                            </div>
                            <div className="bg-purple-50/50 rounded-lg py-0.5">
                              <span className="text-[10px] text-purple-700 block font-medium">المتبقي</span>
                              <span className={`font-mono font-black text-xs sm:text-sm ${bk.remainingAmount > 0 ? 'text-purple-950' : 'text-emerald-700'}`}>
                                {bk.remainingAmount > 0 ? `${bk.remainingAmount} ر.س` : 'مسدد ✓'}
                              </span>
                            </div>
                            <div className="bg-amber-50/50 rounded-lg py-0.5">
                              <span className="text-[10px] text-amber-700 block font-medium">التأمين</span>
                              <span className="font-mono font-bold text-amber-800 text-xs sm:text-sm">{bk.insuranceAmount} <span className="text-[9px] font-sans">ر.س</span></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TODAY'S DEPARTURES SECTION (مغادرة اليوم: تذكير المسوقة بالخروج • معاينة الحارس للتأمين والأضرار • جمع الرسوم الإدارية وحساب الصافي ونسبة المسوقين 5% أو 7% بموافقة الإدارة) */}
      {(activeFilter === 'departures' || activeFilter === 'all') && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm border border-rose-100/90 space-y-5 font-['Tajawal',sans-serif]">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-rose-700 font-bold bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>مغادرة وخروج اليوم</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
              </span>
            </div>

            <div className="text-right">
              <h3 className="font-black text-base sm:text-xl text-slate-900 flex items-center justify-end gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>حركات خروج ومغادرة اليوم ({searchFilteredDepartures.length})</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 -mt-0.5">
                تذكير المسوقة بالخروج • فحص الحارس للتأمين والأضرار بالصور • تصفية الصافي والنسبة
              </p>
            </div>
          </div>

          {searchFilteredDepartures.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs sm:text-sm font-medium space-y-1.5">
              <Calendar className="w-9 h-9 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">لا توجد حركات خروج مسجلة لليوم مطابقة لخيارات البحث</p>
              <p className="text-xs text-slate-400">ستظهر هنا أي حجوزات يحل موعد مغادرتها وخروجها اليوم تلقائياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchFilteredDepartures.map((bk, idx) => {
                const adminFee = bk.adminFee ?? 50;
                const netRevenue = Math.max(0, bk.totalPrice - adminFee);
                const comm5 = Math.round(netRevenue * 0.05);
                const comm7 = Math.round(netRevenue * 0.07);
                const isApproved7 = Boolean(bk.adminApprovedFullBooking);
                const effectiveComm = isApproved7 ? (bk.marketerCommission || comm7) : comm5;
                const effectivePercent = isApproved7 ? 7 : 5;
                const depKey = bk.id ? `dep-${bk.id}` : `dep-${idx}`;
                const isExpanded = Boolean(expandedBookingIds[depKey]);

                return (
                  <div
                    key={depKey}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-rose-300 shadow-xs hover:shadow-md transition-all p-3 sm:p-4 lg:py-3.5 lg:px-5 font-['Tajawal',sans-serif]"
                  >
                    {/* Single Unified Horizontal Row for the Departures Card (صف واحد أفقي متكامل) */}
                    <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3 sm:gap-4">
                      {/* المجموعة 1: اسم العقار • كود الحجز • المسوقة */}
                      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                        <span className="text-xs text-slate-400 font-bold hidden sm:inline">العقار:</span>
                        <span className="font-black text-sm sm:text-base text-[#2E1045] flex items-center gap-1.5 whitespace-nowrap">
                          <Home className="w-4 h-4 text-rose-700 shrink-0" />
                          <span>{bk.propertyName} {bk.sectionName ? `(${bk.sectionName})` : ''}</span>
                        </span>
                        <span className="font-mono text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 font-bold whitespace-nowrap">
                          #{bk.bookingNumber}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1.5 whitespace-nowrap animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          <span>خروج اليوم ({bk.checkOutDate})</span>
                        </span>
                        {bk.marketerName && (
                          <div className="text-xs font-bold text-purple-900 bg-purple-50/80 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center gap-1 whitespace-nowrap">
                            <span className="text-slate-400 font-normal">المسوقة:</span>
                            <span>{bk.marketerName}</span>
                          </div>
                        )}
                      </div>

                      {/* فاصل رأسي خفيف للشاشات الكبيرة */}
                      <div className="hidden 2xl:block h-8 w-px bg-slate-200/80 shrink-0" />

                      {/* المجموعة 2: اسم العميل • فطور • تنسيق */}
                      <div className="flex items-center gap-3 flex-wrap shrink-0">
                        {/* اسم العميل */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-pink-50 text-rose-700 flex items-center justify-center font-black text-xs shrink-0 border border-rose-200 shadow-2xs">
                            {bk.customerName.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                                {bk.customerName}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-slate-500 block leading-tight">
                              {bk.customerPhone}
                            </span>
                          </div>
                        </div>

                        {/* فطور وتنسيق */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {bk.breakfastOption && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs whitespace-nowrap">
                              <Coffee className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>فطور: {bk.breakfastOption}</span>
                            </div>
                          )}
                          {bk.coordinatorName && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-pink-50 text-pink-900 border border-pink-200 shadow-2xs whitespace-nowrap">
                              <Sparkles className="w-3.5 h-3.5 text-pink-700 shrink-0" />
                              <span>تنسيق: {bk.coordinatorName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* 2. صف الأيقونات التفاعلية لخروج اليوم (مرتب حسب الطلب بدقة: 1-تذكير خروج، 2-تأكيد النظافه والخروج، 3-استرداد التأمين، 4-إنهاء الحجز) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50/80 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 mt-3">
                      {/* 1- تذكير خروج */}
                      <button
                        type="button"
                        onClick={() => handleMarketerSendCheckoutReminder(bk)}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 ${
                          bk.checkoutReminderSent
                            ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                        }`}
                        title="إرسال قالب واتساب لتذكير النزيل بموعد الخروج"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {bk.checkoutReminderSent ? 'تم التذكير ✓' : 'تذكير خروج'}
                        </span>
                      </button>

                      {/* 2- تأكيد النظافه والخروج */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isGuard) {
                            setGuardConfirm({ kind: 'exit', booking: bk });
                          } else {
                            openGuardInspectionModal(bk);
                          }
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-95 ${
                          bk.cleanlinessApproved || bk.checkedOut
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-xs'
                        }`}
                        title="تأكيد النظافة والخروج وتوثيق إنهاء إقامة النزيل"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${bk.cleanlinessApproved || bk.checkedOut ? 'bg-emerald-500' : 'bg-white animate-pulse'}`} />
                        <span className="truncate">
                          {bk.cleanlinessApproved || bk.checkedOut
                            ? `تم الخروج والنظافة ✓`
                            : 'تأكيد النظافه والخروج'}
                        </span>
                      </button>

                      {/* 3- استرداد التأمين */}
                      <button
                        type="button"
                        onClick={() => openInsuranceRefundModal(bk)}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 ${
                          bk.insuranceReturned
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : bk.insuranceRefundRequested
                            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                        }`}
                        title="استرداد التأمين: تحويل بنكي برفع صورة الحساب أو تسليم كاش من الحارس"
                      >
                        <RotateCcw className={`w-4 h-4 shrink-0 ${bk.insuranceReturned ? 'text-emerald-600' : 'text-purple-700'}`} />
                        <span className="truncate">
                          {bk.insuranceReturned
                            ? 'استرداد التأمين (مسترد ✓)'
                            : bk.insuranceRefundRequested
                            ? 'استرداد التأمين (قيد المراجعة)'
                            : `استرداد التأمين (${bk.insuranceAmount} ر.س)`}
                        </span>
                      </button>

                      {/* 4- إنهاء الحجز */}
                      <button
                        type="button"
                        onClick={() => openFinishBookingModal(bk)}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 ${
                          bk.status === 'completed'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                        }`}
                        title="إنهاء الحجز: خيار رفع إيصال التأمين مع إرساله فوراً للمسوقة والإدارة وإمكانية الإنهاء حتى لو كان كاش"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                        <span className="truncate">
                          {bk.status === 'completed' ? 'الحجز منتهي ✓' : 'إنهاء الحجز'}
                        </span>
                      </button>
                    </div>

                    {/* المستندات والإيصالات المرفقة (معاينة وتحميل فوري بضغطة زر) */}
                    {renderBookingReceiptBadges(bk)}

                    {/* 3. الشريط المنسدل (أسفل البطاقة): تفاصيل الحجز */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleBookingExpanded(depKey)}
                        className={`w-full py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                          isExpanded
                            ? 'bg-rose-100 text-rose-950 border-rose-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title="عرض تفاصيل الحجز والملخص المالي"
                      >
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-rose-700" />
                          <span>تفاصيل الحجز والملخص المالي للمغادرة</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* القائمة المنسدلة عند الفتح */}
                      {isExpanded && (
                        <div className="mt-2.5 p-3 bg-slate-50 border border-rose-100 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Damage & Deductions Banner (في حال رصد أضرار وعبث بالاستراحة) */}
                          {bk.insuranceDeductionAmount && bk.insuranceDeductionAmount > 0 && (
                            <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-2.5 space-y-1.5 text-right text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span className="font-bold text-amber-950">
                                    تقرير الحارس: خصم أضرار ({bk.insuranceDeductionAmount} ر.س)
                                  </span>
                                </div>
                                <span className="font-mono font-black text-xs text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-rose-200 shrink-0">
                                  خصم {bk.insuranceDeductionAmount} ر.س
                                </span>
                              </div>
                              {bk.damageDescription && (
                                <p className="text-[11px] text-amber-900 leading-relaxed">
                                  {bk.damageDescription}
                                </p>
                              )}
                              {/* Damage Photos Preview */}
                              {bk.damagePhotos && bk.damagePhotos.length > 0 && (
                                <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                                  {bk.damagePhotos.map((photo, pIdx) => (
                                    <a
                                      key={pIdx}
                                      href={photo.dataUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-12 h-12 rounded-lg overflow-hidden border border-amber-300 bg-white shrink-0 cursor-pointer shadow-2xs"
                                      title="اضغط لفتح الصورة"
                                    >
                                      <img
                                        src={photo.dataUrl}
                                        alt={photo.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* زر تفاصيل الحجز الكاملة */}
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setDetailsTitle('تفاصيل الحجز الكاملة والتسوية');
                                setSelectedBookingForDetails(bk);
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-purple-950 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                              title="عرض كافة تفاصيل الحجز والتسوية"
                            >
                              <Eye className="w-4 h-4 text-purple-200" />
                              <span>عرض تفاصيل الحجز الكاملة والتسوية</span>
                            </button>
                          </div>

                          {/* شريط الملخص المالي التفصيلي للمغادرة */}
                          <div className="grid grid-cols-4 gap-1.5 text-center text-xs bg-white p-2 rounded-xl border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">الإجمالي</span>
                              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{bk.totalPrice} <span className="text-[9px] font-sans">ر.س</span></span>
                            </div>
                            <div>
                              <span className="text-[10px] text-rose-600 block font-medium">الرسوم</span>
                              <span className="font-mono font-bold text-rose-700 text-xs sm:text-sm">{adminFee} <span className="text-[9px] font-sans">ر.س</span></span>
                            </div>
                            <div className="bg-purple-50/50 rounded-lg py-0.5">
                              <span className="text-[10px] text-purple-700 block font-medium">الصافي</span>
                              <span className="font-mono font-black text-purple-950 text-xs sm:text-sm">{netRevenue} <span className="text-[9px] font-sans">ر.س</span></span>
                            </div>
                            <div className="bg-emerald-50/50 rounded-lg py-0.5">
                              <span className="text-[10px] text-emerald-700 block font-medium">العمولة ({effectivePercent}%)</span>
                              <span className="font-mono font-black text-emerald-700 text-xs sm:text-sm">{effectiveComm} <span className="text-[9px] font-sans">ر.س</span></span>
                            </div>
                          </div>

                          {/* Admin 7% Quick Action / Status */}
                          {isAdmin && (
                            <div className="flex items-center justify-between gap-1.5 bg-purple-50/60 border border-purple-200/70 rounded-xl px-2.5 py-1 text-xs">
                              <span className="text-[11px] text-purple-950 font-bold truncate">
                                {isApproved7 ? 'معتمد 7% كحجز كامل ✓' : 'نسبة 5% (يمكن الاعتماد لـ 7%)'}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleAdminCommissionApproval(bk.id)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                                  isApproved7
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'bg-white text-purple-900 border-purple-300 hover:bg-purple-100'
                                }`}
                              >
                                {isApproved7 ? 'إلغاء 7%' : 'اعتماد 7%'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALL ACTIVE BOOKINGS TABLE (Hidden for Guard) */}
      {!isGuard && activeFilter === 'all' && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
            <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              سجل الحجوزات
            </span>
            <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-700" />
              <span>كافة الحجوزات النشطة ({searchFilteredActive.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-purple-100/80 bg-white shadow-xs">
            <div className="min-w-[620px] sm:min-w-0">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 text-center items-center">
                <div className="col-span-5 text-right pr-1">العميل والجوال والعقار</div>
                <div className="col-span-3 text-center">فترة الإقامة</div>
                <div className="col-span-2 text-center">الحساب المالي</div>
                <div className="col-span-2 text-center">التفاصيل</div>
              </div>

              <div className="divide-y divide-slate-100">
                {searchFilteredActive.map((bk, idx) => (
                  <div
                    key={`${bk.id || 'act'}-${idx}`}
                    className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="col-span-5 text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {bk.customerName.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{bk.customerName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-500">{bk.customerPhone}</span>
                            <span className="text-[10px] bg-purple-50 text-purple-800 px-1.5 rounded font-bold">
                              {bk.propertyName}
                            </span>
                            <a
                              href={getWhatsAppDirectUrl(bk.customerPhone, bk.customerName, bk.propertyName, 'arrival')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-5 h-5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center transition-colors"
                              title="فتح واتساب العميل"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 text-center font-mono text-[10px] text-slate-600">
                      {bk.checkInDate} ← {bk.checkOutDate}
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="font-bold text-slate-900 font-mono text-[11px] block">{bk.totalPrice} ر.س</span>
                      <span className="text-[10px] text-emerald-700 block font-mono">
                        العربون: {bk.depositPaid} ر.س
                      </span>
                    </div>

                    <div className="col-span-2 text-center">
                      <button
                        onClick={() => {
                          setDetailsTitle('تفاصيل الحجز الكاملة');
                          setSelectedBookingForDetails(bk);
                        }}
                        className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        عرض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING SECTION (تتبع الحجز ومسار المراحل الـ 5 التلقائي) */}
      {(activeFilter === 'tracking' || activeFilter === 'all') && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm border border-purple-100/90 space-y-5 font-['Tajawal',sans-serif]">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-100">
            {/* خياران لتصفية تتبع الحجز: كافة الحجوزات / حجوزات خروجها اليوم */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-purple-900 font-bold bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>تتبع مسار الحجز (5 مراحل تلقائية)</span>
              </div>

              {/* أزرار الفلترة الداخلية لتتبع الحجز: كافة الحجوزات / حجوزات خروجها اليوم */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTrackingSubFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    trackingSubFilter === 'all'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  كافة الحجوزات ({roleFilteredBookings.filter((b) => b.status !== 'cancelled').length})
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingSubFilter('todayDepartures')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    trackingSubFilter === 'todayDepartures'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  حجوزات خروجها اليوم ({roleFilteredBookings.filter((b) => b.status !== 'cancelled' && (b.checkOutDate ? b.checkOutDate.split('T')[0].trim() : '') === todayStr).length})
                </button>
              </div>
            </div>

            <div className="text-right">
              <h3 className="font-black text-base sm:text-xl text-slate-900 flex items-center justify-end gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                <span>تتبع الحجز ({searchFilteredTracking.length})</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 -mt-0.5">
                مسار آلي متدرج من 1 إلى 5: الدخول • المتبقي • التأمين • الخروج • استرجاع التأمين
              </p>
            </div>
          </div>

          {searchFilteredTracking.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs sm:text-sm font-medium space-y-1.5">
              <Calendar className="w-9 h-9 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">لا توجد حجوزات مطابقة لمعايير البحث والفلترة المحددة</p>
              <p className="text-xs text-slate-400">ستظهر هنا أي حجوزات نشطة مع مسار تتبع مراحلها التلقائي</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchFilteredTracking.map((bk, idx) => {
                const stages = getBookingStages(bk);
                const trackKey = bk.id ? `trk-${bk.id}` : `trk-${idx}`;
                const isExpanded = Boolean(expandedBookingIds[trackKey]);
                const propGuard = guardsList?.find((g) => g.assignedPropertyId === bk.propertyId) || guard;
                const isPaidInFull = bk.remainingAmount <= 0;
                const isInsurancePaid = stages.isInsurancePaid;

                return (
                  <div
                    key={trackKey}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-5 font-['Tajawal',sans-serif] space-y-3.5"
                  >
                    {/* Header Card: اسم العقار / الوحدة • الشارة الزمنية البارزة • اسم العميل ورقم التواصل • اسم المسوق • التواريخ */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/90 shadow-2xs shrink-0">
                          <Home className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm sm:text-base text-slate-900">
                              {bk.propertyName} {bk.sectionName ? `(${bk.sectionName})` : ''}
                            </span>
                            <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200 font-bold whitespace-nowrap">
                              #{bk.bookingNumber}
                            </span>

                            {/* 🌟 الشارة الزمنية البارزة للعميل (دخوله اليوم / خروجه اليوم / تاريخ الدخول الفعلي) */}
                            {(bk.checkInDate ? bk.checkInDate.split('T')[0].trim() : '') === todayStr ? (
                              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs flex items-center gap-1.5 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-sky-600" />
                                <span>دخوله اليوم</span>
                              </span>
                            ) : (bk.checkOutDate ? bk.checkOutDate.split('T')[0].trim() : '') === todayStr ? (
                              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1.5 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-rose-600" />
                                <span>خروجه اليوم</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>تاريخ الدخول: {bk.checkInDate}</span>
                              </span>
                            )}

                            <span className="text-[11px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                              من {bk.checkInDate} إلى {bk.checkOutDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* العميل والمسوق */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* العميل */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-200 to-indigo-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {bk.customerName.charAt(0)}
                          </div>
                          <div className="flex items-baseline gap-1 text-xs">
                            <span className="font-bold text-slate-900">{bk.customerName}</span>
                            <span className="font-mono text-slate-500 text-[11px] dir-ltr">{bk.customerPhone}</span>
                          </div>
                        </div>

                        {/* المسوق */}
                        {bk.marketerName && (
                          <div className="flex items-center gap-1.5 bg-purple-50/80 border border-purple-200/80 px-2.5 py-1 rounded-xl text-xs font-bold text-purple-900 shadow-2xs">
                            <Users className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                            <span className="text-slate-500 font-normal">المسوق:</span>
                            <span>{bk.marketerName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* مسار تتبع مراحل الحجز التلقائي (الـ 5 مراحل مع خط الربط المتصل Connecting Progress Line) */}
                    <div className="bg-gradient-to-r from-amber-50/40 via-purple-50/30 to-slate-50 border border-purple-100 rounded-2xl p-3.5 sm:p-5 space-y-3 font-['Tajawal',sans-serif]">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-black text-slate-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>مسار تتبع مراحل الحجز (تلقائي):</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-[11px] text-slate-500">حالة الإنجاز:</span>
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-purple-100 text-purple-950 border border-purple-200">
                            {stages.completedCount} من 5 مكتملة
                          </span>
                        </div>
                      </div>

                      {/* شريط المراحل مع خط أفقي متصل Connecting Progress Line يربط بين الدوائر ويتلون تدريجياً */}
                      <div className="relative pt-2 pb-1 px-1 sm:px-4">
                        {/* خط الأساس المتصل الرمادي الممتد بين مراكز الدوائر */}
                        <div className="absolute top-[26px] sm:top-[28px] right-[10%] left-[10%] h-1 sm:h-1.5 bg-slate-200 rounded-full z-0 pointer-events-none" />

                        {/* خط التقدم الملون المتصل الذي يتلون تدريجياً حسب تقدم واكتمال المراحل */}
                        <div
                          className="absolute top-[26px] sm:top-[28px] right-[10%] h-1 sm:h-1.5 bg-gradient-to-l from-purple-700 via-amber-500 to-emerald-600 rounded-full z-0 transition-all duration-500 pointer-events-none"
                          style={{
                            width:
                              stages.completedCount === 5
                                ? '80%'
                                : stages.completedCount === 4
                                ? '60%'
                                : stages.completedCount === 3
                                ? '40%'
                                : stages.completedCount === 2
                                ? '20%'
                                : '0%',
                          }}
                        />

                        {/* دوائر المراحل الخمس فوق الخط المتصل */}
                        <div className="relative z-10 flex items-start justify-between w-full">
                          {/* 1- تم الدخول */}
                          <div className="flex flex-col items-center gap-1.5 text-center flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all shadow-xs ${
                                stages.isEntered
                                  ? 'bg-purple-700 text-white ring-4 ring-purple-100'
                                  : 'bg-white text-slate-400 border-2 border-slate-300'
                              }`}
                            >
                              {stages.isEntered ? <Check className="w-5 h-5 stroke-[3]" /> : '1'}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold leading-tight ${stages.isEntered ? 'text-purple-950 font-black' : 'text-slate-500'}`}>
                              1- تم الدخول
                            </span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[80px] sm:max-w-none">
                              {bk.guestArrived || bk.arrivalConfirmedAt ? 'وصل العميل ✓' : (todayStr >= bk.checkInDate ? 'موعد اليوم' : 'بانتظار الدخول')}
                            </span>
                          </div>

                          {/* 2- تم دفع المتبقي */}
                          <div className="flex flex-col items-center gap-1.5 text-center flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all shadow-xs ${
                                stages.isRemainingPaid
                                  ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                                  : 'bg-white text-slate-400 border-2 border-slate-300'
                              }`}
                            >
                              {stages.isRemainingPaid ? <Check className="w-5 h-5 stroke-[3]" /> : '2'}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold leading-tight ${stages.isRemainingPaid ? 'text-amber-950 font-black' : 'text-slate-500'}`}>
                              2- تم دفع المتبقي
                            </span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[80px] sm:max-w-none">
                              {bk.remainingAmount <= 0 ? 'مسدد بالكامل' : `${bk.remainingAmount} ر.س متبقي`}
                            </span>
                          </div>

                          {/* 3- تم دفع التأمين */}
                          <div className="flex flex-col items-center gap-1.5 text-center flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all shadow-xs ${
                                stages.isInsurancePaid
                                  ? 'bg-purple-700 text-white ring-4 ring-purple-100'
                                  : 'bg-white text-slate-400 border-2 border-slate-300'
                              }`}
                            >
                              {stages.isInsurancePaid ? <Check className="w-5 h-5 stroke-[3]" /> : '3'}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold leading-tight ${stages.isInsurancePaid ? 'text-purple-950 font-black' : 'text-slate-500'}`}>
                              3- تم دفع التأمين
                            </span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[80px] sm:max-w-none">
                              {stages.isInsurancePaid ? (bk.insurancePaymentMethod === 'cash' || bk.insuranceReceivedCash ? 'مستلم كاش' : 'محول بنكياً') : `${bk.insuranceAmount} ر.س معلق`}
                            </span>
                          </div>

                          {/* 4- تم الخروج */}
                          <div className="flex flex-col items-center gap-1.5 text-center flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all shadow-xs ${
                                stages.isCheckedOut
                                  ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                                  : 'bg-white text-slate-400 border-2 border-slate-300'
                              }`}
                            >
                              {stages.isCheckedOut ? <Check className="w-5 h-5 stroke-[3]" /> : '4'}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold leading-tight ${stages.isCheckedOut ? 'text-amber-950 font-black' : 'text-slate-500'}`}>
                              4- تم الخروج
                            </span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[80px] sm:max-w-none">
                              {stages.isCheckedOut ? 'تأكيد الخروج ✓' : bk.checkOutDate}
                            </span>
                          </div>

                          {/* 5- تم استرجاع التأمين */}
                          <div className="flex flex-col items-center gap-1.5 text-center flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all shadow-xs ${
                                stages.isInsuranceRefunded
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                  : 'bg-white text-slate-400 border-2 border-slate-300'
                              }`}
                            >
                              {stages.isInsuranceRefunded ? <Check className="w-5 h-5 stroke-[3]" /> : '5'}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold leading-tight ${stages.isInsuranceRefunded ? 'text-emerald-950 font-black' : 'text-slate-500'}`}>
                              5- تم استرجاع التأمين
                            </span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[80px] sm:max-w-none">
                              {stages.isInsuranceRefunded ? 'مسترد للنزيل ✓' : 'قيد الاسترجاع'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* المستندات والإيصالات المرفقة (معاينة وتحميل فوري بضغطة زر) */}
                    {renderBookingReceiptBadges(bk)}

                    {/* الشريط المنسدل السفلي للتواصل السريع (اتصال / واتساب) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleBookingExpanded(trackKey)}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                          isExpanded
                            ? 'bg-purple-100 text-purple-950 border-purple-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-purple-700" />
                          <span>أزرار الاتصال والمراسلة السريعة (العميل • الحارس • الإدارة)</span>
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 bg-slate-50 border border-purple-100 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 animate-in fade-in duration-100">
                          {/* العميل */}
                          <div className="bg-white border border-emerald-200 rounded-xl p-2 flex items-center justify-between gap-2 shadow-2xs">
                            <span className="text-xs font-bold text-emerald-950 truncate">العميل: {bk.customerName}</span>
                            <div className="flex items-center gap-1">
                              <a href={`tel:${bk.customerPhone}`} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <Phone className="w-3 h-3" />
                              </a>
                              <a href={getWhatsAppCustomerUrl(bk.customerPhone, bk.customerName, bk.propertyName)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          {/* الحارس */}
                          <div className="bg-white border border-sky-200 rounded-xl p-2 flex items-center justify-between gap-2 shadow-2xs">
                            <span className="text-xs font-bold text-sky-950 truncate">الحارس: {propGuard?.name || 'أبو راشد'}</span>
                            <div className="flex items-center gap-1">
                              <a href={`tel:${propGuard?.phone || '0598881234'}`} className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200">
                                <Phone className="w-3 h-3" />
                              </a>
                              <a href={getWhatsAppGuardUrl(bk)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white">
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          {/* الإدارة */}
                          <div className="bg-white border border-purple-200 rounded-xl p-2 flex items-center justify-between gap-2 shadow-2xs">
                            <span className="text-xs font-bold text-purple-950 truncate">الإدارة العامة</span>
                            <div className="flex items-center gap-1">
                              <a href="tel:0500000001" className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200">
                                <Phone className="w-3 h-3" />
                              </a>
                              <a href={getWhatsAppAdminUrl(bk)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white">
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Available Today Chalets Section */}
      {!isGuard && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
            <button
              onClick={() => setShowAvailableProps(!showAvailableProps)}
              className="px-3.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {showAvailableProps ? 'إخفاء المتاح' : 'عرض المتاح'}
            </button>
            <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-700" />
              <span>المتاح اليوم ({availableTodayProperties.length})</span>
            </h3>
          </div>

          {showAvailableProps && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-150">
              {availableTodayProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedPropertyId(prop.id);
                    setActiveTab('calendar');
                  }}
                  className="p-3 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl border border-emerald-200/80 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-900 transition-colors">
                        {prop.name}
                      </h4>
                      <span className="text-[10px] text-slate-500">{prop.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left font-mono">
                      <span className="font-bold text-xs sm:text-sm text-emerald-800 block">
                        {prop.basePriceWeekday} ر.س
                      </span>
                      <span className="text-[9px] text-slate-400">سعر الليلة</span>
                    </div>
                    <span className="text-xs bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs group-hover:bg-purple-800 transition-all">
                      حجز الآن
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete Payment Modal */}
      {paymentModalBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPaymentModalBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-3.5 shadow-2xl border border-purple-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
              <h4 className="font-bold text-sm text-purple-950">
                إكمال الدفع - {paymentModalBooking.customerName}
              </h4>
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم الحجز:</span>
                <span className="font-mono font-bold">{paymentModalBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المبلغ المتبقي:</span>
                <span className="font-mono font-bold text-purple-900">
                  {paymentModalBooking.remainingAmount} ر.س
                </span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-purple-300 rounded-xl px-3 py-3 text-xs text-purple-900 font-bold hover:bg-purple-50/50 transition-colors">
              <Paperclip className="w-4 h-4 text-purple-700" />
              <span className="truncate">
                {paymentReceiptFile?.name || 'إرفاق إيصال التحويل البنكي (صورة أو PDF)'}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleReceiptFileChange(e.target.files?.[0])}
              />
            </label>

            {paymentFileError && (
              <p className="text-[10px] text-amber-700 font-bold">{paymentFileError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                disabled={!paymentReceiptFile}
                onClick={submitPaymentCompletion}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                حفظ وإكمال
              </button>
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Handover Confirm Modal */}
      {insuranceConfirmBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInsuranceConfirmBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-3.5 shadow-2xl border border-purple-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-sm">تأكيد تسليم التأمين</h4>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              هل تؤكد تسليم مبلغ التأمين{' '}
              <strong className="font-mono text-amber-800">({insuranceConfirmBooking.insuranceAmount} ر.س)</strong> للعميل{' '}
              <strong>{insuranceConfirmBooking.customerName}</strong>؟ سيُرسل إشعار بذلك للإدارة.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={confirmInsuranceHandover}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                نعم، تم التسليم
              </button>
              <button
                onClick={() => setInsuranceConfirmBooking(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedBookingForDetails(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <div>
                <h4 className="font-bold text-base text-slate-900">{detailsTitle}</h4>
                <span className="text-xs font-mono text-purple-700">{selectedBookingForDetails.bookingNumber}</span>
              </div>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">اسم العميل:</span>
                <span className="font-bold text-slate-900">{selectedBookingForDetails.customerName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">رقم الجوال:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBookingForDetails.customerPhone}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">العقار:</span>
                <span className="font-bold text-purple-900">{selectedBookingForDetails.propertyName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">فترة الإقامة:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  من {selectedBookingForDetails.checkInDate} إلى {selectedBookingForDetails.checkOutDate} ({selectedBookingForDetails.nightsCount} ليالٍ)
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المبلغ الإجمالي:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{selectedBookingForDetails.totalPrice} ر.س</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">العربون المدفوع:</span>
                <span className="font-bold text-emerald-700 font-mono">{selectedBookingForDetails.depositPaid} ر.س</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المبلغ المتبقي للتحصيل:</span>
                <span className="font-bold text-purple-900 font-mono">{selectedBookingForDetails.remainingAmount} ر.س</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">مبلغ التأمين المسترد:</span>
                <span className="font-bold text-amber-700 font-mono">
                  {selectedBookingForDetails.insuranceAmount} ر.س ({selectedBookingForDetails.insuranceReturned ? 'تم التسليم' : 'معلق'})
                </span>
              </div>

              {/* المستندات والإيصالات المرفقة للحجز */}
              <div className="py-2 border-b border-slate-100 space-y-2">
                <span className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-purple-700" />
                  <span>الإيصالات والمستندات المرفقة:</span>
                </span>
                
                <div className="space-y-1.5">
                  {selectedBookingForDetails.paymentReceiptName ? (
                    <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 p-2 rounded-xl text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>إيصال سداد المتبقي</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openReceiptModal('remaining', selectedBookingForDetails)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(selectedBookingForDetails.paymentReceiptDataUrl, selectedBookingForDetails.paymentReceiptName || `payment-${selectedBookingForDetails.bookingNumber}.png`)}
                          className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg cursor-pointer"
                          title="تحميل الإيصال"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {(selectedBookingForDetails.digitalInsuranceReceiptUrl || selectedBookingForDetails.insuranceReceiptDataUrl || selectedBookingForDetails.insuranceReceiptName) ? (
                    <div className="flex items-center justify-between bg-sky-50/70 border border-sky-200 p-2 rounded-xl text-xs">
                      <span className="font-bold text-sky-950 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                        <span>إيصال التأمين</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openReceiptModal('insurance', selectedBookingForDetails)}
                          className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(selectedBookingForDetails.digitalInsuranceReceiptUrl || selectedBookingForDetails.insuranceReceiptDataUrl, selectedBookingForDetails.digitalInsuranceReceiptName || selectedBookingForDetails.insuranceReceiptName || `insurance-${selectedBookingForDetails.bookingNumber}.png`)}
                          className="p-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg cursor-pointer"
                          title="تحميل الإيصال"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {selectedBookingForDetails.customerBankReceiptUrl ? (
                    <div className="flex items-center justify-between bg-purple-50/70 border border-purple-200 p-2 rounded-xl text-xs">
                      <span className="font-bold text-purple-950 flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-purple-600" />
                        <span>حساب العميل (استرداد)</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openReceiptModal('customer_account', selectedBookingForDetails)}
                          className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(selectedBookingForDetails.customerBankReceiptUrl, selectedBookingForDetails.customerBankReceiptName || `iban-${selectedBookingForDetails.bookingNumber}.png`)}
                          className="p-1 bg-purple-800 hover:bg-purple-900 text-white rounded-lg cursor-pointer"
                          title="تحميل حساب العميل"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {selectedBookingForDetails.insuranceRefundReceiptUrl ? (
                    <div className="flex items-center justify-between bg-teal-50/70 border border-teal-200 p-2 rounded-xl text-xs">
                      <span className="font-bold text-teal-950 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-teal-600" />
                        <span>إيصال استرداد التأمين</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openReceiptModal('refund', selectedBookingForDetails)}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(selectedBookingForDetails.insuranceRefundReceiptUrl, selectedBookingForDetails.insuranceRefundReceiptName || `refund-${selectedBookingForDetails.bookingNumber}.png`)}
                          className="p-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg cursor-pointer"
                          title="تحميل إيصال الاسترداد"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {selectedBookingForDetails.depositReceiptUrl ? (
                    <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 p-2 rounded-xl text-xs">
                      <span className="font-bold text-amber-950 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-amber-600" />
                        <span>إيصال العربون</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openReceiptModal('deposit', selectedBookingForDetails)}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(selectedBookingForDetails.depositReceiptUrl, `deposit-${selectedBookingForDetails.bookingNumber}.png`)}
                          className="p-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg cursor-pointer"
                          title="تحميل إيصال العربون"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {!selectedBookingForDetails.paymentReceiptName &&
                   !selectedBookingForDetails.digitalInsuranceReceiptUrl &&
                   !selectedBookingForDetails.insuranceReceiptDataUrl &&
                   !selectedBookingForDetails.customerBankReceiptUrl &&
                   !selectedBookingForDetails.insuranceRefundReceiptUrl &&
                   !selectedBookingForDetails.depositReceiptUrl && (
                    <div className="text-slate-400 text-[11px] italic py-1">
                      لا توجد إيصالات مرفقة محفوظة لهذا الحجز حالياً.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المسوق المعتمد:</span>
                <span className="font-bold text-slate-800">
                  {selectedBookingForDetails.marketerName || 'حجز مباشر'} ({selectedBookingForDetails.marketerCommission} ر.س)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                disabled={selectedBookingForDetails.remainingAmount <= 0}
                onClick={() => {
                  handlePaymentReminder(selectedBookingForDetails.id);
                  setSelectedBookingForDetails(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {selectedBookingForDetails.remainingAmount <= 0 ? 'الدفع مكتمل ✓' : 'تذكير الدفع عبر واتساب'}
                </span>
              </button>

              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Receipt Viewer Modal - معاينة وحفظ وتحميل الإيصال بضغطة زر */}
      {activeReceiptViewer && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-['Tajawal',sans-serif] animate-in fade-in"
          dir="rtl"
          onClick={() => setActiveReceiptViewer(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[94vh] overflow-hidden shadow-2xl border border-purple-200 flex flex-col text-right animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-200 shadow-inner">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base text-white">
                    {activeReceiptViewer.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-purple-200 mt-0.5 flex-wrap">
                    <span className="font-semibold bg-white/15 px-2 py-0.5 rounded-md">
                      {activeReceiptViewer.receiptTypeName}
                    </span>
                    {activeReceiptViewer.uploadedBy && (
                      <span>بواسطة: {activeReceiptViewer.uploadedBy}</span>
                    )}
                    {activeReceiptViewer.uploadedAt && (
                      <span className="font-mono text-[10px] text-purple-300">
                        ({activeReceiptViewer.uploadedAt})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveReceiptViewer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
              {/* Context Summary Cards */}
              {activeReceiptViewer.booking && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">العقار</span>
                    <span className="font-bold text-purple-900 truncate block">
                      {activeReceiptViewer.booking.propertyName}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">النزيل</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {activeReceiptViewer.booking.customerName}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">رقم التواصل</span>
                    <span className="font-mono font-bold text-slate-800 dir-ltr text-right block">
                      {activeReceiptViewer.booking.customerPhone}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">المبلغ المرتبط</span>
                    <span className="font-mono font-black text-emerald-700 block">
                      {activeReceiptViewer.amount !== undefined ? `${activeReceiptViewer.amount} ر.س` : '—'}
                    </span>
                  </div>
                </div>
              )}

              {/* Extra details if available (notes / IBAN) */}
              {(activeReceiptViewer.customerIban || activeReceiptViewer.notes) && (
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                  {activeReceiptViewer.customerIban && (
                    <div className="flex items-center justify-between">
                      <span className="text-amber-900 font-bold">الآيبان / الحساب البنكي:</span>
                      <span className="font-mono font-bold text-slate-900 dir-ltr select-all">
                        {activeReceiptViewer.customerIban}
                      </span>
                    </div>
                  )}
                  {activeReceiptViewer.notes && (
                    <div className="text-amber-950">
                      <span className="font-bold">ملاحظات: </span>
                      <span>{activeReceiptViewer.notes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview Container */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-2 sm:p-3 shadow-xs flex items-center justify-center min-h-[220px]">
                {activeReceiptViewer.receiptUrl ? (
                  activeReceiptViewer.receiptUrl.startsWith('data:image') ||
                  activeReceiptViewer.receiptUrl.startsWith('http') ||
                  activeReceiptViewer.receiptUrl.startsWith('/') ||
                  activeReceiptViewer.receiptUrl.startsWith('blob:') ? (
                    <div className="relative group max-w-full">
                      <img
                        src={activeReceiptViewer.receiptUrl}
                        alt={activeReceiptViewer.title}
                        className="max-h-[52vh] w-auto max-w-full rounded-xl object-contain mx-auto shadow-xs border border-slate-100"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500 space-y-2">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700">{activeReceiptViewer.receiptName || 'مستند مرفق'}</p>
                      <p className="text-xs text-slate-400">الملف غير متاح كصورة قابلة للعرض المباشر</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <p className="font-bold text-slate-600">لا يوجد ملف إيصال مرفق لهذا الإجراء</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {activeReceiptViewer.receiptUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(activeReceiptViewer.receiptUrl, activeReceiptViewer.receiptName)}
                      className="flex-1 min-w-[170px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer btn-beam-shine"
                      title="حفظ الصورة وتحميلها مباشرة إلى جهازك"
                    >
                      <Download className="w-4 h-4 text-emerald-100" />
                      <span>حفظ الصورة / تحميل بضغطة زر واحدة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.open(activeReceiptViewer.receiptUrl, '_blank')}
                      className="py-2.5 px-3.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="فتح الصورة بالحجم الكامل في نافذة مستقلة"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-700" />
                      <span>فتح بالحجم الكامل</span>
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveReceiptViewer(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal (Fallback) */}
      {viewReceiptBooking && !activeReceiptViewer && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 font-['Tajawal',sans-serif]"
          onClick={() => setViewReceiptBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" />
                <span>إيصال إكمال الدفع - {viewReceiptBooking.bookingNumber}</span>
              </h4>
              <button onClick={() => setViewReceiptBooking(null)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              بواسطة {viewReceiptBooking.paymentCompletedBy || 'الموظف'} · <span className="font-mono">{viewReceiptBooking.paymentCompletedAt}</span>
            </div>

            {viewReceiptBooking.paymentReceiptDataUrl?.startsWith('data:image') ? (
              <img
                src={viewReceiptBooking.paymentReceiptDataUrl}
                alt="إيصال"
                className="w-full rounded-2xl border border-slate-200"
              />
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
                {viewReceiptBooking.paymentReceiptName || 'ملف الإيصال المرفق'}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              {viewReceiptBooking.paymentReceiptDataUrl && (
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(viewReceiptBooking.paymentReceiptDataUrl, viewReceiptBooking.paymentReceiptName)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>حفظ وتحميل الصورة</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewReceiptBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW MODAL 1: نافذة تأكيد وصول العميل (خيارين: دفع إيصال مع إرفاق، دفع كاش + إشعار للحارس والإدارة) */}
      {arrivalModalBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tajawal',sans-serif] animate-in fade-in"
          dir="rtl"
          onClick={() => setArrivalModalBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl border border-purple-100 max-h-[92vh] overflow-y-auto text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-sky-100" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">تسجيل وتأكيد وصول العميل</h4>
                  <p className="text-[11px] text-purple-700 font-bold">
                    إشعار فوري للحارس والإدارة وتحديد طريقة سداد المتبقي
                  </p>
                </div>
              </div>
              <button
                onClick={() => setArrivalModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Booking Info Card */}
            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">اسم العميل:</span>
                <span className="font-bold text-slate-900">{arrivalModalBooking.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">رقم الجوال:</span>
                <span className="font-mono font-bold text-slate-800">{arrivalModalBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">العقار / الشاليه:</span>
                <span className="font-bold text-purple-900">{arrivalModalBooking.propertyName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">رقم الحجز:</span>
                <span className="font-mono font-bold text-purple-700">{arrivalModalBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-200/70">
                <span className="text-slate-500 font-medium">المبلغ المتبقي للتحصيل:</span>
                <span className={`font-mono font-bold text-sm ${arrivalModalBooking.remainingAmount > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                  {arrivalModalBooking.remainingAmount > 0 ? `${arrivalModalBooking.remainingAmount} ر.س` : 'مدفوع بالكامل مسبقاً ✓'}
                </span>
              </div>
            </div>

            {/* Payment Method Selector (خيارين: دفع إيصال ويرفق الإيصال، أو دفع كاش) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                اختر طريقة سداد المتبقي وتأكيد الوصول:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: دفع إيصال */}
                <button
                  type="button"
                  onClick={() => {
                    setArrivalPayMethod('receipt');
                    setArrivalFileError(null);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    arrivalPayMethod === 'receipt'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-200 text-purple-950'
                      : 'border-slate-200 hover:border-purple-200 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-purple-700" />
                      <span>دفع إيصال بنكي</span>
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        arrivalPayMethod === 'receipt'
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {arrivalPayMethod === 'receipt' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    حوالة بنكية ويجب إرفاق ملف الإيصال
                  </span>
                </button>

                {/* Option 2: دفع كاش */}
                <button
                  type="button"
                  onClick={() => {
                    setArrivalPayMethod('cash');
                    setArrivalFileError(null);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    arrivalPayMethod === 'cash'
                      ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-200 text-amber-950'
                      : 'border-slate-200 hover:border-amber-200 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-amber-700" />
                      <span>دفع كاش مباشر</span>
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        arrivalPayMethod === 'cash'
                          ? 'border-amber-600 bg-amber-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {arrivalPayMethod === 'cash' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    تسليم نقدي للحارس أو الاستراحة
                  </span>
                </button>
              </div>
            </div>

            {/* Receipt File Upload Field (ويرفق الإيصال) */}
            {arrivalPayMethod === 'receipt' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  إرفاق صورة إيصال السداد البنكي:
                  {arrivalModalBooking.remainingAmount > 0 && (
                    <span className="text-rose-600 mr-1">*</span>
                  )}
                </label>

                <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 rounded-2xl cursor-pointer transition-colors text-center">
                  <UploadCloud className="w-6 h-6 text-purple-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    {arrivalReceiptFile ? arrivalReceiptFile.name : 'اضغط لاختيار صورة الإيصال (PNG, JPG, PDF)'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">الحد الأقصى للحجم 3 ميجابايت</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleArrivalReceiptChange(e.target.files?.[0])}
                  />
                </label>

                {arrivalReceiptFile && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
                    <span className="truncate max-w-[280px] font-mono">{arrivalReceiptFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setArrivalReceiptFile(null)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                    >
                      إزالة
                    </button>
                  </div>
                )}

                {arrivalFileError && (
                  <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                    {arrivalFileError}
                  </p>
                )}
              </div>
            )}

            {arrivalPayMethod === 'cash' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  سيتم تسجيل السداد كاش، وإرسال تنبيه فوري للحارس ({guard?.name || 'أبو راشد'}) والإدارة العامة لمتابعة استلام المبلغ بصندوق الاستراحة.
                </p>
              </div>
            )}

            {/* Notification Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-[11px] text-slate-600 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>
                سيُرسل إشعار وتنبيه فوري بالنظام إلى <strong>الحارس والإدارة</strong> فور النقر على التأكيد.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={submitArrivalConfirmation}
                className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد وصول العميل وإرسال الإشعار</span>
              </button>
              <button
                type="button"
                onClick={() => setArrivalModalBooking(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW MODAL 2: نافذة عنصر التأمين (خيارين: دفع إيصال مع إرفاق إلزامي، دفع كاش + إشعار للحارس والإدارة) */}
      {insuranceModalBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tajawal',sans-serif] animate-in fade-in"
          dir="rtl"
          onClick={() => setInsuranceModalBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl border border-purple-100 max-h-[92vh] overflow-y-auto text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">تحصيل واستلام مبلغ التأمين</h4>
                  <p className="text-[11px] text-amber-800 font-bold">
                    مبلغ التأمين المطلوب: {insuranceModalBooking.insuranceAmount} ر.س
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInsuranceModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Booking Info Card */}
            <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">اسم العميل:</span>
                <span className="font-bold text-slate-900">{insuranceModalBooking.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">العقار / الشاليه:</span>
                <span className="font-bold text-purple-900">{insuranceModalBooking.propertyName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">رقم الحجز:</span>
                <span className="font-mono font-bold text-purple-700">{insuranceModalBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-amber-200">
                <span className="text-amber-900 font-bold">مبلغ التأمين المسترد:</span>
                <span className="font-mono font-black text-base text-amber-950">
                  {insuranceModalBooking.insuranceAmount} ر.س
                </span>
              </div>
            </div>

            {/* Payment Method Selector (خيارين: دفع إيصال ويجب إرفاق الإيصال، ودفع كاش) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                اختر طريقة استلام التأمين:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: دفع إيصال */}
                <button
                  type="button"
                  onClick={() => {
                    setInsurancePayMethod('receipt');
                    setInsuranceFileError(null);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    insurancePayMethod === 'receipt'
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-200 text-purple-950'
                      : 'border-slate-200 hover:border-purple-200 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-purple-700" />
                      <span>دفع إيصال بنكي</span>
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        insurancePayMethod === 'receipt'
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {insurancePayMethod === 'receipt' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                    يجب إرفاق ملف الإيصال إجبارياً
                  </span>
                </button>

                {/* Option 2: دفع كاش */}
                <button
                  type="button"
                  onClick={() => {
                    setInsurancePayMethod('cash');
                    setInsuranceFileError(null);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    insurancePayMethod === 'cash'
                      ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-200 text-amber-950'
                      : 'border-slate-200 hover:border-amber-200 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-amber-700" />
                      <span>دفع كاش مباشر</span>
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        insurancePayMethod === 'cash'
                          ? 'border-amber-600 bg-amber-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {insurancePayMethod === 'cash' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    استلام نقدي مباشر من العميل
                  </span>
                </button>
              </div>
            </div>

            {/* Receipt File Upload Field - ويجب إرفاق الإيصال */}
            {insurancePayMethod === 'receipt' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    ملف إيصال التأمين البنكي:
                    <span className="text-rose-600 mr-1">* (إلزامي)</span>
                  </label>
                  <span className="text-[10px] text-rose-600 font-bold">ويجب إرفاق الإيصال</span>
                </div>

                <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 rounded-2xl cursor-pointer transition-colors text-center">
                  <UploadCloud className="w-6 h-6 text-purple-600 mb-1" />
                  <span className="text-xs font-bold text-purple-900">
                    {insuranceReceiptFile ? insuranceReceiptFile.name : 'اضغط لإرفاق ملف إيصال التأمين'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">يُقبل صور وإيصالات بنكية حتى 3 ميجابايت</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleInsuranceReceiptChange(e.target.files?.[0])}
                  />
                </label>

                {insuranceReceiptFile && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
                    <span className="truncate max-w-[280px] font-mono">{insuranceReceiptFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setInsuranceReceiptFile(null)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                    >
                      إزالة
                    </button>
                  </div>
                )}

                {insuranceFileError && (
                  <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                    {insuranceFileError}
                  </p>
                )}
              </div>
            )}

            {insurancePayMethod === 'cash' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  تم استلام مبلغ التأمين نقداً ({insuranceModalBooking.insuranceAmount} ريال) وسيتم إشعار الحارس ({guard?.name || 'أبو راشد'}) والإدارة العامة فوراً وتوثيق العملية في سجل الحركات.
                </p>
              </div>
            )}

            {/* Notification Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-[11px] text-slate-600 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                سيُرسل إشعار وتنبيه فوري بالنظام إلى <strong>الحارس والإدارة</strong> فور النقر على التأكيد.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={submitInsuranceConfirmation}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>تأكيد استلام التأمين وإشعار الحارس والإدارة</span>
              </button>
              <button
                type="button"
                onClick={() => setInsuranceModalBooking(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: إجراءات المسوقة (رسالة ترحيب + طلب وسداد الدفع بإيصال أو كاش مع إشعار الحارس) */}
      {marketerPaymentModalBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tajawal',sans-serif] animate-in fade-in"
          dir="rtl"
          onClick={() => setMarketerPaymentModalBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl border border-purple-100 max-h-[92vh] overflow-y-auto text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-purple-100" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">إجراءات المسوقة: الترحيب وإكمال الدفع</h4>
                  <p className="text-[11px] text-purple-700 font-bold">
                    {marketerPaymentModalBooking.customerName} • {marketerPaymentModalBooking.propertyName} (#{marketerPaymentModalBooking.bookingNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMarketerPaymentModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Tabs: رسالة ترحيب | طلب وسداد الدفع */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMarketerPaymentTab('welcome')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketerPaymentTab === 'welcome'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>1. رسالة ترحيب بالعميل</span>
              </button>
              <button
                type="button"
                onClick={() => setMarketerPaymentTab('payment')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  marketerPaymentTab === 'payment'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4 text-purple-700" />
                <span>2. طلب وسداد الدفع</span>
                {marketerPaymentModalBooking.remainingAmount > 0 && (
                  <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded-md font-mono">
                    {marketerPaymentModalBooking.remainingAmount} ر.س
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: رسالة ترحيب بالعميل */}
            {marketerPaymentTab === 'welcome' && (
              <div className="space-y-3.5">
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs space-y-1.5 text-emerald-950">
                  <span className="font-bold block flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>رسالة ترحيبية فورية بالنزيل عند الوصول:</span>
                  </span>
                  <p className="text-[11px] text-emerald-800">
                    يمكنك تعديل نص الرسالة أدناه ثم النقر على زر الإرسال لفتح محادثة واتساب العميل مباشرة.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">نص رسالة الترحيب:</label>
                  <textarea
                    rows={4}
                    value={marketerWelcomeCustomText}
                    onChange={(e) => setMarketerWelcomeCustomText(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-2xl transition-all resize-none outline-none leading-relaxed text-slate-800 font-medium"
                    placeholder="اكتب صيغة الترحيب هنا..."
                  />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => sendWelcomeMessageWhatsApp(marketerPaymentModalBooking, marketerWelcomeCustomText)}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>📱 إرسال رسالة الترحيب عبر واتساب للعميل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarketerPaymentTab('payment')}
                    className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>المتابعة إلى خيار طلب وسداد الدفع</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: طلب وسداد الدفع (خيارين: إيصال مع إرفاق، أو تسليم كاش مع إشعار الحارس) */}
            {marketerPaymentTab === 'payment' && (
              <div className="space-y-3.5">
                {/* Financial Summary */}
                <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-medium">العميل:</span>
                    <span className="font-bold text-slate-900">{marketerPaymentModalBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-medium">العقار / الشاليه:</span>
                    <span className="font-bold text-purple-900">{marketerPaymentModalBooking.propertyName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">المبلغ المتبقي للتحصيل:</span>
                    <span className={`font-mono font-black text-sm ${marketerPaymentModalBooking.remainingAmount > 0 ? 'text-purple-900' : 'text-emerald-700'}`}>
                      {marketerPaymentModalBooking.remainingAmount > 0 ? `${marketerPaymentModalBooking.remainingAmount} ر.س` : 'مسدد بالكامل مسبقاً ✓'}
                    </span>
                  </div>
                </div>

                {/* Option Switcher: دفع إيصال أو دفع كاش */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 block">
                    اختر طريقة سداد المبلغ المتبقي:
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option A: دفع إيصال */}
                    <button
                      type="button"
                      onClick={() => {
                        setMarketerPayMethod('receipt');
                        setMarketerFileError(null);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        marketerPayMethod === 'receipt'
                          ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-200 text-purple-950'
                          : 'border-slate-200 hover:border-purple-200 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4 text-purple-700" />
                          <span>دفع إيصال بنكي</span>
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            marketerPayMethod === 'receipt'
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {marketerPayMethod === 'receipt' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        حوالة بنكية مع خانة إرفاق الإيصال
                      </span>
                    </button>

                    {/* Option B: تسليم كاش */}
                    <button
                      type="button"
                      onClick={() => {
                        setMarketerPayMethod('cash');
                        setMarketerFileError(null);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        marketerPayMethod === 'cash'
                          ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-200 text-amber-950'
                          : 'border-slate-200 hover:border-amber-200 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-amber-700" />
                          <span>تسليم كاش للحارس</span>
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            marketerPayMethod === 'cash'
                              ? 'border-amber-600 bg-amber-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {marketerPayMethod === 'cash' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-800 font-bold mt-1 block">
                        إشعار للحارس بالتوجه واستلام المبلغ
                      </span>
                    </button>
                  </div>
                </div>

                {/* File Upload Box (عند اختيار إيصال) */}
                {marketerPayMethod === 'receipt' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      خانة إرفاق إيصال السداد البنكي:
                      {marketerPaymentModalBooking.remainingAmount > 0 && (
                        <span className="text-rose-600 mr-1">*</span>
                      )}
                    </label>

                    <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 rounded-2xl cursor-pointer transition-colors text-center">
                      <UploadCloud className="w-6 h-6 text-purple-600 mb-1" />
                      <span className="text-xs font-bold text-slate-700">
                        {marketerReceiptFile ? marketerReceiptFile.name : 'اضغط لاختيار صورة الإيصال أو المستند (PNG, JPG, PDF)'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">الحد الأقصى للحجم 3 ميجابايت</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleMarketerReceiptChange(e.target.files?.[0])}
                      />
                    </label>

                    {marketerReceiptFile && (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
                        <span className="truncate max-w-[280px] font-mono">{marketerReceiptFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setMarketerReceiptFile(null)}
                          className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                        >
                          إزالة
                        </button>
                      </div>
                    )}

                    {marketerFileError && (
                      <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                        {marketerFileError}
                      </p>
                    )}
                  </div>
                )}

                {/* Cash Alert Box (عند اختيار كاش: يرسل إشعار للحارس للذهاب لاستلام المبلغ وسعر المبلغ المتبقي) */}
                {marketerPayMethod === 'cash' && (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2 text-right">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-xs text-amber-950">
                          إشعار فوري للحارس للذهاب لاستلام المبلغ كاش:
                        </h5>
                        <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                          عند النقر على الزر أدناه، سيتم إرسال إشعار فوري للحارس (<strong>{guard?.name || 'أبو راشد'}</strong>) للتوجه فوراً واستلام المبلغ المتبقي وقدره (<strong>{marketerPaymentModalBooking.remainingAmount} ر.س</strong>) كاش من العميل (<strong>{marketerPaymentModalBooking.customerName}</strong>) في ({marketerPaymentModalBooking.propertyName}).
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                      <span className="text-[11px] text-amber-800 font-medium">سعر المبلغ المتبقي المطلوب كاش:</span>
                      <span className="font-mono font-black text-sm text-amber-950">
                        {marketerPaymentModalBooking.remainingAmount} ر.س
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={submitMarketerPayment}
                    className={`flex-1 py-3 px-4 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all ${
                      marketerPayMethod === 'cash'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {marketerPayMethod === 'cash' ? (
                      <>
                        <Send className="w-4 h-4" />
                        <span>إرسال إشعار للحارس للذهاب لاستلام الكاش ({marketerPaymentModalBooking.remainingAmount} ر.س)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد إرفاق الإيصال وإكمال الدفع</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketerPaymentModalBooking(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: تذكير النزيل بموعد الخروج (إجراء المسوقة) */}
      {reminderModalBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tajawal',sans-serif] animate-in fade-in"
          dir="rtl"
          onClick={() => setReminderModalBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl border border-rose-100 max-h-[92vh] overflow-y-auto text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-5 h-5 text-emerald-100" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">رسالة تذكير بالخروج للنزيل</h4>
                  <p className="text-[11px] text-emerald-800 font-bold">
                    إجراء المسوقة • {reminderModalBooking.customerName} (#{reminderModalBooking.bookingNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Booking Info */}
            <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">النزيل:</span>
                <span className="font-bold text-slate-900">{reminderModalBooking.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">العقار / الشاليه:</span>
                <span className="font-bold text-purple-900">{reminderModalBooking.propertyName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">مبلغ التأمين المسترد:</span>
                <span className="font-mono font-bold text-emerald-800">{reminderModalBooking.insuranceAmount} ر.س</span>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">نص رسالة التذكير عبر واتساب:</label>
              <textarea
                rows={5}
                value={customReminderMsg}
                onChange={(e) => setCustomReminderMsg(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all resize-none outline-none leading-relaxed text-slate-800 font-medium"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => sendMarketerReminder(reminderModalBooking, customReminderMsg)}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>📱 إرسال تذكير الخروج عبر واتساب العميل</span>
              </button>
              <button
                type="button"
                onClick={() => setReminderModalBooking(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: معاينة الحارس عند الخروج تماماً وتصفية التأمين أو خصم الأضرار مع خانة إرفاق صور */}
      {guardInspectionBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Tajawal',sans-serif] animate-in fade-in"
          dir="rtl"
          onClick={() => setGuardInspectionBooking(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl border border-rose-100 max-h-[92vh] overflow-y-auto text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-rose-100" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">معاينة الحارس عند خروج النزيل تماماً</h4>
                  <p className="text-[11px] text-rose-800 font-bold">
                    إشعار فوري للمسوقة والإدارة بإعادة التأمين أو خصم مبلغ الأضرار
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGuardInspectionBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Booking Info Card */}
            <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">النزيل:</span>
                <span className="font-bold text-slate-900">{guardInspectionBooking.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">العقار / الشاليه:</span>
                <span className="font-bold text-purple-900">{guardInspectionBooking.propertyName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">المسوقة المسؤولة:</span>
                <span className="font-bold text-purple-900">{guardInspectionBooking.marketerName || 'حجز مباشر'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-1.5 border-t border-slate-200/70">
                <span className="text-slate-600 font-bold">إجمالي مبلغ التأمين المودع:</span>
                <span className="font-mono font-black text-sm text-amber-800">
                  {guardInspectionBooking.insuranceAmount} ر.س
                </span>
              </div>
            </div>

            {/* Choice: إعادة التأمين كاملاً أو خصم أضرار */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                نتيجة معاينة الاستراحة وحالة التأمين:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: إعادة التأمين بالكامل */}
                <button
                  type="button"
                  onClick={() => {
                    setGuardInspectionResult('full_refund');
                    setGuardInspectionError(null);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    guardInspectionResult === 'full_refund'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-200 text-emerald-950'
                      : 'border-slate-200 hover:border-emerald-200 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>إعادة التأمين كاملاً</span>
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        guardInspectionResult === 'full_refund'
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {guardInspectionResult === 'full_refund' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    الاستراحة سليمة وبدون أي تلفيات ({guardInspectionBooking.insuranceAmount} ر.س)
                  </span>
                </button>

                {/* Option 2: خصم مبلغ للعبث والأضرار */}
                <button
                  type="button"
                  onClick={() => {
                    setGuardInspectionResult('deduction');
                    setGuardInspectionError(null);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    guardInspectionResult === 'deduction'
                      ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-200 text-rose-950'
                      : 'border-slate-200 hover:border-rose-200 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>خصم مبلغ (أضرار وعبث)</span>
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        guardInspectionResult === 'deduction'
                          ? 'border-rose-600 bg-rose-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {guardInspectionResult === 'deduction' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-bold mt-1 block">
                    وجود عبث أو أضرار مع إرفاق صور
                  </span>
                </button>
              </div>
            </div>

            {/* Deduction Form & Photo Upload (إذا اختار خصم مبلغ للعبث والأضرار) */}
            {guardInspectionResult === 'deduction' && (
              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    المبلغ المخصوم من التأمين (ر.س): <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={guardInspectionBooking.insuranceAmount}
                    value={guardDeductionAmount || ''}
                    onChange={(e) => setGuardDeductionAmount(Number(e.target.value))}
                    placeholder={`مثال: 150 (الحد الأقصى ${guardInspectionBooking.insuranceAmount} ر.س)`}
                    className="w-full p-2.5 text-xs bg-white border border-rose-300 focus:ring-2 focus:ring-rose-200 rounded-xl outline-none font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    المتبقي المسترد للعميل: {Math.max(0, guardInspectionBooking.insuranceAmount - (guardDeductionAmount || 0))} ر.س
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    وصف الأضرار أو العبث بالاستراحة: <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={guardDamageDesc}
                    onChange={(e) => setGuardDamageDesc(e.target.value)}
                    placeholder="اكتب وصف التلفيات أو العبث (مثال: كسر طاولة، تلف في مسند الكنب، اتساخ شديد في المسبح...)"
                    className="w-full p-2.5 text-xs bg-white border border-rose-300 focus:ring-2 focus:ring-rose-200 rounded-xl outline-none resize-none text-slate-800"
                  />
                </div>

                {/* خانة إرفاق صور العبث والأضرار */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="w-4 h-4 text-rose-600" />
                      <span>خانة إرفاق صور الأضرار والعبث:</span>
                    </label>
                    <span className="text-[10px] text-rose-700 font-bold">توثيق بالصور للمسوقة والإدارة</span>
                  </div>

                  <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-rose-300 hover:border-rose-500 bg-white rounded-2xl cursor-pointer transition-colors text-center">
                    <UploadCloud className="w-6 h-6 text-rose-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      اضغط لاختيار وإرفاق صور الأضرار (كاميرا الجوال أو الألبوم)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">يمكنك اختيار عدة صور (PNG, JPG)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleDamagePhotoUpload(e.target.files)}
                    />
                  </label>

                  {/* Uploaded photos preview grid */}
                  {guardDamagePhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {guardDamagePhotos.map((photo, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-rose-200 bg-white group">
                          <img src={photo.dataUrl} alt={photo.name} className="w-full h-20 object-cover" />
                          <button
                            type="button"
                            onClick={() => removeDamagePhoto(idx)}
                            className="absolute top-1 left-1 bg-rose-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <span className="text-[9px] text-slate-600 truncate block px-1 py-0.5 font-mono text-center">
                            {photo.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {guardInspectionError && (
              <p className="text-[11px] text-rose-700 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {guardInspectionError}
              </p>
            )}

            {/* Notification Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-[11px] text-slate-600 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>
                سيُرسل إشعار وتنبيه فوري بالنظام إلى <strong>المسوقة ({guardInspectionBooking.marketerName || 'المسؤولة'}) والإدارة</strong> فور النقر على التأكيد.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={submitGuardDepartureInspection}
                className={`flex-1 py-3 px-4 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all ${
                  guardInspectionResult === 'deduction'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {guardInspectionResult === 'deduction'
                    ? `تأكيد الخروج وخصم (${guardDeductionAmount} ر.س) وإشعار المسوقة والإدارة`
                    : 'تأكيد الخروج وإعادة التأمين كاملاً وإشعار المسوقة والإدارة'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setGuardInspectionBooking(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Digital Insurance Receipt Uploader Modal (المسوقة ترفع إيصال الحوالة البنكية للتأمين) */}
      {digitalInsuranceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-lg p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <UploadCloud className="w-5 h-5 text-purple-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    رفع إيصال التأمين البنكي الرقمي
                  </h3>
                  <span className="text-xs text-purple-700 font-bold">
                    توثيق الحوالة البنكية للتأمين وإشعار الحارس والإدارة
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDigitalInsuranceBooking(null);
                  setDigitalInsuranceFile(null);
                  setDigitalInsuranceError(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Booking Summary */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-bold text-slate-900">{digitalInsuranceBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العقار:</span>
                <span className="font-bold text-purple-900">{digitalInsuranceBooking.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">مبلغ التأمين المطلوب:</span>
                <span className="font-black text-amber-700 font-mono text-sm">{digitalInsuranceBooking.insuranceAmount} ر.س</span>
              </div>
            </div>

            {/* File Uploader Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                صورة إيصال التحويل البنكي للتأمين: <span className="text-rose-600">*</span>
              </label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 rounded-2xl cursor-pointer transition-colors text-center">
                <UploadCloud className="w-8 h-8 text-purple-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-800">
                  {digitalInsuranceFile ? digitalInsuranceFile.name : 'اضغط لاختيار أو تصوير إيصال التحويل'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">صيغ مدعومة: JPG, PNG, PDF (الحد الأقصى 3 ميجابايت)</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 3 * 1024 * 1024) {
                      setDigitalInsuranceError('حجم الملف كبير جداً، الحد الأقصى 3 ميجابايت');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      setDigitalInsuranceFile({ name: file.name, dataUrl: String(reader.result) });
                      setDigitalInsuranceError(null);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {/* Preview */}
              {digitalInsuranceFile && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span className="truncate flex-1">✓ تم إرفاق: {digitalInsuranceFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setDigitalInsuranceFile(null)}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold mr-2"
                  >
                    حذف
                  </button>
                </div>
              )}

              {digitalInsuranceError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {digitalInsuranceError}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                ملاحظات الحوالة (اختياري - اسم البنك أو رقم العملية):
              </label>
              <input
                type="text"
                value={digitalInsuranceNotes}
                onChange={(e) => setDigitalInsuranceNotes(e.target.value)}
                placeholder="مثال: حوالة من مصرف الراجحي باسم العميل"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 text-slate-900"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!digitalInsuranceFile) {
                    setDigitalInsuranceError('يرجى إرفاق صورة إيصال التحويل للمتابعة');
                    return;
                  }
                  uploadDigitalInsuranceReceipt({
                    bookingId: digitalInsuranceBooking.id,
                    receiptName: digitalInsuranceFile.name,
                    receiptDataUrl: digitalInsuranceFile.dataUrl,
                    notes: digitalInsuranceNotes,
                  });
                  showToast('تم رفع إيصال التأمين البنكي وتوثيق المعاملة بنجاح ✓');
                  setDigitalInsuranceBooking(null);
                  setDigitalInsuranceFile(null);
                  setDigitalInsuranceNotes('');
                }}
                className="flex-1 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 btn-beam-shine transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد إيصال التأمين الرقمي</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDigitalInsuranceBooking(null);
                  setDigitalInsuranceFile(null);
                  setDigitalInsuranceError(null);
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guard Cash Insurance Modal - الحارس يسجل المبلغ المستلم كاش ويرسل إشعار للإدارة والمسوقة */}
      {guardCashModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    استلام التأمين كاش من العميل
                  </h3>
                  <span className="text-xs text-amber-700 font-bold">
                    إثبات وتوثيق الاستلام وإشعار الإدارة والمسوقة فوراً
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuardCashModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-bold text-slate-900">{guardCashModalBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العقار / الشاليه:</span>
                <span className="font-bold text-purple-900">{guardCashModalBooking.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المسوقة المسؤولة:</span>
                <span className="font-bold text-slate-800">{guardCashModalBooking.marketerName || 'المسوقة'}</span>
              </div>
            </div>

            {/* Amount input: كتابة المبلغ المستلم من العميل */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                المبلغ المستلم كاش من العميل (ر.س): <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={guardCashReceivedAmount || ''}
                  onChange={(e) => setGuardCashReceivedAmount(Number(e.target.value))}
                  className="w-full p-3 text-sm font-bold font-mono bg-slate-50 border border-amber-300 focus:border-amber-600 rounded-xl outline-none text-slate-900"
                  placeholder="أدخل المبلغ المستلم نقداً"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">ريال سعودي</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                المبلغ المحدد في العقد: {guardCashModalBooking.insuranceAmount} ر.س
              </span>
            </div>

            {/* Optional notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                ملاحظات الاستلام (اختياري):
              </label>
              <input
                type="text"
                value={guardCashNotes}
                onChange={(e) => setGuardCashNotes(e.target.value)}
                placeholder="مثال: تم الاستلام نقداً عند بوابة الدخول"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-slate-900"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  confirmCashInsuranceByGuard({
                    bookingId: guardCashModalBooking.id,
                    receivedAmount: guardCashReceivedAmount || guardCashModalBooking.insuranceAmount,
                    notes: guardCashNotes,
                  });
                  showToast(`تم تأكيد استلام التأمين كاش (${guardCashReceivedAmount} ر.س) وإرسال إشعار للإدارة والمسوقة بنجاح ✓`);
                  setGuardCashModalBooking(null);
                }}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 btn-beam-shine transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد استلام التأمين كاش وإشعار الإدارة والمسوقة</span>
              </button>
              <button
                type="button"
                onClick={() => setGuardCashModalBooking(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marketer Cash Insurance Alert Modal - إشعار للحارس مع كتابة مبلغ التأمين للحارس */}
      {marketerCashAlertBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <Bell className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    دفع التأمين كاش • إشعار للحارس
                  </h3>
                  <span className="text-xs text-amber-700 font-bold">
                    إرسال إشعار عاجل للحارس مع كتابة مبلغ التأمين للتحصيل
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMarketerCashAlertBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-bold text-slate-900">{marketerCashAlertBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العقار:</span>
                <span className="font-bold text-purple-900">{marketerCashAlertBooking.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حارس العقار المستلم:</span>
                <span className="font-bold text-emerald-800">{guard?.name || 'حارس الاستراحة'} ({guard?.phone || ''})</span>
              </div>
            </div>

            {/* Amount input to guard */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                مبلغ التأمين المطلوب تحصيله كاش للحارس (ر.س): <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={marketerCashAlertAmount || ''}
                  onChange={(e) => setMarketerCashAlertAmount(Number(e.target.value))}
                  className="w-full p-3 text-sm font-bold font-mono bg-slate-50 border border-amber-300 focus:border-amber-600 rounded-xl outline-none text-slate-900"
                  placeholder="مبلغ التأمين"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">ريال سعودي</span>
              </div>
            </div>

            {/* Notes to guard */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                توجيه أو ملاحظة للحارس (اختياري):
              </label>
              <input
                type="text"
                value={marketerCashAlertNotes}
                onChange={(e) => setMarketerCashAlertNotes(e.target.value)}
                placeholder="مثال: يرجى التوجه للعميل عند البوابة واستلام التأمين"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-slate-900"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  notifyGuardForCashInsurance({
                    bookingId: marketerCashAlertBooking.id,
                    insuranceAmount: marketerCashAlertAmount,
                    notes: marketerCashAlertNotes,
                  });
                  showToast(`تم إرسال إشعار للحارس (${guard?.name || 'الحارس'}) باستلام التأمين كاش (${marketerCashAlertAmount} ر.س) بنجاح ✓`);
                  setMarketerCashAlertBooking(null);
                }}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 btn-beam-shine transition-all"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الإشعار للحارس بمبلغ التأمين</span>
              </button>
              <button
                type="button"
                onClick={() => setMarketerCashAlertBooking(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Modal تذكير الحجز والترحيب بالعميل (الأيقونة الأولى) */}
      {welcomeReminderBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                  <MessageCircle className="w-5 h-5 text-purple-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    تذكير الحجز والترحيب بالعميل
                  </h3>
                  <span className="text-xs text-purple-700 font-bold">
                    إرسال ترحيب وموعد الدخول والمتبقي والتأمين عبر واتساب
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWelcomeReminderBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Pill Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">العميل</span>
                <span className="font-bold text-slate-900 truncate block">{welcomeReminderBooking.customerName}</span>
              </div>
              <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-[10px] text-purple-600 block font-medium">العقار</span>
                <span className="font-bold text-purple-950 truncate block">{welcomeReminderBooking.propertyName}</span>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] text-amber-600 block font-medium">المتبقي</span>
                <span className="font-bold font-mono text-amber-900 block">{welcomeReminderBooking.remainingAmount} ر.س</span>
              </div>
              <div className="p-2 bg-sky-50 border border-sky-200 rounded-xl">
                <span className="text-[10px] text-sky-600 block font-medium">التأمين</span>
                <span className="font-bold font-mono text-sky-900 block">{welcomeReminderBooking.insuranceAmount} ر.س</span>
              </div>
            </div>

            {/* Textarea for WhatsApp Greeting Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800">
                  نص رسالة الترحيب والتذكير (يمكنك التعديل قبل الإرسال):
                </label>
                <span className="text-[11px] text-slate-400">على نفس الحساب المعتمد</span>
              </div>
              <textarea
                rows={7}
                value={welcomeReminderCustomText}
                onChange={(e) => setWelcomeReminderCustomText(e.target.value)}
                className="w-full p-3 text-xs leading-relaxed bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-2xl outline-none text-slate-900 resize-none font-sans"
              />
            </div>

            {/* Actions: Send via WhatsApp API + Copy text */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  let clean = welcomeReminderBooking.customerPhone.replace(/[^0-9]/g, '');
                  if (clean.startsWith('0')) clean = '966' + clean.substring(1);
                  else if (!clean.startsWith('966')) clean = '966' + clean;
                  window.open(`https://wa.me/${clean}?text=${encodeURIComponent(welcomeReminderCustomText)}`, '_blank');
                  showToast('تم فتح واتساب لإرسال رسالة الترحيب للعميل بنجاح ✓');
                  setWelcomeReminderBooking(null);
                }}
                className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>إرسال مباشر عبر WhatsApp API</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  copyTextToClipboard(welcomeReminderCustomText, () => {
                    setCopiedWelcome(true);
                    setTimeout(() => setCopiedWelcome(false), 2500);
                  });
                }}
                className="w-full sm:w-auto px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedWelcome ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedWelcome ? 'تم النسخ ✓' : 'نسخ النص'}</span>
              </button>

              <button
                type="button"
                onClick={() => setWelcomeReminderBooking(null)}
                className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal سداد وتحصيل المتبقي (الأيقونة الثانية) */}
      {remainingPaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <DollarSign className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    سداد المتبقي ({remainingPaymentBooking.remainingAmount} ر.س)
                  </h3>
                  <span className="text-xs text-amber-700 font-bold">
                    إيصال بنكي للإدارة أو تسليم كاش للحارس مع التنبيه والنسخ
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRemainingPaymentBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Booking Info Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-bold text-slate-900">{remainingPaymentBooking.customerName} ({remainingPaymentBooking.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العقار:</span>
                <span className="font-bold text-purple-950">{remainingPaymentBooking.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المبلغ المتبقي المطلوب:</span>
                <span className="font-black font-mono text-amber-900 text-sm">{remainingPaymentBooking.remainingAmount} ر.س</span>
              </div>
            </div>

            {/* Tab Selector: خياران (دفع إيصال بنكي / تسليم كاش للحارس) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setRemainingPaymentTab('receipt')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  remainingPaymentTab === 'receipt'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>دفع إيصال بنكي</span>
              </button>
              <button
                type="button"
                onClick={() => setRemainingPaymentTab('cash')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  remainingPaymentTab === 'cash'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>تسليم كاش للحارس</span>
              </button>
            </div>

            {/* Tab 1 Content: رفع صورة الإيصال وإرسالها فوراً إلى «تنبيهات الإدارة» */}
            {remainingPaymentTab === 'receipt' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
                  💡 سيتم رفع صورة إيصال السداد البنكي وإرسال إشعار فوري إلى <strong>«تنبيهات الإدارة»</strong> لمراجعته وحفظه وتأكيد استلام المبلغ بالنظام.
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    صورة إيصال التحويل البنكي للمتبقي: <span className="text-rose-600">*</span>
                  </label>
                  <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-purple-50/30 hover:bg-purple-50/60 transition-colors">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleRemainingReceiptFileChange(e.target.files?.[0])}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-purple-600" />
                    <span className="text-xs font-bold text-purple-950">
                      {remainingPaymentReceiptFile ? remainingPaymentReceiptFile.name : 'انقر لرفع صورة إيصال السداد'}
                    </span>
                    <span className="text-[10px] text-slate-500">JPG, PNG, PDF بحد أقصى 4MB</span>
                  </label>
                  {remainingPaymentFileError && (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {remainingPaymentFileError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ملاحظات أو رقم العملية البنكية (اختياري):
                  </label>
                  <input
                    type="text"
                    value={remainingPaymentNotes}
                    onChange={(e) => setRemainingPaymentNotes(e.target.value)}
                    placeholder="مثال: تحويل سريع من بنك الراجحي"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={submitRemainingReceiptToAdmin}
                    className="flex-1 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>إرسال الإيصال إلى تنبيهات الإدارة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemainingPaymentBooking(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2 Content: تسليم كاش للحارس (إشعار فوري للوحة الحارس + زر إرسال الإشعار + زر نسخ النص للمراسلة) */}
            {remainingPaymentTab === 'cash' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
                  🔔 سيصل إشعار فوري إلى لوحة تحكم الحارس (<strong>{guardsList?.find((g) => g.assignedPropertyId === remainingPaymentBooking.propertyId)?.name || guard?.name || 'أبو راشد'}</strong>) لتحصيل المبلغ المتبقي كاش وقدره (<strong>{remainingPaymentBooking.remainingAmount} ر.س</strong>).
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    نص التوجيه والإشعار للحارس (للمراسلة والتطبيق):
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                    {getRemainingCashGuardText(remainingPaymentBooking)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    إضافة ملاحظة خاصة للحارس (اختياري):
                  </label>
                  <input
                    type="text"
                    value={remainingPaymentNotes}
                    onChange={(e) => setRemainingPaymentNotes(e.target.value)}
                    placeholder="مثال: يرجى استلام المبلغ فور وصول النزيل"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-600 text-slate-900"
                  />
                </div>

                {/* Buttons: إرسال الإشعار + نسخ النص للمراسلة عبر الواتساب والتطبيق + إرسال واتساب مباشر للحارس */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={submitRemainingCashToGuard}
                      className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال الإشعار للوحة الحارس</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = getRemainingCashGuardText(remainingPaymentBooking);
                        copyTextToClipboard(text, () => {
                          setCopiedRemainingCash(true);
                          setTimeout(() => setCopiedRemainingCash(false), 2500);
                        });
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      title="نسخ النص للمراسلة عبر الواتساب والتطبيق"
                    >
                      {copiedRemainingCash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedRemainingCash ? 'تم النسخ ✓' : 'نسخ النص'}</span>
                    </button>
                  </div>

                  {/* واتساب مباشر للحارس */}
                  <button
                    type="button"
                    onClick={() => {
                      const propGuard = guardsList?.find((g) => g.assignedPropertyId === remainingPaymentBooking.propertyId) || guard;
                      let phone = (propGuard?.phone || '0598881234').replace(/[^0-9]/g, '');
                      if (phone.startsWith('0')) phone = '966' + phone.substring(1);
                      else if (!phone.startsWith('966')) phone = '966' + phone;
                      const text = getRemainingCashGuardText(remainingPaymentBooking);
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-sky-700" />
                    <span>مراسلة الحارس مباشرة عبر واتساب</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Modal التأمين (الأيقونة الثالثة: إيصال بنكي للإدارة أو تسليم كاش للحارس مع التنبيه والنسخ) */}
      {insuranceActionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-sky-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5 text-sky-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    إدارة وتوثيق التأمين ({insuranceActionBooking.insuranceAmount} ر.س)
                  </h3>
                  <span className="text-xs text-sky-700 font-bold">
                    إيصال بنكي للإدارة أو تسليم كاش للحارس مع التنبيه والنسخ
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInsuranceActionBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Booking Info Banner */}
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-bold text-slate-900">{insuranceActionBooking.customerName} ({insuranceActionBooking.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العقار:</span>
                <span className="font-bold text-purple-950">{insuranceActionBooking.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">مبلغ التأمين المستحق:</span>
                <span className="font-black font-mono text-sky-900 text-sm">{insuranceActionBooking.insuranceAmount} ر.س</span>
              </div>
            </div>

            {/* Tab Selector: خياران (دفع إيصال بنكي للإدارة / تسليم كاش للحارس) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setInsuranceActionTab('receipt')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  insuranceActionTab === 'receipt'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>إيصال بنكي للإدارة</span>
              </button>
              <button
                type="button"
                onClick={() => setInsuranceActionTab('cash')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  insuranceActionTab === 'cash'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>تسليم كاش للحارس</span>
              </button>
            </div>

            {/* Tab 1 Content: دفع إيصال بنكي للإدارة */}
            {insuranceActionTab === 'receipt' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
                  💡 إرفاق صورة إيصال تحويل التأمين البنكي وإرسالها إلى <strong>«تنبيهات الإدارة»</strong> لمراجعتها وحفظها ضمن سجلات التأمين المعتمدة.
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    صورة إيصال تحويل التأمين: <span className="text-rose-600">*</span>
                  </label>
                  <label className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-sky-50/30 hover:bg-sky-50/60 transition-colors">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleInsuranceActionReceiptChange(e.target.files?.[0])}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-sky-600" />
                    <span className="text-xs font-bold text-sky-950">
                      {insuranceActionReceiptFile ? insuranceActionReceiptFile.name : 'انقر لرفع صورة إيصال التأمين البنكي'}
                    </span>
                    <span className="text-[10px] text-slate-500">JPG, PNG, PDF بحد أقصى 4MB</span>
                  </label>
                  {insuranceActionFileError && (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {insuranceActionFileError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ملاحظات أو رقم العملية البنكية (اختياري):
                  </label>
                  <input
                    type="text"
                    value={insuranceActionNotes}
                    onChange={(e) => setInsuranceActionNotes(e.target.value)}
                    placeholder="مثال: حوالة تأمين من حساب العميل"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={submitInsuranceReceiptToAdmin}
                    className="flex-1 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>إرسال إيصال التأمين إلى تنبيهات الإدارة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsuranceActionBooking(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2 Content: تسليم كاش للحارس (إشعار فوري للوحة الحارس + زر إرسال الإشعار + زر نسخ النص للمراسلة) */}
            {insuranceActionTab === 'cash' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
                  🔔 سيصل إشعار فوري للوحة تحكم الحارس (<strong>{guardsList?.find((g) => g.assignedPropertyId === insuranceActionBooking.propertyId)?.name || guard?.name || 'أبو راشد'}</strong>) لتحصيل مبلغ التأمين كاش.
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    مبلغ التأمين المطلوب استلامه كاش (ر.س):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={insuranceActionCashAmount || ''}
                    onChange={(e) => setInsuranceActionCashAmount(Number(e.target.value))}
                    className="w-full p-2.5 text-sm font-bold font-mono bg-slate-50 border border-amber-300 focus:border-amber-600 rounded-xl outline-none text-slate-900"
                    placeholder="مبلغ التأمين كاش"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    نص التوجيه والإشعار للحارس (للمراسلة والتطبيق):
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                    {getInsuranceCashGuardText(insuranceActionBooking)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ملاحظات إضافية للحارس (اختياري):
                  </label>
                  <input
                    type="text"
                    value={insuranceActionNotes}
                    onChange={(e) => setInsuranceActionNotes(e.target.value)}
                    placeholder="مثال: يرجى تسليم العميل سند قبض كاش عند البوابة"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-600 text-slate-900"
                  />
                </div>

                {/* Buttons: إرسال الإشعار + نسخ النص للمراسلة عبر الواتساب والتطبيق + واتساب مباشر للحارس */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={submitInsuranceCashToGuard}
                      className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال الإشعار للوحة الحارس</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = getInsuranceCashGuardText(insuranceActionBooking);
                        copyTextToClipboard(text, () => {
                          setCopiedInsuranceCash(true);
                          setTimeout(() => setCopiedInsuranceCash(false), 2500);
                        });
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      title="نسخ النص للمراسلة عبر الواتساب والتطبيق"
                    >
                      {copiedInsuranceCash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedInsuranceCash ? 'تم النسخ ✓' : 'نسخ النص'}</span>
                    </button>
                  </div>

                  {/* واتساب مباشر للحارس */}
                  <button
                    type="button"
                    onClick={() => {
                      const propGuard = guardsList?.find((g) => g.assignedPropertyId === insuranceActionBooking.propertyId) || guard;
                      let phone = (propGuard?.phone || '0598881234').replace(/[^0-9]/g, '');
                      if (phone.startsWith('0')) phone = '966' + phone.substring(1);
                      else if (!phone.startsWith('966')) phone = '966' + phone;
                      const text = getInsuranceCashGuardText(insuranceActionBooking);
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-sky-700" />
                    <span>مراسلة الحارس مباشرة عبر واتساب</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Modal استرداد المحول (تأمين الحجز المسترد) */}
      {refundModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                  <RotateCcw className="w-5 h-5 text-purple-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    استرداد المحول • تأمين الحجز
                  </h3>
                  <span className="text-xs text-purple-700 font-bold">
                    تفاصيل التأمين الكاملة وخيارات الاسترداد (تحويل بنكي / كاش من الحارس)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundModalBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* تفاصيل التأمين الكاملة */}
            <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/60 border border-purple-200/90 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <div>
                  <span className="font-black text-slate-900 text-sm block">{refundModalBooking.propertyName}</span>
                  <span className="text-purple-700 font-mono text-[11px]">حجز #{refundModalBooking.bookingNumber}</span>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 block text-[10px]">العميل المستفيد</span>
                  <span className="font-bold text-slate-900">{refundModalBooking.customerName}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                <div className="p-2 bg-white/80 rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">التأمين المسجل</span>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{refundModalBooking.insuranceAmount} ر.س</span>
                </div>
                <div className="p-2 bg-white/80 rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-[10px] text-rose-500 block">خصم التلفيات</span>
                  <span className="font-mono font-bold text-rose-700 text-xs sm:text-sm">{refundModalBooking.insuranceDeductionAmount || 0} ر.س</span>
                </div>
                <div className="p-2 bg-purple-100/80 rounded-xl border border-purple-200 shadow-2xs">
                  <span className="text-[10px] text-purple-900 block font-bold">الصافي المسترد</span>
                  <span className="font-mono font-black text-purple-950 text-xs sm:text-sm">
                    {Math.max(0, refundModalBooking.insuranceAmount - (refundModalBooking.insuranceDeductionAmount || 0))} ر.س
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white/60 p-2 rounded-xl">
                <span>طريقة استلام التأمين الأصلية:</span>
                <span className="font-bold text-purple-900">
                  {refundModalBooking.insurancePaymentMethod === 'cash' || refundModalBooking.insuranceReceivedCash
                    ? '💵 مستلم كاش عند الدخول'
                    : '🏦 تحويل بنكي رقمي'}
                </span>
              </div>
            </div>

            {/* الخياران الرئيسيان لاسترداد المبلغ (Tabs) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setRefundMethod('bank')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  refundMethod === 'bank'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>1. تحويل بنكي</span>
              </button>
              <button
                type="button"
                onClick={() => setRefundMethod('cash')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  refundMethod === 'cash'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>2. يسلم كاش من الحارس</span>
              </button>
            </div>

            {/* الخيار الأول: تحويل بنكي (رفع صورة الحساب + إرسال تنبيه فوري للإدارة + حفظ الصورة بالنظام) */}
            {refundMethod === 'bank' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 leading-relaxed">
                  💡 عند الضغط على <strong>"رفع صورة الحساب"</strong>، يتم حفظ صورة الحساب البنكي أو الآيبان في النظام للمراجعة والاسترجاع، مع إرسال <strong>تنبيه فوري للإدارة</strong> لتحويل التأمين للعميل.
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    رفع صورة الحساب البنكي أو الآيبان: <span className="text-rose-600">*</span>
                  </label>
                  <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-purple-50/30 hover:bg-purple-50/60 transition-colors">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleRefundBankImageChange(e.target.files?.[0])}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-purple-600" />
                    <span className="text-xs font-bold text-purple-950">
                      {refundBankImageFile ? refundBankImageFile.name : 'انقر لرفع صورة بطاقة الحساب أو الآيبان'}
                    </span>
                    <span className="text-[10px] text-slate-500">JPG, PNG, PDF بحد أقصى 5MB</span>
                  </label>
                  {refundBankImageError && (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {refundBankImageError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    رقم الآيبان (IBAN) أو اسم البنك (اختياري):
                  </label>
                  <input
                    type="text"
                    value={refundCustomerIban}
                    onChange={(e) => setRefundCustomerIban(e.target.value)}
                    placeholder="SA0000000000000000000000"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ملاحظات للإدارة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    placeholder="مثال: يرجى تحويل التأمين لحساب العميل المرفق"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-600 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={submitRefundBankToAdmin}
                    className="flex-1 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ صورة الحساب وإرسال تنبيه فوري للإدارة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundModalBooking(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* الخيار الثاني: يسلم كاش من الحارس (مراسلة الحارس واتس + بالنظام) */}
            {refundMethod === 'cash' && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
                  🔔 خيار تسليم التأمين نقداً عن طريق الحارس (<strong>{guardsList?.find((g) => g.assignedPropertyId === refundModalBooking.propertyId)?.name || guard?.name || 'أبو راشد'}</strong>)، مع إرسال إشعار بالنظام وتفعيل المراسلة المباشرة عبر واتساب.
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    نص التوجيه للحارس (لتسليم المبلغ كاش للنزيل):
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                    {getGuardCashRefundText(refundModalBooking)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ملاحظة إضافية للحارس (اختياري):
                  </label>
                  <input
                    type="text"
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    placeholder="مثال: يرجى تسليم المبلغ بعد استلام المفتاح والتأكد من النظافة"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-600 text-slate-900"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={submitRefundCashToGuard}
                      className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال التنبيه للحارس بالنظام</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = getGuardCashRefundText(refundModalBooking);
                        copyTextToClipboard(text, () => {
                          setCopiedGuardCashRefund(true);
                          setTimeout(() => setCopiedGuardCashRefund(false), 2500);
                        });
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      title="نسخ النص للمراسلة عبر الواتساب والتطبيق"
                    >
                      {copiedGuardCashRefund ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedGuardCashRefund ? 'تم النسخ ✓' : 'نسخ النص'}</span>
                    </button>
                  </div>

                  {/* مراسلة الحارس مباشرة عبر واتساب */}
                  <button
                    type="button"
                    onClick={() => {
                      const propGuard = guardsList?.find((g) => g.assignedPropertyId === refundModalBooking.propertyId) || guard;
                      let phone = (propGuard?.phone || '0598881234').replace(/[^0-9]/g, '');
                      if (phone.startsWith('0')) phone = '966' + phone.substring(1);
                      else if (!phone.startsWith('966')) phone = '966' + phone;
                      const text = getGuardCashRefundText(refundModalBooking);
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-sky-700" />
                    <span>مراسلة الحارس مباشرة عبر واتساب لتسليم التأمين كاش</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Modal إنهاء الحجز مع خيار رفع إيصال التأمين */}
      {finishBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Tajawal',sans-serif]" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    إنهاء الحجز وتوثيق التأمين
                  </h3>
                  <span className="text-xs text-emerald-700 font-bold">
                    إغلاق دورة الحجز وإرسال الإيصال للمسوقة والإدارة فوراً
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFinishBookingModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-bold text-slate-900">{finishBookingModal.customerName} ({finishBookingModal.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العقار:</span>
                <span className="font-bold text-purple-950">{finishBookingModal.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المسوقة المسؤولة:</span>
                <span className="font-bold text-emerald-900">{finishBookingModal.marketerName || 'المسوقة'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">مبلغ التأمين المسترد:</span>
                <span className="font-black font-mono text-emerald-900 text-sm">
                  {Math.max(0, finishBookingModal.insuranceAmount - (finishBookingModal.insuranceDeductionAmount || 0))} ر.س
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 bg-white/70 p-2 rounded-xl mt-1 border border-emerald-100">
                ✓ <strong>ملاحظة هامة:</strong> يتيح النظام إنهاء الحجز وإغلاق المعاملة سواء كان التأمين بنكياً أو تم تسليمه بنظام الكاش عبر الحارس.
              </div>
            </div>

            {/* خيار رفع إيصال التأمين */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                رفع إيصال التأمين المسترد (اختياري للكاش / مطلوب للبنك):
              </label>
              <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFinishReceiptChange(e.target.files?.[0])}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-950">
                  {finishReceiptFile ? finishReceiptFile.name : 'انقر لرفع صورة إيصال تحويل التأمين المسترد'}
                </span>
                <span className="text-[10px] text-slate-500">JPG, PNG, PDF بحد أقصى 5MB (يصل فوراً للمسوقة مع إمكانية حفظه)</span>
              </label>
              {finishFileError && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {finishFileError}
                </p>
              )}
            </div>

            {/* ملاحظات الإنهاء */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                ملاحظات إنهاء الحجز (اختياري):
              </label>
              <input
                type="text"
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
                placeholder="مثال: تم خروج العميل وتسليم التأمين بالكامل وإتمام النظافة"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 text-slate-900"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={submitFinishBooking}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد إنهاء الحجز وحفظ الإيصال</span>
              </button>
              <button
                type="button"
                onClick={() => setFinishBookingModal(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
