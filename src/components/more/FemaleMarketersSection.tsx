import React, { useState, useMemo } from 'react';
import {
  Users,
  Sparkles,
  Award,
  Phone,
  Mail,
  CreditCard,
  Building,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Plus,
  UserPlus,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Wallet,
  Calendar,
  MessageCircle,
  PartyPopper,
  Trash2,
  Tag,
  Pencil,
  CalendarDays,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Marketer, CoordinatorServiceItem } from '../../types';

interface FemaleMarketersSectionProps {
  onOpenGeminiAI?: () => void;
  onOpenContract?: () => void;
}

export const FemaleMarketersSection: React.FC<FemaleMarketersSectionProps> = ({
  onOpenGeminiAI,
  onOpenContract,
}) => {
  const {
    marketers,
    bookings,
    isAdmin,
    userRole,
    currentMarketerId,
    switchUser,
    updateMarketerProfile,
    updateMarketerPermissions,
    addMarketer,
    payMarketerCommission,
    coordinatorServices,
    addCoordinatorService,
    updateCoordinatorService,
    deleteCoordinatorService,
  } = useApp();

  // Known or tagged female marketers list
  const femaleNames = ['سارة', 'ريم', 'نورة', 'منيرة', 'هند', 'مها', 'عبير', 'خلود', 'فاطمة', 'عائشة', 'لطيفة', 'أمل', 'شهد'];
  const femaleMarketers = useMemo(() => {
    return marketers.filter((m) => {
      return (
        femaleNames.some((fn) => m.name.includes(fn)) ||
        m.id === 'm2' ||
        m.id === 'm4' ||
        m.id === 'm5'
      );
    });
  }, [marketers]);

  const [selectedMarketerId, setSelectedMarketerId] = useState<string>(() => {
    if (femaleMarketers.some((m) => m.id === currentMarketerId)) {
      return currentMarketerId;
    }
    return femaleMarketers[0]?.id || marketers[0]?.id || 'm2';
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [payoutModalMarketer, setPayoutModalMarketer] = useState<Marketer | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New marketer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newFalLicense, setNewFalLicense] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newBankName, setNewBankName] = useState('مصرف الراجحي');

  // Coordinator services management state
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(850);
  const [serviceCoordName, setServiceCoordName] = useState('سارة الشمري');
  const [serviceCoordPhone, setServiceCoordPhone] = useState('0551234567');
  const [serviceCategory, setServiceCategory] = useState<CoordinatorServiceItem['category']>('decor');
  const [serviceDescription, setServiceDescription] = useState('');

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim() || !serviceCoordName.trim()) return;

    if (editingServiceId) {
      updateCoordinatorService(editingServiceId, {
        title: serviceTitle.trim(),
        price: Math.max(0, Number(servicePrice)),
        coordinatorName: serviceCoordName.trim(),
        coordinatorPhone: serviceCoordPhone.trim(),
        category: serviceCategory,
        description: serviceDescription.trim(),
      });
      setSuccessToast(`تم تعديل وحفظ خدمة "${serviceTitle}" بنجاح!`);
    } else {
      addCoordinatorService({
        coordinatorId: 'coord-' + Date.now(),
        title: serviceTitle.trim(),
        price: Math.max(0, Number(servicePrice)),
        coordinatorName: serviceCoordName.trim(),
        coordinatorPhone: serviceCoordPhone.trim(),
        category: serviceCategory,
        description: serviceDescription.trim(),
        isActive: true,
      });
      setSuccessToast(`تمت إضافة خدمة "${serviceTitle}" بنجاح وتوفيرها فوراً في شاشة الحجوزات`);
    }

    setTimeout(() => setSuccessToast(null), 3000);
    setServiceTitle('');
    setServiceDescription('');
    setEditingServiceId(null);
    setAddServiceModalOpen(false);
  };

  const selectedMarketer = useMemo(() => {
    return femaleMarketers.find((m) => m.id === selectedMarketerId) || femaleMarketers[0] || marketers[0];
  }, [femaleMarketers, marketers, selectedMarketerId]);

  // Aggregate stats for all female marketers
  const femaleMarketerIds = useMemo(() => femaleMarketers.map((m) => m.id), [femaleMarketers]);
  const femaleBookings = useMemo(() => {
    return bookings.filter((b) => b.marketerId && femaleMarketerIds.includes(b.marketerId));
  }, [bookings, femaleMarketerIds]);

  const totalSales = femaleBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const totalCommissions = femaleBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.marketerCommission || 0), 0);

  const paidCommissions = femaleBookings
    .filter((b) => b.commissionStatus === 'paid')
    .reduce((sum, b) => sum + (b.marketerCommission || 0), 0);

  const pendingCommissions = Math.max(0, totalCommissions - paidCommissions);

  // Stats for selected marketer
  const selectedBookings = useMemo(() => {
    if (!selectedMarketer) return [];
    return bookings.filter((b) => b.marketerId === selectedMarketer.id);
  }, [bookings, selectedMarketer]);

  const selectedSales = selectedBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const selectedTotalComm = selectedBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.marketerCommission || 0), 0);

  const selectedPaidComm = selectedBookings
    .filter((b) => b.commissionStatus === 'paid')
    .reduce((sum, b) => sum + (b.marketerCommission || 0), 0);

  const selectedPendingComm = Math.max(0, selectedTotalComm - selectedPaidComm);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateMarketer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addMarketer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `marketer.${Date.now()}@amasa.sa`,
      nationalId: newNationalId.trim() || '1099887766',
      falLicenseNumber: newFalLicense.trim() || '1100099881',
      bankAccount: newIban.trim() || 'SA0380000000000000000000',
      bankName: newBankName,
    });

    setSuccessToast(`تمت إضافة المسوقة (${newName}) بنجاح وتفعيل كود العمولة 5%!`);
    setAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNationalId('');
    setNewFalLicense('');
    setNewIban('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleConfirmPayout = () => {
    if (!payoutModalMarketer) return;
    payMarketerCommission(payoutModalMarketer.id);
    setSuccessToast(`تم تسجيل صرف وتسوية عمولة (${payoutModalMarketer.name}) بنجاح!`);
    setPayoutModalMarketer(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg text-xs font-bold flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. البطاقة الترحيبية الفاخرة للوحة المسوقات */}
      <div className="bg-gradient-to-r from-[#380E62] via-[#4F138A] to-[#2B0850] p-5 sm:p-6 rounded-3xl text-white shadow-md border border-purple-800/40 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-purple-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Sparkles className="w-7 h-7 text-purple-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white">لوحة المسوقات المعتمدات</h3>
                <span className="text-[11px] bg-amber-400 text-purple-950 font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  عمولة 5% موثقة
                </span>
                <span className="text-[10px] bg-purple-900/80 text-purple-200 font-bold px-2 py-0.5 rounded-full border border-purple-700/60">
                  {femaleMarketers.length} مسوقات نشطات
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                متابعة مبيعات وحجوزات المسوقات، إصدار عقود الوساطة المعتمدة، وسرعة تحويل العمولات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="py-2.5 px-3.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة مسوقة جديدة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. مؤشرات الأداء والعمولات الإجمالية للمسوقات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">إجمالي المبيعات</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            {totalSales.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold">{femaleBookings.length} حجز مؤكد</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">عمولات محققة (5%)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-amber-600">
            {totalCommissions.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </div>
          <span className="text-[10px] text-slate-400">حسب العقود الرسمية</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">تم تحويله للمسوقات</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-600">
            {paidCommissions.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">حسابات بنكية معتمدة</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-900 text-xs mb-1">
            <span className="font-bold">جاهز للصرف الآن</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-purple-950">
            {pendingCommissions.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold">بانتظار التحويل</span>
        </div>
      </div>

      {/* 3. شريط اختيار المسوقة */}
      <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-700" />
            <span>اختر المسوقة لاستعراض ملفها وحساباتها:</span>
          </span>
          <span className="text-[11px] text-purple-700 font-bold">
            {femaleMarketers.length} مسوقات
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {femaleMarketers.map((m) => {
            const isSelected = selectedMarketer?.id === m.id;
            const marketerBookings = bookings.filter((b) => b.marketerId === m.id);
            const comm = marketerBookings
              .filter((b) => b.status !== 'cancelled')
              .reduce((sum, b) => sum + (b.marketerCommission || 0), 0);

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMarketerId(m.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-purple-50/90 border-purple-500 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={m.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'}
                    alt={m.name}
                    className="w-10 h-10 rounded-xl object-cover border border-purple-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{m.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded">
                        {m.code}
                      </span>
                      <span className="text-[10px] text-slate-500">{m.bankName || 'الراجحي'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-black text-amber-600 block">{comm.toLocaleString()} ر.س</span>
                  <span className="text-[10px] text-slate-400">{marketerBookings.length} حجز</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. تفاصيل المسوقة المختارة */}
      {selectedMarketer && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
            <div className="flex items-center gap-3">
              <img
                src={selectedMarketer.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'}
                alt={selectedMarketer.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-300 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{selectedMarketer.name}</h3>
                  <span className="text-[11px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                    كود: {selectedMarketer.code}
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    عمولة: 5%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  رخصة فال: <span className="font-mono font-bold text-slate-700">{selectedMarketer.falLicenseNumber || '1100034921'}</span> · تاريخ الانضمام: {selectedMarketer.joinDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleCopy(selectedMarketer.code, 'code')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-xl border border-purple-200 transition-all flex items-center gap-1 cursor-pointer"
                title="نسخ كود المسوقة"
              >
                {copiedCode === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-purple-700" />}
                <span>{copiedCode === 'code' ? 'تم النسخ!' : 'كود الخصم'}</span>
              </button>

              <a
                href={`https://wa.me/966${selectedMarketer.phone.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً أختي ${selectedMarketer.name}، بخصوص عمولات وحجوزات شاليهات أماسا:`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>واتساب</span>
              </a>

              {isAdmin && selectedPendingComm > 0 && (
                <button
                  type="button"
                  onClick={() => setPayoutModalMarketer(selectedMarketer)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>صرف عمولة ({selectedPendingComm.toLocaleString()} ر.س)</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => switchUser('marketer', selectedMarketer.id)}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  title="الدخول إلى حساب هذه المسوقة"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
                  <span>تبديل لحسابها</span>
                </button>
              )}
            </div>
          </div>

          {/* بطاقات البيانات المصرفية والاتصال */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block mb-0.5">معلومات التواصل:</span>
              <p className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-700" />
                <span>{selectedMarketer.phone}</span>
              </p>
              <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-purple-700" />
                <span>{selectedMarketer.email}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block mb-0.5">الحساب البنكي المعتمد:</span>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purple-700" />
                <span>{selectedMarketer.bankName || 'مصرف الراجحي'}</span>
              </p>
              <p className="text-[11px] text-purple-900 font-mono font-bold mt-1 select-all truncate">
                {selectedMarketer.bankAccount || 'غير مسجل'}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block mb-0.5">حالة العقد والتوثيق:</span>
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>عقد ساري وموثق (5%)</span>
              </p>
              <p className="text-[11px] text-slate-600 mt-1 font-mono">
                رقم: {selectedMarketer.contract?.contractNumber || `MKT-CTR-${selectedMarketer.code}`}
              </p>
            </div>
          </div>

          {/* إدارة صلاحية صفحة التقويم والأسعار للمسوقة / المنسقة */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-amber-50/40 to-purple-50 border border-purple-200 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">صلاحية صفحة التقويم والأسعار</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedMarketer.permissions?.canViewCalendar !== false
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {selectedMarketer.permissions?.canViewCalendar !== false ? 'مفعلة ومعروضة' : 'مخفية عن المسوقة'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    إمكانية إظهار صفحة التقويم وجداول الأسعار في الشريط السفلي والقائمة لحساب ({selectedMarketer.name}) أو حجبها عنها
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentVal = selectedMarketer.permissions?.canViewCalendar !== false;
                  updateMarketerPermissions(selectedMarketer.id, { canViewCalendar: !currentVal });
                  setSuccessToast(`تم ${!currentVal ? 'إظهار' : 'إخفاء'} صفحة التقويم والأسعار للمسوقة ${selectedMarketer.name} بنجاح!`);
                  setTimeout(() => setSuccessToast(null), 3500);
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border self-end sm:self-auto ${
                  selectedMarketer.permissions?.canViewCalendar !== false
                    ? 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                    : 'bg-purple-700 text-white border-purple-800 hover:bg-purple-800'
                }`}
                title="تغيير إتاحة صفحة التقويم والأسعار"
              >
                {selectedMarketer.permissions?.canViewCalendar !== false ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>إخفاء التقويم عنها</span>
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-3.5 h-3.5 text-amber-300" />
                    <span>إظهار التقويم لها</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* جدول الحجوزات الخاصة بالمسوقة */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>حجوزات المسوقة ({selectedBookings.length}):</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                مجموع العمولات: <span className="font-bold text-amber-600">{selectedTotalComm.toLocaleString()} ر.س</span>
              </span>
            </div>

            {selectedBookings.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">لا توجد حجوزات مسجلة لهذه المسوقة حالياً.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                {selectedBookings.slice(0, 5).map((b, idx) => (
                  <div key={`${b.id || 'fm'}-${idx}`} className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{b.customerName}</span>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-bold">
                          {b.bookingNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {b.propertyName} · من {b.checkInDate} إلى {b.checkOutDate}
                      </p>
                    </div>

                    <div className="text-left space-y-0.5">
                      <span className="font-black text-slate-900 block">{b.totalPrice.toLocaleString()} ر.س</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                          عمولة: {b.marketerCommission || Math.round(b.totalPrice * 0.05)} ر.س
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            b.commissionStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {b.commissionStatus === 'paid' ? 'تم الصرف' : 'مستحق'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. عنصر لوحة المسوقات لإدراج وإدارة خدمات وباقات المنسقات */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border-2 border-pink-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  دليل باقات وخدمات المنسقات (إدراج وإدارة الخدمات)
                </h3>
                <span className="text-[10px] bg-pink-100 text-pink-900 font-bold px-2 py-0.5 rounded-full border border-pink-200">
                  لوحة المسوقات
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكن للمسوقات والإدارة إدراج خدمات المنسقات هنا لتظهر تلقائياً كخيارات متعددة في شاشة الحجز
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingServiceId(null);
              setServiceTitle('');
              setServicePrice(850);
              setServiceCoordName('سارة الشمري');
              setServiceCoordPhone('0551234567');
              setServiceCategory('decor');
              setServiceDescription('');
              setAddServiceModalOpen(true);
            }}
            className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ إدراج خدمة منسقة جديدة</span>
          </button>
        </div>

        {/* قائمة الخدمات المتاحة حالياً */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coordinatorServices.map((service) => {
            const cleanPhone = service.coordinatorPhone.replace(/\D/g, '').replace(/^0/, '966');
            const sampleWhatsapp = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `مرحباً أختي ${service.coordinatorName}، نستفسر عن باقة: ${service.title} (${service.price} ر.س) للحجوزات القادمة.`
            )}`;

            return (
              <div
                key={service.id}
                className="bg-gradient-to-br from-[#FFF9FB] via-white to-[#FDF4F8] p-3.5 rounded-2xl border border-pink-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                      {service.title}
                    </h4>
                    <span className="text-xs font-black font-mono text-pink-800 bg-pink-100/80 px-2 py-0.5 rounded-lg shrink-0">
                      {service.price} ر.س
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="pt-2 mt-2 border-t border-pink-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      المنسقة: <strong className="text-slate-900">{service.coordinatorName}</strong>
                    </span>
                    <span className="font-mono text-purple-700 text-[11px] dir-ltr">
                      {service.coordinatorPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href={sampleWhatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>واتساب المنسقة</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceId(service.id);
                      setServiceTitle(service.title);
                      setServicePrice(service.price);
                      setServiceCoordName(service.coordinatorName);
                      setServiceCoordPhone(service.coordinatorPhone);
                      setServiceCategory((service.category as any) || 'decor');
                      setServiceDescription(service.description || '');
                      setAddServiceModalOpen(true);
                    }}
                    className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl transition-colors cursor-pointer"
                    title="تعديل الخدمة والسعر"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف خدمة "${service.title}"؟`)) {
                          deleteCoordinatorService(service.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                      title="حذف الخدمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* مودال إدراج خدمة منسقة جديدة */}
      {addServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-pink-200 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-pink-800 via-purple-900 to-indigo-950 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-400 text-purple-950 flex items-center justify-center font-bold shadow-xs">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingServiceId ? 'تعديل باقة وخدمة منسقة' : 'إدراج خدمة منسقة جديدة'}
                  </h3>
                  <p className="text-[11px] text-pink-200">
                    {editingServiceId ? 'تعديل الأسعار والبيانات لتنعكس فوراً في الحجوزات' : 'إضافة الخدمة لتظهر في خيارات متعددة بشاشة الحجز'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">عنوان / اسم باقة الخدمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: باقة مدخل استقبال بالونات وإضاءات ليزر"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-600 focus:outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">سعر الخدمة الإجمالي (ر.س) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50}
                    placeholder="850"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-600 focus:outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">تصنيف الخدمة</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-600 focus:outline-hidden"
                  >
                    <option value="decor">كوش وديكور وتزيين</option>
                    <option value="hospitality">ضيافة وبوفيه وباريستا</option>
                    <option value="photography">تصوير وتوثيق</option>
                    <option value="music">صوتيات ودي جي</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">اسم المنسقة المسؤولة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سارة الشمري"
                    value={serviceCoordName}
                    onChange={(e) => setServiceCoordName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">رقم جوال المنسقة (واتساب) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="055xxxxxxx"
                    value={serviceCoordPhone}
                    onChange={(e) => setServiceCoordPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">تفاصيل ومواصفات الخدمة (اختياري)</label>
                <textarea
                  rows={3}
                  placeholder="محتويات الباقة، التجهيز قبل كم ساعة، المتطلبات..."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-pink-600 focus:outline-hidden resize-none"
                />
              </div>

              <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 flex items-center gap-2 text-pink-950 text-[11px] font-medium">
                <CheckCircle2 className="w-4 h-4 text-pink-700 shrink-0" />
                <span>ستظهر الخدمة فوراً للمسوقات كاختيار متعدد، مع إمكانية مراسلة المنسقة بنقرة واحدة عبر واتساب.</span>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddServiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-700 hover:bg-pink-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {editingServiceId ? 'حفظ تعديلات الخدمة والسعر' : 'إدراج الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إضافة مسوقة جديدة */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-bold shadow-xs">
                  <UserPlus className="w-5 h-5 text-purple-950" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">إضافة مسوقة معتمدة جديدة</h3>
                  <p className="text-[11px] text-purple-200">تفعيل كود تسويقي فوري وعقد إلكتروني بنسبة 5%</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMarketer} className="p-4 sm:p-6 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">اسم المسوقة الثلاثي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: نورة محمد الدوسري"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">رقم الجوال *</label>
                  <input
                    type="tel"
                    required
                    placeholder="05xxxxxxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="marketer@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">رقم الهوية الوطنية</label>
                  <input
                    type="text"
                    placeholder="10xxxxxxxx"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">رقم ترخيص فال العقاري</label>
                  <input
                    type="text"
                    placeholder="11000xxxxx"
                    value={newFalLicense}
                    onChange={(e) => setNewFalLicense(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">اسم البنك</label>
                  <select
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    <option value="مصرف الراجحي">مصرف الراجحي</option>
                    <option value="البنك الأهلي السعودي">البنك الأهلي السعودي</option>
                    <option value="بنك الإنماء">بنك الإنماء</option>
                    <option value="بنك الرياض">بنك الرياض</option>
                    <option value="بنك البلاد">بنك البلاد</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">رقم الآيبان (IBAN)</label>
                  <input
                    type="text"
                    placeholder="SAxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={newIban}
                    onChange={(e) => setNewIban(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-2 text-purple-950 text-[11px] font-medium">
                <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                <span>سيتم إنشاء عقد وساطة رسمي بنسبة عمولة 5% وتوليد رمز كود تسويقي فوري.</span>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  حفظ وتفعيل المسوقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تأكيد صرف العمولة */}
      {payoutModalMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 p-5 space-y-4 text-xs">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl mx-auto flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">تأكيد تحويل وصرف العمولة</h3>
              <p className="text-slate-500">
                هل تم تحويل مبلغ العمولة المستحق للمسوقة <span className="font-bold text-slate-900">{payoutModalMarketer.name}</span> إلى حسابها البنكي في {payoutModalMarketer.bankName}؟
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">الآيبان:</span>
                <span className="font-bold text-slate-800">{payoutModalMarketer.bankAccount || 'SA0380000000000000000000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المبلغ المستحق:</span>
                <span className="font-bold text-emerald-600 text-xs">{selectedPendingComm.toLocaleString()} ر.س</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayoutModalMarketer(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
              >
                تأكيد واعتماد التحويل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
