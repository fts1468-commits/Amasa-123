import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  Download,
  Phone,
  Send,
  MapPin,
  Film,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  Copy,
  Check,
  Edit2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Lock,
  Layers,
  PartyPopper,
  MessageCircle,
  Star,
  HeartHandshake,
  Utensils,
  Coffee,
  Plus,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_COORDINATORS } from '../../data/mock';
import { Coordinator, CoordinatorServiceItem, Booking, BookingStatus } from '../../types';

export const BookingsTab: React.FC = () => {
  const {
    properties,
    selectedPropertyId,
    selectedProperty,
    setSelectedPropertyId,
    bookings,
    dateOverrides,
    setDateOverridesBulk,
    requestDeposit,
    confirmBookingWithReceipt,
    isAdmin,
    userRole,
    isGuard,
    updateBookingStatus,
    currentMarketerId,
    nowTimestamp,
    canCreateContract,
    canEditDeposit,
    updateWaitingDepositAmount,
    preselectedSectionForBooking,
    setPreselectedSectionForBooking,
    coordinatorServices,
    addCoordinatorService,
    updateCoordinatorService,
    deleteCoordinatorService,
    sendCoordinatorWhatsAppNotification,
  } = useApp();

  const [commissionType, setCommissionType] = useState<'full' | 'partial'>('partial');
  const isHamranProperty =
    selectedPropertyId === 'hamran' ||
    selectedProperty.name.includes('حمران') ||
    selectedProperty.name.includes('الما') ||
    selectedProperty.name.includes('نايا');

  // Multi-select Coordinator Services
  const [selectedCoordServiceIds, setSelectedCoordServiceIds] = useState<string[]>([]);
  const toggleCoordService = (serviceId: string) => {
    setSelectedCoordServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const todayStr = useMemo(() => {
    const now = new Date(nowTimestamp || Date.now());
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [nowTimestamp]);

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return [`${y}-${m}-${d}`];
  });

  // Filter out any past dates from selectedDates automatically
  useEffect(() => {
    setSelectedDates((prev) => {
      const filtered = prev.filter((d) => d >= todayStr);
      return filtered.length > 0 ? filtered : [todayStr];
    });
  }, [todayStr]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('05');
  const [depositAmount, setDepositAmount] = useState<number>(selectedProperty.defaultDeposit || 250);

  // Edit deposit modal
  const [editDepositModalOpen, setEditDepositModalOpen] = useState(false);
  const [tempDepositValue, setTempDepositValue] = useState<number>(selectedProperty.defaultDeposit || 250);

  // Modals for Info / Photos / Location / Contract
  const [infoModalType, setInfoModalType] = useState<'info' | 'photos' | 'location' | 'contract' | null>(null);

  // Receipt upload
  const [receiptFile, setReceiptFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  // Message preview / sent modal
  const [sentMessageData, setSentMessageData] = useState<{
    title: string;
    text: string;
    whatsappUrl: string;
    phone: string;
  } | null>(null);

  // Contract confirmed popup
  const [confirmedContractData, setConfirmedContractData] = useState<{
    contractText: string;
    whatsappUrl: string;
    bookingNumber: string;
    bookingId?: string;
    coordinatorWhatsAppUrl?: string;
    coordinatorName?: string;
  } | null>(null);

  const coordinatorsList = INITIAL_COORDINATORS;

  const [calendarSize, setCalendarSize] = useState<'compact' | 'normal' | 'large'>('normal');
  const [activeSectionId, setActiveSectionId] = useState<string>(() => {
    if (preselectedSectionForBooking) return preselectedSectionForBooking;
    if (selectedProperty.sections && selectedProperty.sections.length > 0) {
      return selectedProperty.sections[0].id;
    }
    return 'all';
  });

  useEffect(() => {
    if (preselectedSectionForBooking) {
      setActiveSectionId(preselectedSectionForBooking);
      setPreselectedSectionForBooking(null);
    } else if (selectedProperty.sections && selectedProperty.sections.length > 0) {
      if (!selectedProperty.sections.some((s) => s.id === activeSectionId) && activeSectionId !== 'all') {
        setActiveSectionId(selectedProperty.sections[0].id);
      }
    } else {
      setActiveSectionId('all');
    }
  }, [selectedPropertyId, selectedProperty, preselectedSectionForBooking]);

  useEffect(() => {
    if (selectedProperty.defaultDeposit) {
      setDepositAmount(selectedProperty.defaultDeposit);
    }
  }, [selectedPropertyId, selectedProperty]);

  const activeSection = useMemo(() => {
    if (!selectedProperty.sections || selectedProperty.sections.length === 0 || activeSectionId === 'all') {
      return null;
    }
    return selectedProperty.sections.find((s) => s.id === activeSectionId) || null;
  }, [selectedProperty, activeSectionId]);

  // Guard Booking Status Management states & helpers
  const [bookingStatusSuccessMsg, setBookingStatusSuccessMsg] = useState<{ id: string; msg: string } | null>(null);

  // All bookings for current property & section
  const propertyAllBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.propertyId === selectedPropertyId &&
        (!activeSection || !b.sectionId || b.sectionId === activeSection.id)
    );
  }, [bookings, selectedPropertyId, activeSection]);

  const sortedDates = useMemo(() => [...selectedDates].sort(), [selectedDates]);

  // Bookings specifically matching the currently selected calendar dates
  const selectedDateBookings = useMemo(() => {
    if (sortedDates.length === 0) return [];
    return propertyAllBookings.filter(
      (b) => sortedDates.some((d) => d >= b.checkInDate && d < b.checkOutDate)
    );
  }, [propertyAllBookings, sortedDates]);

  const handleGuardUpdateStatus = (bookingId: string, newStatus: Booking['status'], bookingNumber: string) => {
    updateBookingStatus(bookingId, newStatus);
    const label = newStatus === 'confirmed' ? 'مؤكد' : newStatus === 'waiting_deposit' ? 'قيد الانتظار' : 'ملغي';
    setBookingStatusSuccessMsg({
      id: bookingId,
      msg: `✓ تم تحديث حالة الحجز (${bookingNumber}) إلى [${label}] بنجاح`,
    });
    setTimeout(() => {
      setBookingStatusSuccessMsg(null);
    }, 3000);
  };
  const checkInDate = sortedDates[0] || todayStr;
  const lastSelectedDate = sortedDates[sortedDates.length - 1] || checkInDate;

  const checkOutDate = useMemo(() => {
    const d = new Date(lastSelectedDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [lastSelectedDate]);

  const nightsCount = Math.max(1, selectedDates.length);

  const nightsStayPrice = useMemo(() => {
    let sum = 0;
    sortedDates.forEach((d) => {
      const ovKey = activeSection
        ? `${selectedPropertyId}_${activeSection.id}_${d}`
        : `${selectedPropertyId}_${d}`;
      const ov = dateOverrides[ovKey] || dateOverrides[`${selectedPropertyId}_${d}`];
      if (ov?.price !== undefined) {
        sum += ov.price;
      } else {
        const dateObj = new Date(d);
        const isWk = dateObj.getDay() === 4 || dateObj.getDay() === 5;
        if (activeSection) {
          sum += isWk ? activeSection.priceWeekend : activeSection.priceWeekday;
        } else {
          sum += isWk ? selectedProperty.basePriceWeekend : selectedProperty.basePriceWeekday;
        }
      }
    });
    return sum;
  }, [sortedDates, dateOverrides, selectedPropertyId, selectedProperty, activeSection]);

  // Breakfast pricing state (الافطار في السعر اساسا من مبلغ الحجز ويتم خصم السعر اذا بدون افطار)
  const isBreakfastAvailableForProperty = selectedProperty.breakfastPricing
    ? selectedProperty.breakfastPricing.enabled !== false
    : true;

  const [withoutBreakfast, setWithoutBreakfast] = useState(false);

  useEffect(() => {
    if (!isBreakfastAvailableForProperty) {
      setWithoutBreakfast(false);
    }
  }, [isBreakfastAvailableForProperty, selectedPropertyId]);

  const defaultBreakfastPricePerDay = useMemo(() => {
    if (!isBreakfastAvailableForProperty) return 0;
    if (selectedProperty.breakfastPricing) {
      return selectedProperty.breakfastPricing.weekday;
    }
    return selectedProperty.defaultBreakfastPrice !== undefined ? selectedProperty.defaultBreakfastPrice : 150;
  }, [isBreakfastAvailableForProperty, selectedProperty.breakfastPricing, selectedProperty.defaultBreakfastPrice]);

  const breakfastDiscount = useMemo(() => {
    if (!isBreakfastAvailableForProperty || !withoutBreakfast) return 0;
    let sum = 0;
    sortedDates.forEach((d) => {
      const ovKey = activeSection
        ? `${selectedPropertyId}_${activeSection.id}_${d}`
        : `${selectedPropertyId}_${d}`;
      const ov = dateOverrides[ovKey] || dateOverrides[`${selectedPropertyId}_${d}`];
      if (ov?.breakfastPrice !== undefined) {
        sum += ov.breakfastPrice;
      } else {
        const dateObj = new Date(d);
        const isWk = dateObj.getDay() === 4 || dateObj.getDay() === 5;
        if (selectedProperty.breakfastPricing) {
          sum += isWk ? selectedProperty.breakfastPricing.weekend : selectedProperty.breakfastPricing.weekday;
        } else {
          sum += defaultBreakfastPricePerDay;
        }
      }
    });
    return sum;
  }, [isBreakfastAvailableForProperty, withoutBreakfast, sortedDates, activeSection, selectedPropertyId, dateOverrides, selectedProperty.breakfastPricing, defaultBreakfastPricePerDay]);

  // Coordinator multi-selection (اختيارات متعددة للخدمات)
  const selectedCoordServicesList = useMemo(() => {
    return coordinatorServices.filter((s) => selectedCoordServiceIds.includes(s.id));
  }, [coordinatorServices, selectedCoordServiceIds]);

  const coordinatorPrice = useMemo(() => {
    return selectedCoordServicesList.reduce((sum, s) => sum + s.price, 0);
  }, [selectedCoordServicesList]);

  // مجموع الحجز الإجمالي (الإفطار مشمول أساساً، ويُخصم breakfastDiscount إذا تم اختيار بدون إفطار، وتُضاف رسوم خدمات المنسقة)
  const totalPrice = useMemo(() => {
    const baseAfterDiscount = Math.max(0, nightsStayPrice - breakfastDiscount);
    return baseAfterDiscount + coordinatorPrice;
  }, [nightsStayPrice, breakfastDiscount, coordinatorPrice]);

  const remainingAmount = Math.max(0, totalPrice - depositAmount);
  const insuranceAmount = selectedProperty.insuranceAmount || 300;

  // Waiting deposit hold on checkInDate
  const currentOverride = dateOverrides[`${selectedPropertyId}_${checkInDate}`];
  const isAwaitingDeposit =
    currentOverride?.status === 'waiting_deposit' &&
    !!currentOverride.waitingDepositExpiresAt &&
    currentOverride.waitingDepositExpiresAt > nowTimestamp;

  const depositSecondsLeft =
    isAwaitingDeposit && currentOverride?.waitingDepositExpiresAt
      ? Math.max(0, Math.floor((currentOverride.waitingDepositExpiresAt - nowTimestamp) / 1000))
      : 0;

  const isPhoneValid =
    customerPhone.trim() !== '' &&
    customerPhone.trim() !== '05' &&
    customerPhone.trim().length >= 9;

  const commissionPercent =
    isAwaitingDeposit && currentOverride?.waitingCommissionRate
      ? currentOverride.waitingCommissionRate
      : commissionType === 'full'
      ? 7
      : 5;

  // احتساب عمولة المسوق يكون من سعر الليلة الموجود بالتقويم فقط (nightsStayPrice)
  const marketerCommission = Math.round(nightsStayPrice * (commissionPercent / 100));

  const monthsAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const daysAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  const daysMatrix = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const items = [];

    for (let i = 0; i < firstDay; i++) {
      items.push(null);
    }

    for (let d = 1; d <= daysCount; d++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateKey = `${year}-${monthPadded}-${dayPadded}`;
      const dayDate = new Date(year, month, d);
      const isWk = dayDate.getDay() === 4 || dayDate.getDay() === 5;
      const ovKey = activeSection
        ? `${selectedPropertyId}_${activeSection.id}_${dateKey}`
        : `${selectedPropertyId}_${dateKey}`;
      const ov = dateOverrides[ovKey] || dateOverrides[`${selectedPropertyId}_${dateKey}`];
      const basePrice = activeSection
        ? (isWk ? activeSection.priceWeekend : activeSection.priceWeekday)
        : (isWk ? selectedProperty.basePriceWeekend : selectedProperty.basePriceWeekday);
      const price = ov?.price !== undefined ? ov.price : basePrice;

      const bk = bookings.find(
        (b) =>
          b.propertyId === selectedPropertyId &&
          b.status !== 'cancelled' &&
          (!activeSection || !b.sectionId || b.sectionId === activeSection.id) &&
          dateKey >= b.checkInDate &&
          dateKey < b.checkOutDate
      );

      const isPast = dateKey < todayStr;
      const isToday = dateKey === todayStr;

      let status: 'available' | 'booked' | 'blocked' | 'waiting_deposit' = 'available';
      if (isPast) {
        status = 'blocked';
      } else if (!selectedProperty.isPublished || (activeSection && activeSection.isAvailable === false)) {
        status = 'blocked';
      } else if (bk) {
        if (bk.status === 'waiting_deposit' || bk.status === 'pending' || bk.status === 'pending_payment') {
          status = 'waiting_deposit';
        } else {
          status = 'booked';
        }
      } else if (ov?.status === 'waiting_deposit') {
        status = 'waiting_deposit';
      } else if (ov?.status === 'blocked') {
        status = 'blocked';
      }

      items.push({
        dayNum: d,
        dateKey,
        price,
        status,
        override: ov,
        booking: bk,
        isPast,
        isToday,
      });
    }

    return items;
  }, [year, month, selectedPropertyId, selectedProperty, activeSection, bookings, dateOverrides, todayStr]);

  const handleDateClick = (dateKey: string) => {
    // Strictly disable past dates: non-clickable and cannot be selected
    if (dateKey < todayStr) return;

    if (selectedDates.includes(dateKey)) {
      if (selectedDates.length > 1) {
        setSelectedDates(selectedDates.filter((d) => d !== dateKey));
      }
    } else {
      setSelectedDates([...selectedDates, dateKey].sort());
    }
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const openWhatsAppMessageModal = (text: string, title = 'إرسال عبر واتساب') => {
    const raw = customerPhone.trim();
    if (!raw || raw === '05' || raw.length < 9) {
      const url = `https://wa.me/966?text=${encodeURIComponent(text)}`;
      setSentMessageData({ title, text, whatsappUrl: url, phone: raw || '05' });
      return;
    }
    const clean = raw.replace(/\D/g, '').replace(/^0/, '966');
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    setSentMessageData({ title, text, whatsappUrl: url, phone: raw });
    try {
      window.open(url, '_blank');
    } catch {}
  };

  // Quick WhatsApp Info
  const sendQuickInfo = () => {
    const msg = `مرحباً بك أخي الكريم ${customerName || ''}،
يسرنا تزويدكم بتفاصيل ومواصفات استراحة (${selectedProperty.name}):

🏕️ *المواصفات:*
• ${selectedProperty.subtitle}
• السعة: ${selectedProperty.capacity} فرد
• غرف النوم: ${selectedProperty.bedrooms} | دورات المياه: ${selectedProperty.bathrooms}
• المساحة: ${selectedProperty.areaM2} م² | المسبح: ${selectedProperty.poolType}
• وقت الدخول: ${selectedProperty.checkInTimeText} | وقت الخروج: ${selectedProperty.checkOutTimeText}
• سعر الليلة: ${selectedProperty.basePriceWeekday} ر.س (وسط الأسبوع) / ${selectedProperty.basePriceWeekend} ر.س (الويكند)
• التأمين المسترد: ${insuranceAmount} ريال

نتشرف بخدمتكم لحجز إقامتكم السعيدة!`;
    openWhatsAppMessageModal(msg);
  };

  // Quick WhatsApp Photos & Video
  const sendQuickPhotos = () => {
    const mediaLinks = selectedProperty.images?.length
      ? selectedProperty.images
          .map(
            (img, idx) =>
              `• ${
                img.includes('youtube.com') || img.includes('youtu.be') || img.includes('.mp4')
                  ? '🎥 فيديو'
                  : '📸 صورة'
              } ${idx + 1}: ${img}`
          )
          .join('\n')
      : `• رابط الألبوم: ${selectedProperty.coverImage}`;

    const msg = `أهلاً بك أخي الكريم ${customerName || ''}،
مرفق لكم ألبوم الصور والفيديو لاستراحة (${selectedProperty.name}):

📸 *روابط الصور والتغطيات:*
${mediaLinks}

نتمنى أن تنال إعجابكم ويسعدنا استقبال استفساراتكم! 🏕️`;
    openWhatsAppMessageModal(msg, 'إرسال الوسائط عبر واتساب');
  };

  // Quick WhatsApp Location
  const sendQuickLocation = () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${selectedProperty.name} ${selectedProperty.location}`
    )}`;
    const msg = `مرحباً بك أخي الكريم ${customerName || ''}،
موقع ولوكيشن استراحة (${selectedProperty.name}):

📍 *العنوان:* ${selectedProperty.location}
🗺️ *رابط خرائط Google:*
${mapUrl}

نتمنى لكم رحلة وصول ميسرة وممتعة!`;
    openWhatsAppMessageModal(msg);
  };

  // Quick WhatsApp Full Property Data
  const sendFullPropertyData = () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${selectedProperty.name} ${selectedProperty.location}`
    )}`;
    const msg = `مرحباً بك أخي الكريم ${customerName || ''}،
تفاصيل استراحة (${selectedProperty.name}) الكاملة:

🏕️ *معلومات المكان:* ${selectedProperty.subtitle}
• السعة: ${selectedProperty.capacity} فرد | غرف النوم: ${selectedProperty.bedrooms}
• المسبح: ${selectedProperty.poolType}
• وقت الدخول: ${selectedProperty.checkInTimeText} | وقت الخروج: ${selectedProperty.checkOutTimeText}

📍 *اللوكيشن على خرائط Google:*
${mapUrl}

📸 *ألبوم الصور:* ${selectedProperty.coverImage}

💰 *الأسعار:* ${totalPrice} ر.س (${nightsCount} ليالي) | التأمين: ${insuranceAmount} ر.س
يسعدنا تأكيد حجزكم فور تحويل العربون!`;
    openWhatsAppMessageModal(msg);
  };

  // 15-Minute Deposit Request
  const handleRequestDeposit = () => {
    if (selectedDates.some((d) => d < todayStr)) {
      alert('يمنع إنشاء أو قبول أي حجز على تواريخ فائتة. يرجى اختيار تاريخ اليوم أو تواريخ قادمة.');
      return;
    }

    if (!customerPhone.trim() || customerPhone === '05' || customerPhone.length < 9) {
      alert('فضلاً أدخل رقم جوال العميل بصيغة صحيحة (مثال: 0551234567)');
      return;
    }

    const currentCoordObj = selectedCoordServicesList[0];
    const currentCoordServiceTitles = selectedCoordServicesList.length > 0
      ? selectedCoordServicesList.map((s) => s.title).join(' + ')
      : undefined;

    const currentBreakfastOption = !isBreakfastAvailableForProperty
      ? 'لا يوجد إفطار في هذا العقار (السعر صافي للإقامة)'
      : withoutBreakfast
      ? 'بدون إفطار (تم خصم القيمة)'
      : 'مشمول بالإفطار';

    const { whatsappUrl, message } = requestDeposit({
      propertyId: selectedPropertyId,
      dates: selectedDates,
      customerName: customerName.trim() || 'عميل كريم',
      customerPhone,
      depositAmount,
      totalPrice,
      nightsCount,
      marketerId: currentMarketerId,
      commissionRatePercent: commissionPercent,
      sectionName: activeSection?.name,
      breakfastOption: currentBreakfastOption,
      breakfastPrice: withoutBreakfast ? -breakfastDiscount : 0,
      coordinatorName: currentCoordObj?.coordinatorName,
      coordinatorService: currentCoordServiceTitles,
      coordinatorPrice: coordinatorPrice,
      baseNightlyTotal: nightsStayPrice,
    });

    setSentMessageData({
      title: 'طلب العربون (مهلة 15 دقيقة) عبر واتساب',
      text: message,
      whatsappUrl,
      phone: customerPhone,
    });

    window.open(whatsappUrl, '_blank');
  };

  // Receipt image processing
  const handleReceiptChange = (file?: File) => {
    setReceiptError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setReceiptError('اختر صورة للإيصال (JPG أو PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setReceiptError('تعذر قراءة الصورة، جرّب صورة أخرى.');
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => setReceiptError('تعذر فتح الصورة.');
      img.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setReceiptFile({ name: file.name, dataUrl: String(reader.result) });
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setReceiptFile({ name: file.name, dataUrl: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const isConfirmReady =
    selectedDates.length > 0 &&
    !selectedDates.some((d) => d < todayStr) &&
    customerName.trim() !== '' &&
    isPhoneValid &&
    depositAmount > 0 &&
    !!receiptFile;

  // Confirm booking with receipt
  const handleConfirmWithReceipt = () => {
    if (selectedDates.some((d) => d < todayStr)) {
      alert('يمنع إنشاء أو قبول أي حجز على تواريخ فائتة.');
      return;
    }
    if (!isConfirmReady || !receiptFile) return;

    const currentCoordObj = selectedCoordServicesList[0];
    const currentCoordServiceTitles = selectedCoordServicesList.length > 0
      ? selectedCoordServicesList.map((s) => s.title).join(' + ')
      : undefined;

    const currentBreakfastOption = !isBreakfastAvailableForProperty
      ? 'لا يوجد إفطار في هذا العقار (السعر صافي للإقامة)'
      : withoutBreakfast
      ? 'بدون إفطار (تم خصم القيمة)'
      : 'مشمول بالإفطار';

    const { booking, whatsappContractUrl, contractText } = confirmBookingWithReceipt({
      propertyId: selectedPropertyId,
      dates: selectedDates,
      customerName: customerName.trim(),
      customerPhone,
      depositPaid: depositAmount,
      totalPrice,
      remainingAmount,
      insuranceAmount,
      receiptFileName: receiptFile.name,
      receiptDataUrl: receiptFile.dataUrl,
      marketerId: currentMarketerId,
      commissionRatePercent: commissionPercent,
      sectionId: activeSection?.id,
      sectionName: activeSection?.name,
      breakfastOption: currentBreakfastOption,
      breakfastPrice: withoutBreakfast ? -breakfastDiscount : 0,
      coordinatorName: currentCoordObj?.coordinatorName,
      coordinatorService: currentCoordServiceTitles,
      coordinatorPrice: coordinatorPrice,
      baseNightlyTotal: nightsStayPrice,
    });

    const coordNotif = selectedCoordServicesList.length > 0
      ? sendCoordinatorWhatsAppNotification(booking.id)
      : null;

    setConfirmedContractData({
      contractText,
      whatsappUrl: whatsappContractUrl,
      bookingNumber: booking.bookingNumber,
      bookingId: booking.id,
      coordinatorWhatsAppUrl: coordNotif?.whatsappUrl,
      coordinatorName: coordNotif?.coordinatorName || currentCoordObj?.coordinatorName,
    });

    setReceiptFile(null);
    window.open(whatsappContractUrl, '_blank');
  };

  // Instant booking & contract creation
  const handleInstantBooking = () => {
    if (selectedDates.some((d) => d < todayStr)) {
      alert('يمنع إنشاء أو قبول أي حجز على تواريخ فائتة. يرجى اختيار تاريخ اليوم أو تواريخ قادمة.');
      return;
    }
    if (!isPhoneValid) {
      alert('فضلاً أدخل رقم جوال العميل لإرسال العقد عبر واتساب');
      return;
    }

    const currentCoordObj = selectedCoordServicesList[0];
    const currentCoordServiceTitles = selectedCoordServicesList.length > 0
      ? selectedCoordServicesList.map((s) => s.title).join(' + ')
      : undefined;

    const currentBreakfastOption = !isBreakfastAvailableForProperty
      ? 'لا يوجد إفطار في هذا العقار (السعر صافي للإقامة)'
      : withoutBreakfast
      ? 'بدون إفطار (تم خصم القيمة)'
      : 'مشمول بالإفطار';

    const { booking, whatsappContractUrl, contractText } = confirmBookingWithReceipt({
      propertyId: selectedPropertyId,
      dates: selectedDates,
      customerName: customerName.trim() || 'علي',
      customerPhone,
      depositPaid: depositAmount,
      totalPrice,
      remainingAmount,
      insuranceAmount,
      receiptFileName: 'حجز_فوري_معتمد.pdf',
      marketerId: currentMarketerId,
      commissionRatePercent: commissionPercent,
      sectionId: activeSection?.id,
      sectionName: activeSection?.name,
      breakfastOption: currentBreakfastOption,
      breakfastPrice: withoutBreakfast ? -breakfastDiscount : 0,
      coordinatorName: currentCoordObj?.coordinatorName,
      coordinatorService: currentCoordServiceTitles,
      coordinatorPrice: coordinatorPrice,
      baseNightlyTotal: nightsStayPrice,
    });

    const coordNotif = selectedCoordServicesList.length > 0
      ? sendCoordinatorWhatsAppNotification(booking.id)
      : null;

    setConfirmedContractData({
      contractText,
      whatsappUrl: whatsappContractUrl,
      bookingNumber: booking.bookingNumber,
      bookingId: booking.id,
      coordinatorWhatsAppUrl: coordNotif?.whatsappUrl,
      coordinatorName: coordNotif?.coordinatorName || currentCoordObj?.coordinatorName,
    });

    window.open(whatsappContractUrl, '_blank');
  };

  const handleBlockSelectedDays = () => {
    if (selectedDates.length === 0) return;
    setDateOverridesBulk(selectedPropertyId, selectedDates, { status: 'blocked' });
    alert(`تم إغلاق الأيام المحددة (${selectedDates.length} يوم) لعقار ${selectedProperty.name}`);
  };

  const handleDownloadCsv = () => {
    const csvContent = `الاستراحة,${selectedProperty.name}\nتاريخ الدخول,${checkInDate}\nتاريخ الخروج,${checkOutDate}\nالليالي,${nightsCount}\nالسعر,${totalPrice}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `حجز_${selectedProperty.name}.csv`;
    link.click();
  };

  return (
    <div className="pb-44 max-w-3xl mx-auto px-3 sm:px-4 pt-1 space-y-4 font-['Tajawal',sans-serif]">
      {/* Property Select Dropdown */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-purple-100/90 flex items-center justify-between">
        <div className="relative flex-1">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full bg-[#FBF9FE] border border-purple-200/80 rounded-xl py-2 px-3 pr-4 pl-9 text-xs sm:text-sm font-bold text-[#2E1045] focus:outline-hidden focus:border-purple-500 appearance-none cursor-pointer"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-bold text-purple-900 mr-3 shrink-0">الاستراحة:</span>
      </div>

      {/* Unit Selector if property has multiple units (e.g. Hamran: Alma & Naya) */}
      {selectedProperty.sections && selectedProperty.sections.length > 0 && (
        <div className="bg-[#FAF7FD] p-3 rounded-2xl border border-purple-200/90 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-700" />
            </span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-100/70 px-2 py-0.5 rounded-md">
              {selectedProperty.id === 'al-taraf' ? 'متاح للحجز: قسم النساء / كامل الترف' : `${selectedProperty.sections.length} وحدات مستقلة`}
            </span>
          </div>

          <div className={`grid gap-1.5 ${selectedProperty.id === 'al-taraf' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {selectedProperty.sections
              .filter((sec) => !(selectedProperty.id === 'al-taraf' && sec.id === 'section-2'))
              .map((sec) => {
              const isSelected = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-800 text-white border-purple-800 shadow-xs ring-1 ring-purple-600'
                      : 'bg-white text-slate-800 border-purple-200/80 hover:bg-purple-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{sec.name}</span>
                    <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 font-bold'}`}>
                      {selectedProperty.id === 'al-taraf' ? 'متاح للحجز' : 'مستقلة'}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-90 truncate mt-0.5 font-mono">
                    {sec.priceWeekday} ر.س / الليلة
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveSectionId('all')}
              className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                selectedProperty.id === 'al-taraf' ? '' : 'col-span-2 sm:col-span-1'
              } ${
                activeSectionId === 'all'
                  ? 'bg-purple-800 text-white border-purple-800 shadow-xs ring-1 ring-purple-600'
                  : 'bg-white text-slate-800 border-purple-200/80 hover:bg-purple-100/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs truncate">
                  {selectedProperty.id === 'al-taraf' ? 'كامل الترف (القسمان معاً)' : selectedProperty.id === 'hamran' ? 'كامل حمران (معاً)' : 'كامل العقار'}
                </span>
                <span className={`text-[9px] px-1 rounded ${activeSectionId === 'all' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700 font-bold'}`}>
                  شامل
                </span>
              </div>
              <span className="text-[10px] opacity-90 truncate mt-0.5 font-mono">
                {selectedProperty.basePriceWeekday} ر.س / الليلة
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Customer Contacts Bar */}
      <div className="bg-gradient-to-r from-[#FBF8FE] to-[#F3EDFB] p-3 rounded-2xl border border-purple-200/90 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-purple-950">رقم جوال العميل للواتساب:</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-sm justify-end">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="اسم العميل (اختياري)"
            dir="rtl"
            className="bg-white border border-purple-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-200 w-1/2"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            dir="ltr"
            className="bg-white border border-purple-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-purple-950 focus:outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-200 w-1/2 text-left"
          />
        </div>
      </div>

      {/* 4 Action Cards: Location, Photos, Contract, Full Data */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Card 1: Info */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button onClick={() => setInfoModalType('info')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">معلومات المكان</span>
            </button>
            <button
              onClick={sendQuickInfo}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>

          {/* Card 2: Photos */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button onClick={() => setInfoModalType('photos')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">الفيديو والصور</span>
            </button>
            <button
              onClick={sendQuickPhotos}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>

          {/* Card 3: Location */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button onClick={() => setInfoModalType('location')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">اللوكيشن</span>
            </button>
            <button
              onClick={sendQuickLocation}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>

          {/* Card 4: Contract */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button onClick={() => setInfoModalType('contract')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">استعراض العقد</span>
            </button>
            <button
              onClick={() => {
                const msg = `عقد استراحة ${selectedProperty.name}\nالعميل: ${customerName || 'عميل'}\nالشروط والأحكام:\n${selectedProperty.contractTerms.join('\n')}`;
                openWhatsAppMessageModal(msg, 'إرسال صيغة العقد عبر واتساب');
              }}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>
        </div>

        {/* Send all data at once button */}
        <div className="pt-2 border-t border-purple-100/80">
          <button
            onClick={sendFullPropertyData}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E1045] via-[#4A154B] to-[#2E1045] hover:from-[#3D145C] hover:via-[#5A1B5C] hover:to-[#3D145C] text-white border border-purple-400/40 shadow-sm hover:shadow-md text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>📲 إرسال معلومات المكان كاملة للعميل (واتساب)</span>
          </button>
        </div>
      </div>

      {/* Coordinators Card - ONLY for Hamran, Alma, and Naya in Bookings page */}
      {isHamranProperty && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border-2 border-purple-200/90 space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between pb-2.5 border-b border-purple-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
                <PartyPopper className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-[#2E1045]">المنسقات (خاص بـ حمران والما ونايا)</h3>
                  <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                    تجهيز وضيافة الشاليه
                  </span>
                </div>
                <p className="text-[11px] text-purple-700/80">
                  تنسيق الكوش، تزيين المسبح، الضيافة الملكية، وبوفيهات الحفلات لوحدتي (الما ونايا)
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100">
              {activeSection ? activeSection.name : 'حمران (الما ونايا)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {coordinatorsList.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-[#FAF8FE] border border-purple-100/90 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover border border-pink-200 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{c.specialty.slice(0, 22)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`tel:${c.phone}`}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    title="اتصال"
                  >
                    <Phone className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://wa.me/966${c.phone.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً أختي ${c.name}، لدينا حجز في شاليه حمران (${activeSection ? activeSection.name : 'الما ونايا'}) بتاريخ ${checkInDate}، ونود التنسيق للتجهيز:`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                    title="واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-4">
        {/* Calendar sizing and Month controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-purple-50">
          <div className="flex items-center gap-1.5 bg-[#F8F5FD] p-1 rounded-xl border border-purple-100 self-stretch sm:self-auto justify-center">
            <span className="text-[10px] font-bold text-purple-900 px-1.5">حجم التقويم:</span>
            <button
              type="button"
              onClick={() => setCalendarSize('compact')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarSize === 'compact' ? 'bg-purple-800 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              مدمج
            </button>
            <button
              type="button"
              onClick={() => setCalendarSize('normal')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarSize === 'normal' ? 'bg-purple-800 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              قياسي
            </button>
            <button
              type="button"
              onClick={() => setCalendarSize('large')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarSize === 'large' ? 'bg-purple-800 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              كبير ومريح
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl border border-purple-100 hover:bg-purple-50 flex items-center justify-center text-purple-900 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-[#2E1045] min-w-[120px] text-center">
              {monthsAr[month]} {year}
            </h3>

            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl border border-purple-100 hover:bg-purple-50 flex items-center justify-center text-purple-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysAr.map((d, idx) => (
            <span key={idx} className="text-xs font-bold text-purple-600/70 py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Grid Days */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysMatrix.map((item, idx) => {
            const heightCls =
              calendarSize === 'compact' ? 'h-12 sm:h-14' : calendarSize === 'large' ? 'h-20 sm:h-24' : 'h-16 sm:h-18';

            if (!item) {
              return <div key={`empty-${idx}`} className={`${heightCls} rounded-2xl bg-[#FAF8FD]/50`} />;
            }

            const { isPast, isToday } = item;
            const isSelected = selectedDates.includes(item.dateKey);
            let colorCls = 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]';

            if (isPast) {
              colorCls = 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-55 cursor-not-allowed pointer-events-none';
            } else if (item.status === 'booked') {
              colorCls = 'bg-[#FDF2F8] border-[#FBCFE8] text-[#9D174D]';
            } else if (item.status === 'waiting_deposit') {
              colorCls = 'bg-[#FEFCE8] border-[#FDE68A] text-[#854D0E]';
            } else if (item.status === 'blocked') {
              colorCls = 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]';
            }

            const todayClasses = isToday
              ? 'border-2 border-purple-400 bg-purple-50/40 font-bold'
              : '';
            const selectedClasses = isSelected
              ? 'ring-3 ring-purple-600 ring-offset-1 !bg-purple-100/80 !border-2 !border-purple-600 font-black scale-[1.02] shadow-md z-20'
              : '';

            return (
              <div
                key={item.dateKey}
                onClick={() => !isPast && handleDateClick(item.dateKey)}
                aria-disabled={isPast}
                className={`${heightCls} rounded-2xl border flex flex-col items-center justify-between py-1.5 px-0.5 transition-all select-none relative ${colorCls} ${todayClasses} ${selectedClasses} ${
                  isPast
                    ? 'cursor-not-allowed pointer-events-none'
                    : 'cursor-pointer hover:scale-102'
                }`}
              >
                <span
                  className={`leading-none ${
                    isToday
                      ? 'font-black text-slate-950 text-sm sm:text-base'
                      : isPast
                      ? 'font-medium text-slate-400 line-through decoration-slate-300'
                      : 'font-bold'
                  } ${calendarSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}
                >
                  {item.dayNum}
                </span>

                <span
                  className={`font-mono leading-none ${
                    isPast
                      ? 'text-[9px] text-slate-400 font-medium'
                      : isToday
                      ? 'text-slate-950 font-black text-xs'
                      : calendarSize === 'large'
                      ? 'text-xs font-bold'
                      : 'text-[10px]'
                  }`}
                >
                  {isPast ? (item.booking ? 'محجوز' : 'فائت') : item.status === 'blocked' ? '--' : item.price}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-around gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0]" />
            <span className="text-slate-600 font-medium">متاح</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FDF2F8] border border-[#FBCFE8]" />
            <span className="text-slate-600 font-medium">مؤكد</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FEFCE8] border border-[#FDE68A]" />
            <span className="text-slate-600 font-medium">انتظار العربون</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FFF1F2] border border-[#FECDD3]" />
            <span className="text-slate-600 font-medium">مغلق (صيانة)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#F5F3FF] border-2 border-[#7C3AED]" />
            <span className="text-purple-900 font-bold">محدد</span>
          </div>
        </div>
      </div>

      {/* بطاقة حالة الحجز في التاريخ المحدد — تحكم مباشر للحارس والإدارة */}
      {selectedDateBookings.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-white to-amber-50/60 rounded-3xl p-4 sm:p-5 shadow-xs border-2 border-purple-200/90 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-purple-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  حالة الحجز في التاريخ المحدد — تحكم مباشر للحارس
                </h4>
                <p className="text-[11px] text-slate-500">
                  يمكن للحارس والإدارة تغيير وتحديث حالة الحجز فورياً بضغطة زر وتحديث التقويم تلقائياً.
                </p>
              </div>
            </div>

            <span className="text-[10px] bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full font-bold border border-purple-200 flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-700" />
              <span>{isGuard ? 'صلاحية الحارس' : isAdmin ? 'صلاحية الإدارة' : 'إدارة الحالات'}</span>
            </span>
          </div>

          <div className="space-y-3">
            {selectedDateBookings.map((b, idx) => {
              const isConfirmed = b.status === 'confirmed';
              const isWaiting = b.status === 'waiting_deposit' || b.status === 'pending' || b.status === 'pending_payment';
              const isCancelled = b.status === 'cancelled';

              return (
                <div
                  key={`${b.id || 'sel-bk'}-${idx}`}
                  className="bg-white rounded-2xl border border-purple-100 p-3.5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-purple-50 text-purple-900 px-2.5 py-0.5 rounded-lg border border-purple-200">
                        {b.bookingNumber}
                      </span>
                      {b.sectionName && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          {b.sectionName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">الحالة الحالية:</span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isWaiting
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                        {isWaiting && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                        {isCancelled && <X className="w-3.5 h-3.5 text-rose-700" />}
                        <span>
                          {isConfirmed ? 'مؤكد' : isWaiting ? 'قيد الانتظار' : 'ملغي'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">العميل:</span>
                      <span className="font-bold text-slate-900 truncate block">{b.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الجوال:</span>
                      <a href={`tel:${b.customerPhone}`} className="font-bold text-purple-700 font-mono block hover:underline" dir="ltr">
                        {b.customerPhone}
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الفترة ({b.nightsCount} ليالي):</span>
                      <span className="font-mono text-slate-700 text-[11px] block">{b.checkInDate} ← {b.checkOutDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">الإجمالي / المتبقي:</span>
                      <span className="font-bold text-slate-900 font-mono block">{b.totalPrice} ر.س <span className="text-[10px] text-rose-600">({b.remainingAmount} متبقي)</span></span>
                    </div>
                  </div>

                  {/* 3 Direct Status Update Buttons for Guard */}
                  <div className="pt-2 border-t border-purple-100">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      تحديث حالة الحجز مباشرة بواسطة الحارس:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {/* 1. مؤكد */}
                      <button
                        type="button"
                        onClick={() => handleGuardUpdateStatus(b.id, 'confirmed', b.bookingNumber)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          isConfirmed
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 font-black'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مؤكد</span>
                      </button>

                      {/* 2. قيد الانتظار */}
                      <button
                        type="button"
                        onClick={() => handleGuardUpdateStatus(b.id, 'waiting_deposit', b.bookingNumber)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          isWaiting
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-black'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>قيد الانتظار</span>
                      </button>

                      {/* 3. ملغي */}
                      <button
                        type="button"
                        onClick={() => handleGuardUpdateStatus(b.id, 'cancelled', b.bookingNumber)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          isCancelled
                            ? 'bg-rose-600 text-white ring-2 ring-rose-400 font-black'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>ملغي</span>
                      </button>
                    </div>
                  </div>

                  {bookingStatusSuccessMsg?.id === b.id && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold text-center animate-in fade-in duration-150">
                      {bookingStatusSuccessMsg.msg}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Commission Type Selector */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-2">
        <h4 className="text-xs sm:text-sm font-bold text-[#2E1045]"> نوع الحجز</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isAwaitingDeposit}
            onClick={() => setCommissionType('full')}
            className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
              commissionPercent === 7
                ? 'bg-purple-700 border-purple-700 text-white shadow-md'
                : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50'
            }`}
          >
            حجز كلي — 7%
          </button>
          <button
            type="button"
            disabled={isAwaitingDeposit}
            onClick={() => setCommissionType('partial')}
            className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
              commissionPercent === 5
                ? 'bg-purple-700 border-purple-700 text-white shadow-md'
                : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50'
            }`}
          >
            حجز جزئي — 5%
          </button>
        </div>
      </div>

      {/* Financial Summary Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">تاريخ الدخول</span>
            <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{checkInDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">تاريخ الخروج</span>
            <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{checkOutDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">عدد الليالي</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono">{nightsCount} ليلة</span>
          </div>
          <div>
            <span className="text-[10px] text-purple-600 font-bold block mb-0.5">عمولة المسوق ({commissionPercent}%)</span>
            <span className="font-bold text-emerald-700 font-mono text-xs sm:text-sm">{marketerCommission} ر.س</span>
          </div>
        </div>

        {/* Separated Price Breakdown */}
        <div className="space-y-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-700 block mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-700 block font-medium">سعر الإقامة ({nightsCount} ليالي)</span>
                <span className="font-black text-purple-950 font-mono text-sm">{nightsStayPrice} ر.س</span>
              </div>
              <span className="text-[9px] bg-white px-2 py-0.5 rounded-md text-purple-800 font-bold border border-purple-100">أساسي</span>
            </div>

            {isBreakfastAvailableForProperty ? (
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                withoutBreakfast ? 'bg-rose-50/70 border-rose-200' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div>
                  <span className={`text-[10px] block font-medium ${withoutBreakfast ? 'text-rose-800' : 'text-amber-800'}`}>
                    وجبة الإفطار (مشمولة أساساً)
                  </span>
                  <span className={`font-black font-mono text-sm ${withoutBreakfast ? 'text-rose-700' : 'text-amber-950'}`}>
                    {withoutBreakfast ? `-${breakfastDiscount} ر.س خصم` : `${defaultBreakfastPricePerDay * nightsCount} ر.س (مشمول)`}
                  </span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                  withoutBreakfast ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {withoutBreakfast ? 'بدون إفطار' : 'مشمول بالحجز'}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] block font-medium text-slate-500">
                    وجبة الإفطار
                  </span>
                  <span className="font-bold font-mono text-xs text-slate-700">
                    غير متوفرة لهذا العقار
                  </span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-slate-200 text-slate-700">
                  إقامة فقط
                </span>
              </div>
            )}

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              selectedCoordServicesList.length > 0
                ? 'bg-pink-50/70 border-pink-200'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div>
                <span className={`text-[10px] block font-medium ${
                  selectedCoordServicesList.length > 0 ? 'text-pink-800' : 'text-slate-400'
                }`}>
                  خدمات المنسقة (متعددة)
                </span>
                <span className={`font-black font-mono text-sm ${
                  selectedCoordServicesList.length > 0 ? 'text-pink-950' : 'text-slate-400'
                }`}>
                  {selectedCoordServicesList.length > 0 ? `+${coordinatorPrice} ر.س` : 'غير مضاف'}
                </span>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                selectedCoordServicesList.length > 0
                  ? 'bg-pink-100 text-pink-900'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {selectedCoordServicesList.length > 0 ? `${selectedCoordServicesList.length} باقات` : 'اختياري'}
              </span>
            </div>
          </div>

          <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-900 via-purple-950 to-indigo-950 text-white flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200">
              المجموع الإجمالي للحجز (الإقامة {withoutBreakfast ? 'بعد خصم الإفطار' : 'شاملة الإفطار'} + خدمات المنسقة):
            </span>
            <span className="text-lg font-black font-mono text-amber-300">{totalPrice} ر.س</span>
          </div>
        </div>
      </div>

      {/* 15-Minute Countdown Warning Banner (If awaiting deposit) */}
      {isAwaitingDeposit && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-200" />
              <span className="font-bold text-sm">الحجز معلق بانتظار تحويل العربون</span>
            </div>
            <span className="bg-black/20 text-white px-3 py-1 rounded-full font-mono font-bold text-xs">
              {Math.floor(depositSecondsLeft / 60)}:{String(depositSecondsLeft % 60).padStart(2, '0')} متبقية
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <p>
                العميل: <strong>{currentOverride?.waitingCustomerName || customerName || 'قيد الانتظار'}</strong>
              </p>
              <p>
                الجوال: <span className="font-mono">{currentOverride?.waitingCustomerPhone || customerPhone}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-amber-100 text-[11px] block">العربون المطلوب:</span>
              <span className="font-bold text-base font-mono">{currentOverride?.waitingDepositAmount || depositAmount} ر.س</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-bold">
            {(canEditDeposit || isAdmin) && (
              <button
                type="button"
                onClick={() => {
                  setTempDepositValue(currentOverride?.waitingDepositAmount || depositAmount);
                  setEditDepositModalOpen(true);
                }}
                className="py-2.5 px-3 bg-white text-amber-950 rounded-xl hover:bg-amber-50 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-800" />
                <span>تعديل العربون قبل التأكيد</span>
              </button>
            )}

            {(canCreateContract || isAdmin) && (
              <button
                type="button"
                onClick={() => setInfoModalType('contract')}
                className="py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-200" />
                <span>إنشاء العقد المعتمد</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleInstantBooking}
              className="py-2.5 px-3 bg-purple-950 hover:bg-purple-900 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span>تأكيد الحجز النهائي</span>
            </button>
          </div>
        </div>
      )}

      {/* New Booking Form & Deposit Actions */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <button
            onClick={() => {
              setSelectedDates([]);
              setCustomerName('');
              setCustomerPhone('05');
            }}
            className="text-xs text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
          >
            مسح التحديد
          </button>
          <h4 className="font-bold text-[#2E1045] text-sm sm:text-base">حجز جديد</h4>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-bold block text-right">اسم العميل (اختياري)</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="ادخل الاسم (اختياري)"
            dir="rtl"
            className="w-full bg-[#FAF8FD] border border-purple-200/80 rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-bold block text-right">رقم الجوال</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            dir="ltr"
            className="w-full bg-[#FAF8FD] border border-purple-200/80 rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-mono text-left"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs flex-wrap gap-1">
            <label className="text-slate-600 font-bold block text-right flex items-center gap-1.5">
              <span>العربون المطلوب</span>
              {(canEditDeposit || isAdmin) && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ✓ مصرح لك بتعديل العربون
                </span>
              )}
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              الافتراضي: {selectedProperty.defaultDeposit || 250} ر.س
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
              disabled={!canEditDeposit && !isAdmin}
              placeholder="0"
              dir="rtl"
              className="w-full bg-[#FAF8FD] border border-purple-200/80 rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-mono font-bold"
            />
          </div>
        </div>

        {/* Breakfast Option Card - منسقة مطابقة تماماً لصورة التعديل المرفقة */}
        {isBreakfastAvailableForProperty ? (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-purple-200/90 shadow-2xs space-y-2.5 transition-all">
            <div className="flex items-center justify-between gap-3">
              {/* Right: Icon + Title */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  withoutBreakfast ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      حجز مع الإفطار
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        withoutBreakfast
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {withoutBreakfast ? `تم الخصم (-${breakfastDiscount} ر.س)` : 'مشمول أساساً'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Left: Yellow badge "اختياري" + Toggle switch */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  اختياري
                </span>
                <button
                  type="button"
                  onClick={() => setWithoutBreakfast(!withoutBreakfast)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    withoutBreakfast ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}
                  title="التبديل بين شامل الإفطار وبدون إفطار"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      withoutBreakfast ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1.5 transition-all opacity-90">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-slate-200 text-slate-600">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                      وجبة الإفطار
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-300">
                      غير متوفرة لهذا العقار
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    هذا العقار مؤجر بدون وجبة إفطار، والسعر صافي للإقامة فقط.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full shrink-0">
                إقامة فقط
              </span>
            </div>
          </div>
        )}

        {/* كرت إضافة خدمة مع الحجز - يظهر الخدمات والأسعار لاختيارها وإضافتها للحجز */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-[#FFF9FB] via-white to-[#FAF5FF] rounded-2xl border-2 border-pink-200/90 shadow-2xs space-y-2.5 text-xs">
          {/* Header Row: Title on right, Dropdown next to it */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 shadow-2xs">
                <PartyPopper className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2E1045] whitespace-nowrap">
                إضافة خدمة مع الحجز:
              </h4>
            </div>

            {/* القائمة المنسدلة منقولة بجانب العنوان */}
            <div className="relative flex-1 min-w-[220px]">
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  toggleCoordService(val);
                }}
                className="w-full appearance-none bg-white border-2 border-purple-200/90 hover:border-purple-400 focus:border-purple-600 rounded-xl py-2 pr-9 pl-8 text-xs font-bold text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-purple-200 transition-all cursor-pointer text-right"
              >
                <option value="">
                  {selectedCoordServicesList.length === 0
                    ? '▼ اضغط هنا لاختيار خدمة من القائمة المنسدلة...'
                    : '▼ اختر خدمة أخرى لإضافتها من القائمة...'}
                </option>
                {coordinatorServices.map((s) => {
                  const isSelected = selectedCoordServiceIds.includes(s.id);
                  return (
                    <option key={s.id} value={s.id} className="text-slate-900 font-medium py-1">
                      {isSelected ? '✓ [محدد] ' : '+ '}{s.title} — المنسقة: {s.coordinatorName} ({s.price} ر.س)
                    </option>
                  );
                })}
              </select>

              {/* أيقونة سهم القائمة المنسدلة على اليسار */}
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-700">
                <ChevronDown className="w-4 h-4" />
              </div>

              {/* أيقونة على اليمين */}
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pink-600">
                <PartyPopper className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* البطاقات الشريطية للخدمات المختارة من القائمة المنسدلة */}
          {selectedCoordServicesList.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-purple-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-950">
                  الخدمات المختارة ({selectedCoordServicesList.length}):
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCoordServiceIds([])}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer transition-colors"
                >
                  إلغاء التحديد ({selectedCoordServicesList.length})
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCoordServicesList.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white border-2 border-purple-300 rounded-xl py-1 px-2.5 flex items-center gap-2 shadow-2xs text-xs animate-in fade-in"
                  >
                    <span className="font-bold text-slate-900">{s.title}</span>
                    <span className="text-[10px] text-slate-500 font-medium">({s.coordinatorName})</span>
                    <span className="font-mono font-black text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-lg text-xs">
                      +{s.price} ر.س
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCoordService(s.id)}
                      className="w-5 h-5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer mr-0.5"
                      title="إزالة هذه الخدمة"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تفاصيل المنسقة المعتمدة والواتساب عند اختيار أي خدمة */}
          {selectedCoordServicesList.length > 0 && (
            <div className="pt-2 border-t border-purple-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-950">
                  إجمالي خدمات التنسيق المحددة ({selectedCoordServicesList.length}):
                </span>
                <span className="font-mono font-black text-sm text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-xl border border-pink-200">
                  +{coordinatorPrice} ر.س
                </span>
              </div>

              <div className="bg-[#FAF8FD] border border-purple-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      المنسقة: {selectedCoordServicesList[0].coordinatorName}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {selectedCoordServicesList[0].coordinatorPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`https://wa.me/966${selectedCoordServicesList[0].coordinatorPhone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                      `مرحباً أختي المنسقة ${selectedCoordServicesList[0].coordinatorName}، لدينا حجز في شاليه (${selectedProperty.name}):\n- الخدمات المطلوبة: ${selectedCoordServicesList.map((s) => `${s.title} (${s.price} ر.س)`).join(' + ')}\n- مجموع خدمات التنسيق: ${coordinatorPrice} ر.س\n- العميل: ${customerName || 'عميل'}\n- التاريخ: ${checkInDate} (${nightsCount} ليلة)\nيرجى الاستعداد والتجهيز.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                    title="واتساب المنسقة"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>واتساب المنسقة</span>
                  </a>
                  <a
                    href={`tel:${selectedCoordServicesList[0].coordinatorPhone}`}
                    className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                    title="اتصال"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Itemized Financial Recap Card */}
        <div className="p-3.5 bg-gradient-to-r from-purple-50 via-slate-50 to-purple-50 rounded-2xl border border-purple-200/90 space-y-2 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-xl border border-purple-100">
              <span className="text-[10px] text-slate-400 block">سعر الإقامة ({nightsCount} ليالي)</span>
              <span className="font-bold font-mono text-purple-900">{nightsStayPrice} ر.س</span>
            </div>
            <div className={`p-2 rounded-xl border ${withoutBreakfast ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/80 border-emerald-200'}`}>
              <span className="text-[10px] text-slate-400 block">الإفطار (مشمول بالحجز)</span>
              <span className={`font-bold font-mono ${withoutBreakfast ? 'text-rose-700' : 'text-emerald-800'}`}>
                {withoutBreakfast ? `خصم: -${breakfastDiscount} ر.س` : 'مشمول بالسعر'}
              </span>
            </div>
            <div className={`p-2 rounded-xl border col-span-2 sm:col-span-1 ${selectedCoordServicesList.length > 0 ? 'bg-pink-50/80 border-pink-200' : 'bg-white border-slate-150 text-slate-400'}`}>
              <span className="text-[10px] text-slate-400 block">خدمات المنسقة ({selectedCoordServicesList.length})</span>
              <span className={`font-bold font-mono ${selectedCoordServicesList.length > 0 ? 'text-pink-800' : 'text-slate-400'}`}>
                {selectedCoordServicesList.length > 0 ? `+${coordinatorPrice} ر.س` : 'بدون منسقة'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2E1045] via-[#4A154B] to-[#2E1045] border border-purple-400/40 shadow-sm text-white flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs text-purple-200 block font-bold truncate">
                المجموع الإجمالي للحجز (الإقامة شاملة الإفطار+ خدمات المنسقة):
              </span>
              <span className="text-[11px] text-amber-200/90 font-medium block truncate">
                سعر الاقامة النهائي
              </span>
            </div>
            <span className="font-black text-amber-300 font-mono text-lg shrink-0 drop-shadow-xs">{totalPrice} ر.س</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-purple-100 text-[11px]">
            <span className="text-slate-500">
              العربون: <strong className="font-mono text-amber-700">{depositAmount} ر.س</strong> · المتبقي: <strong className="font-mono text-purple-900">{remainingAmount} ر.س</strong>
            </span>
            <span className="text-emerald-700 font-bold font-mono">
              عمولة المسوق ({commissionPercent}%): {marketerCommission} ر.س
            </span>
          </div>
        </div>

        {/* 15-Minute Deposit Request Button */}
        <button
          onClick={handleRequestDeposit}
          disabled={!isPhoneValid}
          className="btn-amber-shiny w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:animate-none"
        >
          <Clock className="w-4 h-4 text-amber-900" />
          <span>طلب العربون (مهلة 15 دقيقة)</span>
        </button>

        {!isPhoneValid && (
          <p className="text-[10px] text-center text-slate-500 -mt-1">
            أدخل رقم جوال العميل لتفعيل زر طلب العربون
          </p>
        )}

        {/* Receipt Attachment & Confirmation Section */}
        <div className="rounded-2xl border border-purple-100 bg-[#FAF8FD] p-3 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-purple-300 rounded-xl px-3 py-2.5 text-xs text-purple-900 font-bold hover:bg-purple-50/50 transition-colors">
            <Paperclip className="w-4 h-4 text-purple-700" />
            <span className="truncate">{receiptFile?.name || 'إرفاق صورة الإيصال البنكي'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleReceiptChange(e.target.files?.[0])}
            />
          </label>

          {receiptError && <p className="text-[10px] text-rose-700 font-bold">{receiptError}</p>}

          {receiptFile && (
            <div className="relative">
              <img
                src={receiptFile.dataUrl}
                alt="صورة الإيصال البنكي"
                className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-white"
              />
              <button
                type="button"
                onClick={() => setReceiptFile(null)}
                className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-rose-600 flex items-center justify-center cursor-pointer hover:bg-rose-50"
                title="حذف الصورة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleConfirmWithReceipt}
            disabled={!isConfirmReady}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد الحجز</span>
          </button>

          {!isConfirmReady && (
            <p className="text-[10px] text-center text-slate-500">
              لتفعيل الزر:{' '}
              {[
                selectedDates.length === 0 && 'اختر الأيام',
                customerName.trim() === '' && 'اسم العميل',
                !isPhoneValid && 'رقم الجوال',
                !(depositAmount > 0) && 'مبلغ العربون',
                !receiptFile && 'صورة الإيصال البنكي',
              ]
                .filter(Boolean)
                .join(' - ')}
            </p>
          )}
        </div>

        {/* Instant Booking Button */}
        <button
          onClick={handleInstantBooking}
          className="btn-mauve-shiny w-full py-4 px-4 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>حجز فوري ({nightsCount} ليلة) وإصدار العقد</span>
        </button>
      </div>

      {/* Info / Photos / Location / Contract Modal */}
      {infoModalType && (
        <div
          onClick={() => setInfoModalType(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[85vh]"
          >
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                {infoModalType === 'info' && <MapPin className="w-4 h-4 text-purple-300" />}
                {infoModalType === 'photos' && <Film className="w-4 h-4 text-purple-300" />}
                {infoModalType === 'location' && <MapPin className="w-4 h-4 text-purple-300" />}
                {infoModalType === 'contract' && <FileText className="w-4 h-4 text-purple-300" />}
                <span>
                  {infoModalType === 'info' && `معلومات استراحة ${selectedProperty.name}`}
                  {infoModalType === 'photos' && `ألبوم صور وفيديو ${selectedProperty.name}`}
                  {infoModalType === 'location' && `لوكيشن استراحة ${selectedProperty.name}`}
                  {infoModalType === 'contract' && `عقد استراحة ${selectedProperty.name}`}
                </span>
              </h4>
              <button
                onClick={() => setInfoModalType(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {infoModalType === 'info' && (
                <div className="space-y-3">
                  <p className="text-slate-700 leading-relaxed font-medium">{selectedProperty.subtitle}</p>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-slate-700">
                    <div>• السعة: <strong>{selectedProperty.capacity} فرد</strong></div>
                    <div>• غرف النوم: <strong>{selectedProperty.bedrooms}</strong></div>
                    <div>• دورات المياه: <strong>{selectedProperty.bathrooms}</strong></div>
                    <div>• المساحة: <strong>{selectedProperty.areaM2} م²</strong></div>
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      • المسبح: {selectedProperty.poolType}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-2xl text-purple-950 space-y-1">
                    <p>• وقت الدخول: {selectedProperty.checkInTimeText}</p>
                    <p>• وقت الخروج: {selectedProperty.checkOutTimeText}</p>
                    <p>• التأمين المسترد: {insuranceAmount} ريال</p>
                  </div>
                </div>
              )}

              {infoModalType === 'photos' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedProperty.images || [selectedProperty.coverImage]).map((img, idx) => (
                      <div key={idx} className="h-28 rounded-2xl overflow-hidden border border-purple-100">
                        <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {infoModalType === 'location' && (
                <div className="space-y-3 text-center">
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                    <p className="font-bold text-slate-900">{selectedProperty.location}</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedProperty.name} ${selectedProperty.location}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs shadow-md"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>فتح الموقع مباشرة على خرائط Google</span>
                  </a>
                </div>
              )}

              {infoModalType === 'contract' && (
                <div className="space-y-3.5">
                  <div className="bg-gradient-to-r from-[#200738] to-[#391263] text-white p-3.5 rounded-2xl flex items-center justify-between border border-purple-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-black text-amber-300 text-sm">AMASA</span>
                        <h5 className="font-bold text-xs">عقد إيجار شاليه موثق</h5>
                      </div>
                      <p className="text-[10px] text-purple-200 mt-0.5">
                        صيغة العقد المعتمدة لـ ({selectedProperty.name})
                      </p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                      موثق ومعتمد
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200 text-slate-700">
                      <div>المؤجر: <strong>إدارة AMASA</strong></div>
                      <div>المستأجر: <strong>{customerName || 'العميل الكريم'}</strong></div>
                      <div>رقم الجوال: <strong className="font-mono">{customerPhone}</strong></div>
                      <div>الفترة: <strong>{nightsCount} ليلة ({checkInDate} إلى {checkOutDate})</strong></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-purple-50/80 p-2.5 rounded-xl border border-purple-100 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">الإقامة ({nightsCount} ليالي):</span>
                        <strong className="font-mono text-purple-900">{nightsStayPrice} ر.س</strong>
                      </div>
                      <div>
                        <span className={`${withoutBreakfast ? 'text-rose-700' : 'text-amber-800'} block`}>
                          وجبة الإفطار:
                        </span>
                        <strong className={`font-mono ${withoutBreakfast ? 'text-rose-700' : 'text-amber-900'}`}>
                          {withoutBreakfast ? `-${breakfastDiscount} ر.س (مخصوم)` : `${defaultBreakfastPricePerDay * nightsCount} ر.س (مشمول)`}
                        </strong>
                      </div>
                      {selectedCoordServicesList.length > 0 && (
                        <div>
                          <span className="text-pink-800 block">خدمات المنسقة ({selectedCoordServicesList.length}):</span>
                          <strong className="font-mono text-pink-900">+{coordinatorPrice} ر.س</strong>
                        </div>
                      )}
                      <div>
                        <span className="text-purple-700 font-bold block">مجموع الحجز:</span>
                        <strong className="font-mono text-purple-950 font-black">{totalPrice} ر.س</strong>
                      </div>
                      <div>
                        <span className="text-amber-700 block">العربون:</span>
                        <strong className="font-mono text-amber-800">{depositAmount} ر.س</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">المتبقي:</span>
                        <strong className="font-mono text-emerald-800">{remainingAmount} ر.س</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className="font-bold text-[#2E1045] flex items-center justify-between">
                        <span>شروط وأحكام العقد المعتمدة:</span>
                        {(canCreateContract || isAdmin) && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            ✓ صلاحية إنشاء العقد مفعلة
                          </span>
                        )}
                      </p>
                      <div className="space-y-1 max-h-36 overflow-y-auto text-slate-700 pr-1">
                        {selectedProperty.contractTerms.map((term, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded-xl border border-slate-200/60">
                            <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{term}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setInfoModalType(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  if (infoModalType === 'info') sendQuickInfo();
                  else if (infoModalType === 'photos') sendQuickPhotos();
                  else if (infoModalType === 'location') sendQuickLocation();
                  else if (infoModalType === 'contract') {
                    let pricingText = `\n• سعر الإقامة (${nightsCount} ليلة): ${nightsStayPrice} ريال`;
                    if (withoutBreakfast) {
                      pricingText += `\n• وجبة الإفطار: تم خصم مبلغ الإفطار (-${breakfastDiscount} ريال)`;
                    } else {
                      pricingText += `\n• وجبة الإفطار: مشمولة تلقائياً في السعر الأساسي`;
                    }
                    if (selectedCoordServicesList.length > 0) {
                      const coordNames = selectedCoordServicesList.map((s) => `${s.title} (${s.coordinatorName})`).join(' + ');
                      pricingText += `\n• باقات المنسقات (${coordNames}): +${coordinatorPrice} ريال`;
                    }
                    pricingText += `\n• المجموع الإجمالي للحجز: ${totalPrice} ريال`;

                    const msg = `عقد إيجار شاليه ${selectedProperty.name} (منصة AMASA)\nالعميل: ${customerName || 'عميل'}\nالجوال: ${customerPhone}\nالفترة: من ${checkInDate} إلى ${checkOutDate} (${nightsCount} ليلة)\n${pricingText}\n• العربون: ${depositAmount} ريال | المتبقي عند الدخول: ${remainingAmount} ريال | التأمين المسترد: ${insuranceAmount} ريال\n\nالشروط والأحكام:\n${selectedProperty.contractTerms.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
                    openWhatsAppMessageModal(msg);
                  }
                  setInfoModalType(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال هذا المحتوى للعميل عبر واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Contract Modal */}
      {confirmedContractData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-l from-purple-900 to-indigo-900 p-4 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">تم اعتماد الحجز وتوليد العقد المعتمد</h4>
                <span className="text-xs text-purple-200 font-mono">{confirmedContractData.bookingNumber}</span>
              </div>
              <button
                onClick={() => setConfirmedContractData(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed select-text shadow-inner">
                {confirmedContractData.contractText}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setConfirmedContractData(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {confirmedContractData.coordinatorWhatsAppUrl && (
                  <a
                    href={confirmedContractData.coordinatorWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <PartyPopper className="w-4 h-4 text-pink-200" />
                    <span>إرسال تفاصيل الحجز للمنسقة ({confirmedContractData.coordinatorName || 'المنسقة'})</span>
                  </a>
                )}

                <a
                  href={confirmedContractData.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال العقد عبر واتساب للعميل</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Sent / Preview Modal */}
      {sentMessageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-200" />
                <h4 className="font-bold text-sm sm:text-base">{sentMessageData.title}</h4>
              </div>
              <button
                onClick={() => setSentMessageData(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between gap-2">
                <span className="font-bold text-emerald-950">رقم جوال العميل:</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    const nextPhone = e.target.value;
                    setCustomerPhone(nextPhone);
                    const clean = nextPhone.replace(/\D/g, '').replace(/^0/, '966');
                    const nextUrl = `https://wa.me/${clean}?text=${encodeURIComponent(sentMessageData.text)}`;
                    setSentMessageData({ ...sentMessageData, phone: nextPhone, whatsappUrl: nextUrl });
                  }}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="bg-white border border-emerald-300 rounded-xl px-3 py-1.5 font-mono font-bold text-emerald-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-200 w-36 text-left"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">نص الرسالة المرسلة للعميل:</span>
                <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-slate-300 text-slate-900 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-64 overflow-y-auto select-text shadow-inner">
                  {sentMessageData.text}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sentMessageData.text);
                  alert('تم نسخ نص الرسالة إلى الحافظة بنجاح');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>نسخ النص</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSentMessageData(null)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إغلاق
                </button>
                <a
                  href={sentMessageData.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSentMessageData(null)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>فتح واتساب الآن</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deposit Modal */}
      {editDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col">
            <div className="bg-gradient-to-l from-amber-600 via-amber-700 to-yellow-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-200" />
                <h4 className="font-bold text-base">تعديل مبلغ العربون قبل تأكيد الحجز</h4>
              </div>
              <button
                onClick={() => setEditDepositModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-950">
                <p className="font-bold">صلاحية الموظف لتعديل العربون:</p>
                <p className="text-[11px] text-amber-900/80 mt-0.5">
                  يمكنك تعديل وتخصيص قيمة العربون المطلوبة من العميل قبل اعتماد الحجز النهائي، وسيتم تحديث الحسابات فورياً.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">مبلغ العربون الجديد (بالريال):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tempDepositValue}
                    onChange={(e) => setTempDepositValue(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    dir="rtl"
                    className="w-full bg-[#FAF8FD] border border-amber-300 rounded-2xl py-3 px-4 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-xs pointer-events-none">
                    ر.س
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">
                  نسب مقترحة من إجمالي الحجز ({totalPrice} ر.س):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTempDepositValue(Math.round(totalPrice * 0.2))}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 text-center text-[11px] cursor-pointer"
                  >
                    20% ({Math.round(totalPrice * 0.2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempDepositValue(Math.round(totalPrice * 0.3))}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 text-center text-[11px] cursor-pointer"
                  >
                    30% ({Math.round(totalPrice * 0.3)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempDepositValue(Math.round(totalPrice * 0.5))}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 text-center text-[11px] cursor-pointer"
                  >
                    50% ({Math.round(totalPrice * 0.5)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempDepositValue(selectedProperty.defaultDeposit || 250)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-center text-[11px] cursor-pointer"
                  >
                    الافتراضي
                  </button>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 font-sans">المتبقي للتحصيل:</span>
                <span className="font-bold text-purple-900 text-sm">
                  {Math.max(0, totalPrice - tempDepositValue)} ر.س
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEditDepositModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setDepositAmount(tempDepositValue);
                  if (selectedDates.length > 0) {
                    updateWaitingDepositAmount(selectedPropertyId, selectedDates, tempDepositValue);
                  }
                  setEditDepositModalOpen(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتحديث العربون فورياً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة وتعديل وحذف خدمات التنسيق مباشرة في صفحة الحجوزات */}
    </div>
  );
};
