import { ProfitGrade } from '../types';

const PROFIT_GRADES: ProfitGrade[] = [
  {
    id: 'breakeven',
    title: 'Беззбиткові',
    minProfit: 0,
    minWinRate: 33.3,
    color: '#ffd93d',
    emoji: '⚖️'
  },
  {
    id: 'light',
    title: 'Легкий прибуток',
    minProfit: 5,
    minWinRate: 40,
    color: '#06d6a0',
    emoji: '🌱'
  },
  {
    id: 'good',
    title: 'Хороший прибуток',
    minProfit: 15,
    minWinRate: 45,
    color: '#10b981',
    emoji: '💚'
  },
  {
    id: 'excellent',
    title: 'Відмінний прибуток',
    minProfit: 30,
    minWinRate: 50,
    color: '#8b5cf6',
    emoji: '💎'
  },
  {
    id: 'amazing',
    title: 'Неймовірний прибуток',
    minProfit: 50,
    minWinRate: 60,
    color: '#f59e0b',
    emoji: '🚀'
  }
];

export function updateProfitGradeDisplay(takes: number, stops: number, profit: number) {
  const container = document.getElementById('profit-grades-list')!;
  const currentLevelDisplay = document.getElementById('current-level-display')!;

  container.innerHTML = '';

  const totalPositions = takes + stops;
  const winRate = totalPositions > 0 ? (takes / totalPositions) * 100 : 0;

  let currentGrade: ProfitGrade | null = null;

  PROFIT_GRADES.forEach(grade => {
    const item = document.createElement('div');
    item.className = 'profit-grade-item';

    const achieved = profit >= grade.minProfit && winRate >= grade.minWinRate;
    const isCurrent = !currentGrade && profit >= grade.minProfit && winRate >= grade.minWinRate;

    if (achieved) {
      item.classList.add('achieved');
      currentGrade = grade;
    }

    if (isCurrent) {
      item.classList.add('current');
    }

    item.innerHTML = `
      <div class="grade-header">
        <span class="grade-title">${grade.emoji} ${grade.title}</span>
        <span class="grade-percentage">${grade.minProfit}%+</span>
      </div>
      <div class="grade-requirement">Мінімум ${grade.minProfit}% прибутку</div>
      <div class="grade-winrate">Win-rate: ${grade.minWinRate}%+</div>
    `;

    container.appendChild(item);
  });

  // Update current level display
  if (currentGrade) {
    currentLevelDisplay.textContent = `Поточний рівень: ${currentGrade.title}`;
    currentLevelDisplay.className = `current-level-display grade-${currentGrade.id}`;
  } else {
    currentLevelDisplay.textContent = 'Поточний рівень: Початковий рівень';
    currentLevelDisplay.className = 'current-level-display initial';
  }
}