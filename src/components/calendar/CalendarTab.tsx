import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  SlidersHorizontal,
  Link2,
  RefreshCw,
  Copy,
  Check,
  Plus,
  Layers,
  AlertTriangle,
  Receipt,
  Wallet,
  ExternalLink,
  ShieldCheck,
  Utensils,
  Edit3,
  Save,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, SeasonalPricing, AdministrativeFees, CustomFeeItem, PropertyBreakfastPricing } from '../../types';
import { AdministrativeFeesLedgerModal } from '../more/AdministrativeFeesLedgerModal';

export const CalendarTab: React.FC = () => {
  const {
    properties,
    selectedPropertyId,
    selectedProperty,
    setSelectedPropertyId,
    bookings,
    dateOverrides,
    setDateOverridesBulk,
    applySeasonalPricingPattern,
    togglePropertyPublished,
    setActiveTab,
    setPreselectedDateForBooking,
    setPreselectedSectionForBooking,
    nowTimestamp,
    triggerBrowserNotification,
    isAdmin,
    userRole,
    updatePropertySeasonalPricing,
    updatePropertyBreakfastPrice,
    updatePropertyBreakfastPricing,
    updatePropertyAdministrativeFees,
    updatePropertySection,
    cancelBooking,
  } = useApp();

  const todayStr = useMemo(() => {
    const now = new Date(nowTimestamp || Date.now());
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [nowTimestamp]);

  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [selectMode, setSelectMode] = useState<'range' | 'multi'>('range');
  const [selectedDates, setSelectedDates] = useState<string[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return [`${y}-${m}-${d}`];
  });
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [month, setMonth] = useState<number>(() => new Date().getMonth()); // 0-indexed
  const [priceInput, setPriceInput] = useState<number>(3000);
  const [panelMode, setPanelMode] = useState<'prices' | 'seasons'>('prices');
  const [targetStatus, setTargetStatus] = useState<'available' | 'blocked'>('available');
  const [savedStatusSuccess, setSavedStatusSuccess] = useState(false);
  const [savedPriceSuccess, setSavedPriceSuccess] = useState(false);
  const [calendarSize, setCalendarSize] = useState<'compact' | 'normal' | 'large'>('normal');

  // Seasonal Pricing Editing States (إمكانية تعديل وحفظ سعر أنماط المواسم)
  const [isEditingSeasons, setIsEditingSeasons] = useState(false);
  const [seasonalInputs, setSeasonalInputs] = useState<SeasonalPricing>(() => ({
    weekday: selectedProperty.seasonalPricing?.weekday || 2500,
    weekend: selectedProperty.seasonalPricing?.weekend || 3500,
    summer: selectedProperty.seasonalPricing?.summer || 2800,
    eid: selectedProperty.seasonalPricing?.eid || 4500,
    vacation: selectedProperty.seasonalPricing?.vacation || 3200,
  }));
  const [savedSeasonsSuccess, setSavedSeasonsSuccess] = useState(false);

  useEffect(() => {
    if (selectedProperty.seasonalPricing) {
      setSeasonalInputs({
        weekday: selectedProperty.seasonalPricing.weekday,
        weekend: selectedProperty.seasonalPricing.weekend,
        summer: selectedProperty.seasonalPricing.summer,
        eid: selectedProperty.seasonalPricing.eid,
        vacation: selectedProperty.seasonalPricing.vacation,
      });
    }
  }, [selectedPropertyId, selectedProperty.seasonalPricing]);

  const handleSaveSeasonalPricing = () => {
    updatePropertySeasonalPricing(selectedPropertyId, seasonalInputs);
    setSavedSeasonsSuccess(true);
    setTimeout(() => {
      setSavedSeasonsSuccess(false);
    }, 2200);
  };

  // Breakfast Pricing & Availability Container per Property (عنصر إعدادات وتسعير الإفطار لكل عقار)
  const [breakfastInputs, setBreakfastInputs] = useState<PropertyBreakfastPricing>(() => {
    if (selectedProperty.breakfastPricing) {
      return { ...selectedProperty.breakfastPricing };
    }
    const def = selectedProperty.defaultBreakfastPrice !== undefined ? selectedProperty.defaultBreakfastPrice : 150;
    return {
      enabled: true,
      weekday: def,
      weekend: def,
      summer: def,
      eid: def + 50,
      vacation: def,
    };
  });
  const [selectedBreakfastTier, setSelectedBreakfastTier] = useState<'weekday' | 'weekend' | 'summer' | 'eid' | 'vacation'>('weekday');
  const [savedBreakfastSuccess, setSavedBreakfastSuccess] = useState(false);
  const [appliedBreakfastDatesSuccess, setAppliedBreakfastDatesSuccess] = useState(false);

  useEffect(() => {
    if (selectedProperty.breakfastPricing) {
      setBreakfastInputs({ ...selectedProperty.breakfastPricing });
    } else {
      const def = selectedProperty.defaultBreakfastPrice !== undefined ? selectedProperty.defaultBreakfastPrice : 150;
      setBreakfastInputs({
        enabled: true,
        weekday: def,
        weekend: def,
        summer: def,
        eid: def + 50,
        vacation: def,
      });
    }
  }, [selectedPropertyId, selectedProperty.breakfastPricing, selectedProperty.defaultBreakfastPrice]);

  const handleSaveBreakfastPricing = () => {
    updatePropertyBreakfastPricing(selectedPropertyId, breakfastInputs);
    setSavedBreakfastSuccess(true);
    setTimeout(() => setSavedBreakfastSuccess(false), 2200);
  };

  const activeBreakfastAmount = useMemo(() => {
    if (!breakfastInputs.enabled) return 0;
    return breakfastInputs[selectedBreakfastTier] ?? breakfastInputs.weekday;
  }, [breakfastInputs, selectedBreakfastTier]);

  const handleApplyBreakfastToDates = () => {
    if (selectedDates.length === 0) return;
    const validDates = selectedDates.filter((d) => d >= todayStr && !isDateBooked(d));
    if (validDates.length === 0) return;

    setDateOverridesBulk(selectedPropertyId, validDates, {
      breakfastPrice: breakfastInputs.enabled ? activeBreakfastAmount : 0,
    });
    setAppliedBreakfastDatesSuccess(true);
    setTimeout(() => setAppliedBreakfastDatesSuccess(false), 2200);
  };

  // Administrative Fees states (الرسوم الإدارية المقتطعة من سعر الليلة لكل عقار بشكل مستقل)
  const [adminFeesLedgerOpen, setAdminFeesLedgerOpen] = useState(false);
  const [adminFeesInputs, setAdminFeesInputs] = useState<AdministrativeFees>(() => ({
    weekday: selectedProperty.administrativeFees?.weekday ?? 50,
    weekend: selectedProperty.administrativeFees?.weekend ?? 100,
    vacation: selectedProperty.administrativeFees?.vacation ?? 150,
    eid: selectedProperty.administrativeFees?.eid ?? 200,
    summer: selectedProperty.administrativeFees?.summer ?? 100,
    customFees: selectedProperty.administrativeFees?.customFees || [],
  }));
  const [selectedFeeTier, setSelectedFeeTier] = useState<string>('weekday');
  const [customFeeNameInput, setCustomFeeNameInput] = useState('');
  const [customFeeAmountInput, setCustomFeeAmountInput] = useState<number>(50);
  const [isAddingCustomFee, setIsAddingCustomFee] = useState(false);
  const [savedAdminFeeSuccess, setSavedAdminFeeSuccess] = useState(false);
  const [appliedAdminFeeSuccess, setAppliedAdminFeeSuccess] = useState(false);

  useEffect(() => {
    setAdminFeesInputs({
      weekday: selectedProperty.administrativeFees?.weekday ?? 50,
      weekend: selectedProperty.administrativeFees?.weekend ?? 100,
      vacation: selectedProperty.administrativeFees?.vacation ?? 150,
      eid: selectedProperty.administrativeFees?.eid ?? 200,
      summer: selectedProperty.administrativeFees?.summer ?? 100,
      customFees: selectedProperty.administrativeFees?.customFees || [],
    });
  }, [selectedPropertyId, selectedProperty.administrativeFees]);

  const activeFeeAmount = useMemo(() => {
    if (selectedFeeTier === 'weekday') return adminFeesInputs.weekday;
    if (selectedFeeTier === 'weekend') return adminFeesInputs.weekend;
    if (selectedFeeTier === 'vacation') return adminFeesInputs.vacation;
    if (selectedFeeTier === 'eid') return adminFeesInputs.eid;
    if (selectedFeeTier === 'summer') return adminFeesInputs.summer;
    const foundCustom = adminFeesInputs.customFees?.find((c) => c.id === selectedFeeTier);
    if (foundCustom) return foundCustom.amount;
    return adminFeesInputs.weekday;
  }, [selectedFeeTier, adminFeesInputs]);

  // Double-booking prevention alert state
  const [blockedAlertMessage, setBlockedAlertMessage] = useState<string | null>(null);
  const blockedAlertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBlockedAlert = useCallback(
    (msg = 'اليوم محجوز ومؤكد ولا يمكن تكرار الحجز') => {
      setBlockedAlertMessage(msg);
      triggerBrowserNotification('⚠️ منع الحجز المزدوج', msg, 'system');
      if (blockedAlertTimeoutRef.current) clearTimeout(blockedAlertTimeoutRef.current);
      blockedAlertTimeoutRef.current = setTimeout(() => {
        setBlockedAlertMessage(null);
      }, 4500);
    },
    [triggerBrowserNotification]
  );

  const activeSection = useMemo(() => {
    if (!selectedProperty.sections || selectedProperty.sections.length === 0 || activeSectionId === 'all') {
      return null;
    }
    return selectedProperty.sections.find((s) => s.id === activeSectionId) || null;
  }, [selectedProperty, activeSectionId]);

  const isDateBooked = useCallback(
    (dateKey: string) => {
      const isAlTaraf = selectedPropertyId === 'al-taraf';
      return bookings.some(
        (b) =>
          b.propertyId === selectedPropertyId &&
          b.status !== 'cancelled' &&
          (isAlTaraf ? true : (!activeSection || !b.sectionId || b.sectionId === activeSection.id)) &&
          dateKey >= b.checkInDate &&
          dateKey < b.checkOutDate
      );
    },
    [bookings, selectedPropertyId, activeSection]
  );

  // Filter out any past or already booked dates from selectedDates automatically
  useEffect(() => {
    setSelectedDates((prev) => {
      const filtered = prev.filter((d) => d >= todayStr && !isDateBooked(d));
      return filtered.length > 0 ? filtered : [todayStr];
    });
  }, [todayStr, isDateBooked]);

  useEffect(() => {
    if (selectedProperty.sections && selectedProperty.sections.length > 0) {
      if (selectedProperty.id === 'al-taraf' && activeSectionId === 'section-2') {
        setActiveSectionId('section-1');
      } else {
        setActiveSectionId(selectedProperty.sections[0].id);
      }
    } else {
      setActiveSectionId('all');
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    if (activeSection) {
      setPriceInput(activeSection.priceWeekday);
    } else if (selectedProperty) {
      setPriceInput(selectedProperty.basePriceWeekday);
    }
  }, [activeSection, selectedProperty]);

  // iCal sync modal state
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [gathernIcalUrl, setGathernIcalUrl] = useState('');
  const [bookingIcalUrl, setBookingIcalUrl] = useState('');
  const [airbnbIcalUrl, setAirbnbIcalUrl] = useState('');

  const [syncStatuses, setSyncStatuses] = useState<Record<string, { gathern?: boolean; booking?: boolean; airbnb?: boolean; lastSync?: string }>>(() => {
    try {
      const saved = localStorage.getItem('property_calendar_sync_status');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'al-taraf': { gathern: true, booking: true, airbnb: false, lastSync: 'منذ 5 دقائق' },
      'al-baylasan': { gathern: true, booking: false, airbnb: false, lastSync: 'منذ 18 دقيقة' },
      rans: { gathern: false, booking: false, airbnb: false },
      alma: { gathern: true, booking: true, airbnb: false, lastSync: 'منذ ساعة' },
      naya: { gathern: false, booking: false, airbnb: false },
      hamran: { gathern: false, booking: false, airbnb: false },
    };
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleManualSync = () => {
    setSyncing(true);
    setSyncSuccessMsg(null);
    setTimeout(() => {
      setSyncing(false);
      const updated = {
        ...syncStatuses,
        [selectedPropertyId]: {
          gathern: !!gathernIcalUrl || syncStatuses[selectedPropertyId]?.gathern || true,
          booking: !!bookingIcalUrl || syncStatuses[selectedPropertyId]?.booking || true,
          airbnb: !!airbnbIcalUrl || syncStatuses[selectedPropertyId]?.airbnb || false,
          lastSync: 'الآن',
        },
      };
      setSyncStatuses(updated);
      try {
        localStorage.setItem('property_calendar_sync_status', JSON.stringify(updated));
        const urlsObj = { [selectedPropertyId]: { gathern: gathernIcalUrl, booking: bookingIcalUrl, airbnb: airbnbIcalUrl } };
        localStorage.setItem('property_calendar_sync_urls', JSON.stringify(urlsObj));
      } catch {}
      setSyncSuccessMsg('تمت مزامنة وتقييد الحجوزات مع جاذر إن وبوكينج بنجاح!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }, 1200);
  };

  const monthsAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const daysAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

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

  const daysMatrix = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const items: (null | {
      dayNum: number;
      dateKey: string;
      price: number;
      status: 'available' | 'booked' | 'blocked' | 'waiting_deposit';
      booking?: (typeof bookings)[0];
      depositRemainingSeconds: number;
      override?: (typeof dateOverrides)[string];
      isPast: boolean;
      isToday: boolean;
    })[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      items.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateKey = `${year}-${monthPadded}-${dayPadded}`;
      const dayDate = new Date(year, month, d);
      const isWeekend = dayDate.getDay() === 4 || dayDate.getDay() === 5; // Thursday & Friday
      const unitKey = activeSection
        ? `${selectedPropertyId}_${activeSection.id}_${dateKey}`
        : `${selectedPropertyId}_${dateKey}`;
      const override = dateOverrides[unitKey] || dateOverrides[`${selectedPropertyId}_${dateKey}`];
      const basePrice = activeSection
        ? (isWeekend ? activeSection.priceWeekend : activeSection.priceWeekday)
        : (isWeekend ? selectedProperty.basePriceWeekend : selectedProperty.basePriceWeekday);
      const price = override?.price !== undefined ? override.price : basePrice;

      const isAlTaraf = selectedPropertyId === 'al-taraf';
      const alTarafSectionBlocked = isAlTaraf && (
        dateOverrides[`al-taraf_section-1_${dateKey}`]?.status === 'blocked' ||
        dateOverrides[`al-taraf_section-2_${dateKey}`]?.status === 'blocked'
      );

      const matchedBooking = bookings.find(
        (b) =>
          b.propertyId === selectedPropertyId &&
          b.status !== 'cancelled' &&
          (isAlTaraf ? true : (!activeSection || !b.sectionId || b.sectionId === activeSection.id)) &&
          dateKey >= b.checkInDate &&
          dateKey < b.checkOutDate
      );

      const isPast = dateKey < todayStr;
      const isToday = dateKey === todayStr;

      let status: 'available' | 'booked' | 'blocked' | 'waiting_deposit' = 'available';
      if (isPast) {
        // Automatically disabled & closed for all past dates
        status = 'blocked';
      } else if (!selectedProperty.isPublished || (activeSection && activeSection.isAvailable === false)) {
        status = 'blocked';
      } else if (matchedBooking) {
        status = 'booked';
      } else if (override?.status === 'waiting_deposit') {
        status = 'waiting_deposit';
      } else if (override?.status === 'blocked' || alTarafSectionBlocked) {
        status = 'blocked';
      }

      let depositRemainingSeconds = 0;
      if (override?.status === 'waiting_deposit' && override.waitingDepositExpiresAt) {
        depositRemainingSeconds = Math.max(0, Math.floor((override.waitingDepositExpiresAt - nowTimestamp) / 1000));
      }

      items.push({
        dayNum: d,
        dateKey,
        price,
        status,
        booking: matchedBooking,
        depositRemainingSeconds,
        override,
        isPast,
        isToday,
      });
    }

    return items;
  }, [year, month, selectedPropertyId, selectedProperty, activeSection, bookings, dateOverrides, nowTimestamp, todayStr]);

  const handleDateClick = (dateKey: string) => {
    // Strictly disable past dates: non-clickable and cannot be selected
    if (dateKey < todayStr) {
      return;
    }

    // Strictly prevent double-booking on confirmed/booked days UNLESS user is Admin
    if (isDateBooked(dateKey) && !isAdmin) {
      showBlockedAlert('اليوم محجوز ومؤكد ولا يمكن تكرار الحجز');
      return;
    }

    if (selectMode === 'multi') {
      if (selectedDates.includes(dateKey)) {
        if (selectedDates.length > 1) {
          setSelectedDates(selectedDates.filter((d) => d !== dateKey));
        }
      } else {
        setSelectedDates([...selectedDates, dateKey].sort());
      }
    } else {
      // Range mode
      if (selectedDates.length === 0 || selectedDates.length >= 2) {
        setSelectedDates([dateKey]);
      } else {
        const start = selectedDates[0];
        if (dateKey >= start) {
          const list: string[] = [];
          const curr = new Date(start);
          const end = new Date(dateKey);
          let foundBooked = false;
          while (curr <= end) {
            const dStr = curr.toISOString().split('T')[0];
            if (isDateBooked(dStr) && !isAdmin) {
              foundBooked = true;
              break;
            }
            if (dStr >= todayStr) {
              list.push(dStr);
            }
            curr.setDate(curr.getDate() + 1);
          }
          if (foundBooked && !isAdmin) {
            showBlockedAlert('اليوم محجوز ومؤكد ولا يمكن تكرار الحجز');
            return;
          }
          setSelectedDates(list.length > 0 ? list : [dateKey]);
        } else {
          setSelectedDates([dateKey]);
        }
      }
    }
  };

  const sortedSelected = useMemo(() => [...selectedDates].sort(), [selectedDates]);
  const checkInDate = sortedSelected[0] || todayStr;
  const lastSelectedDate = sortedSelected[sortedSelected.length - 1] || checkInDate;

  const checkOutDate = useMemo(() => {
    const d = new Date(lastSelectedDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [lastSelectedDate]);

  const totalNights = Math.max(1, selectedDates.length);

  const estimatedTotal = useMemo(() => {
    let sum = 0;
    sortedSelected.forEach((d) => {
      const unitKey = activeSection
        ? `${selectedPropertyId}_${activeSection.id}_${d}`
        : `${selectedPropertyId}_${d}`;
      const ov = dateOverrides[unitKey] || dateOverrides[`${selectedPropertyId}_${d}`];
      if (ov?.price !== undefined) {
        sum += ov.price;
      } else {
        const dateObj = new Date(d);
        const isWk = dateObj.getDay() === 4 || dateObj.getDay() === 5;
        const bp = activeSection
          ? (isWk ? activeSection.priceWeekend : activeSection.priceWeekday)
          : (isWk ? selectedProperty.basePriceWeekend : selectedProperty.basePriceWeekday);
        sum += bp;
      }
    });
    return sum;
  }, [sortedSelected, dateOverrides, selectedPropertyId, selectedProperty, activeSection]);

  const estimatedCommission = Math.round(estimatedTotal * 0.05);

  const handleApplyStatus = (status: 'available' | 'blocked') => {
    const validDates = selectedDates.filter((d) => d >= todayStr);
    if (validDates.length === 0) return;

    // If reopening / setting to available by Admin, cancel conflicting booking locks for these dates
    if (status === 'available' && isAdmin) {
      bookings.forEach((b) => {
        if (
          b.propertyId === selectedPropertyId &&
          b.status !== 'cancelled' &&
          (selectedPropertyId === 'al-taraf' ? true : (!activeSection || !b.sectionId || b.sectionId === activeSection.id))
        ) {
          const hasOverlap = validDates.some((vd) => vd >= b.checkInDate && vd < b.checkOutDate);
          if (hasOverlap) {
            cancelBooking(b.id);
          }
        }
      });
    }

    setDateOverridesBulk(selectedPropertyId, validDates, { status }, activeSectionId);
  };

  const saveStatusSelection = () => {
    const validDates = selectedDates.filter((d) => d >= todayStr);
    if (validDates.length === 0) return;
    handleApplyStatus(targetStatus);
    setSavedStatusSuccess(true);
    setTimeout(() => setSavedStatusSuccess(false), 2000);
  };

  const seasonalPrices = useMemo(() => {
    if (activeSection) {
      return {
        weekday: activeSection.priceWeekday,
        weekend: activeSection.priceWeekend,
        summer: Math.round(activeSection.priceWeekday * 1.1),
        eid: Math.round(activeSection.priceWeekend * 1.5),
        vacation: Math.round(activeSection.priceWeekday * 1.25),
      };
    }
    return {
      weekday: seasonalInputs.weekday || selectedProperty.seasonalPricing.weekday,
      weekend: seasonalInputs.weekend || selectedProperty.seasonalPricing.weekend,
      summer: seasonalInputs.summer || selectedProperty.seasonalPricing.summer,
      eid: seasonalInputs.eid || selectedProperty.seasonalPricing.eid,
      vacation: seasonalInputs.vacation || selectedProperty.seasonalPricing.vacation,
    };
  }, [activeSection, selectedProperty, seasonalInputs]);

  // Determine which season tier matches the selected calendar date
  const selectedDateSeasonTier = useMemo<'weekday' | 'weekend'>(() => {
    if (selectedDates.length === 0) return 'weekday';
    const dObj = new Date(selectedDates[0]);
    const isWk = dObj.getDay() === 4 || dObj.getDay() === 5;
    return isWk ? 'weekend' : 'weekday';
  }, [selectedDates]);

  // Read current active price from calendar table for the selected date(s)
  const selectedDatePrice = useMemo(() => {
    if (selectedDates.length === 0) return selectedProperty.basePriceWeekday;
    const targetDate = selectedDates[0];
    const unitKey = activeSection
      ? `${selectedPropertyId}_${activeSection.id}_${targetDate}`
      : `${selectedPropertyId}_${targetDate}`;
    const override = dateOverrides[unitKey] || dateOverrides[`${selectedPropertyId}_${targetDate}`];
    if (override?.price !== undefined) return override.price;
    const dObj = new Date(targetDate);
    const isWk = dObj.getDay() === 4 || dObj.getDay() === 5;
    return activeSection
      ? (isWk ? activeSection.priceWeekend : activeSection.priceWeekday)
      : (isWk ? seasonalPrices.weekend : seasonalPrices.weekday);
  }, [selectedDates, activeSection, selectedPropertyId, selectedProperty, dateOverrides, seasonalPrices]);

  // Real-time synchronization: when a date is selected in the calendar table, priceInput instantly updates!
  useEffect(() => {
    if (selectedDatePrice !== undefined && selectedDatePrice > 0) {
      setPriceInput(selectedDatePrice);
    }
  }, [selectedDatePrice]);

  const handleApplyPrice = () => {
    const validDates = selectedDates.filter((d) => d >= todayStr);
    if (validDates.length === 0 || !priceInput) return;
    const numericPrice = Number(priceInput);

    // 1. Update calendar date overrides across all matching keys so the price appears immediately in the calendar table!
    setDateOverridesBulk(
      selectedPropertyId,
      validDates,
      {
        price: numericPrice,
        season: selectedDateSeasonTier,
        ...(isAdmin && activeFeeAmount !== undefined ? { adminFee: Number(activeFeeAmount) } : {}),
      },
      activeSectionId
    );

    // 2. Synchronize "أنماط المواسم" with this new price so the two elements are 100% in sync!
    const updatedSeasons: SeasonalPricing = {
      ...seasonalInputs,
      [selectedDateSeasonTier]: numericPrice,
    };
    setSeasonalInputs(updatedSeasons);
    updatePropertySeasonalPricing(selectedPropertyId, updatedSeasons);

    // If viewing a sub-unit, also keep its base price in sync
    if (activeSection) {
      if (selectedDateSeasonTier === 'weekday') {
        updatePropertySection(selectedPropertyId, activeSection.id, { priceWeekday: numericPrice });
      } else {
        updatePropertySection(selectedPropertyId, activeSection.id, { priceWeekend: numericPrice });
      }
    }

    setSavedPriceSuccess(true);
    setTimeout(() => setSavedPriceSuccess(false), 2200);
  };

  const handleSaveAdminFees = () => {
    updatePropertyAdministrativeFees(selectedPropertyId, adminFeesInputs);
    setSavedAdminFeeSuccess(true);
    setTimeout(() => setSavedAdminFeeSuccess(false), 2200);
  };

  const handleApplyAdminFee = (feeOverride?: number) => {
    const validDates = selectedDates.filter((d) => d >= todayStr);
    if (validDates.length === 0) return;
    const feeToApply = feeOverride !== undefined ? feeOverride : activeFeeAmount;
    setDateOverridesBulk(selectedPropertyId, validDates, { adminFee: Number(feeToApply) }, activeSectionId);
    setAppliedAdminFeeSuccess(true);
    setTimeout(() => setAppliedAdminFeeSuccess(false), 2000);
  };

  const handleAddCustomFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFeeNameInput.trim()) return;
    const newFee: CustomFeeItem = {
      id: `fee-${Date.now()}`,
      name: customFeeNameInput.trim(),
      amount: Math.max(0, Number(customFeeAmountInput)),
    };
    const updated: AdministrativeFees = {
      ...adminFeesInputs,
      customFees: [...(adminFeesInputs.customFees || []), newFee],
    };
    setAdminFeesInputs(updated);
    updatePropertyAdministrativeFees(selectedPropertyId, updated);
    setSelectedFeeTier(newFee.id);
    setCustomFeeNameInput('');
    setCustomFeeAmountInput(50);
    setIsAddingCustomFee(false);
  };

  const handleDeleteCustomFee = (feeId: string) => {
    const updated: AdministrativeFees = {
      ...adminFeesInputs,
      customFees: (adminFeesInputs.customFees || []).filter((c) => c.id !== feeId),
    };
    setAdminFeesInputs(updated);
    updatePropertyAdministrativeFees(selectedPropertyId, updated);
    if (selectedFeeTier === feeId) {
      setSelectedFeeTier('weekday');
    }
  };

  const handleApplySeason = (season: keyof Property['seasonalPricing']) => {
    const validDates = selectedDates.filter((d) => d >= todayStr);
    if (validDates.length === 0) return;
    const seasonPrice = seasonalPrices[season] || seasonalInputs[season] || Number(priceInput);

    // 1. Immediately synchronize the custom price input with the season price
    setPriceInput(seasonPrice);

    // 2. Set date override in calendar table so it renders immediately
    setDateOverridesBulk(
      selectedPropertyId,
      validDates,
      {
        price: seasonPrice,
        season: String(season),
      },
      activeSectionId
    );

    applySeasonalPricingPattern(selectedPropertyId, validDates, season, activeSectionId);
    setSavedPriceSuccess(true);
    setTimeout(() => setSavedPriceSuccess(false), 2000);
  };

  return (
    <div className="pb-28 max-w-3xl mx-auto px-3 sm:px-4 pt-2 space-y-4">
      {/* Property Selector Pills & Calendar Link Button */}
      <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-purple-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {properties.map((p) => {
            const isSelected = p.id === selectedPropertyId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100 hover:text-purple-900'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Units Bar for properties with multiple independent units (e.g. Hamran: Alma & Naya) */}
      {selectedProperty.sections && selectedProperty.sections.length > 0 && (
        <div className="bg-gradient-to-r from-[#FAF7FD] via-[#F5EEFB] to-[#FAF7FD] p-3 rounded-2xl border-2 border-purple-200/90 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-700 shrink-0" />
              <span>
                {selectedProperty.id === 'al-taraf'
                  ? 'خيارات حجز عقار الترف (قسم النساء أو كامل العقار):'
                  : selectedProperty.id === 'hamran'
                  ? 'الوحدات المستقلة داخل حمران (وحدتان مستقلتان فقط):'
                  : `أقسام ووحدات الحجز المستقلة داخل ${selectedProperty.name}:`}
              </span>
            </span>
            <span className="text-[10px] bg-purple-200/70 text-purple-900 px-2 py-0.5 rounded-md font-bold">
              {selectedProperty.id === 'al-taraf' ? 'متاح للحجز: قسم النساء / كامل الترف' : `${selectedProperty.sections.length} وحدات مستقلة`}
            </span>
          </div>

          <div className={`grid gap-2 ${selectedProperty.id === 'al-taraf' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {selectedProperty.sections
              .filter((sec) => !(selectedProperty.id === 'al-taraf' && sec.id === 'section-2'))
              .map((sec) => {
              const isSecActive = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    isSecActive
                      ? 'bg-purple-800 text-white border-purple-800 shadow-md ring-2 ring-purple-600 ring-offset-1'
                      : 'bg-white text-slate-800 border-purple-200/80 hover:bg-purple-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm truncate">
                      {sec.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isSecActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {selectedProperty.id === 'al-taraf' ? 'متاح للحجز' : 'مستقلة'}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-90 truncate font-sans">
                    {sec.id === 'section-1'
                      ? 'مجلس ضيافة ملكي ومسبح أوفر فلو دافئ (قسم النساء)'
                      : sec.id === 'hamran-alma'
                      ? 'طابع بوهيمي ومسبح فيروزي'
                      : sec.id === 'hamran-naya'
                      ? 'منتجع عائلي ومسبح ألعاب مائية'
                      : sec.subtitle}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-bold font-mono">
                    <span>وسط: {sec.priceWeekday} ر.س</span>
                    <span>الويكند: {sec.priceWeekend} ر.س</span>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveSectionId('all')}
              className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                activeSectionId === 'all'
                  ? 'bg-purple-800 text-white border-purple-800 shadow-md ring-2 ring-purple-600 ring-offset-1'
                  : 'bg-white text-slate-800 border-purple-200/80 hover:bg-purple-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs sm:text-sm truncate">
                  {selectedProperty.id === 'al-taraf'
                    ? 'كامل الترف (القسمان معاً)'
                    : selectedProperty.id === 'hamran'
                    ? 'كامل حمران (الوحدتان معاً)'
                    : `كامل ${selectedProperty.name}`}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    activeSectionId === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  شامل
                </span>
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {selectedProperty.id === 'al-taraf'
                  ? 'حجز شاليه الترف بالكامل بجميع مرافقه'
                  : 'عرض تقويم وتسعيرة العقار كاملاً'}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-bold font-mono">
                <span>وسط: {selectedProperty.basePriceWeekday} ر.س</span>
                <span>الويكند: {selectedProperty.basePriceWeekend} ر.س</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Selection Mode Switcher */}
      <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-purple-100 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setSelectMode('range')}
          className={`py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            selectMode === 'range' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          دخول ومغادرة (فترة متصلة)
        </button>
        <button
          onClick={() => setSelectMode('multi')}
          className={`py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            selectMode === 'multi' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          ليالٍ منفصلة (تحديد متعدد)
        </button>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100 space-y-4">
        {/* Month Header and Size controls */}
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
              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-purple-50 text-purple-900 flex items-center justify-center transition-colors cursor-pointer"
              title="الشهر السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 min-w-[120px] justify-center">
              <span>{monthsAr[month]}</span>
              <span className="font-mono text-purple-700">{year}</span>
            </h3>

            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-purple-50 text-purple-900 flex items-center justify-center transition-colors cursor-pointer"
              title="الشهر القادم"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Double Booking Warning Banner */}
        {blockedAlertMessage && (
          <div className="bg-rose-50 border-2 border-rose-300 p-3 sm:p-3.5 rounded-2xl flex items-center justify-between text-rose-950 font-bold text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                ⚠️
              </span>
              <div>
                <p className="font-extrabold text-rose-900">{blockedAlertMessage}</p>
                <p className="text-[11px] text-rose-700 font-medium">
                  هذا اليوم مخصص بحالة مؤكد ولا يمكن قبول أو إنشاء أي حجز إضافي عليه منعاً للتضارب.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBlockedAlertMessage(null)}
              className="w-7 h-7 rounded-lg bg-rose-200/70 hover:bg-rose-300 text-rose-900 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors shrink-0"
              title="إغلاق التنبيه"
            >
              ✕
            </button>
          </div>
        )}

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysAr.map((day, idx) => (
            <div key={idx} className="text-xs font-bold text-slate-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {daysMatrix.map((item, idx) => {
            const heightCls =
              calendarSize === 'compact'
                ? 'h-13 sm:h-15'
                : calendarSize === 'large'
                ? 'h-22 sm:h-26'
                : 'h-16 sm:h-20';

            if (!item) {
              return <div key={`empty-${idx}`} className={`${heightCls} rounded-2xl bg-slate-50/50`} />;
            }

            const { dayNum, dateKey, price, status, depositRemainingSeconds, isPast, isToday } = item;
            const isConfirmedBooked = status === 'booked' || !!item.booking;
            const isSelected = selectedDates.includes(dateKey);

            let colorClasses = 'bg-[#E8F8F1] border-emerald-200 text-emerald-950';
            let label = `${price}`;

            if (isPast) {
              colorClasses = 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-55 cursor-not-allowed pointer-events-none';
              label = item.booking ? 'محجوز' : 'فائت';
            } else if (status === 'waiting_deposit') {
              colorClasses = 'bg-amber-100 border-amber-300 text-amber-950 btn-beam-shine';
              label = `انتظار (${Math.floor(depositRemainingSeconds / 60)}:${String(depositRemainingSeconds % 60).padStart(2, '0')})`;
            } else if (status === 'booked') {
              colorClasses = 'bg-[#FCE7F3] border-pink-300 text-pink-950 hover:border-pink-400';
              label = 'مؤكد';
            } else if (status === 'blocked') {
              colorClasses = 'bg-slate-100 border-slate-200 text-slate-400';
              label = 'مغلق';
            }

            // Elegantly styled today's date and non-black selection border
            const todayClasses = isToday
              ? 'border-2 border-purple-400 bg-purple-50/40 font-bold'
              : '';
            const selectedClasses = isSelected
              ? 'ring-3 ring-purple-600 ring-offset-2 !border-2 !border-purple-600 !bg-purple-100/80 shadow-md font-black scale-[1.02] z-20'
              : '';

            return (
              <div
                key={dateKey}
                onClick={() => {
                  if (isPast) return;
                  if (isConfirmedBooked && !isAdmin) {
                    showBlockedAlert('اليوم محجوز ومؤكد ولا يمكن تكرار الحجز');
                    return;
                  }
                  handleDateClick(dateKey);
                }}
                aria-disabled={isPast || (isConfirmedBooked && !isAdmin)}
                title={
                  isConfirmedBooked
                    ? isAdmin
                      ? 'حجز مؤكد (انقر للإدارة لإعادة فتح التقويم أو التعديل)'
                      : 'اليوم محجوز ومؤكد ولا يمكن تكرار الحجز'
                    : undefined
                }
                className={`${heightCls} rounded-2xl border p-1 sm:p-1.5 flex flex-col justify-between items-center transition-all relative select-none ${colorClasses} ${todayClasses} ${selectedClasses} ${
                  isPast
                    ? 'cursor-not-allowed pointer-events-none'
                    : isConfirmedBooked && !isAdmin
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {/* Booked Locked Badge */}
                {status === 'booked' && !isToday && (
                  <span className="bg-pink-200/90 text-pink-950 text-[7px] sm:text-[8px] font-extrabold px-1 rounded-xs -mt-0.5">
                    🔒 مؤكد
                  </span>
                )}
                <span
                  className={`leading-none pt-0.5 ${
                    isToday
                      ? 'text-xs sm:text-sm font-black text-purple-950 font-mono'
                      : isPast
                      ? 'font-medium text-slate-400 line-through decoration-slate-300'
                      : 'font-bold'
                  } ${calendarSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}
                >
                  {dayNum}
                </span>

                <div className="flex flex-col items-center w-full px-0.5">
                  <span
                    className={`truncate text-center w-full ${
                      isToday
                        ? 'font-mono font-black text-slate-950 text-[11px] sm:text-xs'
                        : isPast
                        ? 'text-[9px] font-bold text-slate-400'
                        : calendarSize === 'large'
                        ? 'font-mono font-bold text-xs sm:text-sm'
                        : 'font-mono font-bold text-[9px] sm:text-[10px]'
                    } ${
                      isPast
                        ? 'text-slate-400'
                        : isToday
                        ? 'text-slate-950'
                        : status === 'waiting_deposit'
                        ? 'text-amber-800'
                        : status === 'booked'
                        ? 'text-pink-800'
                        : 'text-emerald-800'
                    }`}
                  >
                    {label}
                  </span>
                  {!isPast && status === 'available' && (
                    <span className={`text-[8px] font-bold -mt-0.5 ${isToday ? 'text-slate-700' : 'text-emerald-600'}`}>
                      ر.س
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-around gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E8F8F1] border border-emerald-300" />
            <span className="text-slate-600 font-medium">متاح</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FCE7F3] border border-pink-300" />
            <span className="text-slate-600 font-medium">مؤكد (محجوز)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-300" />
            <span className="text-slate-600 font-medium">انتظار العربون</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white" />
            <span className="text-slate-600 font-medium">مغلق (صيانة)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-600 bg-purple-100" />
            <span className="text-purple-900 font-bold">محدد ({selectedDates.length})</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Price / Seasons / Block */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100 space-y-3.5">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-700" />
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              {selectedDates.length > 0 ? `${selectedDates.length} يوم محدد` : 'تعديل أسعار الأيام'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDates([])}
              className="text-xs text-[#E11D48] hover:text-[#BE123C] font-bold cursor-pointer transition-colors"
            >
              مسح التحديد
            </button>
          </div>
        </div>

        {/* Quick Open/Close Action for Selected Days */}
        <div className="relative border border-purple-200/90 rounded-2xl bg-white p-3 sm:p-4 overflow-hidden">
          <div className="space-y-3 px-2 sm:px-3 text-center">
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              فتح / إغلاق الأيام المحددة
            </span>
            <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={saveStatusSelection}
                className="py-2 px-5 sm:px-6 rounded-xl font-bold text-xs sm:text-sm bg-[#D5C4EC] hover:bg-[#C6B3DF] text-slate-900 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {savedStatusSuccess ? '✓ تم الحفظ' : 'حفظ'}
              </button>
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => setTargetStatus('blocked')}
                  className={`py-2 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all border cursor-pointer ${
                    targetStatus === 'blocked'
                      ? 'bg-[#EFE8F9] text-purple-950 border-purple-400 shadow-2xs font-extrabold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  مغلق
                </button>
                <button
                  type="button"
                  onClick={() => setTargetStatus('available')}
                  className={`py-2 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all border cursor-pointer ${
                    targetStatus === 'available'
                      ? 'bg-[#EFE8F9] text-purple-950 border-purple-400 shadow-2xs font-extrabold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  متاح
                </button>
              </div>
            </div>

            {/* تنبيه وزر إعادة فتح التقويم المخصص للإدارة عند تحديد يوم به حجز مؤكد */}
            {isAdmin && selectedDates.some(isDateBooked) && (
              <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-right animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-950 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>تنبيه الإدارة: الأيام المحددة بها حجز مؤكد. مصرح لك بإعادة فتح التقويم وإلغاء القفل.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyStatus('available');
                    setTargetStatus('available');
                    setSavedStatusSuccess(true);
                    setTimeout(() => setSavedStatusSuccess(false), 2500);
                  }}
                  className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>إعادة فتح التقويم فوراً</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher between Pricing and Seasons (متوافقة ومتطابقة تماماً في الأسعار والتقويم) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPanelMode('seasons')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              panelMode === 'seasons'
                ? 'border-2 border-purple-700 bg-white text-slate-900 shadow-sm ring-2 ring-purple-100'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">
                متوافق ✓
              </span>
              <span className="text-[10px] text-slate-400 font-medium">الخانة الرابعة</span>
            </div>
            <span className="text-xs sm:text-sm font-black block mt-0.5">أنماط المواسم</span>
            <span className="text-[11px] font-mono font-bold text-purple-700 block mt-0.5">
              {seasonalPrices[selectedDateSeasonTier]} ر.س ({selectedDateSeasonTier === 'weekend' ? 'الويكند' : 'وسط الأسبوع'})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPanelMode('prices')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              panelMode === 'prices'
                ? 'border-2 border-purple-700 bg-white text-slate-900 shadow-sm ring-2 ring-purple-100'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                متوافق ✓
              </span>
              <span className="text-[10px] text-slate-400 font-medium">الخانة الثالثة</span>
            </div>
            <span className="text-xs sm:text-sm font-black block mt-0.5">تحديد سعر الليلة</span>
            <span className="text-[11px] font-mono font-bold text-purple-700 block mt-0.5">
              {priceInput} ر.س / ليلة
            </span>
          </button>
        </div>

        {/* Custom Price Input (متوافق مع المواسم ويظهر فوراً في جدول التقويم) */}
        {panelMode === 'prices' && (
          <div className="bg-[#FAF7FC] border border-purple-100/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-[11px] text-purple-700 font-bold bg-purple-100/70 px-2 py-0.5 rounded-lg">
                اليوم المحدد: {selectedDateSeasonTier === 'weekend' ? 'ويكند (عطلة نهاية أسبوع)' : 'وسط الأسبوع'}
              </span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                <span>إدخال وتعديل سعر الليلة ({selectedDates.length} ليلة محددة):</span>
                <DollarSign className="w-4 h-4 text-purple-700" />
              </div>
            </div>

            <div className="flex items-stretch gap-2.5">
              <button
                type="button"
                onClick={handleApplyPrice}
                className="py-2.5 px-5 sm:px-6 bg-[#6B21A8] hover:bg-[#581C87] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                {savedPriceSuccess ? (
                  <span className="text-emerald-200 font-bold">✓ تم التطبيق بالتقويم والمواسم</span>
                ) : (
                  <span>تطبيق السعر</span>
                )}
              </button>
              <div className="flex-1">
                <input
                  type="number"
                  step={50}
                  value={priceInput}
                  onChange={(e) => setPriceInput(Number(e.target.value))}
                  className="w-full h-full min-h-[50px] bg-white border border-purple-200 rounded-2xl px-4 text-center sm:text-right text-xl sm:text-2xl font-bold text-slate-800 font-mono focus:outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-100 shadow-2xs"
                  placeholder="السعر بالريال"
                />
              </div>
            </div>

            {/* أزرار التوافق السريع المباشر مع أسعار أنماط المواسم */}
            <div className="pt-2 border-t border-purple-100/80 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 block text-right">
                توافق سريع مع أنماط المواسم (اضغط لاختيار وتطبيق السعر فوراً في التقويم):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleApplySeason('weekday')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    priceInput === seasonalPrices.weekday
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-black shadow-xs ring-1 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">وسط الأسبوع</span>
                  <span className="font-mono font-bold text-purple-700 text-xs">{seasonalPrices.weekday} ر.س</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySeason('weekend')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    priceInput === seasonalPrices.weekend
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-black shadow-xs ring-1 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">الويكند</span>
                  <span className="font-mono font-bold text-purple-700 text-xs">{seasonalPrices.weekend} ر.س</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySeason('summer')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    priceInput === seasonalPrices.summer
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-black shadow-xs ring-1 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">الصيف</span>
                  <span className="font-mono font-bold text-purple-700 text-xs">{seasonalPrices.summer} ر.س</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySeason('eid')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    priceInput === seasonalPrices.eid
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-black shadow-xs ring-1 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">الأعياد</span>
                  <span className="font-mono font-bold text-purple-700 text-xs">{seasonalPrices.eid} ر.س</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySeason('vacation')}
                  className={`p-2 rounded-xl border text-center col-span-2 sm:col-span-1 transition-all cursor-pointer ${
                    priceInput === seasonalPrices.vacation
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-black shadow-xs ring-1 ring-purple-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500">الإجازات</span>
                  <span className="font-mono font-bold text-purple-700 text-xs">{seasonalPrices.vacation} ر.س</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* عنصر الرسوم الإدارية - لكل عقار رسوم مستقلة مع إمكانية إضافة وتعديل وحفظ الأسعار لجميع الأنماط */}
        {panelMode === 'prices' && isAdmin && userRole !== 'marketer' && (
          <div className="bg-gradient-to-r from-purple-50/90 via-amber-50/50 to-purple-50/90 border-2 border-purple-300/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs animate-in fade-in duration-200">
            {/* رأس بطاقة الرسوم وزر الحفظ العام للعقار */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Receipt className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-purple-950">
                      أسعار الرسوم الإدارية لعقار ({selectedProperty.name})
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full border border-amber-300">
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-900/80 mt-0.5">
                  </p>
                </div>
              </div>

              {/* زر حفظ أسعار الرسوم الإدارية للعقار */}
              <button
                type="button"
                onClick={handleSaveAdminFees}
                className="py-2 px-3.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0 self-end sm:self-auto"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>{savedAdminFeeSuccess ? '✓ تم حفظ رسوم العقار بنجاح' : `حفظ أسعار رسوم ${selectedProperty.name}`}</span>
              </button>
            </div>

            {/* شبكة عناصر أسعار الرسوم (وسط الأسبوع، الويكند، الإجازات المطولة، الأعياد، الصيف، وأي مخصص) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700" />
                  <span>عناصر الرسوم الإدارية ومبالغ الخصم (ر.س / ليلة):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomFee(!isAddingCustomFee)}
                  className="text-xs text-purple-700 hover:text-purple-950 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingCustomFee ? 'إلغاء الإضافة' : '+ إضافة رسم مخصص'}</span>
                </button>
              </div>

              {/* فورم إضافة رسم مخصص جديد */}
              {isAddingCustomFee && (
                <form
                  onSubmit={handleAddCustomFee}
                  className="p-3 bg-white rounded-xl border border-purple-300 shadow-2xs flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-150"
                >
                  <input
                    type="text"
                    value={customFeeNameInput}
                    onChange={(e) => setCustomFeeNameInput(e.target.value)}
                    placeholder="اسم الرسم (مثال: مناسبات خاصة، رأس السنة...)"
                    className="flex-1 w-full text-xs font-bold bg-purple-50/50 border border-purple-200 rounded-lg px-3 py-2 text-right focus:outline-hidden focus:border-purple-600"
                    required
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-28">
                      <input
                        type="number"
                        value={customFeeAmountInput}
                        onChange={(e) => setCustomFeeAmountInput(Math.max(0, Number(e.target.value)))}
                        className="w-full text-xs font-bold bg-purple-50/50 border border-purple-200 rounded-lg px-2 py-2 text-center font-mono focus:outline-hidden focus:border-purple-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="50"
                        required
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-purple-700 font-bold">
                        ر.س
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                    >
                      إضافة وحفظ
                    </button>
                  </div>
                </form>
              )}

              {/* شبكة العناصر */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {/* 1. وسط الأسبوع */}
                <div
                  onClick={() => setSelectedFeeTier('weekday')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedFeeTier === 'weekday'
                      ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/40'
                      : 'border-purple-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">وسط الأسبوع</span>
                    {selectedFeeTier === 'weekday' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={adminFeesInputs.weekday}
                      onChange={(e) =>
                        setAdminFeesInputs((prev) => ({ ...prev, weekday: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-purple-50/60 border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-purple-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-purple-700 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 2. الويكند */}
                <div
                  onClick={() => setSelectedFeeTier('weekend')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedFeeTier === 'weekend'
                      ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/40'
                      : 'border-purple-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الويكند</span>
                    {selectedFeeTier === 'weekend' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={adminFeesInputs.weekend}
                      onChange={(e) =>
                        setAdminFeesInputs((prev) => ({ ...prev, weekend: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-purple-50/60 border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-purple-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-purple-700 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 3. الإجازات المطولة */}
                <div
                  onClick={() => setSelectedFeeTier('vacation')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedFeeTier === 'vacation'
                      ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/40'
                      : 'border-purple-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الإجازات المطولة</span>
                    {selectedFeeTier === 'vacation' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={adminFeesInputs.vacation}
                      onChange={(e) =>
                        setAdminFeesInputs((prev) => ({ ...prev, vacation: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-purple-50/60 border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-purple-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-purple-700 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 4. الأعياد */}
                <div
                  onClick={() => setSelectedFeeTier('eid')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedFeeTier === 'eid'
                      ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/40'
                      : 'border-purple-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الأعياد</span>
                    {selectedFeeTier === 'eid' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={adminFeesInputs.eid}
                      onChange={(e) =>
                        setAdminFeesInputs((prev) => ({ ...prev, eid: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-purple-50/60 border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-purple-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-purple-700 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 5. الصيف */}
                <div
                  onClick={() => setSelectedFeeTier('summer')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                    selectedFeeTier === 'summer'
                      ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/40'
                      : 'border-purple-200 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الصيف</span>
                    {selectedFeeTier === 'summer' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={adminFeesInputs.summer}
                      onChange={(e) =>
                        setAdminFeesInputs((prev) => ({ ...prev, summer: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-purple-50/60 border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-purple-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-purple-700 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* أي رسوم مخصصة تمت إضافتها */}
                {adminFeesInputs.customFees?.map((custom) => (
                  <div
                    key={custom.id}
                    onClick={() => setSelectedFeeTier(custom.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                      selectedFeeTier === custom.id
                        ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-400/40'
                        : 'border-purple-200 bg-white/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11px] truncate max-w-[80px]" title={custom.name}>
                        {custom.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomFee(custom.id);
                        }}
                        className="text-red-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                        title="حذف الرسم"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={custom.amount}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setAdminFeesInputs((prev) => ({
                            ...prev,
                            customFees: (prev.customFees || []).map((c) =>
                              c.id === custom.id ? { ...c, amount: val } : c
                            ),
                          }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-purple-50/60 border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-purple-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[9px] text-purple-700 block text-center mt-0.5 font-bold">
                        ر.س / ليلة
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* شريط التطبيق السريع على الليالي المحددة في التقويم */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleApplyAdminFee()}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {appliedAdminFeeSuccess ? (
                  <span className="font-black text-slate-950">✓ تم تطبيق الرسم ({activeFeeAmount} ر.س) على التقويم بنجاح</span>
                ) : (
                  <span>
                    تطبيق الرسم المحدد ({activeFeeAmount} ر.س) على الليالي المحددة ({selectedDates.length} ليلة)
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-purple-200/60">
              <span className="text-[10px] text-purple-700 font-medium">
                • لا يظهر هذا المبلغ أو تفاصيله للمسوقين إطلاقاً (محجوب بالكامل)
              </span>
              <button
                type="button"
                onClick={() => setAdminFeesLedgerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-purple-950 hover:text-purple-900 font-black bg-white hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs transition-colors cursor-pointer self-end sm:self-auto"
              >
                <Receipt className="w-3.5 h-3.5 text-purple-700" />
                <span>فتح جدول المعاملات المالية للرسوم الإدارية</span>
                <ExternalLink className="w-3 h-3 text-purple-500" />
              </button>
            </div>
          </div>
        )}

        {/* Seasons Preset Patterns */}
        {panelMode === 'seasons' && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-700 font-semibold">
                تطبيق تسعيرة المواسم الجاهزة على الأيام المحددة ({selectedDates.length} يوم):
              </p>
              <button
                type="button"
                onClick={() => setIsEditingSeasons(!isEditingSeasons)}
                className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingSeasons ? 'إغلاق نافذة التعديل' : 'تعديل أسعار المواسم'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleApplySeason('weekday')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <span>وسط الأسبوع</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {seasonalPrices.weekday} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('weekend')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <span>الويكند</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {seasonalPrices.weekend} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('summer')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <span>الصيف</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {seasonalPrices.summer} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('eid')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <span>الأعياد</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {seasonalPrices.eid} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('vacation')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold col-span-2 sm:col-span-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span>الإجازات</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {seasonalPrices.vacation} ر.س
                </span>
              </button>
            </div>

            {/* إمكانية تعديل وحفظ أسعار أنماط المواسم لعقار */}
            <div className="p-3.5 bg-white rounded-xl border border-purple-200 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      تعديل وحفظ سعر أنماط المواسم لعقار ({selectedProperty.name})
                    </h5>
                    <span className="text-[10px] text-slate-500">
                      تعديل قيم المواسم الافتراضية وحفظها في قاعدة بيانات العقار
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSeasonalPricing}
                  className="py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedSeasonsSuccess ? '✓ تم حفظ الأسعار بنجاح' : 'حفظ أسعار أنماط المواسم'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
                <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-100">
                  <label className="text-[10px] text-purple-950 font-bold block mb-1">وسط الأسبوع</label>
                  <input
                    type="number"
                    step={50}
                    value={seasonalInputs.weekday}
                    onChange={(e) => setSeasonalInputs((prev) => ({ ...prev, weekday: Number(e.target.value) }))}
                    className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono"
                  />
                  <span className="text-[9px] text-purple-700 block text-center mt-0.5">ر.س / ليلة</span>
                </div>
                <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-100">
                  <label className="text-[10px] text-purple-950 font-bold block mb-1">الويكند</label>
                  <input
                    type="number"
                    step={50}
                    value={seasonalInputs.weekend}
                    onChange={(e) => setSeasonalInputs((prev) => ({ ...prev, weekend: Number(e.target.value) }))}
                    className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono"
                  />
                  <span className="text-[9px] text-purple-700 block text-center mt-0.5">ر.س / ليلة</span>
                </div>
                <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-100">
                  <label className="text-[10px] text-purple-950 font-bold block mb-1">الصيف</label>
                  <input
                    type="number"
                    step={50}
                    value={seasonalInputs.summer}
                    onChange={(e) => setSeasonalInputs((prev) => ({ ...prev, summer: Number(e.target.value) }))}
                    className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono"
                  />
                  <span className="text-[9px] text-purple-700 block text-center mt-0.5">ر.س / ليلة</span>
                </div>
                <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-100">
                  <label className="text-[10px] text-purple-950 font-bold block mb-1">الأعياد</label>
                  <input
                    type="number"
                    step={50}
                    value={seasonalInputs.eid}
                    onChange={(e) => setSeasonalInputs((prev) => ({ ...prev, eid: Number(e.target.value) }))}
                    className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono"
                  />
                  <span className="text-[9px] text-purple-700 block text-center mt-0.5">ر.س / ليلة</span>
                </div>
                <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-100 col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-purple-950 font-bold block mb-1">الإجازات</label>
                  <input
                    type="number"
                    step={50}
                    value={seasonalInputs.vacation}
                    onChange={(e) => setSeasonalInputs((prev) => ({ ...prev, vacation: Number(e.target.value) }))}
                    className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono"
                  />
                  <span className="text-[9px] text-purple-700 block text-center mt-0.5">ر.س / ليلة</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* عنصر تسعير وإعدادات وجبة الإفطار لكل عقار في العنصر الحاوي */}
        <div className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-2 border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
          {/* Header Row: Title & Save Button */}
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      breakfastInputs.enabled
                        ? 'bg-amber-200 text-amber-950 border-amber-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    {breakfastInputs.enabled ? '✓ يوجد فطور (مشمول تلقائياً)' : '✕ لا يوجد فطور في هذا العقار'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveBreakfastPricing}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              {savedBreakfastSuccess ? (
                <span className="font-black text-slate-950">✓ تم حفظ أسعار الإفطار بنجاح</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ إعدادات وأسعار الإفطار</span>
                </>
              )}
            </button>
          </div>

          {/* عنصر اختيار هل يوجد فطور أو لا يوجد */}
          <div className="bg-amber-100/40 rounded-xl p-3 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-xs font-bold text-amber-950 block">اختيار توفر وجبة الإفطار في هذا العقار:</span>
              {!breakfastInputs.enabled && (
                <span className="text-[11px] text-slate-600">
                  العقار بدون إفطار، والسعر في صفحة الحجز سيكون صافياً للإقامة فقط دون أي احتساب أو خصم للإفطار.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBreakfastInputs((prev) => ({ ...prev, enabled: true }))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  breakfastInputs.enabled
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>يوجد فطور</span>
              </button>

              <button
                type="button"
                onClick={() => setBreakfastInputs((prev) => ({ ...prev, enabled: false }))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  !breakfastInputs.enabled
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50'
                }`}
              >
                <span>لا يوجد فطور</span>
              </button>
            </div>
          </div>

          {/* عناصر أسعار الفطور لجميع المواسم (وسط الأسبوع، الويكند، الإجازات المطولة، الأعياد، الصيف) */}
          {breakfastInputs.enabled ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-800">
                </span>
                <span className="text-[10px] text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md font-medium">
                  الموسم المحدد حالياً للتطبيق: <strong className="font-bold">
                    {selectedBreakfastTier === 'weekday' && 'وسط الأسبوع'}
                    {selectedBreakfastTier === 'weekend' && 'الويكند'}
                    {selectedBreakfastTier === 'vacation' && 'الإجازات المطولة'}
                    {selectedBreakfastTier === 'eid' && 'الأعياد'}
                    {selectedBreakfastTier === 'summer' && 'الصيف'}
                  </strong> ({activeBreakfastAmount} ر.س)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {/* 1. وسط الأسبوع */}
                <div
                  onClick={() => setSelectedBreakfastTier('weekday')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                    selectedBreakfastTier === 'weekday'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-400/50'
                      : 'border-amber-200 bg-white hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">وسط الأسبوع</span>
                    {selectedBreakfastTier === 'weekday' && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={25}
                      min={0}
                      value={breakfastInputs.weekday}
                      onChange={(e) =>
                        setBreakfastInputs((prev) => ({ ...prev, weekday: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-amber-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-amber-900 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 2. الويكند */}
                <div
                  onClick={() => setSelectedBreakfastTier('weekend')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                    selectedBreakfastTier === 'weekend'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-400/50'
                      : 'border-amber-200 bg-white hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الويكند</span>
                    {selectedBreakfastTier === 'weekend' && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={25}
                      min={0}
                      value={breakfastInputs.weekend}
                      onChange={(e) =>
                        setBreakfastInputs((prev) => ({ ...prev, weekend: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-amber-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-amber-900 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 3. الإجازات المطولة */}
                <div
                  onClick={() => setSelectedBreakfastTier('vacation')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                    selectedBreakfastTier === 'vacation'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-400/50'
                      : 'border-amber-200 bg-white hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الإجازات المطولة</span>
                    {selectedBreakfastTier === 'vacation' && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={25}
                      min={0}
                      value={breakfastInputs.vacation}
                      onChange={(e) =>
                        setBreakfastInputs((prev) => ({ ...prev, vacation: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-amber-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-amber-900 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 4. الأعياد */}
                <div
                  onClick={() => setSelectedBreakfastTier('eid')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                    selectedBreakfastTier === 'eid'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-400/50'
                      : 'border-amber-200 bg-white hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الأعياد</span>
                    {selectedBreakfastTier === 'eid' && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={25}
                      min={0}
                      value={breakfastInputs.eid}
                      onChange={(e) =>
                        setBreakfastInputs((prev) => ({ ...prev, eid: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-amber-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-amber-900 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>

                {/* 5. الصيف */}
                <div
                  onClick={() => setSelectedBreakfastTier('summer')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative col-span-2 sm:col-span-1 ${
                    selectedBreakfastTier === 'summer'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-400/50'
                      : 'border-amber-200 bg-white hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-[11px]">الصيف</span>
                    {selectedBreakfastTier === 'summer' && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={25}
                      min={0}
                      value={breakfastInputs.summer}
                      onChange={(e) =>
                        setBreakfastInputs((prev) => ({ ...prev, summer: Math.max(0, Number(e.target.value)) }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-xs font-mono focus:outline-hidden focus:border-amber-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[9px] text-amber-900 block text-center mt-0.5 font-bold">
                      ر.س / ليلة
                    </span>
                  </div>
                </div>
              </div>

              {/* تطبيق سعر الإفطار على عدة تواريخ مخصصة بالتقويم */}
              <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleApplyBreakfastToDates}
                  disabled={selectedDates.length === 0}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {appliedBreakfastDatesSuccess ? (
                    <span className="font-black text-slate-950">
                      ✓ تم تطبيق سعر الإفطار ({activeBreakfastAmount} ر.س) على التواريخ المحددة بنجاح
                    </span>
                  ) : (
                    <span>
                      تطبيق سعر الإفطار المحدد ({activeBreakfastAmount} ر.س) على التواريخ المحددة بالتقويم ({selectedDates.length} ليلة)
                    </span>
                  )}
                </button>

                <div className="text-xs text-slate-700 bg-white/80 py-1.5 px-3 rounded-xl border border-amber-200 shrink-0 text-center sm:text-right">
                  {selectedDates.length > 0 ? (
                    <span>
                      إجمالي قيمة الإفطار المخصومة لو أُلغي: <strong className="text-amber-900 font-mono font-bold">{activeBreakfastAmount * selectedDates.length} ر.س</strong> ({selectedDates.length} ليلة)
                    </span>
                  ) : (
                    <span>حدد تواريخ من التقويم لتطبيق سعر الإفطار عليها</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* في حال تم اختيار لا يوجد فطور */
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-900 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>العقار مضبوط على وضع: «لا يوجد إفطار»</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                في هذا الوضع، سيكون السعر المعروض في صفحة الحجوزات والعقود صافياً للإقامة فقط، ولن يتم احتساب وجبة إفطار أو إتاحة خصم الإفطار للعميل. اضغط على «حفظ إعدادات وأسعار الإفطار» لتثبيت هذه الحالة لهذا العقار.
              </p>
              {selectedDates.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyBreakfastToDates}
                  className="py-2 px-3 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  {appliedBreakfastDatesSuccess
                    ? '✓ تم إلغاء الإفطار من التواريخ المحددة'
                    : `تأكيد إلغاء الإفطار على التواريخ المحددة بالتقويم (${selectedDates.length} ليلة)`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Block whole property toggle */}
        <button
          type="button"
          onClick={() => togglePropertyPublished(selectedPropertyId)}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs border ${
            selectedProperty.isPublished
              ? 'bg-[#FFF5F5] hover:bg-[#FFE8E8] text-slate-900 border-[#FECDD3]'
              : 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-emerald-900 border-emerald-200'
          }`}
        >
          {selectedProperty.isPublished ? (
            <>
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              <span>إغلاق العقار كامل</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span>فتح العقار كامل لجميع الأيام</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Summary Chart */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100 space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>الشاركت السريع — ملخص الفترة والربح التقديري</span>
          </div>
          <span className="text-[11px] font-mono text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full font-bold">
            {totalNights} {totalNights === 1 ? 'ليلة' : 'ليالٍ'}
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-slate-50/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 block mb-1">تاريخ الدخول</span>
            <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm truncate">
              {checkInDate}
            </span>
          </div>

          <div className="bg-slate-50/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 block mb-1">تاريخ الخروج</span>
            <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm truncate">
              {checkOutDate}
            </span>
          </div>

          <div className="bg-purple-50/60 p-2.5 sm:p-3 rounded-2xl border border-purple-100 flex flex-col justify-between">
            <span className="text-[10px] text-purple-700 block mb-1">عدد الليالي</span>
            <span className="font-extrabold text-purple-950 font-mono text-sm sm:text-base">
              {totalNights}
            </span>
          </div>

          <div className="bg-purple-50 p-2.5 sm:p-3 rounded-2xl border border-purple-200/80 flex flex-col justify-between">
            <span className="text-[10px] text-purple-800 block mb-1">إجمالي الفترة</span>
            <span className="font-extrabold text-purple-950 font-mono text-sm sm:text-base">
              {estimatedTotal} <span className="text-[10px] font-normal">ر.س</span>
            </span>
          </div>

          <div className="bg-emerald-50 p-2.5 sm:p-3 rounded-2xl border border-emerald-200 flex flex-col justify-between col-span-2 xs:col-span-1 sm:col-span-1">
            <span className="text-[10px] text-emerald-800 block mb-1">عمولة 5%</span>
            <span className="font-extrabold text-emerald-900 font-mono text-sm sm:text-base">
              {estimatedCommission} <span className="text-[10px] font-normal">ر.س</span>
            </span>
          </div>
        </div>

        <button
          disabled={checkInDate < todayStr || selectedDates.some((d) => isDateBooked(d))}
          onClick={() => {
            if (checkInDate < todayStr) return;
            if (selectedDates.some((d) => isDateBooked(d))) {
              showBlockedAlert('اليوم محجوز ومؤكد ولا يمكن تكرار الحجز');
              return;
            }
            setPreselectedDateForBooking(checkInDate);
            if (activeSectionId && activeSectionId !== 'all') {
              setPreselectedSectionForBooking(activeSectionId);
            }
            setActiveTab('bookings');
          }}
          className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
            selectedDates.some((d) => isDateBooked(d))
              ? 'bg-rose-100 text-rose-900 border border-rose-300 cursor-not-allowed shadow-none font-black'
              : checkInDate < todayStr
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'btn-mauve-shiny text-white cursor-pointer'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>
            {selectedDates.some((d) => isDateBooked(d))
              ? 'اليوم محجوز ومؤكد ولا يمكن تكرار الحجز'
              : checkInDate < todayStr
              ? 'التاريخ المحدد فائت — يرجى اختيار تاريخ اليوم أو تاريخ قادم للحجز'
              : activeSection
              ? `المتابعة لحجز (${activeSection.name}) وطلب العربون (15 دقيقة)`
              : 'المتابعة إلى صفحة الحجوزات وطلب العربون (15 دقيقة)'}
          </span>
        </button>
      </div>

      {/* iCal Synchronization Modal */}
      {syncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3.5 border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-1.5">
                    <span>ربط تقويم العقار</span>
                    <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                      {selectedProperty.name}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    مزامنة آلية ثنائية الاتجاه مع جاذر إن (Gathern) و Booking.com
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {syncSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncSuccessMsg}</span>
              </div>
            )}

            {/* Export Section */}
            <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-700 text-white text-[11px] flex items-center justify-center font-mono">
                    1
                  </span>
                  رابط تقويم العقار للتصدير (Export iCal)
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-semibold">
                  مباشر ومحدث
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                انسخ هذا الرابط وضعه في إعدادات التقويم بمنصة <b>جاذر إن</b> أو <b>Booking.com</b> لمنع الحجوزات المزدوجة وإغلاق الأيام المحجوزة تلقائياً:
              </p>

              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-purple-200">
                <input
                  type="text"
                  readOnly
                  dir="ltr"
                  value={`https://amasa.app/api/calendar/ical/${selectedPropertyId}.ics?key=auth_sync_2026`}
                  className="w-full text-[11px] font-mono text-slate-700 bg-transparent outline-none truncate"
                />
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `https://amasa.app/api/calendar/ical/${selectedPropertyId}.ics?key=auth_sync_2026`,
                      'export'
                    )
                  }
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  {copiedKey === 'export' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-mono">
                  2
                </span>
                استيراد تقويم المنصات الخارجية إلى النظام (Import iCal)
              </span>

              {/* Gathern */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <label className="text-xs font-bold text-slate-900">
                      رابط تقويم جاذر إن (Gathern Calendar iCal)
                    </label>
                  </div>
                  {syncStatuses[selectedPropertyId]?.gathern ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      متصل ونشط
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">غير مربوط بعد</span>
                  )}
                </div>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://gathern.co/calendars/.../sync.ics"
                  value={gathernIcalUrl}
                  onChange={(e) => setGathernIcalUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Booking.com */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <label className="text-xs font-bold text-slate-900">
                      رابط تقويم بوكينج (Booking.com iCal)
                    </label>
                  </div>
                  {syncStatuses[selectedPropertyId]?.booking ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      متصل ونشط
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">غير مربوط بعد</span>
                  )}
                </div>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?t=..."
                  value={bookingIcalUrl}
                  onChange={(e) => setBookingIcalUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Airbnb */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  منصات أخرى (Airbnb / منصة محلية) (اختياري)
                </label>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://www.airbnb.com/calendar/ical/...ics"
                  value={airbnbIcalUrl}
                  onChange={(e) => setAirbnbIcalUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-purple-700" />
                <span>تحديث المزامنة التلقائية: كل 10 دقائق</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                آخر تحديث: {syncStatuses[selectedPropertyId]?.lastSync || 'لم يتم بعد'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>
                  {syncing ? 'جارٍ فحص ومزامنة التقويم...' : 'حفظ ومزامنة فورية الآن'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSyncModalOpen(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Administrative Fees Financial Ledger Modal */}
      <AdministrativeFeesLedgerModal
        isOpen={adminFeesLedgerOpen}
        onClose={() => setAdminFeesLedgerOpen(false)}
      />
    </div>
  );
};
