import { Achievement } from '../types';
import { post } from '../utils/api';
import { showToast } from '../utils/toast';

interface AchievementRule {
  code: string;
  title: string;
  description: string;
  checkCondition: (stats: any) => boolean;
}

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  {
    code: 'first-click',
    title: '🎯 Перший крок',
    description: 'Зробіть перший клік по позиції',
    checkCondition: (stats) => stats.totalClicks >= 1
  },
  {
    code: 'breakeven', 
    title: '⚖️ Беззбитковість',
    description: 'Досягніть 0% прибутку (5 тейків + 10 стопів)',
    checkCondition: (stats) => stats.profit === 0 && (stats.takes > 0 || stats.stops > 0)
  },
  {
    code: 'in-profit',
    title: '💰 Прибутковий трейдер', 
    description: 'Досягніть позитивного прибутку',
    checkCondition: (stats) => stats.profit > 0
  },
  {
    code: 'rr-expert',
    title: '🏆 Експерт ризик-менеджменту',
    description: 'Досягніть 9% прибутку',
    checkCondition: (stats) => stats.profit >= 9
  },
  {
    code: 'rr-master',
    title: '👑 Майстер торгівлі',
    description: 'Досягніть 12% прибутку',
    checkCondition: (stats) => stats.profit >= 12
  }
];

let unlockedAchievements = new Set<string>();
let totalClicks = 0;

export function initAchievements(achievements: Achievement[]) {
  unlockedAchievements.clear();
  achievements.forEach(a => {
    if (a.unlocked) {
      unlockedAchievements.add(a.code);
    }
  });
  updateAchievementsDisplay();
}

export function incrementClicks() {
  totalClicks++;
}

export async function checkAchievements(stats: { takes: number; stops: number; profit: number; winRate: number }) {
  const gameStats = {
    ...stats,
    totalClicks
  };

  for (const rule of ACHIEVEMENT_RULES) {
    if (!unlockedAchievements.has(rule.code) && rule.checkCondition(gameStats)) {
      try {
        await post(`/api/achievements/${rule.code}`, {});
        unlockedAchievements.add(rule.code);
        showToast(`🏆 Досягнення розблоковано: ${rule.title}`, 'success');
        updateAchievementsDisplay();
      } catch (error) {
        console.error('Помилка розблокування досягнення:', error);
      }
    }
  }
}

export function updateAchievementsDisplay() {
  const achievementsList = document.getElementById('achievements-list')!;
  achievementsList.innerHTML = '';

  ACHIEVEMENT_RULES.forEach(rule => {
    const isUnlocked = unlockedAchievements.has(rule.code);

    const achievementEl = document.createElement('div');
    achievementEl.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;

    achievementEl.innerHTML = `
      <div class="achievement-title">${rule.title}</div>
      <div class="achievement-desc">${rule.description}</div>
    `;

    achievementsList.appendChild(achievementEl);
  });
}