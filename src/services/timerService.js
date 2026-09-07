/**
 * TimerService - High-Precision Pomodoro & Focus Engine
 * Calculates remaining time using high-resolution timestamps to prevent background drift.
 */

import { eventBus } from './eventBus.js';
import { storageService } from './storageService.js';
import { timerAudio } from '../modules/timer/timerAudio.js';

export const TIMER_MODES = {
  WORK: 'work',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break'
};

export const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

class TimerService {
  constructor() {
    this.settings = storageService.getTimerSettings();
    this.activePreset = this.settings.activePreset || '25/5';
    
    this.mode = TIMER_MODES.WORK;
    this.state = TIMER_STATES.IDLE;
    
    this.sessionCycleCount = 0; // Number of work sessions in current cycle
    this.currentDurationSeconds = this.getDurationForMode(this.mode) * 60;
    this.remainingSeconds = this.currentDurationSeconds;
    
    this.intervalId = null;
    this.targetEndTime = null;
  }

  getDurationForMode(mode) {
    const presetConfig = this.settings.presets[this.activePreset] || this.settings.presets['25/5'];
    if (mode === TIMER_MODES.WORK) return presetConfig.work;
    if (mode === TIMER_MODES.SHORT_BREAK) return presetConfig.shortBreak;
    if (mode === TIMER_MODES.LONG_BREAK) return presetConfig.longBreak;
    return 25;
  }

  start() {
    if (this.state === TIMER_STATES.RUNNING) return;

    if (this.state === TIMER_STATES.IDLE || this.state === TIMER_STATES.COMPLETED) {
      this.currentDurationSeconds = this.getDurationForMode(this.mode) * 60;
      this.remainingSeconds = this.currentDurationSeconds;
    }

    this.targetEndTime = Date.now() + this.remainingSeconds * 1000;
    this.state = TIMER_STATES.RUNNING;

    if (this.settings.soundEnabled) {
      timerAudio.playStartChime();
    }

    this._startTicker();
    this._notifyState();
  }

  pause() {
    if (this.state !== TIMER_STATES.RUNNING) return;

    this._clearTicker();
    // Recompute remaining exact seconds
    this.remainingSeconds = Math.max(0, Math.ceil((this.targetEndTime - Date.now()) / 1000));
    this.state = TIMER_STATES.PAUSED;
    this._notifyState();
  }

  resume() {
    if (this.state !== TIMER_STATES.PAUSED) return;
    this.start();
  }

  reset() {
    this._clearTicker();
    this.state = TIMER_STATES.IDLE;
    this.currentDurationSeconds = this.getDurationForMode(this.mode) * 60;
    this.remainingSeconds = this.currentDurationSeconds;
    this._notifyState();
    this._notifyTick();
  }

  skip() {
    this._clearTicker();
    this._advanceSession(false);
  }

  setPreset(presetKey) {
    if (!this.settings.presets[presetKey]) return;
    this.activePreset = presetKey;
    this.settings.activePreset = presetKey;
    storageService.saveTimerSettings(this.settings);
    
    this.reset();
    eventBus.emit('timer:presetChange', {
      preset: presetKey,
      durations: this.settings.presets[presetKey]
    });
  }

  setCustomDurations(workMins, shortBreakMins, longBreakMins) {
    this.settings.presets.custom = {
      work: Math.max(1, parseInt(workMins) || 25),
      shortBreak: Math.max(1, parseInt(shortBreakMins) || 5),
      longBreak: Math.max(1, parseInt(longBreakMins) || 15)
    };
    this.activePreset = 'custom';
    this.settings.activePreset = 'custom';
    storageService.saveTimerSettings(this.settings);

    this.reset();
    eventBus.emit('timer:presetChange', {
      preset: 'custom',
      durations: this.settings.presets.custom
    });
  }

  setMode(newMode) {
    if (!Object.values(TIMER_MODES).includes(newMode)) return;
    this.mode = newMode;
    this.reset();
  }

  _startTicker() {
    this._clearTicker();
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const diffMs = this.targetEndTime - now;
      this.remainingSeconds = Math.max(0, Math.ceil(diffMs / 1000));

      this._notifyTick();

      if (this.remainingSeconds <= 0) {
        this._handleSessionComplete();
      }
    }, 250);
  }

  _clearTicker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  _handleSessionComplete() {
    this._clearTicker();
    this.state = TIMER_STATES.COMPLETED;

    if (this.settings.soundEnabled) {
      timerAudio.playCompleteBell();
    }

    const durationMins = this.getDurationForMode(this.mode);

    if (this.mode === TIMER_MODES.WORK) {
      this.sessionCycleCount += 1;
      // Persist logged focus time
      storageService.addFocusTime(durationMins);
    }

    eventBus.emit('timer:completed', {
      mode: this.mode,
      sessionCount: this.sessionCycleCount,
      durationMinutes: durationMins
    });

    this._advanceSession(true);
  }

  _advanceSession(autoProgress = false) {
    if (this.mode === TIMER_MODES.WORK) {
      if (this.sessionCycleCount > 0 && this.sessionCycleCount % (this.settings.longBreakInterval || 4) === 0) {
        this.mode = TIMER_MODES.LONG_BREAK;
      } else {
        this.mode = TIMER_MODES.SHORT_BREAK;
      }
    } else {
      this.mode = TIMER_MODES.WORK;
    }

    this.currentDurationSeconds = this.getDurationForMode(this.mode) * 60;
    this.remainingSeconds = this.currentDurationSeconds;
    this.state = TIMER_STATES.IDLE;

    this._notifyState();
    this._notifyTick();

    const shouldAutoStart = (this.mode === TIMER_MODES.WORK && this.settings.autoStartPomodoros) ||
                            (this.mode !== TIMER_MODES.WORK && this.settings.autoStartBreaks);
    
    if (autoProgress && shouldAutoStart) {
      this.start();
    }
  }

  getFormattedTime() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getProgressFraction() {
    if (this.currentDurationSeconds === 0) return 0;
    return 1 - (this.remainingSeconds / this.currentDurationSeconds);
  }

  getState() {
    return {
      state: this.state,
      mode: this.mode,
      activePreset: this.activePreset,
      remainingSeconds: this.remainingSeconds,
      currentDurationSeconds: this.currentDurationSeconds,
      formattedTime: this.getFormattedTime(),
      progress: this.getProgressFraction(),
      sessionCycleCount: this.sessionCycleCount
    };
  }

  _notifyTick() {
    eventBus.emit('timer:tick', this.getState());
  }

  _notifyState() {
    eventBus.emit('timer:stateChange', this.getState());
  }
}

export const timerService = new TimerService();
