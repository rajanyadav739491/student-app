/**
 * DeepWorkView - Fullscreen Distraction-Free Study Mode
 * Isolates the student in an ambient focus room with zero distracting UI.
 */

import { eventBus } from '../../services/eventBus.js';
import { timerService, TIMER_STATES, TIMER_MODES } from '../../services/timerService.js';

const MOTIVATIONAL_QUOTES = [
  "“Focus is a muscle. The deeper you go, the sharper you become.”",
  "“Mastering PCM requires sustained deep work, not hurried skimming.”",
  "“One focused problem solved is worth ten distracted readings.”",
  "“You are building the neural pathways for rank 1 today.”",
  "“Zero notifications. Maximum intensity.”"
];

class DeepWorkView {
  constructor() {
    this.overlay = null;
    this.digitsEl = null;
    this.statusEl = null;
    this.quoteEl = null;
    this.mainBtn = null;
    this.exitBtn = null;
    this.isActive = false;
  }

  init() {
    this.overlay = document.getElementById('deep-work-overlay');
    this.digitsEl = document.getElementById('dw-timer-digits');
    this.statusEl = document.getElementById('dw-focus-status');
    this.quoteEl = document.getElementById('dw-quote');
    this.mainBtn = document.getElementById('dw-main-btn');
    this.exitBtn = document.getElementById('dw-exit-btn');

    if (!this.overlay) return;

    this._bindEvents();
  }

  _bindEvents() {
    // Open deep work mode from anywhere via eventBus
    eventBus.on('deepwork:open', () => this.open());
    eventBus.on('deepwork:close', () => this.close());

    // Exit button
    if (this.exitBtn) {
      this.exitBtn.addEventListener('click', () => this.close());
    }

    // Main action button inside deep work mode
    if (this.mainBtn) {
      this.mainBtn.addEventListener('click', () => {
        const state = timerService.getState();
        if (state.state === TIMER_STATES.RUNNING) {
          timerService.pause();
        } else {
          timerService.start();
        }
      });
    }

    // Listen to timer ticks
    eventBus.on('timer:tick', (state) => {
      if (!this.isActive) return;
      if (this.digitsEl) this.digitsEl.textContent = state.formattedTime;
    });

    eventBus.on('timer:stateChange', (state) => {
      if (!this.isActive) return;
      this._updateStateUI(state);
    });

    // Handle Escape key to exit
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.close();
      }
    });
  }

  open() {
    if (!this.overlay) return;
    this.isActive = true;
    this.overlay.classList.add('active');

    // Pick random motivational quote
    if (this.quoteEl) {
      const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      this.quoteEl.textContent = quote;
    }

    // Sync initial state
    const state = timerService.getState();
    if (this.digitsEl) this.digitsEl.textContent = state.formattedTime;
    this._updateStateUI(state);

    // If timer is idle, start it immediately when entering Deep Work Mode
    if (state.state === TIMER_STATES.IDLE) {
      timerService.start();
    }

    // Try requesting fullscreen if user gesture allows
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          // Fullscreen request might be blocked by browser policy without direct user click
        });
      }
    } catch (_) {}
  }

  close() {
    if (!this.overlay) return;
    this.isActive = false;
    this.overlay.classList.remove('active');

    // Exit fullscreen if active
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}
  }

  _updateStateUI(state) {
    if (!this.mainBtn || !this.statusEl) return;

    if (state.state === TIMER_STATES.RUNNING) {
      this.mainBtn.textContent = 'Pause Focus';
      this.mainBtn.className = 'btn btn-secondary btn-lg';
      this.statusEl.textContent = state.mode === TIMER_MODES.WORK 
        ? 'Deep Work in Progress: Zero Distractions' 
        : 'Rest & Recover: Stand Up & Breathe';
    } else {
      this.mainBtn.textContent = 'Resume Focus';
      this.mainBtn.className = 'btn btn-primary btn-lg';
      this.statusEl.textContent = 'Focus Paused';
    }
  }
}

export const deepWorkView = new DeepWorkView();
