import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Percent,
  Shield,
  LogOut,
  DollarSign,
  X,
  Radio,
  Megaphone,
  MessageCircle,
  Download,
  ExternalLink,
  Eye,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const {
    filteredNotifications,
    markNotificationsAsRead,
    unreadNotificationsCount,
    browserNotificationPermission,
    requestBrowserNotificationPermission,
    isSoundEnabled,
    toggleSound,
    sendTestNotification,
    isGuard,
    guard,
    isAdmin,
    setAdminBroadcastModalOpen,
    acknowledgeBroadcast,
    sendPaymentCompletionRequest,
  } = useApp();

  const [requestingPerm, setRequestingPerm] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; name?: string; title?: string } | null>(null);

  const handleDownloadReceipt = (url?: string, filename?: string) => {
    if (!url) return;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `receipt-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setRequestingPerm(true);
    await requestBrowserNotificationPermission();
    setRequestingPerm(false);
  };

  const isGranted = browserNotificationPermission === 'granted';
  const isDenied = browserNotificationPermission === 'denied';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="bg-purple-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-200" />
            <h3 className="font-bold text-base text-white">مركز التنبيهات والإشعارات</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
          {/* Permission card */}
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 rounded-2xl border border-purple-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    تنبيهات المتصفح الفورية (Web Notifications)
                  </span>
                  <span className="text-[10px] text-purple-900">
                    تنبيه سطح المكتب والجوال للحجوزات والعربون فوراً
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isGranted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isDenied
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {isGranted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>مفعّلة</span>
                  </>
                ) : isDenied ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>محظورة</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3 h-3 text-amber-600" />
                    <span>غير مفعّلة</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isGranted
                ? 'النظام يرسل تنبيهات فورية للموظفين والمسوقين عند تسجيل أي حجز جديد أو تأكيد سداد العربون.'
                : isDenied
                ? 'تم حظر الإشعارات في إعدادات متصفحك. يرجى الضغط على أيقونة القفل في شريط العنوان والسماح بالإشعارات.'
                : 'اضغط على زر التفعيل لتلقي تنبيهات المتصفح فوراً عند وصول أي حجز أو تأكيد عربون.'}
            </p>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-100/80">
              <div className="flex items-center gap-1.5">
                {!isGranted && !isDenied && (
                  <button
                    onClick={handleRequestPermission}
                    disabled={requestingPerm}
                    className="btn-mauve-shiny px-3 py-1.5 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{requestingPerm ? 'جاري التفعيل...' : 'تفعيل إشعارات المتصفح'}</span>
                  </button>
                )}

                <button
                  onClick={sendTestNotification}
                  className="px-2.5 py-1.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  title="إرسال تنبيه تجريبي لتأكيد عمل النظام ونغمة التنبيه"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>تجربة إشعار فوري 🚀</span>
                </button>
              </div>

              <button
                onClick={toggleSound}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 border transition-all cursor-pointer ${
                  isSoundEnabled
                    ? 'bg-purple-100 text-purple-900 border-purple-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title={isSoundEnabled ? 'كتم نغمة التنبيه الصوتية' : 'تشغيل نغمة التنبيه الصوتية'}
              >
                {isSoundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>النغمة: شغالة</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span>النغمة: صامت</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Admin compose broadcast button */}
          {isAdmin && (
            <button
              onClick={() => {
                onClose();
                setAdminBroadcastModalOpen(true);
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-900 hover:to-indigo-950 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>إرسال تعميم وقرار إداري للفرق والمجموعات</span>
            </button>
          )}

          {/* Notifications List */}
          <div className="space-y-2">
            {isGuard && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  أنت مسجل كحارس مسؤول عن عقار <strong>({guard.assignedPropertyName || 'الترف'})</strong>. يتم عرض الإشعارات الخاصة بهذا العقار فقط.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-700 text-xs">سجل الإشعارات والتنبيهات:</span>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-medium">
                  حذف تلقائي لأي تنبيه مر عليه أسبوع ⏳
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{filteredNotifications.length} إشعار</span>
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <span>لا توجد إشعارات جديدة حالياً</span>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                let Icon = Sparkles;
                let iconCls = 'bg-slate-100 text-slate-600';

                if (notif.type === 'booking' || notif.type === 'deposit_confirmed') {
                  Icon = CheckCircle2;
                  iconCls = 'bg-purple-100 text-purple-800';
                } else if (notif.type === 'deposit_request') {
                  Icon = DollarSign;
                  iconCls = 'bg-amber-100 text-amber-900';
                } else if (notif.type === 'commission') {
                  Icon = Percent;
                  iconCls = 'bg-emerald-100 text-emerald-800';
                } else if (notif.type === 'permission') {
                  Icon = Shield;
                  iconCls = 'bg-amber-100 text-amber-800';
                } else if (notif.type === 'checkout') {
                  Icon = LogOut;
                  iconCls = 'bg-purple-100 text-purple-900';
                } else if (notif.type === 'insurance') {
                  Icon = DollarSign;
                  iconCls = 'bg-amber-100 text-amber-900';
                } else if (notif.type === 'broadcast') {
                  Icon = Megaphone;
                  iconCls = notif.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-800';
                }

                return (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      notif.read
                        ? 'bg-slate-50/50 border-slate-100 opacity-75'
                        : notif.type === 'broadcast' && notif.priority === 'urgent'
                        ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                        : 'bg-purple-50/50 border-purple-200 shadow-xs'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconCls}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{notif.description}</p>
                      
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        {notif.groupName && (
                          <span className="text-[9px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-semibold">
                            موجّه لـ: {notif.groupName}
                          </span>
                        )}
                        {notif.targetAudience === 'admin_and_guard' && (
                          <span className="text-[9px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-semibold">
                            خاص بالحارس والإدارة
                          </span>
                        )}
                        {notif.targetAudience === 'admin_only' && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                            خاص بالإدارة فقط
                          </span>
                        )}
                        {notif.broadcastId && notif.requiresAcknowledgment && !notif.read && (
                          <button
                            onClick={() => acknowledgeBroadcast(notif.broadcastId!)}
                            className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            ✅ تأكيد الاطلاع
                          </button>
                        )}
                      </div>

                      {/* Dedicated Action Button: إكمال المتبقي والتأمين (فور تأكيد الحضور من الحارس) */}
                      {notif.linkToBookingId && (notif.title.includes('حضور') || notif.title.includes('وصل') || notif.description.includes('إكمال المتبقي والتأمين')) && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const res = sendPaymentCompletionRequest(notif.linkToBookingId!);
                              if (res.whatsappUrl) {
                                window.open(res.whatsappUrl, '_blank');
                              }
                              onClose();
                            }}
                            className="w-full py-2 px-3 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-purple-200" />
                            <span>📱 إرسال "إكمال المتبقي والتأمين" عبر واتساب فوراً</span>
                          </button>
                        </div>
                      )}

                      {/* Receipt / Attachment 1-Click Preview & Download */}
                      {notif.receiptUrl && (
                        <div className="pt-2">
                          <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-xl p-2 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Paperclip className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span className="font-bold text-emerald-950 text-[11px] truncate">
                                {notif.receiptName || 'إيصال / صورة مرفقة'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewReceipt({ url: notif.receiptUrl!, name: notif.receiptName, title: notif.title })}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>معاينة</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadReceipt(notif.receiptUrl, notif.receiptName)}
                                className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg cursor-pointer transition-colors shadow-2xs"
                                title="حفظ وتحميل الصورة بضغطة زر واحدة"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          {unreadNotificationsCount > 0 ? (
            <button
              onClick={markNotificationsAsRead}
              className="text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
            >
              تعليم الكل كمقروء
            </button>
          ) : (
            <span className="text-slate-400">جميع الإشعارات مقروءة</span>
          )}

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Receipt Image Preview Modal inside Notifications */}
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
    </div>
  );
};
