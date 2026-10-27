/**
 * AMASA - لوحة التحكم المركزية
 * قاموس ومعجم جميع النصوص الفرعية (subtext) والنصوص التوضيحية والمساعدة (helperText)
 * 
 * هذا الملف يجمع ويوثق كافة الأكواد والنصوص التوضيحية المستخدمة في شاشة لوحة التحكم
 * مصنفة حسب الأدوار (إدارة، مسوقة، حارس)، والأقسام، والنوافذ المنبثقة، وقوالب المراسلة.
 */

export interface HelperTextItem {
  id: string;
  category: 'header' | 'guard' | 'marketer' | 'admin' | 'arrivals' | 'departures' | 'financial' | 'modals' | 'tooltips' | 'empty_states';
  elementName: string;
  subtext?: string;
  role: 'all' | 'guard' | 'marketer' | 'admin';
  description: string;
}

export const DASHBOARD_HELPER_TEXTS: Record<string, HelperTextItem> = {
  // =========================================================================
  // 1. الترويسة الرئيسية والعناوين العامة (Header & Overview Subtexts)
  // =========================================================================
  header_guard_subtext: {
    id: 'header_guard_subtext',
    category: 'header',
    elementName: 'العنوان الرئيسي للوحة تحكم الحارس',
    subtext: 'متابعة وتأكيد وصول وخروج النزلاء واستلام وإعادة التأمين',
    role: 'guard',
    description: 'يظهر أسفل عنوان "دخول وخروج اليوم" عندما يكون الحساب قيد تشغيل وضع الحارس.',
  },
  header_default_subtext: {
    id: 'header_default_subtext',
    category: 'header',
    elementName: 'العنوان الرئيسي للوحة التحكم العامة (الإدارة والمسوقات)',
    role: 'all',
    description: 'يظهر أسفل عنوان "لوحة التحكم المركزية" للمسوقات والإدارة لتوضيح طريقة العرض الأفقية السريعة.',
  },
  available_props_subtext: {
    id: 'available_props_subtext',
    category: 'header',
    elementName: 'قسم الاستراحات المتاحة للتأجير اليوم',
    subtext: 'جاهزة للاستقبال الفوري دون حجوزات حالية',
    role: 'all',
    description: 'يصف قائمة الوحدات الشاغرة الجاهزة للتسكين الفوري.',
  },
  search_placeholder: {
    id: 'search_placeholder',
    category: 'header',
    elementName: 'خانة البحث السريع باللوحة',
    subtext: 'بحث سريع بالاسم أو رقم الجوال...',
    role: 'all',
    description: 'نص إرشادي داخل حقل البحث لتسهيل العثور على الحجوزات.',
  },

  // =========================================================================
  // 2. حركات دخول اليوم (Today Arrivals Subtexts & Helper Texts)
  // =========================================================================
  arrivals_section_badge: {
    id: 'arrivals_section_badge',
    category: 'arrivals',
    elementName: 'شارة مباشر دخول اليوم',
    subtext: 'مباشر اليوم',
    role: 'all',
    description: 'شارة حية متحركة تبيّن أن الحركات المعروضة تخص تاريخ اليوم الحالي.',
  },
  arrivals_guard_helper: {
    id: 'arrivals_guard_helper',
    category: 'arrivals',
    elementName: 'عنوان قسم دخول اليوم للحارس',
    subtext: 'حركات الاستقبال والتسليم',
    role: 'guard',
    description: 'نص مساعد بجوار شارة الاستقبال في شاشة الحارس.',
  },
  arrivals_empty_title: {
    id: 'arrivals_empty_title',
    category: 'empty_states',
    elementName: 'حالة عدم وجود حركات دخول',
    subtext: 'لا توجد حركات دخول مسجلة لليوم مطابقة لخيارات البحث',
    role: 'all',
    description: 'يظهر في وسط القسم عندما تكون قائمة الدخول فارغة أو لا تطابق البحث.',
  },
  arrivals_empty_subtext: {
    id: 'arrivals_empty_subtext',
    category: 'empty_states',
    elementName: 'توجيه حالة عدم وجود حركات دخول',
    subtext: 'ستظهر هنا أي حجوزات جديدة يتم تسجيل موعد دخولها اليوم تلقائياً',
    role: 'all',
    description: 'نص توضيحي لطمأنة المستخدم بكيفية ظهور الحجوزات الجديدة فور تسجيلها.',
  },

  // =========================================================================
  // 3. أزرار وإجراءات الحارس في الدخول (Guard Arrival Actions)
  // =========================================================================
  guard_arrival_action_pending: {
    id: 'guard_arrival_action_pending',
    category: 'guard',
    elementName: 'زر وصل العميل (تأكيد الحضور)',
    subtext: 'مسؤولية الحارس: النقر على [وصل العميل] فور وصول النزيل لإشعار المسوقة والإدارة فوراً',
    role: 'guard',
    description: 'تلميح المساعدة وشرح الإجراء للحارس عند حضور العميل للبوابة.',
  },
  guard_arrival_action_confirmed: {
    id: 'guard_arrival_action_confirmed',
    category: 'guard',
    elementName: 'شارة وصل العميل بعد الاعتماد',
    subtext: 'وصل العميل ✓ ({وقت الوصول})',
    role: 'guard',
    description: 'توثيق رسمي لوقت وتاريخ حضور النزيل بعد ضغط الحارس على الزر.',
  },
  guard_cash_insurance_pending: {
    id: 'guard_cash_insurance_pending',
    category: 'guard',
    elementName: 'زر استلام التأمين كاش للحارس',
    subtext: 'مسؤولية الحارس: استلام التأمين كاش وكتابة المبلغ المستلم وإرسال إشعار للإدارة والمسوقة',
    role: 'guard',
    description: 'إرشاد الحارس لتسجيل المبلغ النقدي المستلم من العميل.',
  },
  guard_cash_insurance_confirmed: {
    id: 'guard_cash_insurance_confirmed',
    category: 'guard',
    elementName: 'شارة استلام التأمين كاش المعتمدة',
    subtext: '✓ التأمين: مستلم كاش ({مبلغ التأمين} ر.س)',
    role: 'guard',
    description: 'يؤكد أن الحارس استلم المبلغ نقداً وتم إثباته في قاعدة بيانات النظام.',
  },
  guard_digital_insurance_confirmed: {
    id: 'guard_digital_insurance_confirmed',
    category: 'guard',
    elementName: 'شارة التأمين المحول بنكياً في شاشة الحارس',
    subtext: '✓ التأمين: محوّل بنكياً ✓',
    role: 'guard',
    description: 'تنبيه للحارس بعدم مطالبة العميل بتأمين نقدي لوجود إيصال تحويل معتمد.',
  },

  // =========================================================================
  // 4. أزرار وإجراءات المسوقة في الدخول (Marketer Arrival Actions)
  // =========================================================================
  marketer_arrival_status_waiting: {
    id: 'marketer_arrival_status_waiting',
    category: 'marketer',
    elementName: 'حالة وصول العميل في لوحة المسوقة',
    subtext: 'بانتظار وصول العميل (الحارس)',
    role: 'marketer',
    description: 'تنبيه المسوقة بأن العميل لم يصل بعد إلى البوابة.',
  },
  marketer_arrival_status_confirmed: {
    id: 'marketer_arrival_status_confirmed',
    category: 'marketer',
    elementName: 'حالة وصول العميل بعد تأكيد الحارس',
    subtext: 'وصل العميل ✓ ({وقت الوصول})',
    role: 'marketer',
    description: 'إشعار للمسوقة بوصول العميل للبدء بإرسال رسائل إكمال الدفع والتأمين.',
  },
  marketer_payment_reminder_button: {
    id: 'marketer_payment_reminder_button',
    category: 'marketer',
    elementName: 'زر رسالة الترحيب وتذكير الدفع للمسوقة',
    subtext: 'مسؤولية المسوقة: إرسال رسالة الترحيب وتذكير إكمال المتبقي والتأمين عبر واتساب',
    role: 'marketer',
    description: 'تلميح زر الواتساب لإرسال القالب الرسمي للمتبقي والتأمين والآيبان.',
  },
  marketer_digital_insurance_button: {
    id: 'marketer_digital_insurance_button',
    category: 'marketer',
    elementName: 'زر دفع التأمين تحويل للمسوقة',
    subtext: 'مسؤولية المسوقة: دفع التأمين تحويل برفع إيصال الحوالة البنكية وتأكيد المعاملة',
    role: 'marketer',
    description: 'يفتح نافذة رفع إيصال التحويل البنكي للتأمين وتوثيقه.',
  },
  marketer_cash_insurance_alert_button: {
    id: 'marketer_cash_insurance_alert_button',
    category: 'marketer',
    elementName: 'زر دفع التأمين كاش (إشعار للحارس)',
    subtext: 'مسؤولية المسوقة: دفع التأمين كاش بإرسال إشعار فوري للحارس مع كتابة مبلغ التأمين',
    role: 'marketer',
    description: 'يفتح نافذة إشعار الحارس بالتوجه للعميل وتحصيل مبلغ التأمين نقداً.',
  },

  // =========================================================================
  // =========================================================================
  departures_section_badge: {
    id: 'departures_section_badge',
    category: 'departures',
    elementName: 'شارة خروج ومغادرة اليوم',
    subtext: 'مغادرة وخروج اليوم',
    role: 'all',
    description: 'شارة تنبه بحلول موعد إخلاء العقارات واستلام المفاتيح.',
  },
  departures_header_subtext: {
    id: 'departures_header_subtext',
    category: 'departures',
    elementName: 'العنوان الفرعي لقسم المغادرة',
    role: 'all',
    description: 'يلخص تسلسل خطوات دورة المغادرة الثلاثية بين المسوقة والحارس والإدارة.',
  },
  departures_empty_title: {
    id: 'departures_empty_title',
    category: 'empty_states',
    elementName: 'حالة عدم وجود حركات مغادرة',
    subtext: 'لا توجد حركات خروج مسجلة لليوم مطابقة لخيارات البحث',
    role: 'all',
    description: 'يظهر عندما لا توجد عمليات إخلاء أو مغادرة مجدولة لليوم.',
  },
  departures_empty_subtext: {
    id: 'departures_empty_subtext',
    category: 'empty_states',
    elementName: 'توجيه حالة عدم وجود حركات مغادرة',
    subtext: 'ستظهر هنا أي حجوزات يحل موعد مغادرتها وخروجها اليوم تلقائياً',
    role: 'all',
    description: 'نص مساعد يشرح التحديث الآلي لحالات المغادرة اليومية.',
  },
  guard_checkout_cleanliness_button: {
    id: 'guard_checkout_cleanliness_button',
    category: 'guard',
    elementName: 'زر تأكيد النظافة والخروج للحارس',
    subtext: 'مسؤولية الحارس: النقر على [تأكيد النظافة والخروج] لإغلاق دورة الحجز النشط',
    role: 'guard',
    description: 'الإجراء الختامي للحارس بعد معاينة الاستراحة والتأكد من سلامتها.',
  },
  marketer_checkout_reminder_button: {
    id: 'marketer_checkout_reminder_button',
    category: 'marketer',
    elementName: 'زر تذكير بالخروج للمسوقة',
    subtext: 'مسؤولية المسوقة: إرسال قالب واتساب لتذكير النزيل بالخروج وتفادي خصم التأمين',
    role: 'marketer',
    description: 'يرسل للنزيل تنبيهاً بالاستعداد للخروج وتسليم المفتاح للحارس.',
  },

  // =========================================================================
  // 6. الشريط المنسدل وأزرار التفاعل والمراسلة (Dropdown Drawer Helper Texts)
  // =========================================================================
  drawer_toggle_button: {
    id: 'drawer_toggle_button',
    category: 'tooltips',
    elementName: 'زر الشريط المنسدل في كرت الحجز',
    subtext: 'شريط منسدل ليظهر أزرار التفاعل والمراسلة',
    role: 'all',
    description: 'عنوان وتلميح الزر المنسدل لفتح وإغلاق خيارات التواصل والملخص المالي.',
  },
  drawer_toggle_tooltip: {
    id: 'drawer_toggle_tooltip',
    category: 'tooltips',
    elementName: 'تلميح زر الشريط المنسدل',
    subtext: 'فتح أو إغلاق شريط أزرار التفاعل والمراسلة والملخص المالي',
    role: 'all',
    description: 'يظهر عند الوقوف على زر السهم المنسدل.',
  },
  contact_client_whatsapp_tooltip: {
    id: 'contact_client_whatsapp_tooltip',
    category: 'tooltips',
    elementName: 'زر واتساب العميل السريع',
    subtext: 'محادثة واتساب مع العميل ({اسم العميل})',
    role: 'all',
    description: 'يفتح شات واتساب فوري مع النزيل بالرسائل المعتمدة.',
  },
  contact_client_call_tooltip: {
    id: 'contact_client_call_tooltip',
    category: 'tooltips',
    elementName: 'زر اتصال العميل السريع',
    subtext: 'اتصال هاتفي بالعميل ({رقم جوال العميل})',
    role: 'all',
    description: 'يجري اتصالاً مباشراً برقم العميل المسجل.',
  },
  contact_guard_whatsapp_tooltip: {
    id: 'contact_guard_whatsapp_tooltip',
    category: 'tooltips',
    elementName: 'زر واتساب الحارس السريع',
    subtext: 'محادثة واتساب مع الحارس ({اسم الحارس})',
    role: 'all',
    description: 'يفتح محادثة واتساب موجهة لحارس العقار المختص.',
  },
  contact_guard_call_tooltip: {
    id: 'contact_guard_call_tooltip',
    category: 'tooltips',
    elementName: 'زر اتصال الحارس السريع',
    subtext: 'اتصال بالحارس ({رقم الحارس})',
    role: 'all',
    description: 'يجري اتصالاً هاتفياً مباشراً بحارس العقار.',
  },
  contact_admin_whatsapp_tooltip: {
    id: 'contact_admin_whatsapp_tooltip',
    category: 'tooltips',
    elementName: 'زر واتساب الإدارة السريع',
    subtext: 'محادثة واتساب مع الإدارة العامة',
    role: 'all',
    description: 'يفتح محادثة مباشرة مع رقم إدارة التطبيق المعتمد.',
  },
  contact_admin_call_tooltip: {
    id: 'contact_admin_call_tooltip',
    category: 'tooltips',
    elementName: 'زر اتصال الإدارة السريع',
    subtext: 'اتصال هاتفي بالإدارة العامة (0500000001)',
    role: 'all',
    description: 'للاتصال الهاتفي السريع بإدارة العمليات.',
  },
  booking_details_button_tooltip: {
    id: 'booking_details_button_tooltip',
    category: 'tooltips',
    elementName: 'زر تفاصيل الحجز',
    subtext: 'عرض كافة تفاصيل الحجز والعقد والخدمات',
    role: 'all',
    description: 'يفتح نافذة عرض عقد الحجز والخدمات الإضافية والبيانات الكاملة.',
  },

  // =========================================================================
  // 7. التفاصيل المالية ومؤشرات الحسابات (Financial Helper Texts)
  // =========================================================================
  finance_total_helper: {
    id: 'finance_total_helper',
    category: 'financial',
    elementName: 'خانة الإجمالي في الملخص المالي',
    subtext: 'الإجمالي (القيمة الإجمالية لإقامة العميل شاملة الخدمات)',
    role: 'all',
    description: 'القيمة المالية الكلية للحجز.',
  },
  finance_deposit_helper: {
    id: 'finance_deposit_helper',
    category: 'financial',
    elementName: 'خانة العربون في الملخص المالي',
    subtext: 'العربون (المبلغ المدفوع مسبقاً لتثبيت الحجز)',
    role: 'all',
    description: 'قيمة العربون المعتمد المدفوع بنكياً.',
  },
  finance_remaining_helper: {
    id: 'finance_remaining_helper',
    category: 'financial',
    elementName: 'خانة المتبقي في الملخص المالي',
    subtext: 'المتبقي (المبلغ المستحق سداده عند استلام العقار)',
    role: 'all',
    description: 'يوضح ما إذا كان المتبقي مسدد بالكامل أو بانتظار التحصيل.',
  },
  finance_insurance_helper: {
    id: 'finance_insurance_helper',
    category: 'financial',
    elementName: 'خانة التأمين في الملخص المالي',
    subtext: 'التأمين (مبلغ التأمين المسترد المودع لحماية العقار)',
    role: 'all',
    description: 'مبلغ التأمين المشروط في عقد الإقامة لحماية الاستراحة.',
  },
  finance_net_commission_helper: {
    id: 'finance_net_commission_helper',
    category: 'financial',
    elementName: 'عمولة المسوقة والرسوم الإدارية',
    subtext: 'الرسوم الإدارية (50 ر.س) • عمولة المسوقة (5% أو 7% بموافقة الإدارة) • صافي المالك',
    role: 'admin',
    description: 'شريط تصفية الحسابات المالية للمغادرة وتوزيع المستحقات.',
  },

  // =========================================================================
  // 8. النوافذ المنبثقة وتأكيدات الأمان (Modals & Confirmation Dialogs Helper Texts)
  // =========================================================================
  confirm_guard_modal_warning: {
    id: 'confirm_guard_modal_warning',
    category: 'modals',
    elementName: 'تنبيه تأكيد الإرسال لتجنب الخطأ بالضغط',
    subtext: 'تنبيه لتجنب الخطأ بالضغط: هل أنت متأكد من رغبتك في إرسال هذا التنبيه للإدارة والموظف المسؤول؟',
    role: 'guard',
    description: 'رسالة أمان تظهر للحارس قبل اعتماد الحضور أو استلام الكاش أو الخروج لتفادي النقر الخاطئ.',
  },
  confirm_guard_attendance_desc: {
    id: 'confirm_guard_attendance_desc',
    category: 'modals',
    elementName: 'رسالة شرح تأكيد حضور العميل',
    subtext: 'سيتم تأكيد حضور العميل ({اسم العميل}) وإرسال إشعار فوري لمسوقة الحجز ({اسم المسوقة}) والإدارة بالنظام لإرسال قالب إكمال المتبقي والتأمين.',
    role: 'guard',
    description: 'توضح للحارس ما يترتب على نقره على زر الحضور في نظام الإشعارات والعمليات.',
  },
  confirm_guard_cash_desc: {
    id: 'confirm_guard_cash_desc',
    category: 'modals',
    elementName: 'رسالة شرح استلام التأمين كاش للحارس',
    subtext: 'سيتم تأكيد استلام التأمين نقداً ({مبلغ التأمين} ريال) كاش وتوثيقه رسمياً في النظام وإشعار المسوقة والإدارة.',
    role: 'guard',
    description: 'توضح للحارس توثيق المبلغ في السجلات المالية وإشعار باقي الفريق.',
  },
  confirm_guard_exit_desc: {
    id: 'confirm_guard_exit_desc',
    category: 'modals',
    elementName: 'رسالة شرح تأكيد النظافة والخروج للحارس',
    subtext: 'سيتم تأكيد النظافة والخروج للعميل ({اسم العميل}) وإغلاق دورة الحجز النشط بنجاح.',
    role: 'guard',
    description: 'توضح للحارس إتمام الخروج وتحويل الحجز إلى مكتمل.',
  },
  digital_insurance_upload_subtext: {
    id: 'digital_insurance_upload_subtext',
    category: 'modals',
    elementName: 'إرشادات رفع صورة إيصال التحويل البنكي للتأمين',
    subtext: 'صيغ مدعومة: JPG, PNG, PDF (الحد الأقصى 3 ميجابايت)',
    role: 'marketer',
    description: 'النص المساعد تحت مساحة رفع ملف الحوالة البنكية.',
  },
  digital_insurance_notes_placeholder: {
    id: 'digital_insurance_notes_placeholder',
    category: 'modals',
    elementName: 'حقل ملاحظات الحوالة البنكية',
    subtext: 'مثال: حوالة من مصرف الراجحي باسم العميل',
    role: 'marketer',
    description: 'نص استرشادي يوضح للمسوقة نوع البيانات المفيدة كاسم البنك أو رقم العملية.',
  },
  guard_cash_input_contract_note: {
    id: 'guard_cash_input_contract_note',
    category: 'modals',
    elementName: 'إشعار المبلغ المحدد بالعقد في نافذة استلام الكاش',
    subtext: 'المبلغ المحدد في العقد: {مبلغ التأمين} ر.س',
    role: 'guard',
    description: 'يذكّر الحارس بقيمة التأمين المشروطة في العقد الأصلي للمقارنة مع المقبوض.',
  },
  guard_cash_notes_placeholder: {
    id: 'guard_cash_notes_placeholder',
    category: 'modals',
    elementName: 'ملاحظات استلام التأمين كاش',
    subtext: 'مثال: تم الاستلام نقداً عند بوابة الدخول',
    role: 'guard',
    description: 'نص إرشادي للحارس لتدوين مكان أو ظرف استلام النقد.',
  },
  marketer_cash_alert_subtext: {
    id: 'marketer_cash_alert_subtext',
    category: 'modals',
    elementName: 'شرح إرسال إشعار كاش التأمين للحارس',
    subtext: 'إرسال إشعار عاجل للحارس مع كتابة مبلغ التأمين للتحصيل',
    role: 'marketer',
    description: 'يبيّن للمسوقة وظيفة النافذة في إخطار الحارس بمبلغ التأمين المطلوب استلامه.',
  },
  marketer_cash_alert_notes_placeholder: {
    id: 'marketer_cash_alert_notes_placeholder',
    category: 'modals',
    elementName: 'توجيهات المسوقة للحارس في إشعار الكاش',
    subtext: 'مثال: يرجى التوجه للعميل عند البوابة واستلام التأمين',
    role: 'marketer',
    description: 'نص مقترح للتوجيه المباشر بين المسوقة وحارس البوابة.',
  },
  guard_inspection_damage_notes_subtext: {
    id: 'guard_inspection_damage_notes_subtext',
    category: 'modals',
    elementName: 'وصف أضرار وتلفيات المغادرة',
    subtext: 'يرجى كتابة وصف موجز للعبث أو الأضرار المرصودة بالاستراحة مع إرفاق الصور لإثبات الخصم رسمياً',
    role: 'guard',
    description: 'نص إلزامي مساعد للحارس عند تحديد خصم من مبلغ التأمين.',
  },

  // =========================================================================
  // 9. قوالب الواتساب والتنبيهات المباشرة (WhatsApp Microcopy & Helper Messages)
  // =========================================================================
  whatsapp_welcome_template_helper: {
    id: 'whatsapp_welcome_template_helper',
    category: 'marketer',
    elementName: 'قالب رسالة الترحيب للعميل',
    subtext: 'أهلاً وسهلاً بك أخي الكريم {العميل} في {العقار} 🌿 يسعدنا استقبالكم اليوم، ونتمنى لكم أوقاتاً ممتعة. لأي استفسار أو خدمة طوال إقامتكم نحن والحارس بخدمتكم دائماً.',
    role: 'marketer',
    description: 'نص قالب الترحيب المعتمد المرسل للنزيل عند بدء الإقامة.',
  },
  whatsapp_payment_completion_template_helper: {
    id: 'whatsapp_payment_completion_template_helper',
    category: 'marketer',
    elementName: 'قالب رسالة إكمال المتبقي والتأمين',
    subtext: 'نود تذكيركم بإكمال سداد المتبقي للإقامة ({المتبقي} ر.س) ومبلغ التأمين المسترد ({التأمين} ر.س). يمكن التحويل للآيبان المعتمد أو تسليم التأمين نقداً للحارس عند البوابة.',
    role: 'marketer',
    description: 'نص قالب المطالبة بالسداد والتأمين بعد تأكيد حضور العميل.',
  },
  whatsapp_checkout_reminder_template_helper: {
    id: 'whatsapp_checkout_reminder_template_helper',
    category: 'marketer',
    elementName: 'قالب رسالة تذكير الخروج والتحذير من التأخير',
    subtext: 'نود تذكيركم بموعد تسجيل الخروج في تمام {وقت الخروج}، وتسليم المفتاح للحارس لمعاينة الاستراحة واسترداد التأمين، وتفادي أي استقطاع من التأمين في حال التأخير.',
    role: 'marketer',
    description: 'قالب الواتساب المرسل قبل المغادرة لتجهيز الخروج واسترداد التأمين.',
  },
};

/**
 * دالة مساعدة لجلب كافة النصوص التوضيحية الخاصة بدور معين
 */
export const getHelperTextsByRole = (role: 'guard' | 'marketer' | 'admin' | 'all') => {
  return Object.values(DASHBOARD_HELPER_TEXTS).filter(
    (item) => item.role === role || item.role === 'all'
  );
};

/**
 * دالة مساعدة لجلب كافة النصوص التوضيحية الخاصة بتصنيف محدد
 */
export const getHelperTextsByCategory = (category: HelperTextItem['category']) => {
  return Object.values(DASHBOARD_HELPER_TEXTS).filter(
    (item) => item.category === category
  );
};
