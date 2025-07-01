import { ProfitGrade } from '../types';

export const PROFIT_GRADES: ProfitGrade[] = [
  { 
    label: 'Беззбитковість', 
    profitPct: 0, 
    takes: 5, 
    stops: 10, 
    winRate: 33.3,
    className: 'grade-breakeven',
    description: '5 тейків + 10 стопів = 0% прибутку'
  },
  { 
    label: 'Легкий прибуток', 
    profitPct: 3, 
    takes: 6, 
    stops: 9, 
    winRate: 40,
    className: 'grade-light',
    description: '6 тейків + 9 стопів = 3% прибутку'
  },
  { 
    label: 'Хороший прибуток', 
    profitPct: 6, 
    takes: 7, 
    stops: 8, 
    winRate: 46.7,
    className: 'grade-good',
    description: '7 тейків + 8 стопів = 6% прибутку'
  },
  { 
    label: 'Відмінний прибуток', 
    profitPct: 9, 
    takes: 8, 
    stops: 7, 
    winRate: 53.3,
    className: 'grade-excellent',
    description: '8 тейків + 7 стопів = 9% прибутку'
  },
  { 
    label: 'Чудовий прибуток', 
    profitPct: 12, 
    takes: 9, 
    stops: 6, 
    winRate: 60,
    className: 'grade-amazing',
    description: '9 тейків + 6 стопів = 12% прибутку'
  }
];

export function getCurrentGrade(takes: number, stops: number, profit: number): ProfitGrade | null {
  // Спочатку перевіряємо точні комбінації
  const exactMatch = PROFIT_GRADES.find(g => g.takes === takes && g.stops === stops);
  if (exactMatch) {
    return exactMatch;
  }

  // Якщо немає точного співпадіння, знаходимо найближчу нижню градацію за прибутком
  for (let i = PROFIT_GRADES.length - 1; i >= 0; i--) {
    if (profit >= PROFIT_GRADES[i].profitPct) {
      return PROFIT_GRADES[i];
    }
  }

  return null;
}

export function updateProfitGradeDisplay(takes: number, stops: number, profit: number) {
  const container = document.getElementById('profit-grades-list')!;
  const currentLevelElement = document.getElementById('current-level')!;

  container.innerHTML = '';

  const currentGrade = getCurrentGrade(takes, stops, profit);

  PROFIT_GRADES.forEach(grade => {
    const gradeElement = document.createElement('div');
    gradeElement.className = `profit-grade-item ${grade.className}`;

    // Визначаємо чи досягнуто цей рівень
    const isAchieved = profit >= grade.profitPct;
    const isCurrent = currentGrade && currentGrade.profitPct === grade.profitPct;

    if (isAchieved) {
      gradeElement.classList.add('achieved');
    }

    if (isCurrent) {
      gradeElement.classList.add('current');
    }

    gradeElement.innerHTML = `
      <div class="grade-header">
        <span class="grade-title">${grade.label}</span>
        <span class="grade-percentage">${grade.profitPct}%</span>
      </div>
      <div class="grade-requirement">${grade.description}</div>
      <div class="grade-winrate">Потрібний win-rate: ${grade.winRate}%</div>
    `;

    container.appendChild(gradeElement);
  });

  // Оновлюємо поточний рівень
  if (currentGrade) {
    currentLevelElement.innerHTML = `
      Поточний рівень: ${currentGrade.label}
    `;
    currentLevelElement.className = `current-level-display ${currentGrade.className}`;
  } else {
    currentLevelElement.innerHTML = `
      Поточний рівень: Початковий рівень
    `;
    currentLevelElement.className = 'current-level-display initial';
  }
}