import { Position, UserSettings, ApiResponse, ProfitCalculation } from '../../src/types/shared';

class TradingRiskGame {
  private positions: Position[] = [];
  private settings: UserSettings = {
    risk_per_position: 1,
    reward_ratio: 2,
    tutorial_completed: false,
    tutorial_skipped_forever: false
  };

  private gridElement!: HTMLElement;
  private statsElement!: HTMLElement;
  private settingsElement!: HTMLElement;
  private messageElement!: HTMLElement;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.loadData();
      this.initializeDOM();
      this.renderGrid();
      this.updateStats();
      this.checkTutorial();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to load game data');
    }
  }

  private async loadData(): Promise<void> {
    try {
      const [positionsResponse, settingsResponse] = await Promise.all([
        fetch('/api/positions'),
        fetch('/api/settings')
      ]) as any;

      if (!positionsResponse.ok || !settingsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const positionsData: ApiResponse<Position[]> = await positionsResponse.json();
      const settingsData: ApiResponse<UserSettings> = await settingsResponse.json();

      if (positionsData.success && positionsData.data) {
        this.positions = positionsData.data;
      }

      if (settingsData.success && settingsData.data) {
        this.settings = settingsData.data;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  private initializeDOM(): void {
    this.gridElement = document.getElementById('positions-grid')!;
    this.statsElement = document.getElementById('stats')!;
    this.settingsElement = document.getElementById('settings')!;
    this.messageElement = document.getElementById('motivational-message')!;

    // Setup event listeners
    document.getElementById('reset-positions')?.addEventListener('click', () => {
      this.resetAllPositions();
    });

    document.getElementById('save-settings')?.addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('show-tutorial')?.addEventListener('click', () => {
      this.startTutorial();
    });
  }

  private renderGrid(): void {
    this.gridElement.innerHTML = '';

    this.positions.forEach(position => {
      const card = document.createElement('div');
      card.className = `position-card ${position.result}`;
      card.textContent = position.id.toString();

      card.addEventListener('click', () => {
        this.togglePosition(position.id);
      });

      this.gridElement.appendChild(card);
    });
  }

  private async togglePosition(id: number): Promise<void> {
    const position = this.positions.find(p => p.id === id);
    if (!position) return;

    const states = ['none', 'take', 'stop'] as const;
    const currentIndex = states.indexOf(position.result);
    const nextState = states[(currentIndex + 1) % states.length];

    try {
      const response = await fetch(`/api/positions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: nextState })
      });

      if (response.ok) {
        position.result = nextState;
        this.renderGrid();
        this.updateStats();
      }
    } catch (error) {
      console.error('Error updating position:', error);
      this.showError('Failed to update position');
    }
  }

  private updateStats(): void {
    const calculation = this.calculateProfit();

    this.statsElement.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Тейки:</span>
        <span class="stat-value take">${calculation.takes}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Стопи:</span>
        <span class="stat-value stop">${calculation.stops}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Прибуток:</span>
        <span class="stat-value" style="color: ${calculation.color}">${calculation.totalProfit}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Win-rate:</span>
        <span class="stat-value">${calculation.winRate}%</span>
      </div>
    `;

    this.updateMotivationalMessage(calculation);
  }

  private calculateProfit(): ProfitCalculation {
    const takes = this.positions.filter(p => p.result === 'take').length;
    const stops = this.positions.filter(p => p.result === 'stop').length;

    const totalProfit = (takes * this.settings.reward_ratio) + (stops * -this.settings.risk_per_position);
    const totalPositions = takes + stops;
    const winRate = totalPositions > 0 ? Math.round((takes / totalPositions) * 100) : 0;

    let profitLevel = 'break-even';
    let color = '#ff9500';

    if (totalProfit > 0) {
      if (totalProfit >= 12) {
        profitLevel = 'champion';
        color = '#00ff00';
      } else if (totalProfit >= 9) {
        profitLevel = 'excellent';
        color = '#32cd32';
      } else if (totalProfit >= 6) {
        profitLevel = 'great';
        color = '#90ee90';
      } else {
        profitLevel = 'good';
        color = '#98fb98';
      }
    } else if (totalProfit < 0) {
      profitLevel = 'loss';
      color = '#ff4444';
    }

    return {
      takes,
      stops,
      totalProfit: Math.round(totalProfit * 100) / 100,
      winRate,
      profitLevel,
      color
    };
  }

  private updateMotivationalMessage(calculation: ProfitCalculation): void {
    const messages = {
      'champion': '🏆 Чемпіонський результат! Ви володієте ризик-менеджментом!',
      'excellent': '⭐ Відмінно! Ваша дисципліна приносить плоди!',
      'great': '👍 Чудово! Продовжуйте дотримуватися стратегії!',
      'good': '📈 Добре! Ви на правильному шляху!',
      'break-even': '⚖️ Беззбитковість - це теж успіх! Стопи захищають капітал!',
      'loss': '💪 Не здавайтесь! Стопи - це інвестиція в майбутню прибутковість!'
    };

    this.messageElement.textContent = messages[calculation.profitLevel || 'break-even'] as string
    this.messageElement.style.color = calculation.color as string;
  }

  private async resetAllPositions(): Promise<void> {
    try {
      const response = await fetch('/api/positions/reset', { method: 'POST' });

      if (response.ok) {
        this.positions.forEach(p => p.result = 'none');
        this.renderGrid();
        this.updateStats();
      }
    } catch (error) {
      console.error('Error resetting positions:', error);
      this.showError('Failed to reset positions');
    }
  }

  private async saveSettings(): Promise<void> {
    const riskInput = document.getElementById('risk-input') as HTMLInputElement;
    const ratioInput = document.getElementById('ratio-input') as HTMLInputElement;

    const newSettings = {
      risk_per_position: parseFloat(riskInput.value) || this.settings.risk_per_position,
      reward_ratio: parseFloat(ratioInput.value) || this.settings.reward_ratio
    };

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        this.settings = { ...this.settings, ...newSettings };
        this.updateStats();
        this.showSuccess('Налаштування збережено!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showError('Failed to save settings');
    }
  }

  private checkTutorial(): void {
    if (!this.settings.tutorial_completed && !this.settings.tutorial_skipped_forever) {
      this.showTutorialModal();
    }
  }

  private showTutorialModal(): void {
    // Implementation for tutorial modal
    // This would show the tutorial introduction modal
  }

  private startTutorial(): void {
    // Implementation for guided tutorial
  }

  private showError(message: string): void {
    // Show error message to user
    console.error(message);
  }

  private showSuccess(message: string): void {
    // Show success message to user
    console.log(message);
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TradingRiskGame();
});