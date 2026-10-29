import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  DollarSign,
  CalendarCheck,
  Volume2,
  VolumeX,
  X,
  Eye,
  Download,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Paperclip,
  Shield,
  UserCheck,
  ShieldCheck,
  Megaphone,
  Radio,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';

export const ExternalNotificationCards: React.FC = () => {
  const {
    activeToast,
    dismissToast,
    isSoundEnabled,
    toggleSound,
    filteredNotifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    markSingleNotificationAsRead,
    setNotificationsModalOpen,
    isAdmin,
    isGuard,
    guard,
    currentMarketer,
    browserNotificationPermission,
    requestBrowserNotificationPermission,
    setActiveTab,
  } = useApp();

  const [toastProgress, setToastProgress] = useState(100);
  const [isStackExpanded, setIsStackExpanded] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; name?: string; title?: string } | null>(null);
  const [isDismissedTemporarily, setIsDismissedTemporarily] = useState(false);

  // Filter unread notifications for the active user
  const unreadNotifications = filteredNotifications.filter((n) => !n.read);

  // Toast progress timer
  useEffect(() => {
    if (!activeToast) {
      setToastProgress(100);
      return;
    }

    const duration = 7500;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setToastProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        dismissToast();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeToast, dismissToast]);

  // When unread count changes from 0 to > 0, ensure not dismissed
  useEffect(() => {
    if (unreadNotificationsCount > 0) {
      setIsDismissedTemporarily(false);
    }
  }, [unreadNotificationsCount]);

  const handleDownloadReceipt = (url?: string, filename?: string) => {
    if (!url) return;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `amasa-receipt-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  // Helper to determine target role text & styling for any notification
  const getNotificationRoleMeta = (notif: AppNotification) => {
    if (notif.targetAudience === 'admin_only' || notif.title.includes('إشعار للإدارة') || notif.title.includes('للإدارة')) {
      return {
        roleLabel: '👑 خاص بالإدارة (AMASA)',
        roleBadgeCls: 'bg-indigo-100 text-indigo-900 border-indigo-200',
        cardBorderCls: 'border-indigo-300 shadow-indigo-100/50',
      };
    }
    if (
      notif.targetAudience === 'guards' ||
      notif.targetAudience === 'admin_and_guard' ||
      notif.title.includes('إشعار للحارس') ||
      notif.title.includes('تنبيه للحارس')
    ) {
      return {
        roleLabel: `🛡️ خاص بالحارس (${guard.name || 'أبو راشد'})`,
        roleBadgeCls: 'bg-amber-100 text-amber-950 border-amber-300',
        cardBorderCls: 'border-amber-300 shadow-amber-100/50',
      };
    }
    if (
      notif.targetAudience === 'marketer' ||
      notif.targetAudience === 'marketers' ||
      notif.title.includes('إشعار للمسوقة') ||
      notif.targetMarketerId
    ) {
      const mName = currentMarketer?.name || 'المسوقة';
      return {
        roleLabel: `💼 خاص بالمسوقة (${mName})`,
        roleBadgeCls: 'bg-purple-100 text-purple-900 border-purple-200',
        cardBorderCls: 'border-purple-300 shadow-purple-100/50',
      };
    }
    return {
      roleLabel: '👥 تنبيه مشترك (فريق العمل)',
      roleBadgeCls: 'bg-slate-100 text-slate-800 border-slate-200',
      cardBorderCls: 'border-purple-200 shadow-purple-50',
    };
  };

  const currentRoleName = isAdmin
    ? 'الإدارة'
    : isGuard
    ? `الحارس (${guard.name || 'أبو راشد'})`
    : `المسوقة (${currentMarketer?.name || 'فريق التسويق'})`;

  return (
    <>
      {/* 1. Real-time Top Notification Card (Active Toast) */}
      {activeToast && (
        <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 pointer-events-auto animate-in slide-in-from-top-4 duration-300 font-['Tajawal',sans-serif]">
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-white/25 backdrop-blur-md relative overflow-hidden">
            {/* Progress timer bar */}
            <div
              className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-purple-300 to-indigo-300"
              style={{ width: `${toastProgress}%`, transition: 'width 50ms linear' }}
            />

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-purple-700/80 text-white border border-purple-400/30">
                {activeToast.targetRole === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                ) : activeToast.targetRole === 'guard' ? (
                  <Shield className="w-5 h-5 text-amber-400" />
                ) : activeToast.targetRole === 'marketer' ? (
                  <UserCheck className="w-5 h-5 text-purple-200" />
                ) : (
                  <Bell className="w-5 h-5 text-amber-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Role Badge and Unopened indicator */}
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold border border-white/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span>{activeToast.targetAudienceText || `تنبيه خاص بـ: ${currentRoleName} (لم يُفتح)`}</span>
                  </span>
                  <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                    جديد 🔴
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">{activeToast.title}</h4>
                <p className="text-[11px] text-white/90 mt-0.5 leading-relaxed line-clamp-2">{activeToast.body}</p>

                {/* Receipt 1-Click Preview & Download Attachment */}
                {activeToast.receiptUrl && (
                  <div className="mt-2.5 p-2 bg-white/10 rounded-xl border border-white/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Paperclip className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="text-[11px] font-bold text-white truncate">
                        {activeToast.receiptName || 'إيصال مرفق للمعاينة والتحميل'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewReceipt({
                            url: activeToast.receiptUrl!,
                            name: activeToast.receiptName,
                            title: activeToast.title,
                          })
                        }
                        className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>معاينة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(activeToast.receiptUrl, activeToast.receiptName)}
                        className="p-1 bg-white/20 hover:bg-white/30 text-white rounded-lg cursor-pointer transition-colors"
                        title="تحميل الصورة بضغطة زر"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 mt-2.5 pt-1.5 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeToast.notificationId) {
                        markSingleNotificationAsRead(activeToast.notificationId);
                      }
                      dismissToast();
                      setNotificationsModalOpen(true);
                    }}
                    className="flex-1 py-1 px-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-transform active:scale-95"
                  >
                    <Bell className="w-3 h-3" />
                    <span>فتح التنبيه الآن 📲</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeToast.notificationId) {
                        markSingleNotificationAsRead(activeToast.notificationId);
                      }
                      dismissToast();
                    }}
                    className="py-1 px-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-semibold text-[11px] cursor-pointer transition-colors"
                  >
                    تم الاطلاع
                  </button>
                </div>
              </div>

              {/* Top Controls */}
              <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                  title={isSoundEnabled ? 'كتم نغمة التنبيه' : 'تشغيل نغمة التنبيه'}
                >
                  {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-amber-300" />}
                </button>
                <button
                  type="button"
                  onClick={dismissToast}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="إغلاق التنبيه"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Persistent Floating Unopened Notifications Stack ("لم يفتحه") */}
      {unreadNotificationsCount > 0 && !isDismissedTemporarily && (
        <div className="fixed bottom-20 right-3 sm:right-6 z-40 max-w-sm w-[calc(100vw-1.5rem)] sm:w-96 font-['Tajawal',sans-serif] animate-in slide-in-from-bottom-3 duration-200">
          {!isStackExpanded ? (
            /* Collapsed Floating Pill */
            <div
              onClick={() => setIsStackExpanded(true)}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border-2 border-purple-300 hover:border-purple-400 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-900 text-white flex items-center justify-center shadow-md relative shrink-0">
                  <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-xs border-2 border-white">
                    {unreadNotificationsCount}
                  </span>
                </div>
                <div className="min-w-0 text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>تنبيه جديد لم تفتحه</span>
                    </span>
                    <span className="text-[10px] text-purple-900 font-bold truncate">
                      ({currentRoleName})
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                    يوجد {unreadNotificationsCount} تنبيهات غير مقروءة بانتظارك
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStackExpanded(true);
                  }}
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>عرض</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDismissedTemporarily(true);
                  }}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="إخفاء مؤقت"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded Cards Stack */
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-purple-300 overflow-hidden flex flex-col max-h-[75vh]">
              {/* Stack Header */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-3.5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <span>تنبيهات جديدة لم يتم فتحها</span>
                      <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {unreadNotificationsCount}
                      </span>
                    </h4>
                    <span className="text-[10px] text-purple-200">
                      الحساب الحالي: <strong>{currentRoleName}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsStackExpanded(false)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                    title="تصغير"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDismissedTemporarily(true)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stack Body: List of Unread Cards */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1 max-h-[380px]">
                {unreadNotifications.slice(0, 3).map((notif) => {
                  const meta = getNotificationRoleMeta(notif);
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border-2 transition-all bg-white hover:bg-purple-50/40 ${meta.cardBorderCls}`}
                    >
                      {/* Card Header: Role Badge + Unread Dot */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.roleBadgeCls}`}
                        >
                          {meta.roleLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-[10px] text-rose-600 font-bold">لم يُفتح بعد</span>
                        </div>
                      </div>

                      {/* Card Title & Description */}
                      <h5 className="font-bold text-xs text-slate-900 leading-snug">{notif.title}</h5>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {notif.description}
                      </p>

                      {/* Receipt Preview Row if exists */}
                      {notif.receiptUrl && (
                        <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Paperclip className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="text-[10px] font-bold text-emerald-950 truncate">
                              {notif.receiptName || 'إيصال / صورة مرفقة'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewReceipt({
                                  url: notif.receiptUrl!,
                                  name: notif.receiptName,
                                  title: notif.title,
                                })
                              }
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Eye className="w-3 h-3" />
                              <span>معاينة وحفظ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadReceipt(notif.receiptUrl, notif.receiptName)}
                              className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg cursor-pointer transition-colors"
                              title="تحميل"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            markSingleNotificationAsRead(notif.id);
                            setIsStackExpanded(false);
                            setNotificationsModalOpen(true);
                          }}
                          className="flex-1 py-1 px-2.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-900 hover:to-indigo-950 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-transform active:scale-95"
                        >
                          <Bell className="w-3 h-3 text-amber-300" />
                          <span>فتح التنبيه 📲</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => markSingleNotificationAsRead(notif.id)}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[10px] cursor-pointer transition-colors"
                          title="تعليم هذا التنبيه كمقروء"
                        >
                          تم الاطلاع ✅
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* If more than 3 unread */}
                {unreadNotifications.length > 3 && (
                  <p className="text-[11px] text-center text-purple-900 font-bold py-1">
                    + يوجد {unreadNotifications.length - 3} تنبيهات أخرى غير معروضة هنا
                  </p>
                )}
              </div>

              {/* Stack Footer */}
              <div className="p-3 bg-slate-50 border-t border-purple-100 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStackExpanded(false);
                      setNotificationsModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-300" />
                    <span>فتح كافة التنبيهات ({unreadNotificationsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={markNotificationsAsRead}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs cursor-pointer transition-colors shrink-0"
                    title="تعليم كل التنبيهات كمقروءة"
                  >
                    تعليم الكل كمقروء
                  </button>
                </div>

                <div className="text-[10px] text-center text-purple-900/70 font-medium">
                  حفظ تلقائي لآخر 7 أيام (يتم مسح التنبيهات تلقائياً بعد مرور أسبوع)
                </div>

                {/* Browser Notifications Activation Reminder if not granted */}
                {browserNotificationPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestBrowserNotificationPermission}
                    className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                    <span>تفعيل تنبيهات سطح المكتب (لتصلك كبطاقات خارج المتصفح) 🔔</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Modal for Receipt Preview with 1-Click Download */}
      {previewReceipt && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          dir="rtl"
          onClick={() => setPreviewReceipt(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl border border-purple-200 flex flex-col text-right animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-purple-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-200" />
                <h4 className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
                  {previewReceipt.title || previewReceipt.name || 'معاينة الإيصال المرفق'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-50 min-h-[220px]">
              {previewReceipt.url.startsWith('data:image') ||
              previewReceipt.url.startsWith('http') ||
              previewReceipt.url.startsWith('/') ||
              previewReceipt.url.startsWith('blob:') ? (
                <img
                  src={previewReceipt.url}
                  alt="إيصال مرفق"
                  className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain shadow-xs border border-slate-200"
                />
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="font-bold">{previewReceipt.name || 'ملف مرفق'}</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(previewReceipt.url, previewReceipt.name)}
                  className="flex-1 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>حفظ وتحميل الصورة بضغطة زر</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open(previewReceipt.url, '_blank')}
                  className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح بالحجم الكامل</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
