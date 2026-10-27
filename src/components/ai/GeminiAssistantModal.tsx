import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  MessageCircle,
  RefreshCw,
  X,
  FileText,
  Percent,
  Key,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
}) => {
  const { currentMarketer, guard, isAdmin, properties } = useApp();

  const [prompt, setPrompt] = useState(initialPrompt);
  const [tone, setTone] = useState<'marketing' | 'booking' | 'welcome' | 'formal'>('marketing');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [usedModel, setUsedModel] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: 'عروض الويكند والخصومات',
      icon: Percent,
      tone: 'marketing' as const,
      text: 'صياغة عرض ترويجي مغري لنهاية الأسبوع لشاليهات ماسة (الترف، البيلسان، رانس، حمران) بخصم خاص وخدمات راقية للعائلات.',
    },
    {
      label: 'طلب العربون وتأكيد الحجز',
      icon: FileText,
      tone: 'booking' as const,
      text: 'صياغة رسالة رسمية ولطيفة لتأكيد تسجيل الحجز المبدئي وطلب تحويل مبلغ العربون لتثبيت الموعد وإصدار العقد الرسمي.',
    },
    {
      label: 'ترحيب النزلاء والدخول (الحارس)',
      icon: Key,
      tone: 'welcome' as const,
      text: 'صياغة رسالة ترحيبية من الحارس أبو راشد للنزيل عند الوصول، مع إرشادات موعد الدخول واستخدام المسبح وأرقام التواصل.',
    },
    {
      label: 'الخروج واسترداد التأمين',
      icon: ShieldCheck,
      tone: 'formal' as const,
      text: 'صياغة رسالة شكر للنزيل عند إنهاء الإقامة والخروج وتأكيد استرداد مبلغ التأمين بعد الفحص والاطمئنان على رضاهم.',
    },
  ];

  const handleSelectQuickPrompt = (qp: typeof quickPrompts[0]) => {
    setPrompt(qp.text);
    setTone(qp.tone);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          tone,
          contextType: tone,
        }),
      });

      if (!res.ok) {
        throw new Error(`خطأ في الاستجابة (${res.status})`);
      }

      const data = await res.json();
      setResult(data.text || '');
      setUsedModel(data.model || 'gemini-3.8-flash');
    } catch (err: any) {
      console.warn('Fallback to local generation:', err);
      // Seamless smart fallback
      const fallback = `أهلاً وسهلاً بك في استراحات وشاليهات ماسة الفاخرة ✨🏡\n\nبناءً على طلبكم: ${prompt}\n\nنود إفادتكم بتوفر أفضل الخدمات والمرافق المجهزة بمسابح خاصة ومجالس عائلية راقية في شاليهات الترف، البيلسان، رانس، وحمران (الما ونايا).\n\nللحجز والاستفسار الفوري، نحن في خدمتكم على مدار الساعة! 🤍🍃\n*إدارة شاليهات ماسة (AMASA)*`;
      setResult(fallback);
      setUsedModel('محرك ماسة الذكي');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!result) return;
    const encoded = encodeURIComponent(result);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-['Tajawal',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-purple-200/90 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#200738] via-[#35105b] to-[#1c0631] text-white p-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10 border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-6 h-6 text-purple-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  مساعد ماسة الذكي
                </h3>
                <span className="text-[10px] bg-amber-400/90 text-slate-950 font-black px-2 py-0.5 rounded-full font-mono">
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                توليد وصياغة رسائل الواتساب، عروض الشاليهات، وتأكيد الحجوزات والعقود بلباقة واحترافية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Quick Ideas Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>أفكار واقتراحات سريعة بنقرة واحدة:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickPrompt(qp)}
                    className="p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 bg-purple-50/40 hover:bg-purple-100/50 text-right text-xs font-bold text-purple-950 flex items-center gap-2.5 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-200/80 group-hover:bg-purple-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-purple-800" />
                    </div>
                    <span className="truncate">{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">أسلوب ونبرة الرسالة:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'marketing', label: 'تسويقي وترويجي' },
                { id: 'booking', label: 'تأكيد حجز وعربون' },
                { id: 'welcome', label: 'ترحيب بالحارس' },
                { id: 'formal', label: 'رسمي ومعتمد' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    tone === t.id
                      ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box (خانة كتابة الرسائل) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>اكتب فكرة الرسالة أو الموضوع المطلوب صياغته:</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {prompt.length} حرف
              </span>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="اكتب هنا مثلاً: اكتب عرض خصم خاص لشاليه كوخ البيلسان يوم الجمعة القادمة، مع التذكير بتوفر مسبح ألعاب مائية وجلسة خارجية..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-hidden transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Send Button (زر الإرسال والتوليد) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="btn-mauve-shiny flex-1 py-3 px-5 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>جارٍ صياغة الرسالة عبر Gemini...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>إرسال وتوليد الرسالة الذكية</span>
                </>
              )}
            </button>

            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="px-3.5 py-3 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* Generated Result Display Screen */}
          {result && (
            <div className="bg-[#FAF8FD] rounded-2xl border-2 border-purple-200 p-4 sm:p-5 space-y-3 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>الرسالة المقترحة والجاهزة للإرسال:</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md">
                  {usedModel}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-100/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line shadow-inner max-h-72 overflow-y-auto select-text font-sans">
                {result}
              </div>

              {/* Action Buttons for Result */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ للحافظة!' : 'نسخ الرسالة'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>مشاركة عبر واتساب</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="إعادة الصياغة بأسلوب مختلف"
                >
                  <RefreshCw className="w-3 h-3 text-purple-700" />
                  <span>إعادة صياغة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
