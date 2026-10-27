import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';

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
    nowTimestamp,
  } = useApp();

  const [selectMode, setSelectMode] = useState<'range' | 'multi'>('range');
  const [selectedDates, setSelectedDates] = useState<string[]>(['2026-10-18']);
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [priceInput, setPriceInput] = useState<number>(3000);
  const [panelMode, setPanelMode] = useState<'prices' | 'seasons'>('prices');
  const [targetStatus, setTargetStatus] = useState<'available' | 'blocked'>('available');
  const [savedStatusSuccess, setSavedStatusSuccess] = useState(false);
  const [savedPriceSuccess, setSavedPriceSuccess] = useState(false);
  const [calendarSize, setCalendarSize] = useState<'compact' | 'normal' | 'large'>('normal');

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
      const overrideKey = `${selectedPropertyId}_${dateKey}`;
      const override = dateOverrides[overrideKey];
      const basePrice = isWeekend ? selectedProperty.basePriceWeekend : selectedProperty.basePriceWeekday;
      const price = override?.price !== undefined ? override.price : basePrice;

      const matchedBooking = bookings.find(
        (b) =>
          b.propertyId === selectedPropertyId &&
          b.status !== 'cancelled' &&
          dateKey >= b.checkInDate &&
          dateKey < b.checkOutDate
      );

      let status: 'available' | 'booked' | 'blocked' | 'waiting_deposit' = 'available';
      if (!selectedProperty.isPublished) {
        status = 'blocked';
      } else if (matchedBooking) {
        status = 'booked';
      } else if (override?.status === 'waiting_deposit') {
        status = 'waiting_deposit';
      } else if (override?.status === 'blocked') {
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
      });
    }

    return items;
  }, [year, month, selectedPropertyId, selectedProperty, bookings, dateOverrides, nowTimestamp]);

  const handleDateClick = (dateKey: string) => {
    if (selectMode === 'multi') {
      if (selectedDates.includes(dateKey)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateKey));
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
          while (curr <= end) {
            list.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
          }
          setSelectedDates(list);
        } else {
          setSelectedDates([dateKey]);
        }
      }
    }
  };

  const sortedSelected = useMemo(() => [...selectedDates].sort(), [selectedDates]);
  const checkInDate = sortedSelected[0] || '2026-10-18';
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
      const ov = dateOverrides[`${selectedPropertyId}_${d}`];
      if (ov?.price !== undefined) {
        sum += ov.price;
      } else {
        const dateObj = new Date(d);
        const isWk = dateObj.getDay() === 4 || dateObj.getDay() === 5;
        sum += isWk ? selectedProperty.basePriceWeekend : selectedProperty.basePriceWeekday;
      }
    });
    return sum;
  }, [sortedSelected, dateOverrides, selectedPropertyId, selectedProperty]);

  const estimatedCommission = Math.round(estimatedTotal * 0.05);

  const handleApplyStatus = (status: 'available' | 'blocked') => {
    if (selectedDates.length === 0) return;
    setDateOverridesBulk(selectedPropertyId, selectedDates, { status });
  };

  const saveStatusSelection = () => {
    if (selectedDates.length === 0) return;
    handleApplyStatus(targetStatus);
    setSavedStatusSuccess(true);
    setTimeout(() => setSavedStatusSuccess(false), 2000);
  };

  const handleApplyPrice = () => {
    if (selectedDates.length === 0 || !priceInput) return;
    setDateOverridesBulk(selectedPropertyId, selectedDates, { price: Number(priceInput) });
    setSavedPriceSuccess(true);
    setTimeout(() => setSavedPriceSuccess(false), 2000);
  };

  const handleApplySeason = (season: keyof Property['seasonalPricing']) => {
    if (selectedDates.length === 0) return;
    applySeasonalPricingPattern(selectedPropertyId, selectedDates, season);
  };

  return (
    <div className="pb-28 max-w-3xl mx-auto px-3 sm:px-4 pt-2 space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#4A154B] via-[#5E17EB] to-[#43126C] rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">التقويم والأسعار</h2>
            <p className="text-[11px] text-purple-200">إدارة توافر العقارات والأسعار وتطبيق فترات المواسم</p>
          </div>
        </div>

        <button
          onClick={() => togglePropertyPublished(selectedPropertyId)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all backdrop-blur-xs cursor-pointer ${
            selectedProperty.isPublished
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30'
              : 'bg-rose-500/30 text-rose-200 border border-rose-400/50 hover:bg-rose-500/40'
          }`}
          title="تغيير حالة عرض العقار لجميع الأيام"
        >
          {selectedProperty.isPublished ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-300" />
              <span>معروض لجميع الأيام</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-rose-300" />
              <span>العقار موقوف كاملاً</span>
            </>
          )}
        </button>
      </div>

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

        <button
          type="button"
          onClick={() => setSyncModalOpen(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs hover:shadow transition-all cursor-pointer border border-emerald-500/40"
          title="ربط تقويم العقار مع منصات جاذر إن و Booking.com تلقائياً"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <Link2 className="w-3.5 h-3.5" />
          <span>ربط العقار</span>
          {syncStatuses[selectedPropertyId]?.gathern || syncStatuses[selectedPropertyId]?.booking ? (
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
          ) : null}
        </button>
      </div>

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

            const { dayNum, dateKey, price, status, depositRemainingSeconds } = item;
            const isSelected = selectedDates.includes(dateKey);

            let colorClasses = 'bg-[#E8F8F1] border-emerald-200 text-emerald-950';
            let label = `${price}`;

            if (status === 'waiting_deposit') {
              colorClasses = 'bg-amber-100 border-amber-300 text-amber-950 btn-beam-shine';
              label = `انتظار (${Math.floor(depositRemainingSeconds / 60)}:${String(depositRemainingSeconds % 60).padStart(2, '0')})`;
            } else if (status === 'booked') {
              colorClasses = 'bg-[#FCE7F3] border-pink-300 text-pink-950';
              label = 'مؤكد';
            } else if (status === 'blocked') {
              colorClasses = 'bg-slate-100 border-slate-200 text-slate-400';
              label = 'مغلق';
            }

            return (
              <div
                key={dateKey}
                onClick={() => handleDateClick(dateKey)}
                className={`${heightCls} rounded-2xl border p-1 sm:p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer relative select-none ${colorClasses} ${
                  isSelected ? 'ring-2 ring-purple-700 ring-offset-2 scale-98 shadow-sm font-black' : ''
                }`}
              >
                <span className={`font-bold leading-none pt-0.5 ${calendarSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                  {dayNum}
                </span>

                <div className="flex flex-col items-center w-full px-0.5">
                  <span
                    className={`font-mono font-bold truncate text-center w-full ${
                      calendarSize === 'large' ? 'text-xs sm:text-sm' : 'text-[9px] sm:text-[10px]'
                    } ${
                      status === 'waiting_deposit'
                        ? 'text-amber-800'
                        : status === 'booked'
                        ? 'text-pink-800'
                        : 'text-emerald-800'
                    }`}
                  >
                    {label}
                  </span>
                  {status === 'available' && (
                    <span className="text-[8px] text-emerald-600 font-medium -mt-0.5">ر.س</span>
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
            <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-700 bg-white" />
            <span className="text-purple-900 font-bold">محدد ({selectedDates.length})</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Price / Seasons / Block */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100 space-y-3.5">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-700" />
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              لوحة التحكم – {selectedDates.length} يوم محدد
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDates([])}
            className="text-xs text-[#E11D48] hover:text-[#BE123C] font-bold cursor-pointer transition-colors"
          >
            مسح التحديد
          </button>
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
          </div>
        </div>

        {/* Tab Switcher between Pricing and Seasons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPanelMode('seasons')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              panelMode === 'seasons'
                ? 'border-2 border-purple-700 bg-white text-slate-900 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] text-slate-400 block mb-0.5">الخانة الرابعة</span>
            <span className="text-xs sm:text-sm font-bold block">أنماط المواسم</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelMode('prices')}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              panelMode === 'prices'
                ? 'border-2 border-purple-700 bg-white text-slate-900 shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] text-slate-400 block mb-0.5">الخانة الثالثة</span>
            <span className="text-xs sm:text-sm font-bold block">تحديد سعر الليلة</span>
          </button>
        </div>

        {/* Custom Price Input */}
        {panelMode === 'prices' && (
          <div className="bg-[#FAF7FC] border border-purple-100/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-end gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
              <span>إدخال سعر لليالي المحددة ({selectedDates.length} ليلة):</span>
              <DollarSign className="w-4 h-4 text-purple-700" />
            </div>
            <div className="flex items-stretch gap-2.5">
              <button
                type="button"
                onClick={handleApplyPrice}
                className="py-2.5 px-5 sm:px-6 bg-[#6B21A8] hover:bg-[#581C87] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                {savedPriceSuccess ? (
                  <span className="text-emerald-200 font-bold">✓ تم التطبيق</span>
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
                  placeholder="3000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Seasons Preset Patterns */}
        {panelMode === 'seasons' && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in duration-150">
            <p className="text-xs text-slate-700 font-semibold">
              تطبيق تسعيرة المواسم الجاهزة على الأيام المحددة ({selectedDates.length} يوم):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleApplySeason('weekday')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer"
              >
                <span>وسط الأسبوع</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {selectedProperty.seasonalPricing.weekday} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('weekend')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer"
              >
                <span>الويكند</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {selectedProperty.seasonalPricing.weekend} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('summer')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer"
              >
                <span>الصيف</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {selectedProperty.seasonalPricing.summer} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('eid')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold cursor-pointer"
              >
                <span>الأعياد</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {selectedProperty.seasonalPricing.eid} ر.س
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySeason('vacation')}
                className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-800 text-center font-bold col-span-2 sm:col-span-1 cursor-pointer"
              >
                <span>الإجازات</span>
                <span className="block text-[11px] text-purple-700 font-mono mt-0.5">
                  {selectedProperty.seasonalPricing.vacation} ر.س
                </span>
              </button>
            </div>
          </div>
        )}

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
          onClick={() => {
            setPreselectedDateForBooking(checkInDate);
            setActiveTab('bookings');
          }}
          className="btn-mauve-shiny w-full py-3.5 sm:py-4 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>المتابعة إلى صفحة الحجوزات وطلب العربون (15 دقيقة)</span>
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
    </div>
  );
};
