import { InlineKeyboard } from 'grammy';

const labels = ['A', 'B', 'C', 'D'];

export function getAnswerKeyboard(answers: Array<{ id: string; text: string }>, questionIndex: number) {
  const kb = new InlineKeyboard();

  answers.forEach((answer, i) => {
    const label = labels[i] || String.fromCharCode(65 + i);
    kb.text(`${label}) ${answer.text}`.slice(0, 64), `answer:${questionIndex}:${answer.id}`);
    if (i % 2 === 1) kb.row();
  });
  if (answers.length % 2 === 1) kb.row();

  return kb;
}

export function getNextQuestionKeyboard(lang = 'uz') {
  const texts: Record<string, string> = {
    uz: 'Keyingi savol ➡️',
    ru: 'Следующий вопрос ➡️',
    kr: 'Кейинги савол ➡️',
  };

  return new InlineKeyboard().text(texts[lang] || texts.uz, 'next_question');
}
