import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Menu,
  Users,
  Calendar,
  ClipboardList,
  Home,
  LayoutDashboard,
  Settings,
  Megaphone,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenRoleSwitcher: () => void;
  onOpenGeminiAI?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onOpenRoleSwitcher, onOpenGeminiAI }) => {
  const {
    currentMarketer,
    guard,
    isAdmin,
    isGuard,
    unreadNotificationsCount,
    activeTab,
    setActiveTab,
    canViewCalendar,
    canViewProperties,
    canViewDashboard,
    canViewMarketers,
    setAdminBroadcastModalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-purple-100/80 shadow-xs">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
        {/* Right (Start in RTL): Brand */}
        <div
          onClick={() => setActiveTab(canViewCalendar ? 'calendar' : isGuard ? 'dashboard' : 'bookings')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1b0630] via-[#3b1263] to-[#120422] border border-purple-300/30 flex items-center justify-center text-white shadow-md relative overflow-hidden group-hover:scale-105 transition-all shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/25 to-transparent pointer-events-none" />
            <span className="font-serif font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-purple-200">
              A
            </span>
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute top-1 right-1" />
          </div>
          <div className="flex flex-col items-start text-right">
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-wider font-serif leading-none">
              AMASA
            </span>
            {onOpenGeminiAI && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGeminiAI();
                }}
                className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300/90 bg-gradient-to-r from-amber-50 via-purple-50 to-amber-50 hover:from-amber-100 hover:to-purple-100 text-purple-950 text-[10px] font-bold transition-all shadow-2xs cursor-pointer group/gemini"
                title="مساعد ماسة الذكي (Google Gemini) لكتابة وصياغة الرسائل"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse group-hover/gemini:rotate-12 transition-transform" />
                <span>مساعد Gemini</span>
              </button>
            )}
          </div>
        </div>

        {/* Left (End in RTL): User Role Badge, Notifications & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRoleSwitcher}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-purple-200 bg-purple-50/70 hover:bg-purple-100 transition-all text-xs font-semibold text-purple-950 cursor-pointer"
            title="تبديل الصلاحية أو تسجيل الدخول عبر Gmail"
          >
            {isAdmin ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden xs:inline font-bold">الإدارة (AMASA)</span>
                <span className="xs:hidden font-bold">الإدارة</span>
              </>
            ) : isGuard ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-800 font-bold">الحارس</span>
                <span className="truncate max-w-[80px] xs:max-w-[110px]">
                  {guard.name.split(' ')[0]}
                </span>
                {guard.assignedPropertyName && (
                  <span className="text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded-full font-bold">
                    {guard.assignedPropertyName}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                <span className="truncate max-w-[90px] xs:max-w-[120px]">
                  {currentMarketer?.name}
                </span>
                <span className="text-[10px] bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded-full font-bold">
                  5%
                </span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
          </button>

          <a
            href="/download/cyberpanel"
            download="amasa-cyberpanel.zip"
            className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all shadow-2xs group cursor-pointer active:scale-95"
            title="تحميل الحزمة الجاهزة لـ CyberPanel (amasa-cyberpanel.zip)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-y-0.5 transition-transform" />
            <span>ملف CyberPanel</span>
          </a>

          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full text-purple-900 hover:bg-purple-50 transition-colors focus:outline-hidden cursor-pointer"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-5 h-5 text-purple-800" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors md:hidden cursor-pointer"
            title="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white py-3 animate-in fade-in slide-in-from-top duration-150">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-2">
            <div className="p-3 bg-purple-50/60 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">الحساب النشط:</p>
              <p className="text-sm font-bold text-purple-900">
                {isAdmin
                  ? 'الإدارة العامة (كامل الصلاحيات)'
                  : isGuard
                  ? guard.name
                  : currentMarketer?.name}
              </p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRoleSwitcher();
              }}
              className="text-xs bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer"
            >
              تبديل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {canViewCalendar && (
              <button
                onClick={() => {
                  setActiveTab('calendar');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors flex items-center gap-2 ${
                  activeTab === 'calendar' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>التقويم والأسعار</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('bookings');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors flex items-center gap-2 ${
                activeTab === 'bookings' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-purple-700" />
              <span>{isGuard ? 'قائمة النزلاء' : 'الحجوزات'}</span>
            </button>

            {canViewMarketers && (
              <button
                onClick={() => {
                  setActiveTab('more');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors flex items-center gap-2 ${
                  activeTab === 'more' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-purple-700" />
                <span>المسوقون والعمولات</span>
              </button>
            )}

            {canViewProperties && (
              <button
                onClick={() => {
                  setActiveTab('properties');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors flex items-center gap-2 ${
                  activeTab === 'properties' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4 text-purple-700" />
                <span>العقار والوحدات</span>
              </button>
            )}

            {canViewDashboard && (
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors flex items-center gap-2 ${
                  activeTab === 'dashboard' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-700" />
                <span>{isGuard ? 'دخول وخروج اليوم' : 'لوحة التحكم'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('more');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors flex items-center gap-2 ${
                activeTab === 'more' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 text-purple-700" />
              <span>المزيد والإعدادات</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdminBroadcastModalOpen(true);
                }}
                className="col-span-2 p-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-800 to-indigo-900 flex items-center justify-center gap-2 shadow-sm"
              >
                <Megaphone className="w-4 h-4 text-amber-300" />
                <span>إرسال تعميم وقرار إداري للفرق</span>
              </button>
            )}

            {onOpenGeminiAI && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGeminiAI();
                }}
                className="col-span-2 p-2.5 rounded-xl text-xs font-bold text-purple-950 bg-gradient-to-r from-amber-100/90 via-purple-100/80 to-purple-50 border border-amber-300 flex items-center justify-center gap-2 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>مساعد ماسة الذكي (Google Gemini)</span>
              </button>
            )}

            <a
              href="/download/cyberpanel"
              download="amasa-cyberpanel.zip"
              onClick={() => setMobileMenuOpen(false)}
              className="col-span-2 p-2.5 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-300 flex items-center justify-center gap-2 shadow-2xs hover:bg-emerald-100 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>تحميل حزمة CyberPanel الجاهزة (amasa-cyberpanel.zip)</span>
            </a>
          </div>
          </div>
        </div>
      )}
    </header>
  );
};
