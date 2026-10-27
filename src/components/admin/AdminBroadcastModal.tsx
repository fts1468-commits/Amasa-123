import React, { useState } from 'react';
import {
  X,
  Send,
  Users,
  Shield,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Share2,
  Trash2,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  Building2,
  ChevronDown,
  Bell,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  BroadcastTargetGroup,
  BroadcastPriority,
  BroadcastCategory,
  AdminBroadcastMessage,
} from '../../types';

interface AdminBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({ isOpen, onClose }) => {
  const {
    adminBroadcasts,
    sendAdminBroadcast,
    deleteAdminBroadcast,
    marketers,
    guardsList,
    properties,
    isAdmin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Form states
  const [targetGroup, setTargetGroup] = useState<BroadcastTargetGroup>('all');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('al-taraf');
  const [selectedGuardId, setSelectedGuardId] = useState<string>('g1');
  const [selectedMarketerIds, setSelectedMarketerIds] = useState<string[]>([]);
  const [category, setCategory] = useState<BroadcastCategory>('decision');
  const [priority, setPriority] = useState<BroadcastPriority>('urgent');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [whatsappShareUrl, setWhatsappShareUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset templates
  const presets = [
    {
      title: 'توحيد أوقات الدخول والخروج الرسمية',
      category: 'decision' as BroadcastCategory,
      priority: 'urgent' as BroadcastPriority,
      targetGroup: 'all' as BroadcastTargetGroup,
      content:
        'تقرر رسمياً توحيد وقت الدخول لجميع الاستراحات والشاليهات في تمام الساعة ٤:٠٠ عصراً، ووقت الخروج في تمام الساعة ١٢:٠٠ ظهراً. نرجو من كافة المسوقين والحراس الالتزام التام بهذه المواعيد وإبلاغ النزلاء بها مسبقاً لضمان تجهيز الوحدات.',
    },
    {
      title: 'إلزامية معاينة التأمين وتوثيق التلفيات بالصور قبل الإعادة',
      category: 'instruction' as BroadcastCategory,
      priority: 'urgent' as BroadcastPriority,
      targetGroup: 'all_guards' as BroadcastTargetGroup,
      content:
        'تعميم هام لحراس العقارات: يُمنع منعاً باتاً إعادة أي مبلغ تأمين للنزيل قبل إجراء الفحص الشامل لمحتويات الاستراحة والمسبح، وفي حال وجود أي تلفيات أو عبث يجب تصويرها وتوثيقها عبر خانة المعاينة بالتطبيق قبل تسجيل الخروج.',
    },
    {
      title: 'تعليمات استلام مبالغ الكاش المتبقية عند البوابة',
      category: 'alert' as BroadcastCategory,
      priority: 'important' as BroadcastPriority,
      targetGroup: 'all_guards' as BroadcastTargetGroup,
      content:
        'تنبيه تشغيلي للحراس: عند حضور العميل ودفع المبلغ المتبقي نقداً (كاش) عند البوابة، يجب الدخول فوراً على خانة الحجز والضغط على "استلام الكاش عند البوابة" وتأكيد الاستلام لتصل إشعارات السداد للإدارة والمسوقين.',
    },
    {
      title: 'تحديث شروط حجز عربون الـ 20 دقيقة وسرعة المتابعة',
      category: 'update' as BroadcastCategory,
      priority: 'important' as BroadcastPriority,
      targetGroup: 'all_marketers' as BroadcastTargetGroup,
      content:
        'توجيه لفريق المسوقين: مهلة انتظار تحويل العربون هي ٢٠ دقيقة فقط، ويلغى الحجز المؤقت تلقائياً بعد انتهاء المهلة. يرجى متابعة العميل خلال هذه الفترة للتأكد من إرفاق إيصال التحويل البنكي.',
    },
    {
      title: 'آلية اعتماد عمولة المسوقين 7% بعد خروج النزيل',
      category: 'instruction' as BroadcastCategory,
      priority: 'normal' as BroadcastPriority,
      targetGroup: 'female_marketers' as BroadcastTargetGroup,
      content:
        'توجيه لفريق مسوقات حمران: تبدأ نسبة العمولة بـ 5%، ولا تُعتمد نسبة الـ 7% إلا بعد موافقة الإدارة والتأكد من كون الحجز كاملاً بعد مغادرة النزيل تماماً والتأكد من سلامة الاستراحة.',
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setContent(preset.content);
    setCategory(preset.category);
    setPriority(preset.priority);
    setTargetGroup(preset.targetGroup);
  };

  const handleToggleMarketerSelect = (id: string) => {
    setSelectedMarketerIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let targetPropName = '';
    if (targetGroup === 'specific_guard') {
      const p = properties.find((it) => it.id === selectedPropertyId);
      targetPropName = p ? p.name : '';
    }

    const res = sendAdminBroadcast({
      title: title.trim(),
      content: content.trim(),
      targetGroup,
      targetPropertyId: targetGroup === 'specific_guard' ? selectedPropertyId : undefined,
      targetPropertyName: targetGroup === 'specific_guard' ? targetPropName : undefined,
      targetGuardId: targetGroup === 'specific_guard' ? selectedGuardId : undefined,
      targetMarketerIds: targetGroup === 'custom' ? selectedMarketerIds : undefined,
      priority,
      category,
      effectiveDate,
      sendWhatsapp,
    });

    setSuccessMessage(res.message);
    if (res.whatsappUrl) {
      setWhatsappShareUrl(res.whatsappUrl);
    }

    // Reset fields after sending
    setTitle('');
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-purple-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 p-4 sm:p-5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
              <span className="text-xl">📢</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  مركز التعميمات والقرارات الإدارية للفرق
                </h3>
                <span className="text-[10px] bg-amber-400 text-purple-950 font-black px-2 py-0.5 rounded-full">
                  خاص بالإدارة
                </span>
              </div>
              <p className="text-xs text-purple-200 font-medium mt-0.5">
                إرسال تنبيهات وقرارات رسمية للمسوقين وحراس العقارات حسب المجموعات المستهدفة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-purple-50/70 p-2 border-b border-purple-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-purple-700 text-white shadow-sm font-black'
                : 'bg-white hover:bg-purple-100/60 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>صياغة تعميم جديد للمجموعات</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-purple-700 text-white shadow-sm font-black'
                : 'bg-white hover:bg-purple-100/60 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>سجل القرارات والتعميمات السابقة</span>
            <span className="text-[10px] bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded-full font-bold">
              {adminBroadcasts.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {successMessage && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-sm">{successMessage}</span>
                </div>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                تم توزيع التعميم فورياً على إشعارات أعضاء المجموعة المستهدفة وإطلاق رنة التنبيه الصوتية وتوثيق العملية في سجل العمليات.
              </p>
              {whatsappShareUrl && (
                <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-2">
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>📱 إرسال نص التعميم عبر واتساب المجموعات</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(whatsappShareUrl);
                      alert('تم نسخ رابط الرسالة بنجاح');
                    }}
                    className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl text-emerald-900 font-bold text-xs hover:bg-emerald-50"
                  >
                    نسخ الرابط
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Target Group Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-700" />
                    <span>١. تحديد المجموعة المستهدفة لاستلام التنبيه:</span>
                  </span>
                  <span className="text-[11px] text-purple-700 font-medium">
                    (تصل الرسالة للمجموعة المختارة فقط)
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Option 1: Everyone */}
                  <button
                    type="button"
                    onClick={() => setTargetGroup('all')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      targetGroup === 'all'
                        ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-300/60 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">🌟</span>
                      {targetGroup === 'all' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900 block text-xs">
                      الجميع (كامل الفريق)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      جميع المسوقين والحراس
                    </span>
                  </button>

                  {/* Option 2: All Marketers */}
                  <button
                    type="button"
                    onClick={() => setTargetGroup('all_marketers')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      targetGroup === 'all_marketers'
                        ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-300/60 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">👩‍💼</span>
                      {targetGroup === 'all_marketers' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900 block text-xs">
                      جميع المسوقات والمسوقين
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {marketers.length} مسوقة ومسوق معتمد
                    </span>
                  </button>

                  {/* Option 3: All Guards */}
                  <button
                    type="button"
                    onClick={() => setTargetGroup('all_guards')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      targetGroup === 'all_guards'
                        ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-300/60 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">🛡️</span>
                      {targetGroup === 'all_guards' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900 block text-xs">
                      جميع حراس العقارات
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {guardsList.length} حراس مسؤولين
                    </span>
                  </button>

                  {/* Option 4: Specific Property Guard */}
                  <button
                    type="button"
                    onClick={() => setTargetGroup('specific_guard')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      targetGroup === 'specific_guard'
                        ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-300/60 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">🏡</span>
                      {targetGroup === 'specific_guard' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900 block text-xs">
                      حارس عقار محدد
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      توجيه لعقار واستراحة بعينها
                    </span>
                  </button>

                  {/* Option 5: Hamran Female Marketers */}
                  <button
                    type="button"
                    onClick={() => setTargetGroup('female_marketers')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      targetGroup === 'female_marketers'
                        ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-300/60 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">💼</span>
                      {targetGroup === 'female_marketers' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900 block text-xs">
                      مسوقات حمران فقط
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      فريق تسويق استراحة حمران
                    </span>
                  </button>

                  {/* Option 6: Custom Select */}
                  <button
                    type="button"
                    onClick={() => setTargetGroup('custom')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      targetGroup === 'custom'
                        ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-300/60 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">🎯</span>
                      {targetGroup === 'custom' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900 block text-xs">
                      اختيار مخصص بالأسماء
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      تحديد أعضاء بعينهم
                    </span>
                  </button>
                </div>

                {/* Sub-selectors based on group */}
                {targetGroup === 'specific_guard' && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 mt-2 animate-in fade-in">
                    <span className="font-bold text-amber-950 text-xs block">
                      اختر العقار لتوجيه التنبيه لحارسه المسؤول فقط:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {properties.map((p) => {
                        const isSelected = selectedPropertyId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPropertyId(p.id);
                              if (p.assignedGuardId) setSelectedGuardId(p.assignedGuardId);
                            }}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all text-right cursor-pointer ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100/50'
                            }`}
                          >
                            <span className="block truncate">{p.name}</span>
                            <span className="block text-[10px] opacity-80 font-normal">
                              {p.assignedGuardName ? `الحارس: ${p.assignedGuardName}` : 'بدون حارس'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {targetGroup === 'custom' && (
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-2 mt-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-xs">
                        اختر المسوقين المستهدفين ({selectedMarketerIds.length} محدد):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedMarketerIds.length === marketers.length) {
                            setSelectedMarketerIds([]);
                          } else {
                            setSelectedMarketerIds(marketers.map((m) => m.id));
                          }
                        }}
                        className="text-[11px] text-purple-700 font-bold hover:underline"
                      >
                        {selectedMarketerIds.length === marketers.length ? 'إلغاء التحديد' : 'تحديد الكل'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-purple-100">
                      {marketers.map((m) => {
                        const isChecked = selectedMarketerIds.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-purple-100 text-purple-950 border-purple-300 font-bold'
                                : 'hover:bg-slate-50 border-slate-100 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleMarketerSelect(m.id)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span className="truncate">{m.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-700" />
                    <span>تصنيف التنبيه / الفئة:</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BroadcastCategory)}
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="decision">📜 قرار إداري رسمي</option>
                    <option value="alert">🚨 تنبيه تشغيلي عاجل</option>
                    <option value="update">🔄 تعديل في الشروط أو الأسعار</option>
                    <option value="instruction">💡 توجيهات وتعليمات عمل</option>
                    <option value="general">📢 تعميم عام</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>درجة الأهمية والأولوية:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPriority('urgent')}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        priority === 'urgent'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                      }`}
                    >
                      🔴 عاجل وفوري
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('important')}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        priority === 'important'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      🟡 تنبيه هام
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('normal')}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        priority === 'normal'
                          ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50'
                      }`}
                    >
                      🔵 إشعار عادي
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets / Templates */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>نماذج وقوالب قرارات جاهزة وسريعة (اضغط للتعبئة):</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {preset.title.split(':')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Effective Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800 text-xs block">
                    عنوان القرار أو التنبيه:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قرار إداري بتوحيد أوقات الدخول والخروج لكافة الشاليهات..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-xs block">
                    تاريخ السريان:
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    نص القرار / تفاصيل التنبيه والتعديلات الجديدة:
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {content.length} حرف
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="اكتب هنا تفاصيل القرار، التعديلات الجديدة، أو التعليمات المطلوبة من المسوقين أو الحراس بالتفصيل..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* WhatsApp & Alert Options */}
              <div className="p-3 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 rounded-2xl border border-purple-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      تجهيز رابط واتساب لمشاركة التعميم في المجموعات
                    </span>
                    <span className="text-[10px] text-slate-500">
                      يولد رابط مباشر بصيغة رسمية معتمدة لمشاركته فورياً في مجموعات الواتساب
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendWhatsapp}
                  onChange={(e) => setSendWhatsapp(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !content.trim()}
                  className="btn-mauve-shiny px-6 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال وتعميم القرار الآن</span>
                </button>
              </div>
            </form>
          ) : (
            /* History Archive Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-slate-800 text-xs">
                  أرشيف التعميمات والقرارات الصادرة من الإدارة:
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {adminBroadcasts.length} قرار معتمد
                </span>
              </div>

              {adminBroadcasts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <span>لا توجد تعميمات سابقة مسجلة</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {adminBroadcasts.map((bc) => {
                    const isUrgent = bc.priority === 'urgent';
                    const isImportant = bc.priority === 'important';

                    const categoryBadge =
                      bc.category === 'decision'
                        ? 'قرار إداري'
                        : bc.category === 'alert'
                        ? 'تنبيه تشغيلي'
                        : bc.category === 'update'
                        ? 'تعديل شروط'
                        : 'توجيهات';

                    return (
                      <div
                        key={bc.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isUrgent
                            ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                            : isImportant
                            ? 'bg-amber-50/50 border-amber-200 shadow-2xs'
                            : 'bg-white border-purple-100 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isImportant
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-purple-100 text-purple-900 border border-purple-200'
                              }`}
                            >
                              {isUrgent ? '🔴 عاجل' : isImportant ? '🟡 هام' : '🔵 عادي'}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                              {categoryBadge}
                            </span>
                            <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md">
                              موجّه لـ: {bc.targetGroupName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {bc.sentAt}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من حذف هذا التعميم من السجل والإشعارات؟')) {
                                    deleteAdminBroadcast(bc.id);
                                  }
                                }}
                                className="p-1 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="حذف التعميم"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mt-2">
                          {bc.title}
                        </h4>

                        <p className="text-slate-600 mt-1.5 text-xs leading-relaxed whitespace-pre-line">
                          {bc.content}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>المرسل: <strong>{bc.senderName}</strong></span>
                            <span>•</span>
                            <span>ساري من: <strong>{bc.effectiveDate}</strong></span>
                          </div>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `*📢 تعميم إداري: ${bc.title}*\n\n${bc.content}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#1E7E52] hover:underline font-bold flex items-center gap-1"
                          >
                            <span>مشاركة واتساب</span>
                            <Share2 className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">
            تنبيه: التعميمات العاجلة تظهر كبانر أعلى الشاشة لجميع المستهدفين لحين تأكيد الاطلاع.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
