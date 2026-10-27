import React, { useState } from 'react';
import { Guard } from '../../types';
import { Edit2, Shield, Lock, Check } from 'lucide-react';

interface GuardProfileCardProps {
  guard: Guard;
  isAdmin: boolean;
  onSave?: (data: Partial<Guard>) => void;
}

export const GuardProfileCard: React.FC<GuardProfileCardProps> = ({ guard, isAdmin, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Guard>>({});
  const [justSaved, setJustSaved] = useState(false);

  const fields: [keyof Guard, string][] = [
    ['name', 'الاسم'],
    ['jobTitle', 'المسمى الوظيفي'],
    ['phone', 'رقم الجوال'],
    ['nationalId', 'رقم الهوية'],
    ['startDate', 'تاريخ المباشرة'],
    ['iban', 'رقم الآيبان لاستلام الراتب'],
  ];

  const getFieldValue = (key: keyof Guard) => {
    if (key === 'jobTitle') return guard.jobTitle || 'حارس ومشرف العقارات والاستراحات';
    return guard[key] || '';
  };

  const startEdit = () => {
    setFormData({
      name: guard.name || '',
      jobTitle: getFieldValue('jobTitle') as string,
      phone: guard.phone || '',
      nationalId: guard.nationalId || '',
      startDate: guard.startDate || '',
      iban: guard.iban || '',
      salary: guard.salary || 3500,
    });
    setIsEditing(true);
    setJustSaved(false);
  };

  const handleSave = () => {
    if (isAdmin && onSave) {
      onSave({
        name: (formData.name || '').trim() || guard.name,
        jobTitle: (formData.jobTitle || '').trim(),
        phone: (formData.phone || '').trim() || guard.phone,
        nationalId: (formData.nationalId || '').trim(),
        startDate: formData.startDate || '',
        iban: (formData.iban || '').trim(),
        salary: Number(formData.salary) || 0,
      });
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    }
  };

  const salaryNum = Number(guard.salary) || 0;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-3.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-700" />
          <h3 className="text-sm font-black text-purple-950">الملف الشخصي - بيانات العامل</h3>
        </div>

        {isAdmin ? (
          !isEditing ? (
            <button
              onClick={startEdit}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Edit2 className="w-3 h-3" />
              <span>تعديل البيانات</span>
            </button>
          ) : null
        ) : (
          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-800" />
            <span>للعرض فقط - التعديل من الإدارة</span>
          </span>
        )}
      </div>

      {justSaved && !isEditing && (
        <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>تم حفظ بيانات العامل بنجاح</span>
        </div>
      )}

      {/* Salary Highlight */}
      <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <span className="text-xs font-bold">الراتب الشهري</span>
        <span className="text-lg font-black font-mono">
          {salaryNum > 0 ? `${salaryNum.toLocaleString('en-US')} ر.س` : 'لم يحدد بعد'}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fields.map(([k, label]) => (
              <label key={k} className="block">
                <span className="text-[10px] text-slate-500 font-bold block mb-0.5">{label}</span>
                <input
                  type={k === 'startDate' ? 'date' : 'text'}
                  value={formData[k] as string || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [k]: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">الراتب الشهري (ر.س)</span>
            <input
              type="number"
              min="0"
              value={formData.salary || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, salary: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-600"
            />
          </label>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              حفظ التعديل
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {fields
            .concat([['email', 'البريد الإلكتروني للدخول']])
            .map(([k, label]) => (
              <div key={k} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold block mb-0.5">{label}</span>
                <span className="text-xs font-bold text-slate-900 break-all">
                  {String(getFieldValue(k) || 'غير مسجل')}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
