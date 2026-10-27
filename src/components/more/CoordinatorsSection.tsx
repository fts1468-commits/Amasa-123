import React, { useState } from 'react';
import {
  PartyPopper,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  UserPlus,
  MessageCircle,
  Star,
  Building,
  Check,
  AlertCircle,
  HeartHandshake,
  Cake,
  Palette,
  Eye,
  Filter,
  Pencil,
  Trash2,
  X,
  Tag,
  DollarSign,
  CalendarDays,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_COORDINATORS, INITIAL_COORDINATION_TASKS } from '../../data/mock';
import { Coordinator, CoordinationTask } from '../../types';

interface CoordinatorsSectionProps {
  onOpenGeminiAI?: () => void;
}

interface ServiceDraft {
  id: string;
  title: string;
  price: number;
}

export const CoordinatorsSection: React.FC<CoordinatorsSectionProps> = ({ onOpenGeminiAI }) => {
  const {
    properties,
    isAdmin,
    coordinatorServices,
    addCoordinatorService,
    updateCoordinatorService,
    deleteCoordinatorService,
  } = useApp();

  const [coordinators, setCoordinators] = useState<Coordinator[]>(() => {
    try {
      const saved = localStorage.getItem('amasa_coordinators');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COORDINATORS;
  });

  const [tasks, setTasks] = useState<CoordinationTask[]>(() => {
    try {
      const saved = localStorage.getItem('amasa_coordination_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COORDINATION_TASKS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed' | 'team'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New task modal
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [taskCustomerName, setTaskCustomerName] = useState('');
  const [taskCustomerPhone, setTaskCustomerPhone] = useState('');
  const [taskProperty, setTaskProperty] = useState(properties[0]?.name || 'الترف');
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskServiceTitle, setTaskServiceTitle] = useState('');
  const [taskServiceDetails, setTaskServiceDetails] = useState('');
  const [taskCoordinatorId, setTaskCoordinatorId] = useState(coordinators[0]?.id || 'c1');
  const [taskPrice, setTaskPrice] = useState(1000);

  // New coordinator modal
  const [addCoordModalOpen, setAddCoordModalOpen] = useState(false);
  const [coordName, setCoordName] = useState('');
  const [coordPhone, setCoordPhone] = useState('');
  const [coordBank, setCoordBank] = useState('مصرف الراجحي');
  const [coordIban, setCoordIban] = useState('');

  // Draft services inside the "إضافة منسقة معتمدة" modal
  const [coordServicesDraft, setCoordServicesDraft] = useState<ServiceDraft[]>([]);
  const [serviceTitleInput, setServiceTitleInput] = useState('');
  const [servicePriceInput, setServicePriceInput] = useState<number | ''>('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  // Modal to manage services of existing coordinator
  const [manageCoordServicesModalOpen, setManageCoordServicesModalOpen] = useState(false);
  const [selectedCoordForServices, setSelectedCoordForServices] = useState<Coordinator | null>(null);
  const [manageServiceTitle, setManageServiceTitle] = useState('');
  const [manageServicePrice, setManageServicePrice] = useState<number | ''>('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const saveTasks = (newTasks: CoordinationTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem('amasa_coordination_tasks', JSON.stringify(newTasks));
    } catch {}
  };

  const saveCoordinators = (newCoords: Coordinator[]) => {
    setCoordinators(newCoords);
    try {
      localStorage.setItem('amasa_coordinators', JSON.stringify(newCoords));
    } catch {}
  };

  // Draft services handlers in "إضافة منسقة معتمدة" modal
  const handleAddOrUpdateDraftService = () => {
    if (!serviceTitleInput.trim()) return;
    const priceNum = servicePriceInput === '' ? 0 : Number(servicePriceInput);

    if (editingDraftId) {
      setCoordServicesDraft((prev) =>
        prev.map((s) => (s.id === editingDraftId ? { ...s, title: serviceTitleInput.trim(), price: priceNum } : s))
      );
      setEditingDraftId(null);
    } else {
      const newDraft: ServiceDraft = {
        id: `draft-${Date.now()}`,
        title: serviceTitleInput.trim(),
        price: priceNum,
      };
      setCoordServicesDraft((prev) => [...prev, newDraft]);
    }

    setServiceTitleInput('');
    setServicePriceInput('');
  };

  const handleStartEditDraft = (srv: ServiceDraft) => {
    setEditingDraftId(srv.id);
    setServiceTitleInput(srv.title);
    setServicePriceInput(srv.price);
  };

  const handleCancelEditDraft = () => {
    setEditingDraftId(null);
    setServiceTitleInput('');
    setServicePriceInput('');
  };

  const handleDeleteDraft = (id: string) => {
    setCoordServicesDraft((prev) => prev.filter((s) => s.id !== id));
    if (editingDraftId === id) {
      handleCancelEditDraft();
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    saveTasks(updated);
    const msg =
      newStatus === 'completed'
        ? 'تم تحديد الطلب كـ "تم التجهيز والتسليم بنجاح"!'
        : 'تم تحديث حالة التجهيز!';
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskCustomerName || !taskServiceTitle) return;

    const assignedCoord = coordinators.find((c) => c.id === taskCoordinatorId) || coordinators[0];

    const newTask: CoordinationTask = {
      id: `ct-${Date.now()}`,
      bookingCode: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: taskCustomerName.trim(),
      customerPhone: taskCustomerPhone.trim() || '0500000000',
      propertyName: taskProperty,
      date: taskDate,
      serviceTitle: taskServiceTitle.trim(),
      serviceDetails: taskServiceDetails.trim() || 'تنسيق وتجهيز خاص للشاليه',
      coordinatorId: assignedCoord.id,
      coordinatorName: assignedCoord.name,
      coordinatorPhone: assignedCoord.phone,
      status: 'in_progress',
      price: Number(taskPrice) || 0,
    };

    saveTasks([newTask, ...tasks]);
    setSuccessToast(`تمت إضافة طلب التنسيق بنجاح وتعيين المنسقة (${assignedCoord.name})!`);
    setAddTaskModalOpen(false);
    setTaskCustomerName('');
    setTaskCustomerPhone('');
    setTaskServiceTitle('');
    setTaskServiceDetails('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreateCoordinator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordName.trim() || !coordPhone.trim()) return;

    // Collect all services including any currently typed in inputs
    const allServices = [...coordServicesDraft];
    if (serviceTitleInput.trim()) {
      allServices.push({
        id: `draft-${Date.now()}`,
        title: serviceTitleInput.trim(),
        price: servicePriceInput === '' ? 0 : Number(servicePriceInput),
      });
    }

    const specialtySummary =
      allServices.length > 0
        ? allServices.map((s) => `${s.title} (${s.price} ر.س)`).join('، ')
        : 'تنسيق وتجهيز مناسبات وشاليهات';

    const newCoordId = `c-${Date.now()}`;
    const newCoord: Coordinator = {
      id: newCoordId,
      name: coordName.trim(),
      phone: coordPhone.trim(),
      specialty: specialtySummary,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      rating: 5.0,
      completedTasks: 0,
      status: 'available',
      bankName: coordBank,
      bankAccount: coordIban.trim(),
    };

    // Save coordinator
    saveCoordinators([...coordinators, newCoord]);

    // Save all services to AppContext so they appear in bookings with their prices!
    allServices.forEach((s) => {
      addCoordinatorService({
        coordinatorId: newCoordId,
        coordinatorName: newCoord.name,
        coordinatorPhone: newCoord.phone,
        title: s.title,
        price: s.price,
        description: s.title,
        isActive: true,
      });
    });

    setSuccessToast(`تمت إضافة المنسقة (${coordName}) بنجاح مع (${allServices.length}) خدمات مدرجة في الحجوزات!`);
    setAddCoordModalOpen(false);
    setCoordName('');
    setCoordPhone('');
    setCoordBank('مصرف الراجحي');
    setCoordIban('');
    setCoordServicesDraft([]);
    setServiceTitleInput('');
    setServicePriceInput('');
    setEditingDraftId(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Open modal to manage services for an existing coordinator
  const handleOpenManageServices = (coord: Coordinator) => {
    setSelectedCoordForServices(coord);
    setManageServiceTitle('');
    setManageServicePrice('');
    setEditingServiceId(null);
    setManageCoordServicesModalOpen(true);
  };

  const handleSaveExistingCoordinatorService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoordForServices || !manageServiceTitle.trim()) return;

    const priceNum = manageServicePrice === '' ? 0 : Number(manageServicePrice);

    if (editingServiceId) {
      updateCoordinatorService(editingServiceId, {
        title: manageServiceTitle.trim(),
        price: priceNum,
      });
      setSuccessToast(`تم تحديث خدمة "${manageServiceTitle}" بنجاح!`);
    } else {
      addCoordinatorService({
        coordinatorId: selectedCoordForServices.id,
        coordinatorName: selectedCoordForServices.name,
        coordinatorPhone: selectedCoordForServices.phone,
        title: manageServiceTitle.trim(),
        price: priceNum,
        description: manageServiceTitle.trim(),
        isActive: true,
      });
      setSuccessToast(`تمت إضافة خدمة جديدة للمنسقة (${selectedCoordForServices.name}) بنجاح!`);
    }

    setManageServiceTitle('');
    setManageServicePrice('');
    setEditingServiceId(null);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Metrics
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalRevenue = tasks.reduce((sum, t) => sum + (t.price || 0), 0);

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'in_progress') return t.status === 'in_progress' || t.status === 'pending';
    if (activeFilter === 'completed') return t.status === 'completed';
    return true;
  });

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

      {/* 1. البطاقة الترحيبية الفاخرة للوحة المنسقات */}
      <div className="bg-gradient-to-r from-[#200A3B] via-[#3B116A] to-[#1F0738] p-5 sm:p-6 rounded-3xl text-white shadow-md border border-purple-800/40 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <PartyPopper className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white">لوحة المنسقات والتجهيز</h3>
                <span className="text-[11px] bg-pink-500 text-white font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  خدمات المناسبات والضيافة
                </span>
                <span className="text-[10px] bg-purple-900/80 text-purple-200 font-bold px-2 py-0.5 rounded-full border border-purple-700/60">
                  {coordinators.length} منسقات معتمدات
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                متابعة وتنسيق تجهيزات الشاليهات، تزيين الكوش والمسبح، الضيافة، وتنسيق الحفلات قبل وصول النزلاء
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setAddTaskModalOpen(true)}
              className="py-2.5 px-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طلب تجهيز</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setAddCoordModalOpen(true)}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>إضافة منسقة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. مؤشرات الأداء السريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">فريق المنسقات</span>
            <HeartHandshake className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            {coordinators.length} <span className="text-xs font-normal text-slate-500">منسقة</span>
          </div>
          <span className="text-[10px] text-pink-700 font-bold">جاهزات للاستلام</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">قيد التجهيز اليوم</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-amber-600">
            {inProgressCount} <span className="text-xs font-normal text-slate-500">طلب نشط</span>
          </div>
          <span className="text-[10px] text-slate-400">قبل وصول النزلاء</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">تم تجهيزها وتسليمها</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-600">
            {completedCount} <span className="text-xs font-normal text-slate-500">مكتملة</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">بأعلى معايير الجودة</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">إجمالي قيمة التنسيق</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-purple-950">
            {totalRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">ر.س</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold">رسوم التجهيز</span>
        </div>
      </div>

      {/* 3. شريط الفلترة والأقسام */}
      <div className="bg-white p-2 rounded-2xl border border-purple-100 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'all'
              ? 'bg-purple-700 text-white font-black shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>جميع طلبات التجهيز</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
            {tasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('in_progress')}
          className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'in_progress'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>قيد التجهيز</span>
          <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full font-bold">
            {inProgressCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('completed')}
          className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white font-black shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تم التسليم</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
            {completedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('team')}
          className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeFilter === 'team'
              ? 'bg-purple-700 text-white font-black shadow-xs'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>فريق المنسقات ({coordinators.length})</span>
        </button>
      </div>

      {/* 4. عرض فريق المنسقات المعتمدات */}
      {activeFilter === 'team' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {coordinators.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-3xl border border-purple-100 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-300 shadow-2xs"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900">{c.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{c.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({c.completedTasks} مهمة مكتملة)</span>
                  </div>
                </div>
              </div>

              {/* Coordinator Services with Price, Edit & Delete */}
              <div className="p-2.5 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>الخدمات والأسعار المعتمدة:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenManageServices(c)}
                    className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-lg border border-purple-200 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة خدمة</span>
                  </button>
                </div>

                {coordinatorServices.filter((s) => s.coordinatorId === c.id || s.coordinatorName === c.name).length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {coordinatorServices
                      .filter((s) => s.coordinatorId === c.id || s.coordinatorName === c.name)
                      .map((srv) => (
                        <div
                          key={srv.id}
                          className="flex items-center justify-between p-1.5 rounded-xl bg-white border border-purple-100 shadow-2xs text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                            <span className="font-bold text-slate-800 truncate">{srv.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-md border border-pink-200 text-[10px]">
                              {srv.price} ر.س
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCoordForServices(c);
                                setManageServiceTitle(srv.title);
                                setManageServicePrice(srv.price);
                                setEditingServiceId(srv.id);
                                setManageCoordServicesModalOpen(true);
                              }}
                              className="p-1 hover:bg-purple-100 rounded text-purple-700 cursor-pointer"
                              title="تعديل الخدمة"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteCoordinatorService(srv.id);
                                setSuccessToast(`تم حذف خدمة "${srv.title}" بنجاح!`);
                                setTimeout(() => setSuccessToast(null), 3000);
                              }}
                              className="p-1 hover:bg-rose-100 rounded text-rose-600 cursor-pointer"
                              title="حذف الخدمة"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    {c.specialty || 'لا توجد خدمات محددة بعد، اضغط على "إضافة خدمة" للإدراج.'}
                  </p>
                )}
              </div>

              {/* صلاحية إظهار صفحة التقويم والأسعار للمنسقة */}
              {isAdmin && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-purple-700" />
                    <span className="font-bold text-slate-800">صفحة التقويم والأسعار:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentVal = c.permissions?.canViewCalendar !== false;
                      const updated = coordinators.map((coord) =>
                        coord.id === c.id
                          ? {
                              ...coord,
                              permissions: {
                                ...(coord.permissions || { canViewCalendar: true, canViewAllBookings: true, canViewCustomerContacts: true }),
                                canViewCalendar: !currentVal,
                              },
                            }
                          : coord
                      );
                      setCoordinators(updated);
                      try {
                        localStorage.setItem('amasa_coordinators', JSON.stringify(updated));
                      } catch {}
                      setSuccessToast(`تم ${!currentVal ? 'إظهار' : 'إخفاء'} صفحة التقويم والأسعار للمنسقة ${c.name}`);
                      setTimeout(() => setSuccessToast(null), 3000);
                    }}
                    className={`px-2 py-0.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 text-[10px] ${
                      c.permissions?.canViewCalendar !== false
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                    title="التحكم بإظهار أو إخفاء صفحة التقويم للمنسقة"
                  >
                    {c.permissions?.canViewCalendar !== false ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>معروضة للمنسقة</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-rose-600" />
                        <span>مخفية عن المنسقة</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 text-xs">
                <a
                  href={`tel:${c.phone}`}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>اتصال</span>
                </a>

                <a
                  href={`https://wa.me/966${c.phone.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً أختي ${c.name}، نود التنسيق بشأن تجهيز الشاليه لحجز اليوم:`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 border border-emerald-200 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>واتساب</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. عرض قائمة طلبات التنسيق والتجهيز */}
      {activeFilter !== 'team' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
              <PartyPopper className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">لا توجد طلبات تجهيز تطابق الفلتر الحالي.</p>
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isCompleted = t.status === 'completed';

              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-xs space-y-3 ${
                    isCompleted
                      ? 'border-emerald-200/90 bg-emerald-50/10'
                      : 'border-purple-200/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{t.serviceTitle}</h4>
                          <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                            {t.bookingCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          العقار: <span className="font-bold text-slate-800">{t.propertyName}</span> · تاريخ الحجز:{' '}
                          <span className="font-mono">{t.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-black text-purple-950 px-2.5 py-1 bg-purple-50 rounded-xl border border-purple-100">
                        {t.price.toLocaleString()} ر.س
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900 animate-pulse'
                        }`}
                      >
                        {isCompleted ? '✓ تم التجهيز والتسليم' : '⏳ جاري التجهيز'}
                      </span>
                    </div>
                  </div>

                  {/* تفاصيل التجهيز */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {t.serviceDetails}
                  </p>

                  {/* شريط الإجراءات والمنسقة المعينة */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">المنسقة المسؤولة:</span>
                      <span className="font-black text-slate-900 flex items-center gap-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />
                        <span>{t.coordinatorName}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`https://wa.me/966${t.coordinatorPhone.replace(/^0/, '')}?text=${encodeURIComponent(`السلام عليكم أختي ${t.coordinatorName}، بخصوص طلب التجهيز (${t.serviceTitle}) في ${t.propertyName}:`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>واتساب المنسقة</span>
                      </a>

                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                        >
                          إعادة كـ "قيد التجهيز"
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'completed')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تأكيد اكتمال التجهيز</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* مودال إضافة طلب تجهيز جديد */}
      {addTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">إضافة طلب تجهيز وتنسيق شاليه</h3>
                  <p className="text-[11px] text-purple-200">تعيين منسقة معتمدة ومتابعة التنفيذ قبل وصول النزيل</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddTaskModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 sm:p-6 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">عنوان الخدمة / نوع التنسيق *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تجهيز كوشة ورد طبيعي وضيافة VIP"
                  value={taskServiceTitle}
                  onChange={(e) => setTaskServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">اسم العميل / النزيل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فيصل الشمري"
                    value={taskCustomerName}
                    onChange={(e) => setTaskCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">جوال العميل</label>
                  <input
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={taskCustomerPhone}
                    onChange={(e) => setTaskCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">الشاليه / العقار *</label>
                  <select
                    value={taskProperty}
                    onChange={(e) => setTaskProperty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">تاريخ المناسبة / الحجز *</label>
                  <input
                    type="date"
                    required
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">المنسقة المسؤولة *</label>
                  <select
                    value={taskCoordinatorId}
                    onChange={(e) => setTaskCoordinatorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    {coordinators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.specialty.slice(0, 25)}...)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">قيمة الخدمة (ر.س)</label>
                  <input
                    type="number"
                    value={taskPrice}
                    onChange={(e) => setTaskPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">تفاصيل التجهيز والملاحظات</label>
                <textarea
                  rows={3}
                  placeholder="حدد الألوان المطلوبة، نوع الورد، موعد الدخول قبل النزيل..."
                  value={taskServiceDetails}
                  onChange={(e) => setTaskServiceDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  حفظ وتعيين المنسقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إضافة منسقة جديدة */}
      {addCoordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <UserPlus className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">إضافة منسقة معتمدة</h3>
                  <p className="text-[11px] text-purple-200">إدراج منسقة جديدة ضمن فريق تجهيز الشاليهات</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddCoordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoordinator} className="p-4 sm:p-6 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">اسم المنسقة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ريم السبيعي"
                  value={coordName}
                  onChange={(e) => setCoordName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">رقم الجوال *</label>
                <input
                  type="tel"
                  required
                  placeholder="05xxxxxxxx"
                  value={coordPhone}
                  onChange={(e) => setCoordPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                />
              </div>

              {/* إضافة خدمة مع السعر وإمكانية إضافة أكثر من خدمة وحفظ وتعديل وحذف */}
              <div className="bg-purple-50/70 p-3 sm:p-3.5 rounded-2xl border border-purple-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-purple-950 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                    <span>إضافة خدمة</span>
                  </label>
                  <span className="text-[10px] bg-purple-200/80 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                    تظهر مع السعر في الحجوزات
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      placeholder="اسم الخدمة (مثال: كوشة ملكية، تزيين مسبح)"
                      value={serviceTitleInput}
                      onChange={(e) => setServiceTitleInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl focus:border-purple-600 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3 relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="السعر"
                      value={servicePriceInput}
                      onChange={(e) => setServicePriceInput(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl focus:border-purple-600 focus:outline-none text-xs font-mono pl-9"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-800 font-bold">
                      ر.س
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddOrUpdateDraftService}
                      className={`w-full h-full min-h-[34px] py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs active:scale-95 ${
                        editingDraftId
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          : 'bg-purple-700 hover:bg-purple-800 text-white'
                      }`}
                    >
                      {editingDraftId ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>حفظ</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>إضافة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* قائمة الخدمات المضافة للمنسقة مع إمكانية التعديل والحذف */}
                {coordServicesDraft.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span>الخدمات المضافة ({coordServicesDraft.length}):</span>
                      {editingDraftId && (
                        <button
                          type="button"
                          onClick={handleCancelEditDraft}
                          className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          إلغاء التعديل
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {coordServicesDraft.map((srv) => (
                        <div
                          key={srv.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100 shadow-2xs text-xs"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                            <span className="font-bold text-slate-900 truncate">{srv.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200 text-[11px]">
                              {srv.price} ر.س
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditDraft(srv)}
                              className="p-1 hover:bg-purple-100 rounded-md text-purple-700 cursor-pointer"
                              title="تعديل الخدمة"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDraft(srv.id)}
                              className="p-1 hover:bg-rose-100 rounded-md text-rose-600 cursor-pointer"
                              title="حذف الخدمة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-purple-700/70 pt-0.5">
                    يمكنك كتابة اسم الخدمة وسعرها والضغط على "إضافة"، ويمكنك إضافة أكثر من خدمة.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">البنك المعتمد</label>
                  <select
                    value={coordBank}
                    onChange={(e) => setCoordBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    <option value="مصرف الراجحي">مصرف الراجحي</option>
                    <option value="البنك الأهلي السعودي">البنك الأهلي السعودي</option>
                    <option value="بنك الإنماء">بنك الإنماء</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">الآيبان (IBAN)</label>
                  <input
                    type="text"
                    placeholder="SAxxxxxxxxxxxxxxxx"
                    value={coordIban}
                    onChange={(e) => setCoordIban(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddCoordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  إضافة واعتماد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إدارة وإضافة خدمات لمنسقة موجودة مسبقاً */}
      {manageCoordServicesModalOpen && selectedCoordForServices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">إضافة وتعديل خدمات المنسقة</h3>
                  <p className="text-[11px] text-purple-200">
                    المنسقة: {selectedCoordForServices.name} ({selectedCoordForServices.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManageCoordServicesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* فورم إضافة أو تعديل خدمة */}
              <form onSubmit={handleSaveExistingCoordinatorService} className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-xs">
                    {editingServiceId ? 'تعديل الخدمة المحددة' : 'إضافة خدمة جديدة للمنسقة'}
                  </span>
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setManageServiceTitle('');
                        setManageServicePrice('');
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الخدمة *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: باقة كوشة ورد ملكية VIP"
                      value={manageServiceTitle}
                      onChange={(e) => setManageServiceTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">سعر الخدمة (ر.س) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="1200"
                        value={manageServicePrice}
                        onChange={(e) => setManageServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl focus:border-purple-600 focus:outline-none font-mono pl-10"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-800">
                        ر.س
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  {editingServiceId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingServiceId ? 'حفظ تعديل الخدمة' : 'إضافة وحفظ الخدمة فوراً'}</span>
                </button>
              </form>

              {/* قائمة الخدمات الحالية لهذه المنسقة */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs block">
                  الخدمات المعتمدة الحالية لهذه المنسقة:
                </span>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {coordinatorServices
                    .filter(
                      (s) =>
                        s.coordinatorId === selectedCoordForServices.id ||
                        s.coordinatorName === selectedCoordForServices.name
                    )
                    .map((srv) => (
                      <div
                        key={srv.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{srv.title}</span>
                          <span className="font-mono text-pink-700 font-bold text-[11px]">
                            {srv.price} ر.س
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingServiceId(srv.id);
                              setManageServiceTitle(srv.title);
                              setManageServicePrice(srv.price);
                            }}
                            className="p-1.5 bg-white hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-700 cursor-pointer"
                            title="تعديل الخدمة"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteCoordinatorService(srv.id);
                              setSuccessToast(`تم حذف خدمة "${srv.title}" بنجاح!`);
                              setTimeout(() => setSuccessToast(null), 3000);
                            }}
                            className="p-1.5 bg-white hover:bg-rose-100 rounded-lg border border-rose-200 text-rose-600 cursor-pointer"
                            title="حذف الخدمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setManageCoordServicesModalOpen(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
