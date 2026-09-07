/**
 * TimerView - Interactive UI Controller for Pomodoro & Focus Engine
 */

import { eventBus } from '../../services/eventBus.js';
import { timerService, TIMER_STATES, TIMER_MODES } from '../../services/timerService.js';
import { storageService } from '../../services/storageService.js';

const CIRCUMFERENCE = 2 * Math.PI * 120; // Radius = 120 in SVG viewBox 280x280 (center 140, 140)

class TimerView {
  constructor() {
    this.container = null;
    this.digitsEl = null;
    this.progressCircle = null;
    this.modeLabel = null;
    this.sessionLabel = null;
    this.mainBtn = null;
    this.resetBtn = null;
    this.skipBtn = null;
    this.deepWorkBtn = null;
    this.customDrawer = null;
  }

  init() {
    this.container = document.getElementById('view-timer');
    if (!this.container) return;

    this.digitsEl = document.getElementById('timer-digits');
    this.progressCircle = document.getElementById('timer-progress-ring');
    this.modeLabel = document.getElementById('timer-mode-label');
    this.sessionLabel = document.getElementById('timer-session-label');
    this.mainBtn = document.getElementById('timer-main-btn');
    this.resetBtn = document.getElementById('timer-reset-btn');
    this.skipBtn = document.getElementById('timer-skip-btn');
    this.deepWorkBtn = document.getElementById('timer-deepwork-btn');
    this.customDrawer = document.getElementById('custom-timer-drawer');

    if (this.progressCircle) {
      this.progressCircle.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
      this.progressCircle.style.strokeDashoffset = '0';
    }

    this._bindDOMEvents();
    this._bindServiceEvents();
    this._renderInitialState();
  }

  _bindDOMEvents() {
    // Start / Pause / Resume
    if (this.mainBtn) {
      this.mainBtn.addEventListener('click', () => {
        const state = timerService.getState();
        if (state.state === TIMER_STATES.RUNNING) {
          timerService.pause();
        } else if (state.state === TIMER_STATES.PAUSED) {
          timerService.resume();
        } else {
          timerService.start();
        }
      });
    }

    // Reset
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        timerService.reset();
      });
    }

    // Skip
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        timerService.skip();
      });
    }

    // Deep Work trigger
    if (this.deepWorkBtn) {
      this.deepWorkBtn.addEventListener('click', () => {
        eventBus.emit('deepwork:open');
      });
    }

    // Mode tab switching
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        timerService.setMode(mode);
        this._updateModeTabs(mode);
      });
    });

    // Preset buttons switching
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        if (presetKey === 'custom') {
          if (this.customDrawer) this.customDrawer.classList.toggle('open');
        } else {
          if (this.customDrawer) this.customDrawer.classList.remove('open');
          timerService.setPreset(presetKey);
          this._updatePresetBtns(presetKey);
        }
      });
    });

    // Custom durations submit
    const customSaveBtn = document.getElementById('custom-timer-save-btn');
    if (customSaveBtn) {
      customSaveBtn.addEventListener('click', () => {
        const workInput = document.getElementById('custom-work-input');
        const shortBreakInput = document.getElementById('custom-short-input');
        const longBreakInput = document.getElementById('custom-long-input');

        timerService.setCustomDurations(
          workInput ? workInput.value : 25,
          shortBreakInput ? shortBreakInput.value : 5,
          longBreakInput ? longBreakInput.value : 15
        );

        this._updatePresetBtns('custom');
        if (this.customDrawer) this.customDrawer.classList.remove('open');
      });
    }
  }

  _bindServiceEvents() {
    eventBus.on('timer:tick', (state) => {
      this._updateDisplay(state);
    });

    eventBus.on('timer:stateChange', (state) => {
      this._updateButtons(state);
      this._updateDisplay(state);
    });

    eventBus.on('timer:completed', (data) => {
      this._updateSessionsInfo();
    });

    eventBus.on('timer:presetChange', (data) => {
      this._updatePresetBtns(data.preset);
    });
  }

  _renderInitialState() {
    const state = timerService.getState();
    this._updateDisplay(state);
    this._updateButtons(state);
    this._updateModeTabs(state.mode);
    this._updatePresetBtns(state.activePreset);
    this._updateSessionsInfo();
  }

  _updateDisplay(state) {
    if (this.digitsEl) {
      this.digitsEl.textContent = state.formattedTime;
    }

    if (this.progressCircle) {
      // Offset from 0 to CIRCUMFERENCE
      const offset = CIRCUMFERENCE * (1 - state.progress);
      this.progressCircle.style.strokeDashoffset = offset;

      // Update color class according to mode
      this.progressCircle.className = `dial-circle-progress mode-${state.mode}`;
    }

    if (this.modeLabel) {
      if (state.mode === TIMER_MODES.WORK) {
        this.modeLabel.textContent = 'Focus Session';
        this.modeLabel.style.color = 'var(--color-primary)';
      } else if (state.mode === TIMER_MODES.SHORT_BREAK) {
        this.modeLabel.textContent = 'Short Break';
        this.modeLabel.style.color = 'var(--color-emerald)';
      } else {
        this.modeLabel.textContent = 'Long Break';
        this.modeLabel.style.color = 'var(--color-cyan)';
      }
    }

    // Dynamic Title Bar indicator
    if (state.state === TIMER_STATES.RUNNING) {
      document.title = `(${state.formattedTime}) Focus | Student OS`;
    } else {
      document.title = 'Student OS — AI-Powered Academic Operating System';
    }
  }

  _updateButtons(state) {
    if (!this.mainBtn) return;

    if (state.state === TIMER_STATES.RUNNING) {
      this.mainBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Pause
      `;
      this.mainBtn.className = 'btn btn-secondary btn-lg timer-main-btn';
    } else if (state.state === TIMER_STATES.PAUSED) {
      this.mainBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Resume
      `;
      this.mainBtn.className = 'btn btn-primary btn-lg timer-main-btn';
    } else {
      this.mainBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Focus
      `;
      this.mainBtn.className = 'btn btn-primary btn-lg timer-main-btn';
    }
  }

  _updateModeTabs(activeMode) {
    const tabs = document.querySelectorAll('.mode-tab-btn');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-mode') === activeMode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  _updatePresetBtns(activePreset) {
    const btns = document.querySelectorAll('.preset-btn');
    btns.forEach(btn => {
      if (btn.getAttribute('data-preset') === activePreset) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  _updateSessionsInfo() {
    if (!this.sessionLabel) return;
    const metrics = storageService.getMetrics();
    const cycle = (timerService.sessionCycleCount % 4) + 1;
    this.sessionLabel.textContent = `Cycle #${cycle} of 4 • ${metrics.todayCompletedSessions || 0} Sessions Done Today (${metrics.todayFocusMinutes || 0}m Total)`;
  }
}

export const timerView = new TimerView();
