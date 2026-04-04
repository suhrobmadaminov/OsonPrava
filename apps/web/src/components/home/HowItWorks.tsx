'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

const stepColors = ['bg-duo-green', 'bg-duo-blue', 'bg-duo-yellow'];
const stepTextColors = ['text-duo-green', 'text-duo-blue', 'text-duo-yellow'];

const stepsData = {
  uz: [
    { title: "Ro'yxatdan o'ting", description: "Email yoki Telegram orqali tez va oson ro'yxatdan o'ting." },
    { title: "Test rejimini tanlang", description: "Biletlar, mavzular, imtihon yoki Oktagon — o'zingizga qulay rejimni tanlang." },
    { title: "Imtihondan o'ting", description: "Yetarlicha mashq qilib, haqiqiy imtihonni muvaffaqiyatli topshiring!" },
  ],
  ru: [
    { title: "Зарегистрируйтесь", description: "Быстрая и простая регистрация через email или Telegram." },
    { title: "Выберите режим теста", description: "Билеты, темы, экзамен или Октагон — выберите удобный режим." },
    { title: "Сдайте экзамен", description: "Достаточно потренировавшись, успешно сдайте реальный экзамен!" },
  ],
  kr: [
    { title: "Рўйхатдан ўтинг", description: "Email ёки Telegram орқали тез ва осон рўйхатдан ўтинг." },
    { title: "Тест режимини танланг", description: "Билетлар, мавзулар, имтиҳон ёки Октагон — ўзингизга қулай режимни танланг." },
    { title: "Имтиҳондан ўтинг", description: "Етарлича машқ қилиб, ҳақикий имтиҳонни муваффақиятли топширинг!" },
  ],
};

export function HowItWorks() {
  const locale = useLocale();
  const steps = stepsData[locale as keyof typeof stepsData] || stepsData.uz;

  return (
    <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl"
        >
          Qanday ishlaydi?
        </motion.h2>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-0 hidden h-full w-0.5 bg-gray-200 sm:left-8 md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative flex items-start gap-6"
              >
                {/* Step number */}
                <div
                  className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${stepColors[i]} text-xl font-extrabold text-white shadow-lg sm:h-16 sm:w-16 sm:text-2xl`}
                >
                  {i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-[0_4px_0_0_#e5e7eb]">
                  <h3 className={`text-xl font-extrabold ${stepTextColors[i]}`}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-gray-500">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
