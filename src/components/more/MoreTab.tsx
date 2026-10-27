import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Key,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  History,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  Copy,
  Edit,
  Printer,
  Download,
  AlertCircle,
  X,
  CreditCard,
  Building,
  FileCode2,
  FileSpreadsheet,
  Smartphone,
  Database,
  PartyPopper,
  Receipt,
  Send,
  HelpCircle,
  Server,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MarketersTab } from '../marketers/MarketersTab';
import { GuardProfileCard } from './GuardProfileCard';
import { CommissionRequestsSection } from './CommissionRequestsSection';
import { IndividualFilesModal } from '../modals/IndividualFilesModal';
import { GoogleAppSheetModal } from '../modals/GoogleAppSheetModal';
import { CoordinatorsSection } from './CoordinatorsSection';
import { AdministrativeFeesLedgerModal } from './AdministrativeFeesLedgerModal';

interface MoreTabProps {
  onOpenRoleSwitcher: () => void;
  onOpenContract: () => void;
  onOpenGeminiAI?: () => void;
}

export const MoreTab: React.FC<MoreTabProps> = ({ onOpenRoleSwitcher, onOpenContract, onOpenGeminiAI }) => {
  const {
    isAdmin,
    isGuard,
    userRole,
    currentMarketer,
    guard,
    activityLogs,
    marketers,
    bookings,
    setActiveTab,
    openTemplatesModal,
    canViewMarketers,
    canManageTemplates,
    canViewRentalContract,
    canViewActivityLogs,
    updateMarketerProfile,
    updateGuardProfile,
    logout,
    adminBroadcasts,
    setAdminBroadcastModalOpen,
  } = useApp();

  const [selectedMarketerId, setSelectedMarketerId] = useState(
    currentMarketer?.id || marketers[0]?.id || 'm1'
  );
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [contractViewModalOpen, setContractViewModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [financialsModalOpen, setFinancialsModalOpen] = useState(false);
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [appSheetModalOpen, setAppSheetModalOpen] = useState(false);
  const [adminFeesLedgerOpen, setAdminFeesLedgerOpen] = useState(false);
  const [cyberpanelGuideOpen, setCyberpanelGuideOpen] = useState(false);
  const [base44GuideOpen, setBase44GuideOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'admin' | 'marketers' | 'coordinators' | 'guard'>(
    isAdmin ? 'admin' : isGuard ? 'guard' : 'marketers'
  );
  const [showMarketersPanel, setShowMarketersPanel] = useState(true);
  const [showGuardProfile, setShowGuardProfile] = useState(true);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editBankName, setEditBankName] = useState('مصرف الراجحي');
  const [editIban, setEditIban] = useState('');
  const [editContractNum, setEditContractNum] = useState('');
  const [editContractDate, setEditContractDate] = useState('');
  const [editContractExpiry, setEditContractExpiry] = useState('');

  const targetMarketer = marketers.find((m) => m.id === selectedMarketerId) || currentMarketer || marketers[0];

  const openEditModal = () => {
    if (!targetMarketer) return;
    setEditName(targetMarketer.name);
    setEditPhone(targetMarketer.phone);
    setEditEmail(targetMarketer.email);
    setEditNationalId(targetMarketer.nationalId || '1088923412');
    setEditBankName(targetMarketer.bankName || 'مصرف الراجحي');
    setEditIban(targetMarketer.bankAccount || '');
    setEditContractNum(targetMarketer.contract?.contractNumber || `MKT-CTR-2026-${targetMarketer.code.replace('MK-', '')}`);
    setEditContractDate(targetMarketer.contract?.contractDate || '2026-01-15');
    setEditContractExpiry(targetMarketer.contract?.expiryDate || '2027-01-15');
    setEditProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMarketer) return;

    if (!isAdmin) {
      updateMarketerProfile(targetMarketer.id, {
        name: editName,
        phone: editPhone,
        email: editEmail,
        nationalId: editNationalId,
        bankName: editBankName,
        bankAccount: editIban,
      });
      setEditProfileModalOpen(false);
      return;
    }

    updateMarketerProfile(targetMarketer.id, {
      name: editName,
      phone: editPhone,
      email: editEmail,
      nationalId: editNationalId,
      bankName: editBankName,
      bankAccount: editIban,
      contract: {
        contractNumber: editContractNum,
        contractDate: editContractDate,
        expiryDate: editContractExpiry,
        commissionRatePercent: targetMarketer.contract?.commissionRatePercent || 5,
        status: targetMarketer.contract?.status || 'active',
        firstParty: 'إدارة استراحات وشاليهات أماسا (AMASA)',
        firstPartyRepresentative: 'الإدارة العامة والتشغيل',
        secondParty: editName,
        secondPartyPhone: editPhone,
        secondPartyEmail: editEmail,
        secondPartyNationalId: editNationalId,
        isSigned: true,
        signedDate: targetMarketer.contract?.signedDate || editContractDate,
        terms: targetMarketer.contract?.terms || [
          'الالتزام بالأسعار المعتمدة للشاليهات والاستراحات من قبل إدارة AMASA.',
          'يحق للمسوق إنشاء وتعديل عقود الإيجار المعتمدة والتنسيق مع النزلاء.',
          'يحق للمسوق تعديل مبلغ العربون قبل تأكيد الحجز.',
          'تصرف العمولة (5%) من كل حجز مؤكد لحساب المسوق البنكي المعتمد.',
        ],
      },
    });

    setEditProfileModalOpen(false);
  };

  const currentMarketerBookings = bookings.filter((b) => b.marketerId === targetMarketer?.id);
  const totalSales = currentMarketerBookings.filter((b) => b.status !== 'cancelled').reduce((sum, b) => sum + b.totalPrice, 0);
  const totalCommission = currentMarketerBookings.filter((b) => b.status !== 'cancelled').reduce((sum, b) => sum + b.marketerCommission, 0);
  const paidCommission = currentMarketerBookings.filter((b) => b.commissionStatus === 'paid').reduce((sum, b) => sum + b.marketerCommission, 0);
  const pendingCommission = totalCommission - paidCommission;

  return (
    <div className="pb-28 max-w-3xl mx-auto px-3 sm:px-4 pt-3 space-y-4 font-['Tajawal',sans-serif]">
      {/* 1. بطاقة المستخدم الحالية - بتصميم بنفسجي ملكي فخم مطابق للتصميم المرفق */}
      <div className="bg-gradient-to-r from-[#2B0B55] via-[#3C1275] to-[#250849] p-5 sm:p-6 rounded-3xl shadow-md border border-purple-900/50 text-white flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-700/60 border border-purple-400/30 text-white flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
            {isAdmin ? (
              <ShieldCheck className="w-7 h-7 text-amber-300" />
            ) : isGuard ? (
              <Key className="w-7 h-7 text-amber-300" />
            ) : (
              <UserCheck className="w-7 h-7 text-amber-300" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {isAdmin
                ? 'الإدارة العامة'
                : isGuard
                ? `الحارس (${guard.name})`
                : `${currentMarketer?.name} (شاشة الموظف)`}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                {isAdmin
                  ? 'مدير · كامل الصلاحيات'
                  : isGuard
                  ? 'مشرف الميدان والاستلام'
                  : 'مسوق معتمد · عمولة 5%'}
              </span>
            </div>
            <p className="text-xs text-purple-200/90 font-medium mt-1">
              {isAdmin
                ? 'إشراف وتحكم شامل بكافة العمليات'
                : isGuard
                ? `جوال: ${guard.phone} · متابعة دخول وخروج اليوم فقط`
                : `كود المسوق: ${currentMarketer?.code} · عمولة 5% · عقد ساري`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. زري تبديل الحساب وتسجيل الخروج في بطاقة بيضاء نظيفة */}
      <div className="bg-white p-2 rounded-2xl border border-purple-100 shadow-2xs grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenRoleSwitcher}
          className="py-2.5 px-3 bg-purple-50/70 hover:bg-purple-100/70 text-purple-950 border border-purple-200/80 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <UserCheck className="w-4 h-4 text-purple-700" />
          <span>تبديل الحساب</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>[→ تسجيل الخروج</span>
        </button>
      </div>

      {/* 3. شريط الأقسام المنسقة (لوحة الإدارة | لوحة المسوقين | لوحة المنسقات | لوحة الحارس) */}
      <div className="bg-white p-2 rounded-2xl border border-purple-200/90 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {/* قسم 1: لوحة الإدارة */}
          <button
            type="button"
            onClick={() => setActiveSection('admin')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeSection === 'admin'
                ? 'bg-purple-700 text-white shadow-sm font-black'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200/80'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeSection === 'admin' ? 'text-amber-300' : 'text-purple-700'}`} />
            <span>لوحة الإدارة</span>
          </button>

          {/* قسم 2: لوحة المسوقين */}
          <button
            type="button"
            onClick={() => setActiveSection('marketers')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeSection === 'marketers'
                ? 'bg-purple-700 text-white shadow-sm font-black'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Users className={`w-4 h-4 ${activeSection === 'marketers' ? 'text-amber-300' : 'text-purple-700'}`} />
            <span>لوحة المسوقين</span>
          </button>

          {/* قسم 3: لوحة المنسقات */}
          <button
            type="button"
            onClick={() => setActiveSection('coordinators')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeSection === 'coordinators'
                ? 'bg-purple-700 text-white shadow-sm font-black'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200/80'
            }`}
          >
            <PartyPopper className={`w-4 h-4 ${activeSection === 'coordinators' ? 'text-amber-300' : 'text-pink-600'}`} />
            <span>لوحة المنسقات</span>
          </button>

          {/* قسم 4: لوحة الحارس */}
          <button
            type="button"
            onClick={() => setActiveSection('guard')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeSection === 'guard'
                ? 'bg-purple-700 text-white shadow-sm font-black'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Key className={`w-4 h-4 ${activeSection === 'guard' ? 'text-amber-300' : 'text-amber-600'}`} />
            <span>لوحة الحارس</span>
          </button>
        </div>
      </div>

      {/* محتوى القسم الأول: لوحة الإدارة */}
      {activeSection === 'admin' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* بطاقة: مركز التعميمات والقرارات الإدارية للمجموعات */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 rounded-3xl p-4 sm:p-5 text-white shadow-md space-y-3.5 border border-purple-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
                  <span className="text-xl">📢</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <span>مركز التعميمات والقرارات الإدارية</span>
                    <span className="text-[10px] bg-amber-400 text-purple-950 font-black px-2 py-0.5 rounded-full">
                      تنبيه المجموعات
                    </span>
                  </h3>
                  <p className="text-xs text-purple-200">
                    إرسال رسائل وتنبيهات فورية لجميع المسوقين والحراس بالمجموعات لإبلاغهم بالقرارات والتعديلات
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAdminBroadcastModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-purple-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال تعميم جديد للفرق</span>
              </button>
            </div>

            {/* Quick stats & preview */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-[10px] text-purple-200 block">إجمالي التعميمات</span>
                <span className="font-black text-sm text-white font-mono">{adminBroadcasts.length}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-[10px] text-purple-200 block">المجموعات المدعومة</span>
                <span className="font-black text-sm text-amber-300">٦ مجموعات</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <span className="text-[10px] text-purple-200 block">التنبيهات العاجلة</span>
                <span className="font-black text-sm text-rose-300 font-mono">
                  {adminBroadcasts.filter((b) => b.priority === 'urgent').length}
                </span>
              </div>
            </div>
          </div>

          {/* تصنيف: الرسائل والعقود */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-purple-900 px-1 flex items-center gap-1.5">
              <span>الرسائل والعقود</span>
            </h4>

            <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xs border border-purple-100 divide-y divide-purple-50 space-y-1">
              {/* إدارة صيغ وقوالب الرسائل والعقود */}
              {canManageTemplates && (
                <div
                  onClick={() => openTemplatesModal('depositRequest')}
                  className="py-3 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-xs shrink-0">
                      <MessageSquare className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        إدارة صيغ وقوالب الرسائل والعقود
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        تعديل صيغ: طلب العربون · تأكيد الحجز · طلب إكمال الدفع · العقد والتأمين
                      </span>
                    </div>
                  </div>
                  <span className="text-purple-800 font-bold text-xs bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs shrink-0">
                    تعديل القوالب
                  </span>
                </div>
              )}

              {/* عقد إيجار الشاليه والبنود الموحدة للنزلاء */}
              {canViewRentalContract && (
                <div
                  onClick={onOpenContract}
                  className="py-3 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl cursor-pointer transition-all pt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        عقد إيجار الشاليه والبنود الموحدة للنزلاء
                      </span>
                      <span className="text-[11px] text-slate-500">
                        الشروط والتعليمات المعتمدة للنزلاء والتأمين
                      </span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-xs px-2 shrink-0">
                    استعراض
                  </span>
                </div>
              )}

              {/* مساعد ماسة الذكي (Google Gemini) */}
              {onOpenGeminiAI && (
                <div
                  onClick={onOpenGeminiAI}
                  className="py-3 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl cursor-pointer transition-all pt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-xs shrink-0">
                      <Sparkles className="w-5 h-5 text-purple-950" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block flex items-center gap-1.5">
                        <span>مساعد ماسة الذكي (Google Gemini)</span>
                        <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.2 rounded-full font-bold">ذكاء اصطناعي</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        صياغة رسائل الواتساب، عروض الشاليهات الترويجية، تأكيد الحجز والترحيب بالنزلاء
                      </span>
                    </div>
                  </div>
                  <span className="text-purple-900 font-bold text-xs bg-gradient-to-r from-amber-100 to-purple-100 border border-amber-300 px-3 py-1.5 rounded-xl shadow-2xs shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>فتح المساعد</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* تصنيف: المتابعة والرقابة */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-purple-900 px-1 flex items-center gap-1.5">
              <span>المتابعة والرقابة</span>
            </h4>

            <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xs border border-purple-100 divide-y divide-purple-50 space-y-1">
              {/* سجل العمليات والصلاحيات */}
              {canViewActivityLogs && (
                <div
                  onClick={() => setLogsModalOpen(true)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        سجل العمليات والصلاحيات (Audit Log)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        متابعة الحجوزات المسجلة وتعديل الصلاحيات بالوقت والتاريخ
                      </span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-xs px-2 shrink-0">
                    عرض ({activityLogs.length})
                  </span>
                </div>
              )}

              {/* كشف حساب العمولات والتقارير المالية */}
              {!isGuard && (
                <div
                  onClick={() => setFinancialsModalOpen(true)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl cursor-pointer transition-all pt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        كشف حساب العمولات والتقارير المالية
                      </span>
                      <span className="text-[11px] text-slate-500">
                        جدول تدقيق مستحقات المسوقين وصرف المبالغ
                      </span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-xs px-2 shrink-0">
                    عرض
                  </span>
                </div>
              )}

              {/* جدول المعاملات المالية للرسوم الإدارية (خاص بالإدارة ومخفي عن المسوقين) */}
              {isAdmin && userRole !== 'marketer' && (
                <div
                  onClick={() => setAdminFeesLedgerOpen(true)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl cursor-pointer transition-all pt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-purple-950 flex items-center justify-center shadow-xs shrink-0 font-bold">
                      <Receipt className="w-5 h-5 text-purple-950" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block flex items-center gap-1.5">
                        <span>جدول المعاملات المالية للرسوم الإدارية</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full font-bold">
                          خاص بالإدارة · مخفي عن المسوقين
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        جدول محاسبي مستقل لمتابعة الرسوم الإدارية المقتطعة من سعر كل ليلة وتدقيق الصافي
                      </span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-xs bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs shrink-0 flex items-center gap-1">
                    <span>فتح الجدول المالي</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}

              {/* الربط مع منصة Google AppSheet */}
              {isAdmin && (
                <div
                  onClick={() => setAppSheetModalOpen(true)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-emerald-50/50 rounded-2xl cursor-pointer transition-all pt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        الربط مع منصة Google AppSheet و Workspace
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        مزامنة حية مع جداول Google Sheets وتطبيق الهاتف
                      </span>
                    </div>
                  </div>
                  <span className="text-emerald-800 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs shrink-0">
                    إعدادات الربط
                  </span>
                </div>
              )}

              {/* حزمة النشر على منصة Base44 (base44.com) */}
              <div className="py-3 px-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block flex items-center gap-2">
                      <span>حزمة النشر على Base44 (base44.com)</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-950 font-black px-2 py-0.2 rounded-full">
                        منصة Base44 / GitHub
                      </span>
                    </span>
                    <span className="text-[11px] text-indigo-900/80">
                      ملف amasa-base44.zip يحتوي الكود المصدري الأصلي المهيأ لربطه بمنصة Base44 مباشرة عبر GitHub
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => setBase44GuideOpen(true)}
                    className="px-3 py-2 bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-900 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-700" />
                    <span>طريقة الربط بـ Base44</span>
                  </button>
                  <a
                    href="/download/base44"
                    download="amasa-base44.zip"
                    className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل amasa-base44.zip</span>
                  </a>
                </div>
              </div>

              {/* حزمة النشر المباشر على CyberPanel */}
              <div className="py-3 px-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block flex items-center gap-2">
                      <span>حزمة النشر على CyberPanel (سايبر بانل)</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.2 rounded-full">
                        جاهز للرفع فوراً
                      </span>
                    </span>
                    <span className="text-[11px] text-emerald-900/80">
                      ملف amasa-cyberpanel.zip مجهز ومضغوط للرفع في public_html مع .htaccess مهيأ لـ OpenLiteSpeed
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCyberpanelGuideOpen(true)}
                    className="px-3 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>طريقة التثبيت</span>
                  </button>
                  <a
                    href="/download/cyberpanel"
                    download="amasa-cyberpanel.zip"
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل amasa-cyberpanel.zip</span>
                  </a>
                </div>
              </div>

              {/* تحميل ملفات المشروع ونسخة الإنتاج */}
              {isAdmin && (
                <div
                  onClick={() => setFilesModalOpen(true)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl cursor-pointer transition-all pt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        تحميل ملفات المشروع ونسخة الإنتاج (dist.zip)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        استعراض وتحميل نسخة الإنتاج الجاهزة للاستضافة والكود المصدري
                      </span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-xs px-2 shrink-0">
                    استعراض الملفات
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* محتوى القسم الثاني: لوحة المسوقين */}
      {activeSection === 'marketers' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    لوحة المسوقين والعمولات
                  </h3>
                  <p className="text-xs text-purple-900 font-medium">
                    إدارة المسوقين والملفات الشخصية
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('marketers')}
                className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="فتح في شاشة مستقلة كاملة"
              >
                تكبير ↗
              </button>
            </div>

            <div className="pt-1">
              <MarketersTab embedded={true} onOpenGeminiAI={onOpenGeminiAI} />
            </div>
          </div>
        </div>
      )}

      {/* محتوى القسم: لوحة المنسقات */}
      {activeSection === 'coordinators' && (
        <CoordinatorsSection onOpenGeminiAI={onOpenGeminiAI} />
      )}

      {/* محتوى القسم: لوحة الحارس */}
      {activeSection === 'guard' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center shadow-xs">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  لوحة الحارس أبو راشد (مشرف الميدان والاستلام)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                </p>
              </div>
            </div>

            <div className="pt-1">
              <GuardProfileCard guard={guard} isAdmin={isAdmin} onSave={updateGuardProfile} />
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModalOpen && targetMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-5 text-white flex items-center justify-between border-b border-purple-900/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-400/30 flex items-center justify-center text-white shadow-md">
                  <UserCheck className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">الملف الشخصي للموظف</h3>
                  <p className="text-xs text-purple-200">
                    بيانات الموظف، رقم الجوال، إيميل الدخول، والعقد المبرم مع الإدارة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{targetMarketer.name}</h4>
                  <span className="text-xs text-purple-700 font-mono font-bold">{targetMarketer.code}</span>
                  <p className="text-slate-500 mt-1">تاريخ الانضمام: {targetMarketer.joinDate}</p>
                </div>
                <button
                  onClick={openEditModal}
                  className="px-3 py-1.5 bg-white text-purple-900 border border-purple-200 rounded-xl font-bold cursor-pointer hover:bg-purple-50"
                >
                  تعديل البيانات
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 block">رقم الجوال:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{targetMarketer.phone}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 block">البريد الإلكتروني:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{targetMarketer.email}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 block">رقم الهوية:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{targetMarketer.nationalId}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] text-slate-500 block">البنك المعتمد:</span>
                  <span className="text-sm font-bold text-slate-900">{targetMarketer.bankName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 col-span-2">
                  <span className="text-[11px] text-slate-500 block">رقم الآيبان (IBAN):</span>
                  <span className="text-xs font-bold text-purple-900 font-mono select-all">
                    {targetMarketer.bankAccount || 'غير مسجل'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Viewer Modal */}
      {contractViewModalOpen && targetMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-4 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">عقد وساطة وتسويق موثق</h4>
                <span className="text-xs text-purple-200 font-mono">{targetMarketer.contract?.contractNumber}</span>
              </div>
              <button
                onClick={() => setContractViewModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <span className="font-serif font-bold text-purple-900 text-xs">AMASA RESORTS & CHALETS</span>
                <h3 className="text-base font-black text-slate-900">عقد تسويق وإدارة حجوزات الشاليهات</h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  رقم: {targetMarketer.contract?.contractNumber} · تاريخ: {targetMarketer.contract?.contractDate}
                </p>
              </div>

              <div className="space-y-2 text-slate-700 bg-slate-50 p-4 rounded-2xl">
                <p className="font-bold text-purple-950 mb-1">بنود العقد المعتمدة:</p>
                {(targetMarketer.contract?.terms || []).map((term, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {idx + 1}. {term}
                  </p>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn-mauve-shiny flex-1 py-2 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة العقد</span>
              </button>
              <button
                onClick={() => setContractViewModalOpen(false)}
                className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-slate-900">تعديل بيانات الملف والعقد</h4>
              <button onClick={() => setEditProfileModalOpen(false)} className="text-slate-500">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجوال:</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهوية:</label>
                  <input
                    type="text"
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">البنك:</label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الآيبان (IBAN):</label>
                <input
                  type="text"
                  value={editIban}
                  onChange={(e) => setEditIban(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              {isAdmin && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                  <span className="font-bold text-purple-900 block">بيانات العقد (للإدارة فقط):</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editContractNum}
                      onChange={(e) => setEditContractNum(e.target.value)}
                      placeholder="رقم العقد"
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                    <input
                      type="date"
                      value={editContractDate}
                      onChange={(e) => setEditContractDate(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                    <input
                      type="date"
                      value={editContractExpiry}
                      onChange={(e) => setEditContractExpiry(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-mauve-shiny flex-1 py-2 text-white font-bold rounded-xl cursor-pointer">
                  حفظ البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {logsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 shadow-2xl border border-purple-100 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-700" />
                <span>سجل النشاطات والعمليات</span>
              </h4>
              <button onClick={() => setLogsModalOpen(false)} className="text-slate-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{log.details}</p>
                  <span className="text-[10px] text-purple-700 font-semibold block">
                    بواسطة: {log.actorName} ({log.actorRole === 'admin' ? 'الإدارة' : 'موظف'})
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLogsModalOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Financials Summary Modal */}
      {financialsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-purple-900">تقرير العمولات والمبيعات</h4>
              <button onClick={() => setFinancialsModalOpen(false)} className="text-slate-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-purple-50 p-3.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-purple-700 block">إجمالي مبيعاتك:</span>
                  <span className="text-base font-bold text-purple-950 font-mono">{totalSales.toLocaleString()} ر.س</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block">إجمالي العمولات (5%):</span>
                  <span className="text-base font-bold text-emerald-800 font-mono">{totalCommission.toLocaleString()} ر.س</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">المصروفة (محوّلة):</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{paidCommission.toLocaleString()} ر.س</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block">المعلقة:</span>
                  <span className="text-sm font-bold text-amber-800 font-mono">{pendingCommission.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setFinancialsModalOpen(false)}
              className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Individual Files Downloader Modal */}
      <IndividualFilesModal
        isOpen={filesModalOpen}
        onClose={() => setFilesModalOpen(false)}
      />

      {/* Google AppSheet & Google Workspace Modal */}
      <GoogleAppSheetModal
        isOpen={appSheetModalOpen}
        onClose={() => setAppSheetModalOpen(false)}
      />

      {/* Administrative Fees Financial Ledger Modal */}
      <AdministrativeFeesLedgerModal
        isOpen={adminFeesLedgerOpen}
        onClose={() => setAdminFeesLedgerOpen(false)}
      />

      {/* CyberPanel Quick Deployment Guide Modal */}
      {cyberpanelGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden text-right">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center">
                  <Server className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">دليل الرفع على CyberPanel (سايبر بانل)</h3>
                  <p className="text-[11px] text-emerald-200/80">خطوات تشغيل نظام شاليهات ماسة خلال دقيقة واحدة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCyberpanelGuideOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Steps */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-emerald-950 block text-xs sm:text-sm">الملف المخصص: amasa-cyberpanel.zip</span>
                  <span className="text-[11px] text-emerald-800">مجهّز بملف .htaccess وقواعد SPA Rewrite لسيرفر OpenLiteSpeed</span>
                </div>
                <a
                  href="/download/cyberpanel"
                  download="amasa-cyberpanel.zip"
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الآن</span>
                </a>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">الدخول إلى CyberPanel</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">افتح لوحة تحكم سيرفرك (مثال: https://your-server-ip:8090) وسجل الدخول.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">فتح مدير الملفات (File Manager)</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">من القائمة الجانبية: Websites ← List Websites ← اضغط على زر File Manager بجانب نطاق موقعك.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">الدخول إلى مجلد public_html ورفع الملف</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">ادخل إلى مجلد <code className="bg-slate-100 text-purple-900 px-1 py-0.5 rounded font-mono font-bold">public_html</code> واضغط على Upload وارفع ملف <code className="bg-slate-100 text-purple-900 px-1 py-0.5 rounded font-mono font-bold">amasa-cyberpanel.zip</code>.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">فك الضغط (Extract) مباشرة</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">اضغط بالزر الأيمن على الملف ثم اختر <strong className="text-slate-900">Extract</strong> داخل مجلد <code className="bg-slate-100 text-purple-900 px-1 py-0.5 rounded font-mono font-bold">public_html</code> لتستقر الملفات مباشرة فيه.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
                  <div>
                    <h5 className="font-bold text-emerald-950 text-xs sm:text-sm">إعادة تشغيل OpenLiteSpeed (مهم جداً)</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">من القائمة الجانبية: Server Status ← LiteSpeed Status ثم اضغط <strong className="text-emerald-900">Restart OpenLiteSpeed</strong> أو اضغط Fix Permissions من مدير الملفات لتفعيل ملف الـ .htaccess وحماية الروابط.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 text-[11px] text-purple-950 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الموقع سيعمل مباشرة بنسبة 100% وبسرعة قصوى!</span>
                </span>
                <p className="text-slate-600">كافة الإعدادات والواجهات والخطوط (Tajawal) متضمنة بالكامل داخل الحزمة دون الحاجة لتثبيت برامج إضافية على السيرفر.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCyberpanelGuideOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                إغلاق
              </button>
              <a
                href="/download/cyberpanel"
                download="amasa-cyberpanel.zip"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف amasa-cyberpanel.zip</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Base44 Guide Modal */}
      {base44GuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-indigo-100 overflow-hidden font-['Tajawal',sans-serif]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-800 via-indigo-900 to-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">دليل الرفع على منصة Base44 (base44.com)</h3>
                  <p className="text-[11px] text-indigo-200/80">ربط الكود المصدري الأصلي ونشر الموقع عبر GitHub أو CLI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBase44GuideOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Steps */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-indigo-950 block text-xs sm:text-sm">الملف المخصص: amasa-base44.zip</span>
                  <span className="text-[11px] text-indigo-800">الكود المصدري الكامل مع كافة التبعات والملفات الثابتة جاهز للاستيراد في Base44</span>
                </div>
                <a
                  href="/download/base44"
                  download="amasa-base44.zip"
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الآن</span>
                </a>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">تحميل وفك ضغط حزمة Base44</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">قم بتحميل ملف <code className="bg-slate-100 text-indigo-900 px-1 py-0.5 rounded font-mono font-bold">amasa-base44.zip</code> وفك ضغطه على جهازك.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">رفع الكود إلى مستودع GitHub خاص بك</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">أنشئ مستودعاً جديداً على GitHub وارفع الملفات إليه (عبر Git أو GitHub Desktop أو رفع الملفات مباشرة).</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">فتح Base44 والربط المباشر</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">سجل دخولك إلى <strong className="text-indigo-900">base44.com</strong>، وفي الصفحة الرئيسية اضغط على علامة <strong className="text-slate-900">(+)</strong> واختر <strong className="text-indigo-900">Connect your repo</strong> أو الصق رابط المستودع.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div>
                    <h5 className="font-bold text-emerald-950 text-xs sm:text-sm">التشغيل التلقائي والمعاينة الحية</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">ستقوم منصة Base44 تلقائياً بالتعرف على إعدادات Vite و Tailwind وبناء المشروع وتوفير رابط فوري ومجاني مع ميزة ربط Custom Domain في أي وقت.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 text-[11px] text-purple-950 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>متوافق تماماً مع بنية Base44 السحابية</span>
                </span>
                <p className="text-slate-600">تم تضمين ملف BASE44_GUIDE.md داخل الحزمة ومراجعة التبعات لضمان عدم حدوث أي تعارض عند بناء التطبيق.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setBase44GuideOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                إغلاق
              </button>
              <a
                href="/download/base44"
                download="amasa-base44.zip"
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف amasa-base44.zip</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
