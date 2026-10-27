import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  DollarSign,
  Building,
  Calendar,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  X,
  Lock,
  ArrowDownRight,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';

interface AdministrativeFeesLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdministrativeFeesLedgerModal: React.FC<AdministrativeFeesLedgerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { bookings, properties, isAdmin } = useApp();
  const [selectedPropFilter, setSelectedPropFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Helper to calculate admin fee per booking if not explicitly set
  const getBookingAdminFee = (b: Booking): number => {
    if (b.adminFee !== undefined && b.adminFee !== null) {
      return b.adminFee;
    }
    // Default property administrative fee deduction based on property independent rates
    const prop = properties.find((p) => p.id === b.propertyId);
    if (!prop) return 50 * Math.max(1, b.nightsCount);
    const checkIn = new Date(b.checkInDate);
    const day = checkIn.getDay();
    const isWeekend = day === 4 || day === 5 || day === 6;
    const feePerNight = isWeekend
      ? (prop.administrativeFees?.weekend ?? 100)
      : (prop.administrativeFees?.weekday ?? 50);
    return feePerNight * Math.max(1, b.nightsCount);
  };

  const getNightlyAdminFee = (b: Booking): number => {
    const totalFee = getBookingAdminFee(b);
    return Math.round(totalFee / Math.max(1, b.nightsCount));
  };

  const ledgerRecords = useMemo(() => {
    return bookings
      .filter((b) => b.status !== 'cancelled')
      .map((b) => {
        const totalAdminFee = getBookingAdminFee(b);
        const feePerNight = getNightlyAdminFee(b);
        const grossNightly = Math.round((b.baseNightlyTotal || b.nightlyPrice * b.nightsCount) / Math.max(1, b.nightsCount));
        const netNightly = Math.max(0, grossNightly - feePerNight);
        const grossTotal = grossNightly * b.nightsCount;
        const netTotal = Math.max(0, grossTotal - totalAdminFee);

        return {
          id: b.id,
          bookingNumber: b.bookingNumber,
          propertyName: b.propertyName,
          propertyId: b.propertyId,
          sectionName: b.sectionName,
          customerName: b.customerName,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          nightsCount: b.nightsCount,
          grossNightly,
          feePerNight,
          netNightly,
          grossTotal,
          totalAdminFee,
          netTotal,
          marketerName: b.marketerName || 'الإدارة مباشرة',
          date: b.createdAt || b.checkInDate,
          status: 'محصلة ومودعة بصندوق الإدارة',
        };
      });
  }, [bookings, properties]);

  const filteredRecords = useMemo(() => {
    return ledgerRecords.filter((rec) => {
      const matchProp = selectedPropFilter === 'all' || rec.propertyId === selectedPropFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        rec.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.marketerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProp && matchSearch;
    });
  }, [ledgerRecords, selectedPropFilter, searchQuery]);

  // Aggregate stats
  const totalCollectedFees = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.totalAdminFee, 0);
  }, [filteredRecords]);

  const totalGrossNightsRevenue = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.grossTotal, 0);
  }, [filteredRecords]);

  const totalNetNightsRevenue = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.netTotal, 0);
  }, [filteredRecords]);

  const totalNightsProcessed = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.nightsCount, 0);
  }, [filteredRecords]);

  const handleCopyTableForSheets = () => {
    const headers = [
      'كود الحجز',
      'العقار والوحدة',
      'العميل',
      'تاريخ الدخول',
      'تاريخ الخروج',
      'الليالي',
      'سعر الليلة الإجمالي',
      'الرسم الإداري المقتطع لليلة',
      'صافي سعر الليلة',
      'إجمالي الرسوم الإدارية',
      'صافي دخل الإقامة',
      'المسوق المسؤول',
      'حالة القيد المالي',
    ].join('\t');

    const rows = filteredRecords
      .map((r) =>
        [
          r.bookingNumber,
          r.propertyName,
          r.customerName,
          r.checkInDate,
          r.checkOutDate,
          r.nightsCount,
          r.grossNightly,
          r.feePerNight,
          r.netNightly,
          r.totalAdminFee,
          r.netTotal,
          r.marketerName,
          r.status,
        ].join('\t')
      )
      .join('\n');

    const fullTsv = `${headers}\n${rows}`;
    navigator.clipboard?.writeText(fullTsv);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  if (!isOpen) return null;

  // Strict check: Marketers are NEVER allowed to view this
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-['Tajawal',sans-serif]">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-3 shadow-2xl border border-rose-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">غير مصرح بالوصول</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            هذا الجدول المالي مخصص حصرياً للإدارة العامة للرقابة على الرسوم الإدارية المقتطعة ولا يتاح للمسوقين.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs font-['Tajawal',sans-serif] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-purple-200/90 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-l from-[#250849] via-[#3C1275] to-[#250849] p-4 sm:p-5 text-white flex items-center justify-between border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <Receipt className="w-6 h-6 text-purple-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-white">
                  جدول المعاملات المالية للرسوم الإدارية
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  سري · خاص بالإدارة العامة
                </span>
                <span className="text-[10px] bg-white/15 text-purple-200 font-bold px-2 py-0.5 rounded-full border border-white/10">
                  محجوب تماماً عن المسوقين
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                كشف وتوثيق الرسوم الإدارية المقتطعة من سعر الليلة لكل حجز وصندوق الإدارة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Informational Alert Box */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-3 sm:p-3.5 rounded-2xl border border-purple-200/80 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-purple-950 text-xs block">
                آلية اقتطاع الرسوم الإدارية من سعر الليلة:
              </span>
              <p className="text-[11px] text-purple-900/80 leading-relaxed">
                يتم اقتطاع الرسم الإداري تلقائياً من إجمالي سعر الليلة المعتمد لتمويل مصاريف الإدارة والتشغيل. المسوقون لا يرون هذا العنصر في شاشاتهم أو تقاويمهم، وتظهر لهم فقط أسعار الليلة الصافية والعمولات المعتمدة.
              </p>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>إجمالي الرسوم المقتطعة:</span>
                <Wallet className="w-4 h-4 text-purple-700" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-purple-950">
                  {totalCollectedFees.toLocaleString()}
                </span>
                <span className="text-[10px] text-purple-600 font-bold">ر.س</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">
                ✓ مودعة في صندوق الإدارة
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>إجمالي المبيعات (قبل الخصم):</span>
                <TrendingUp className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                  {totalGrossNightsRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">ر.س</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                إجمالي أسعار الليالي
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>الصافي بعد الرسوم الإدارية:</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                  {totalNetNightsRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">ر.س</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                صافي دخل الإقامة
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>الليالي والمعاملات:</span>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-purple-900">
                  {totalNightsProcessed}
                </span>
                <span className="text-[10px] text-purple-600 font-bold">ليلة ({filteredRecords.length} حجز)</span>
              </div>
              <span className="text-[10px] text-purple-700 font-bold block">
                متوسط: {totalNightsProcessed > 0 ? Math.round(totalCollectedFees / totalNightsProcessed) : 0} ر.س / ليلة
              </span>
            </div>
          </div>

          {/* Filter Bar & Export Actions */}
          <div className="bg-[#FAF8FD] p-3 rounded-2xl border border-purple-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الحجز أو العقار أو العميل..."
                  className="w-full pr-8 pl-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <select
                value={selectedPropFilter}
                onChange={(e) => setSelectedPropFilter(e.target.value)}
                className="bg-white border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-hidden focus:border-purple-600 cursor-pointer shrink-0"
              >
                <option value="all">جميع العقارات</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTableForSheets}
                className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="نسخ الجدول بالكامل ولصقه مباشرة في جدول إكسل أو Google Sheets"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                <span>{copiedSuccess ? '✓ تم النسخ للشيت' : 'نسخ لجدول Sheets/Excel'}</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-2xl border border-purple-200 bg-white shadow-xs">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-purple-50/70 border-b border-purple-100 text-purple-950 font-black text-[11px]">
                  <th className="p-3">كود الحجز</th>
                  <th className="p-3">العقار / القسم</th>
                  <th className="p-3">تاريخ الإقامة</th>
                  <th className="p-3 text-center">الليالي</th>
                  <th className="p-3 text-center">سعر الليلة (إجمالي)</th>
                  <th className="p-3 text-center bg-purple-100/60 text-purple-950 font-black">
                    الرسم الإداري المقتطع
                  </th>
                  <th className="p-3 text-center text-emerald-800">الصافي بعد الرسم</th>
                  <th className="p-3 text-center font-bold text-purple-900">إجمالي الرسوم للحجز</th>
                  <th className="p-3">المسوق المنفذ</th>
                  <th className="p-3 text-center">حالة القيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                      لا توجد معاملات مسجلة مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-purple-950 whitespace-nowrap">
                        {rec.bookingNumber}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{rec.propertyName}</span>
                        {rec.sectionName && (
                          <span className="text-[10px] text-purple-700 block">{rec.sectionName}</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {rec.checkInDate} ← {rec.checkOutDate}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {rec.nightsCount}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                        {rec.grossNightly} ر.س
                      </td>
                      <td className="p-3 text-center font-mono font-black bg-purple-50/80 text-purple-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-purple-200/70 border border-purple-300">
                          -{rec.feePerNight} ر.س
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {rec.netNightly} ر.س
                      </td>
                      <td className="p-3 text-center font-mono font-black text-purple-950 whitespace-nowrap">
                        +{rec.totalAdminFee} ر.س
                      </td>
                      <td className="p-3 text-slate-700 whitespace-nowrap">
                        <span className="block font-medium">{rec.marketerName}</span>
                        <span className="text-[9px] text-slate-400">محجوب عنه الخصم</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>مودعة بصندوق الإدارة</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500 font-medium">
            إجمالي السجلات: <strong>{filteredRecords.length}</strong> معاملة مالية معتمدة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
