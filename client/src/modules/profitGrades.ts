import { ProfitGrade } from '../types';

export const PROFIT_GRADES: ProfitGrade[] = [
  { 
    label: 'Беззбитковість', 
    profitPct: 0, 
    takes: 5, 
    stops: 10, 
    winRate: 33.3,
    className: 'grade-0'
  },
  { 
    label: 'Легкий прибуток', 
    profitPct: 3, 
    takes: 6, 
    stops: 9, 
    winRate: 40,
    className: 'grade-3'
  },
  { 
    label: 'Хороший прибуток', 
    profitPct: 6, 
    takes: 7, 
    stops: 8, 
    winRate: 46.7,
    className: 'grade-6'
  },
  { 
    label: 'Відмінний прибуток', 
    profitPct: 9, 
    takes: 8, 
    stops: 7, 
    winRate: 53.3,
    className: 'grade-9'
  },
  { 
    label: 'Чудовий прибуток', 
    profitPct: 12, 
    takes: 9, 
    stops: 6, 
    winRate: 60,
    className: 'grade-12'
  }
];

export function detectGrade(takes: number, stops: number): ProfitGrade | null {
  return PROFIT_GRADES.find(g => g.takes === takes && g.stops === stops) || null;
}

export function getGradeByProfit(profitPct: number): ProfitGrade | null {
  // Знаходимо найближчу нижню градацію
  for (let i = PROFIT_GRADES.length - 1; i >= 0; i--) {
    if (profitPct >= PROFIT_GRADES[i].profitPct) {
      return PROFIT_GRADES[i];
    }
  }
  return null;
}

export function updateGradeDisplay(takes: number, stops: number, profitPct: number) {
  const gradeBadge = document.getElementById('grade-badge')!;
  const gradeDescription = document.getElementById('grade-description')!;

  const exactGrade = detectGrade(takes, stops);
  const profitGrade = getGradeByProfit(profitPct);

  if (exactGrade) {
    // Точне співпадіння з градацією
    gradeBadge.textContent = `${exactGrade.label} (${exactGrade.profitPct}%)`;
    gradeBadge.className = `grade-badge ${exactGrade.className}`;
    gradeDescription.textContent = `${exactGrade.takes} тейків + ${exactGrade.stops} стопів = ${exactGrade.profitPct}% | Win-rate: ${exactGrade.winRate}%`;
  } else if (profitGrade) {
    // Показуємо за рівнем прибутку
    gradeBadge.textContent = `${profitGrade.label}+ (${profitPct.toFixed(1)}%)`;
    gradeBadge.className = `grade-badge ${profitGrade.className}`;
    gradeDescription.textContent = `Ваш результат перевищує рівень "${profitGrade.label}"`;
  } else {
    // Немає градації (збитки або початок)
    gradeBadge.textContent = profitPct < 0 ? 'Збитки' : 'Розпочато';
    gradeBadge.className = 'grade-badge';
    gradeDescription.textContent = profitPct < 0 ? 'Потрібно покращити результат' : 'Почніть торгувати для отримання градації';
  }
}