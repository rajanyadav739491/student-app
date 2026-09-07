/**
 * StreakService - Real Study Streak & Weekly Heatmap Calculator
 */

import { storageService } from './storageService.js';
import { eventBus } from './eventBus.js';

class StreakService {
  constructor() {}

  getStreakInfo() {
    const metrics = storageService.getMetrics();
    const streakDays = metrics.studyStreakDays || 0;

    // Build the 7-day Monday -> Sunday array for the current week
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

    const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const weekDots = daysLabels.map((label, idx) => {
      // Days up to and including today are active if user has an active streak
      const isActive = idx <= currentDayOfWeek && streakDays > 0;
      return {
        label,
        active: isActive,
        isToday: idx === currentDayOfWeek
      };
    });

    return {
      streakDays,
      weekDots
    };
  }
}

export const streakService = new StreakService();
