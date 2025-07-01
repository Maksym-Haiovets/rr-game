import { Position, UserSettings, Achievement, GameState } from './types';
import { get, put, post } from './utils/api';
import { showToast } from './utils/toast';
import { updateGradeDisplay } from './modules/profitGrades';
import { initAchievements, checkAchievements, incrementClicks, updateAchievementsDisplay } from './modules/achievements';
import { tutorialManager } from './modules/tutorial';

class RiskManagementGame {
  private gameState: GameState = {
    positions: [],
    settings: {
      id: 1,
      risk_per_position: 1.0,
      reward_ratio: 2.0,
      tutorial_completed: false,
      tutorial_skipped_forever: false
    },
    achievements: [],
    stats: {
      takes: 0,
      stops: 0,
      profit: 0,
      winRate: 0
    }
  };

  async init() {
    try {
      await this.loadGameState();
      this.setupUI();
      this.checkTutorial();

      console.log('✅ Гра ініціалізована успішно');
    } catch (error) {
      console.error('❌ Помилка ініціалізації гри:', error);
      showToast('Помилка завантаження гри', 'error');
    }
  }

  private async loadGameState() {
    try {
      // Завантажуємо дані паралельно
      const [positions, settings, achievements] = await Promise.all([
        get<Position[]>('/api/positions'),
        get<UserSettings>('/api/settings'),
        get<Achievement[]>('/api/achievements')
      ]);

      this.gameState.positions = positions;
      this.gameState.settings = settings;
      this.gameState.achievements = achievements;

      this.calculateStats();
      initAchievements(achievements);

    } catch (error) {
      console.error('Помилка завантаження стану гри:', error);
      throw error;
    }
  }

  private setupUI() {
    this.createPositionsGrid();
    this.updateStatsDisplay();
    this.updateSettingsUI();
    this.setupEventListeners();
    updateAchievementsDisplay();
  }

  private createPositionsGrid() {
    const grid = document.getElementById('positions-grid')!;
    grid.innerHTML = '';

    this.gameState.positions.forEach(position => {
      const card = document.createElement('div');
      card.className = `position-card ${position.result}`;
      card.textContent = position.id.toString();
      card.dataset.id = position.id.toString();

      card.addEventListener('click', () => this.handlePositionClick(position.id));

      grid.appendChild(card);
    });
  }

  private async handlePositionClick(positionId: number) {
    try {
      const position = this.gameState.positions.find(p => p.id === positionId);
      if (!position) return;

      // Циклічне перемикання станів
      const states: Array<'none' | 'take' | 'stop'> = ['none', 'take', 'stop'];
      const currentIndex = states.indexOf(position.result);
      const nextState = states[(currentIndex + 1) % states.length];

      // Оновлюємо на сервері
      await put(`/api/positions/${positionId}`, { result: nextState });

      // Оновлюємо локальний стан
      position.result = nextState;

      // Оновлюємо UI
      const card = document.querySelector(`[data-id="${positionId}"]`)!;
      card.className = `position-card ${nextState}`;

      // Перераховуємо статистику
      this.calculateStats();
      this.updateStatsDisplay();

      // Перевіряємо досягнення
      incrementClicks();
      await checkAchievements(this.gameState.stats);

    } catch (error) {
      console.error('Помилка оновлення позиції:', error);
      showToast('Помилка оновлення позиції', 'error');
    }
  }

  private calculateStats() {
    const takes = this.gameState.positions.filter(p => p.result === 'take').length;
    const stops = this.gameState.positions.filter(p => p.result === 'stop').length;
    const totalPositions = takes + stops;

    // Розрахунок прибутку: тейки дають +RR%, стопи дають -1%
    const profit = (takes * this.gameState.settings.reward_ratio) + (stops * -1);
    const winRate = totalPositions > 0 ? (takes / totalPositions) * 100 : 0;

    this.gameState.stats = {
      takes,
      stops,
      profit: parseFloat(profit.toFixed(1)),
      winRate: parseFloat(winRate.toFixed(1))
    };
  }

  private updateStatsDisplay() {
    document.getElementById('takes-count')!.textContent = this.gameState.stats.takes.toString();
    document.getElementById('stops-count')!.textContent = this.gameState.stats.stops.toString();
    document.getElementById('profit-pct')!.textContent = `${this.gameState.stats.profit}%`;
    document.getElementById('win-rate')!.textContent = `${this.gameState.stats.winRate}%`;

    // Оновлюємо градації прибутку
    updateGradeDisplay(
      this.gameState.stats.takes,
      this.gameState.stats.stops,
      this.gameState.stats.profit
    );

    // Оновлюємо мотиваційне повідомлення
    this.updateMotivationMessage();
  }

