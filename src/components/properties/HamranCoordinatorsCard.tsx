import React, { useState } from 'react';
import {
  PartyPopper,
  Sparkles,
  Phone,
  MessageCircle,
  Star,
  CheckCircle2,
  Calendar,
  Building,
  HeartHandshake,
  Clock,
  Plus,
  Send,
  X,
  CreditCard,
  Layers,
} from 'lucide-react';
import { INITIAL_COORDINATORS, INITIAL_COORDINATION_TASKS } from '../../data/mock';
import { Coordinator, CoordinationTask } from '../../types';

interface HamranCoordinatorsCardProps {
  propertyName: string;
  activeSectionName?: string;
  onOpenBookingWithCoord?: (coordinatorName: string, serviceTitle: string) => void;
}

export const HamranCoordinatorsCard: React.FC<HamranCoordinatorsCardProps> = ({
  propertyName,
  activeSectionName,
  onOpenBookingWithCoord,
}) => {
  const [coordinators] = useState<Coordinator[]>(() => {
    try {
      const saved = localStorage.getItem('amasa_coordinators');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COORDINATORS;
  });

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<Coordinator>(coordinators[0] || INITIAL_COORDINATORS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('05');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [packageType, setPackageType] = useState('باقة كوشة وضيافة ملكية VIP');
  const [notes, setNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const packages = [
    {
      id: 'pkg-1',
      title: 'باقة كوشة وضيافة ملكية VIP',
      price: 1500,
      description: 'كوشة ورد طبيعي منسق بألوان الموف والأبيض، طاولة ضيافة فخمة ومباخر عود فاخرة.',
      suitableFor: 'وحدة الما ووحدة نايا',
      coordinator: coordinators[0]?.name || 'منى الحربي',
    },
    {
      id: 'pkg-2',
      title: 'باقة تزيين مسبح وإضاءة بالونات',
      price: 1200,
      description: 'بالونات هيليوم فاخرة محيطة بالمسبح، شعلات ليزر مضيئة، وكيكة مناسبة مخصصة.',
      suitableFor: 'المسبح الفيروزي في الما ونايا',
      coordinator: coordinators[1]?.name || 'لمى السبيعي',
    },
    {
      id: 'pkg-3',
      title: 'باقة استقبال عرسان خاصة',
      price: 950,
      description: 'مسار ورد جوري أحمر، شموع إلكترونية آمنة، وضيافة شوكولاتة باتشي فاخرة.',
      suitableFor: 'غرفة النوم الماستر وجلسة الاستجمام',
      coordinator: coordinators[1]?.name || 'لمى السبيعي',
    },
    {
      id: 'pkg-4',
      title: 'باقة ضيافة نجدية وقهوة وشاي',
      price: 800,
      description: 'طاولة خشبية نجدية، دلال قهوة شقراء، تمور فاخرة محشية، ومكسرات محمصة.',
      suitableFor: 'صالة الضيافة والمجلس العائلي',
      coordinator: coordinators[2]?.name || 'شهد التميمي',
    },
  ];

  const currentUnitLabel = activeSectionName || 'شاليه واستراحة حمران (الما ونايا)';

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    const newTask: CoordinationTask = {
      id: `ct-${Date.now()}`,
      bookingCode: `BK-HAMRAN-${Math.floor(100 + Math.random() * 900)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      propertyName: `حمران (${currentUnitLabel})`,
      date: serviceDate,
      serviceTitle: packageType,
      serviceDetails: notes.trim() || `طلب تنسيق خاص لشاليه ${currentUnitLabel}`,
      coordinatorId: selectedCoord.id,
      coordinatorName: selectedCoord.name,
      coordinatorPhone: selectedCoord.phone,
      status: 'in_progress',
      price: packages.find((p) => p.title === packageType)?.price || 1000,
    };

    try {
      const existing = localStorage.getItem('amasa_coordination_tasks');
      const parsed = existing ? JSON.parse(existing) : INITIAL_COORDINATION_TASKS;
      localStorage.setItem('amasa_coordination_tasks', JSON.stringify([newTask, ...parsed]));
    } catch {}

    const whatsappMsg = `السلام عليكم أختي ${selectedCoord.name}، لدينا طلب تنسيق جديد في شاليه حمران (${currentUnitLabel}):\n- الخدمة: ${packageType}\n- العميل: ${customerName}\n- الجوال: ${customerPhone}\n- التاريخ: ${serviceDate}\n${notes ? `- ملاحظات: ${notes}` : ''}`;
    const whatsappUrl = `https://wa.me/966${selectedCoord.phone.replace(/^0/, '')}?text=${encodeURIComponent(whatsappMsg)}`;

    setSuccessToast(`تم إرسال طلب التنسيق للمنسقة (${selectedCoord.name}) بنجاح!`);
    setRequestModalOpen(false);
    setCustomerName('');
    setNotes('');

    window.open(whatsappUrl, '_blank');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border-2 border-purple-200/90 space-y-4 animate-in fade-in duration-200">
      {/* Toast alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white px-3.5 py-2.5 rounded-2xl shadow-md text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
            <PartyPopper className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-[#2E1045]">المنسقات</h3>
              <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2.5 py-0.5 rounded-full border border-pink-200">
                خاص بـ حمران (الما ونايا)
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                {coordinators.length} منسقات معتمدات
              </span>
            </div>
            <p className="text-xs text-purple-700/80 font-medium mt-0.5">
              خدمات التجهيز، الكوش، الضيافة الملكية، وتزيين المسابح الخاصة بوحدتي (الما ونايا)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRequestModalOpen(true)}
          className="btn-mauve-shiny px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>طلب تجهيز للمكان</span>
        </button>
      </div>

      {/* Unit Callout */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50/60 to-purple-50 p-3 rounded-2xl border border-purple-200/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-700 shrink-0" />
          <span className="text-slate-700">
            الوحدة الحالية المحددة:{' '}
            <span className="font-black text-purple-950 font-bold">{currentUnitLabel}</span>
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-purple-100">
          جاهز للتنسيق الفوري
        </span>
      </div>

      {/* Coordinator Profile Cards for Hamran */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {coordinators.map((c) => (
          <div
            key={c.id}
            className="p-3.5 rounded-2xl border border-purple-100 hover:border-purple-300 bg-[#FAF8FE] transition-all flex flex-col justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={c.avatar}
                alt={c.name}
                className="w-11 h-11 rounded-xl object-cover border-2 border-pink-300 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{c.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({c.completedTasks} حفل)</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug bg-white p-2 rounded-xl border border-purple-50">
              {c.specialty}
            </p>

            <div className="flex items-center gap-1.5 pt-1">
              <a
                href={`tel:${c.phone}`}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-center text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Phone className="w-3 h-3 text-slate-600" />
                <span>اتصال</span>
              </a>

              <a
                href={`https://wa.me/966${c.phone.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً أختي ${c.name}، نود التنسيق لتجهيز شاليه حمران (${currentUnitLabel}) لحجز قادم:`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-center text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>واتساب</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Packages Carousel / Grid for Hamran */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
          <span>باقات التنسيق المعتمدة لوحدتي (الما ونايا):</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => {
                setSelectedPackage(pkg.id);
                setPackageType(pkg.title);
                const matched = coordinators.find((c) => c.name === pkg.coordinator) || coordinators[0];
                setSelectedCoord(matched);
                setRequestModalOpen(true);
              }}
              className="p-3 rounded-2xl border border-purple-100 hover:border-purple-300 bg-white hover:bg-purple-50/40 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                    {pkg.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{pkg.description}</p>
                </div>
                <span className="text-xs font-black text-purple-950 font-mono bg-purple-50 px-2 py-1 rounded-xl border border-purple-100 shrink-0">
                  {pkg.price} ر.س
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                <span className="text-purple-700 font-bold">المنسقة: {pkg.coordinator}</span>
                <span className="text-slate-400 font-medium">طلب الباقة ↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <PartyPopper className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">طلب تنسيق وتجهيز لشاليه حمران</h3>
                  <p className="text-[11px] text-purple-200">الوحدة: {currentUnitLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">نوع باقة التنسيق / الخدمة *</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-bold"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title} ({p.price} ر.س)
                    </option>
                  ))}
                  <option value="تنسيق وتجهيز مخصص حسب رغبة العميل">تنسيق وتجهيز مخصص حسب رغبة العميل</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">المنسقة المسؤولة *</label>
                <select
                  value={selectedCoord.id}
                  onChange={(e) => {
                    const c = coordinators.find((coord) => coord.id === e.target.value) || coordinators[0];
                    setSelectedCoord(c);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                >
                  {coordinators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.specialty.slice(0, 30)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">اسم العميل / النزيل *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم النزيل"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">جوال العميل *</label>
                  <input
                    type="tel"
                    required
                    placeholder="05xxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">تاريخ الحجز والمناسبة *</label>
                <input
                  type="date"
                  required
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">ملاحظات وطلبات خاصة</label>
                <textarea
                  rows={2}
                  placeholder="مثال: تجهيز الكوشة قبل الساعة 3 عصراً، درجات ألوان محددة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال وتواصل واتساب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
