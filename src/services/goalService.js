/**
 * GoalService - Student Exam Targets & Milestones Engine
 */

import { storageService } from './storageService.js';
import { eventBus } from './eventBus.js';
import { DEFAULT_STATE } from '../data/defaultState.js';

class GoalService {
  constructor() {
    this.storageKey = 'goals_data';
  }

  getGoals() {
    return storageService.get(this.storageKey, DEFAULT_STATE.goals);
  }

  saveGoals(goals) {
    storageService.set(this.storageKey, goals);
    eventBus.emit('goals:updated', goals);
  }

  addGoal(goalData) {
    if (!goalData || !goalData.title || !goalData.title.trim()) return null;
    const goals = this.getGoals();
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: goalData.title.trim(),
      exam: goalData.exam || 'JEE / NDA',
      targetDate: goalData.targetDate || '2026-12-31',
      priority: goalData.priority || 'Medium',
      dailyTarget: goalData.dailyTarget || '2 hrs',
      progress: Math.min(100, Math.max(0, parseInt(goalData.progress) || 0)),
      description: goalData.description || ''
    };
    goals.push(newGoal);
    this.saveGoals(goals);
    return newGoal;
  }

  updateGoal(id, updatedFields) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    Object.assign(goal, updatedFields);
    this.saveGoals(goals);
  }

  deleteGoal(id) {
    let goals = this.getGoals();
    goals = goals.filter(g => g.id !== id);
    this.saveGoals(goals);
  }

  getOverallProgress() {
    const goals = this.getGoals();
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, g) => acc + (g.progress || 0), 0);
    return Math.round(sum / goals.length);
  }
}

export const goalService = new GoalService();
