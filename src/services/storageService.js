/**
 * StorageService - Decoupled Persistence Layer
 * Provides clean access to client storage with fallback mechanisms.
 * Ready to be swapped for remote providers (Firebase/Supabase) in future phases.
 */

import { DEFAULT_STATE } from '../data/defaultState.js';

const STORAGE_PREFIX = 'student_os_';

class StorageService {
  constructor() {
    this.prefix = STORAGE_PREFIX;
  }

  /**
   * Safe getter for local storage items
   */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`${this.prefix}${key}`);
      if (raw === null || raw === undefined) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`StorageService: Error reading key "${key}", using fallback.`, err);
      return fallback;
    }
  }

  /**
   * Safe setter for local storage items
   */
  set(key, value) {
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`StorageService: Error writing key "${key}".`, err);
      return false;
    }
  }

  /**
   * Remove item
   */
  remove(key) {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
      return true;
    } catch (err) {
      console.error(`StorageService: Error removing key "${key}".`, err);
      return false;
    }
  }

  /* Typed Helper Accessors */

  getTimerSettings() {
    return this.get('timer_settings', DEFAULT_STATE.timer);
  }

  saveTimerSettings(settings) {
    return this.set('timer_settings', settings);
  }

  getMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const metrics = this.get('metrics', DEFAULT_STATE.metrics);

    // Reset daily counters if new day
    if (metrics.lastStudyDate !== today) {
      metrics.todayFocusMinutes = 0;
      metrics.todayCompletedSessions = 0;
      metrics.lastStudyDate = today;
      this.set('metrics', metrics);
    }

    return metrics;
  }

  saveMetrics(metrics) {
    return this.set('metrics', metrics);
  }

  addFocusTime(minutes) {
    const metrics = this.getMetrics();
    metrics.todayFocusMinutes = (metrics.todayFocusMinutes || 0) + minutes;
    metrics.todayCompletedSessions = (metrics.todayCompletedSessions || 0) + 1;
    this.saveMetrics(metrics);
    return metrics;
  }
}

export const storageService = new StorageService();
