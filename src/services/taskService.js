/**
 * TaskService - Daily Study Tasks Engine
 * Manages daily student deliverables with full add/toggle/delete support.
 */

import { storageService } from './storageService.js';
import { eventBus } from './eventBus.js';
import { DEFAULT_STATE } from '../data/defaultState.js';

class TaskService {
  constructor() {
    this.storageKey = 'tasks_data';
  }

  getTasks() {
    return storageService.get(this.storageKey, DEFAULT_STATE.tasks);
  }

  saveTasks(tasks) {
    storageService.set(this.storageKey, tasks);
    eventBus.emit('tasks:updated', tasks);
  }

  addTask(title, subject = 'General', priority = 'Medium') {
    if (!title || !title.trim()) return null;
    const tasks = this.getTasks();
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      subject,
      priority,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  toggleTask(taskId) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    task.completed = !task.completed;
    this.saveTasks(tasks);
    return task.completed;
  }

  deleteTask(taskId) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    this.saveTasks(tasks);
  }

  getStats() {
    const tasks = this.getTasks();
    const completed = tasks.filter(t => t.completed).length;
    return {
      total: tasks.length,
      completed,
      remaining: tasks.length - completed
    };
  }
}

export const taskService = new TaskService();
