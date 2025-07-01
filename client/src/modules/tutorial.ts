import { showToast } from '../utils/toast';

interface TutorialStep {
  title: string;
  text: string;
  target?: string;
  action?: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Вітаємо в грі!',
    text: 'Це гра для вивчення ризик-менеджменту в трейдингу. Ви будете симулювати торгові позиції та дивитися на те скільки ще стопів ваша система дозволяє вам отримати а також показує мінімальну кількість тейків для різних градацій прибутку.'
  },
  {
    title: 'Торгові позиції',
    text: 'Кожна клітинка представляє торгову позицію. Клікайте по них, щоб позначити як тейк (прибуток) або стоп (збиток).',
    target: '#positions-grid'
  },
  {
    title: 'Статистика',
    text: 'Тут відображається ваша статистика: кількість тейків, стопів, загальний прибуток та win-rate.',
    target: '.stats-panel'
  },
  {
    title: 'Налаштування',
    text: 'Тут ви можете налаштувати ризик на позицію та співвідношення прибутку (RR).',
    target: '.settings-section'
  },
  {
    title: 'Градації прибутку',
    text: 'Система показує ваш прогрес через різні рівні прибутковості.',
    target: '.profit-grades-section'
  },
  {
    title: 'Готово!',
    text: 'Тепер ви знаєте основи. Почніть клікати по позиціях та спостерігайте за своїми результатами!'
  }
];

class TutorialManager {
  private currentStep = 0;
  private overlay?: HTMLElement;
  private modal?: HTMLElement;

  start() {
    this.currentStep = 0;
    this.createOverlay();
    this.showStep();
  }

  private createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    this.modal = document.createElement('div');
    this.modal.className = 'tutorial-modal';
    this.modal.style.cssText = `
      background: var(--surface-color);
      padding: 2rem;
      border-radius: 16px;
      max-width: 500px;
      margin: 1rem;
      text-align: center;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
    `;

    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
  }

  private showStep() {
    const step = TUTORIAL_STEPS[this.currentStep];
    if (!step || !this.modal) return;

    // Highlight target element
    this.highlightTarget(step.target);

    this.modal.innerHTML = `
      <h3 style="margin-bottom: 1rem; font-size: 1.25rem; font-weight: 700;">${step.title}</h3>
      <p style="margin-bottom: 2rem; color: var(--text-muted);">${step.text}</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        ${this.currentStep > 0 ? '<button id="tutorial-prev" class="btn btn-secondary">Назад</button>' : ''}
        <button id="tutorial-next" class="btn btn-primary">
          ${this.currentStep === TUTORIAL_STEPS.length - 1 ? 'Завершити' : 'Далі'}
        </button>
        <button id="tutorial-skip" class="btn btn-outline">Пропустити</button>
      </div>
    `;

    // Add event listeners
    this.modal.querySelector('#tutorial-next')?.addEventListener('click', () => {
      if (this.currentStep === TUTORIAL_STEPS.length - 1) {
        this.finish();
      } else {
        this.next();
      }
    });

    this.modal.querySelector('#tutorial-prev')?.addEventListener('click', () => {
      this.prev();
    });

    this.modal.querySelector('#tutorial-skip')?.addEventListener('click', () => {
      this.finish();
    });

    // Execute step action
    if (step.action) {
      step.action();
    }
  }

  private highlightTarget(selector?: string) {
    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    if (selector) {
      const target = document.querySelector(selector);
      if (target) {
        target.classList.add('tutorial-highlight');
        // Add highlight CSS if not exists
        if (!document.querySelector('#tutorial-highlight-style')) {
          const style = document.createElement('style');
          style.id = 'tutorial-highlight-style';
          style.textContent = `
            .tutorial-highlight {
              position: relative;
              z-index: 10000;
              box-shadow: 0 0 0 4px var(--primary-color), 0 0 0 8px rgba(139, 92, 246, 0.3) !important;
              border-radius: 8px !important;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }
  }

  private next() {
    this.currentStep++;
    this.showStep();
  }

  private prev() {
    this.currentStep--;
    this.showStep();
  }

  private finish() {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
    }

    // Remove highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    // Remove highlight style
    const style = document.querySelector('#tutorial-highlight-style');
    if (style) {
      style.remove();
    }

    showToast('Туторіал завершено!', 'success');
  }
}

export const tutorialManager = new TutorialManager();