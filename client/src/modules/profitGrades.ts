import { ProfitGrade } from '../types';

const PROFIT_GRADES: ProfitGrade[] = [
  {
    id: 'breakeven',
    title: 'Беззбиткові',
    description: '5 тейків + 10 стопів = 0% прибутку',
    minProfit: 0,
    takes: 5, 
    stops: 10, 
    minWinRate: 33.3,
    color: '#ffd93d',
    emoji: '⚖️'
  },
  {
    id: 'light',
    title: 'Легкий прибуток',
    description: '6 тейків + 9 стопів = 3% прибутку',
    minProfit: 3,
    takes: 6, 
    stops: 9, 
    minWinRate: 40,
    color: '#06d6a0',
    emoji: '🌱'
  },
  {
    id: 'good',
    title: 'Хороший прибуток',
     description: '7 тейків + 8 стопів = 6% прибутку',
    minProfit: 6,
    takes: 7, 
    stops: 8, 
    minWinRate: 45,
    color: '#10b981',
    emoji: '💚'
  },
  {
    id: 'excellent',
    title: 'Відмінний прибуток',
    description: '8 тейків + 7 стопів = 9% прибутку',
    minProfit: 9,
    takes: 8, 
    stops: 7, 
    minWinRate: 50,
    color: '#8b5cf6',
    emoji: '💎'
  },
  {
    id: 'amazing',
    title: 'Неймовірний прибуток',
    description: '9 тейків + 6 стопів = 12% прибутку',
    minProfit: 12,
    takes: 9, 
    stops: 6,
    minWinRate: 60,
    color: '#f59e0b',
    emoji: '🚀'
  }
];

function getCurrentGrade(takes: number): ProfitGrade | null {
  // Якщо немає точного співпадіння, знаходимо найближчу нижню градацію за кількістю тейків
  const currentGrade = PROFIT_GRADES.reverse().find((grade) => takes >= grade.takes);

  if(!currentGrade){
    return null;
  }

  return currentGrade;
}

export function updateProfitGradeDisplay(takes: number, stops: number, profit: number) {
  const container = document.getElementById('profit-grades-list')!;
  const currentLevelDisplay = document.getElementById('current-level-display')!;
  currentLevelDisplay.classList.remove('current');
  
  container.innerHTML = '';

  const totalPositions = takes + stops;
  const winRate = totalPositions > 0 ? (takes / totalPositions) * 100 : 0;

  let currentGrade = getCurrentGrade(takes)

  PROFIT_GRADES.reverse().forEach(grade => {
    const item = document.createElement('div');
    item.className = 'profit-grade-item';

    const achieved = takes >= grade.takes;
    const isCurrent = grade.id === currentGrade?.id

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
      <div class="grade-winrate">Win-rate: ${grade.description}</div>
    `;

    container.appendChild(item);
  });

  // Update current level display
  if (currentGrade) {
    currentLevelDisplay.textContent = `Поточний рівень: ${currentGrade.title}`;
    currentLevelDisplay.className = `current-level-display.grade-${currentGrade.id}`;
  } else {
    currentLevelDisplay.textContent = 'Поточний рівень: Початковий рівень';
    currentLevelDisplay.className = 'current-level-display.initial';
  }
}