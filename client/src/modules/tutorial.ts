import { put } from '../utils/api';

export class TutorialManager {
  private isActive = false;
  private currentStep = 0;
  private steps: TutorialStep[] = [];

  constructor() {
    this.initSteps();
  }

  private initSteps() {
    this.steps = [
      {
        target: '.positions-grid',
        title: '🎯 Сітка позицій',
        content: 'Це ваші 15 торгових позицій. Клікайте по них, щоб перемикати між станами: none → take → stop.',
        position: 'bottom'
      },
      {
        target: '.stats-panel',
        title: '📊 Статистика',
        content: 'Тут відображаються ваші поточні результати: кількість тейків, стопів, загальний прибуток та win-rate.',
        position: 'bottom'
      },
      {
        target: '.grade-panel',
        title: '🏅 Градації прибутку',
        content: 'Ваш поточний рівень торгівлі. Від беззбитковості до майстерства!',
        position: 'bottom'
      },
      {
        target: '.controls-panel',
        title: '⚙️ Налаштування',
        content: 'Тут можна змінити ризик на позицію та співвідношення прибутку (RR). Не забудьте зберегти!',
        position: 'top'
      },
      {
        target: '.achievements-panel',
        title: '🏆 Досягнення',
        content: 'Розблокуйте досягнення, досягаючи різних цілей у торгівлі!',
        position: 'top'
      }
    ];
  }

  async start() {
    if (this.isActive) return;

    this.isActive = true;
    this.currentStep = 0;
    await this.showStep(0);
  }

  private async showStep(stepIndex: number) {
    if (stepIndex >= this.steps.length) {
      await this.complete();
      return;
    }

    const step = this.steps[stepIndex];
    const target = document.querySelector(step.target);

    if (!target) {
      console.warn(`Елемент ${step.target} не знайдено`);
      return this.showStep(stepIndex + 1);
    }

    this.highlightElement(target as HTMLElement);
    this.showTooltip(step, target as HTMLElement);
  }

  private highlightElement(element: HTMLElement) {
    // Видаляємо попередні підсвітки
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    // Додаємо підсвітку
    element.classList.add('tutorial-highlight');

    // Додаємо стилі для підсвітки
    if (!document.getElementById('tutorial-styles')) {
      const style = document.createElement('style');
      style.id = 'tutorial-styles';
      style.textContent = `
        .tutorial-highlight {
          position: relative;
          z-index: 1001;
          box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.5), 0 0 20px rgba(52, 152, 219, 0.3) !important;
          border-radius: 8px !important;
        }
        .tutorial-tooltip {
          position: fixed;
          background: white;
          border: 2px solid #3498db;
          border-radius: 8px;
          padding: 20px;
          max-width: 300px;
          z-index: 1002;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .tutorial-tooltip h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        .tutorial-tooltip p {
          margin: 0 0 15px 0;
          color: #34495e;
          line-height: 1.4;
        }
        .tutorial-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .tutorial-buttons button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .tutorial-next {
          background: #3498db;
          color: white;
        }
        .tutorial-skip {
          background: #95a5a6;
          color: white;
        }
        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private showTooltip(step: TutorialStep, target: HTMLElement) {
    // Видаляємо попередні тултіпи
    document.querySelectorAll('.tutorial-tooltip, .tutorial-overlay').forEach(el => {
      el.remove();
    });

    // Створюємо overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    document.body.appendChild(overlay);

    // Створюємо тултіп
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    tooltip.innerHTML = `
      <h3>${step.title}</h3>
      <p>${step.content}</p>
      <div class="tutorial-buttons">
        <button class="tutorial-skip">Пропустити</button>
        <button class="tutorial-next">${this.currentStep === this.steps.length - 1 ? 'Завершити' : 'Далі'}</button>
      </div>
    `;

    document.body.appendChild(tooltip);

    // Позиціонування тултіпа
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = rect.bottom + 10;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

    if (step.position === 'top') {
      top = rect.top - tooltipRect.height - 10;
    }

    // Перевірка на вихід за межі екрану
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = rect.bottom + 10;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Обробники подій
    tooltip.querySelector('.tutorial-next')?.addEventListener('click', () => {
      this.nextStep();
    });

    tooltip.querySelector('.tutorial-skip')?.addEventListener('click', () => {
      this.skip();
    });

    overlay.addEventListener('click', () => {
      this.skip();
    });
  }

  private nextStep() {
    this.currentStep++;
    this.showStep(this.currentStep);
  }

  private async skip() {
    await this.complete();
  }

  private async complete() {
    this.isActive = false;

    // Видаляємо всі елементи туторіалу
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    document.querySelectorAll('.tutorial-tooltip, .tutorial-overlay').forEach(el => {
      el.remove();
    });

    // Зберігаємо стан завершення
    try {
      await put('/api/settings', { tutorial_completed: true });
    } catch (error) {
      console.error('Помилка збереження стану туторіалу:', error);
    }
  }
}

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom';
}

// Глобальний екземпляр туторіалу
export const tutorialManager = new TutorialManager();