  private updateMotivationMessage() {
    const msgEl = document.getElementById('motivation-msg')!;
    const { takes, stops, profit } = this.gameState.stats;

    if (takes === 0 && stops === 0) {
      msgEl.textContent = 'Почніть торгувати, щоб побачити результати!';
    } else if (profit === 0 && takes === 5 && stops === 10) {
      msgEl.textContent = '⚖️ Ідеальна беззбитковість! Тепер спробуйте досягти прибутку.';
    } else if (profit > 0) {
      msgEl.textContent = `💰 Чудово! Ви в прибутку ${profit}%. Продовжуйте у тому ж дусі!`;
    } else if (profit < 0) {
      msgEl.textContent = '📉 Не переживайте через стопи - вони частина стратегії. Трейдинг - це довгострокова гра!';
    } else {
      msgEl.textContent = 'Продовжуйте торгувати, щоб побачити свій прогрес!';
    }
  }

  private updateSettingsUI() {
    (document.getElementById('risk-input') as HTMLInputElement).value = 
      this.gameState.settings.risk_per_position.toString();
    (document.getElementById('reward-input') as HTMLInputElement).value = 
      this.gameState.settings.reward_ratio.toString();
  }

  private setupEventListeners() {
    // Збереження налаштувань
    document.getElementById('save-settings')!.addEventListener('click', async () => {
      await this.saveSettings();
    });

    // Скидання позицій
    document.getElementById('reset-positions')!.addEventListener('click', async () => {
      await this.resetPositions();
    });

    // Показати гайд
    document.getElementById('show-guide-btn')!.addEventListener('click', () => {
      tutorialManager.start();
    });

    // Модальне вікно туторіалу
    document.getElementById('start-tutorial')!.addEventListener('click', () => {
      this.hideTutorialModal();
      tutorialManager.start();
    });

    document.getElementById('skip-tutorial')!.addEventListener('click', () => {
      this.hideTutorialModal();
    });

    document.getElementById('skip-forever')!.addEventListener('click', async () => {
      try {
        await put('/api/settings', { tutorial_skipped_forever: true });
        this.gameState.settings.tutorial_skipped_forever = true;
        this.hideTutorialModal();
        showToast('Туторіал відключено назавжди', 'success');
      } catch (error) {
        console.error('Помилка збереження налаштувань туторіалу:', error);
      }
    });
  }

  private async saveSettings() {
    try {
      const riskInput = document.getElementById('risk-input') as HTMLInputElement;
      const rewardInput = document.getElementById('reward-input') as HTMLInputElement;

      const risk = parseFloat(riskInput.value);
      const reward = parseFloat(rewardInput.value);

      if (risk < 0.1 || risk > 10) {
        showToast('Ризик має бути від 0.1% до 10%', 'error');
        return;
      }

      if (reward < 1 || reward > 5) {
        showToast('Співвідношення прибутку має бути від 1 до 5', 'error');
        return;
      }

      await put('/api/settings', {
        risk_per_position: risk,
        reward_ratio: reward
      });

      this.gameState.settings.risk_per_position = risk;
      this.gameState.settings.reward_ratio = reward;

      // Перераховуємо статистику з новими налаштуваннями
      this.calculateStats();
      this.updateStatsDisplay();

      showToast('Налаштування збережено!', 'success');

    } catch (error) {
      console.error('Помилка збереження налаштувань:', error);
      showToast('Помилка збереження налаштувань', 'error');
    }
  }

  private async resetPositions() {
    try {
      await post('/api/positions/reset', {});

      // Оновлюємо локальний стан
      this.gameState.positions.forEach(p => p.result = 'none');

      this.createPositionsGrid();
      this.calculateStats();
      this.updateStatsDisplay();

      showToast('Всі позиції скинуті!', 'success');

    } catch (error) {
      console.error('Помилка скидання позицій:', error);
      showToast('Помилка скидання позицій', 'error');
    }
  }

  private checkTutorial() {
    if (!this.gameState.settings.tutorial_completed && 
        !this.gameState.settings.tutorial_skipped_forever) {
      this.showTutorialModal();
    }
  }

  private showTutorialModal() {
    const modal = document.getElementById('tutorial-modal')!;
    modal.classList.add('show');
  }

  private hideTutorialModal() {
    const modal = document.getElementById('tutorial-modal')!;
    modal.classList.remove('show');
  }
}

// Ініціалізація гри після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
  const game = new RiskManagementGame();
  game.init();
});