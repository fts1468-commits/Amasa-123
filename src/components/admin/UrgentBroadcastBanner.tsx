import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  X,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UrgentBroadcastBanner: React.FC = () => {
  const { activeUrgentBroadcast, acknowledgeBroadcast, isAdmin } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!activeUrgentBroadcast) return null;

  const handleAcknowledge = () => {
    acknowledgeBroadcast(activeUrgentBroadcast.id);
  };

  return (
    <div className="bg-gradient-to-r from-rose-600 via-purple-700 to-rose-700 text-white shadow-lg border-b-2 border-rose-400/50 sticky top-0 z-40 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 animate-pulse">
              <span className="text-base">🚨</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  تعميم إداري عاجل
                </span>
                <span className="text-[11px] text-rose-100 font-medium hidden sm:inline">
                  موجّه إلى: ({activeUrgentBroadcast.targetGroupName})
                </span>
                <span className="text-[10px] text-rose-200 font-mono">
                  ساري من: {activeUrgentBroadcast.effectiveDate}
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                {activeUrgentBroadcast.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>{isExpanded ? 'طي التفاصيل' : 'قراءة القرار كاملاً'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleAcknowledge}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="تأكيد الاطلاع وإخفاء هذا التنبيه"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم الاطلاع والموافقة</span>
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-white/20 text-xs text-rose-50 space-y-2 animate-in fade-in duration-150">
            <p className="leading-relaxed bg-black/20 p-3 rounded-2xl whitespace-pre-line border border-white/10 text-white font-medium text-xs sm:text-sm">
              {activeUrgentBroadcast.content}
            </p>
            <div className="flex items-center justify-between text-[11px] text-rose-200">
              <span>المرسل: {activeUrgentBroadcast.senderName} (الإدارة العامة)</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `*📢 تعميم إداري عاجل: ${activeUrgentBroadcast.title}*\n\n${activeUrgentBroadcast.content}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 text-white font-bold"
              >
                <span>مشاركة عبر واتساب المجموعات</span>
                <Share2 className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
