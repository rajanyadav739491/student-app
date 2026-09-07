/**
 * RevisionService - Automated Spaced Repetition Engine
 * Implements 1d -> 3d -> 7d -> 14d -> 30d interval scheduler.
 * Automatically receives notifications when syllabus topics are completed.
 */

import { storageService } from './storageService.js';
import { eventBus } from './eventBus.js';
import { DEFAULT_STATE } from '../data/defaultState.js';

const SPACING_INTERVALS = [1, 3, 7, 14, 30];

class RevisionService {
  constructor() {
    this.storageKey = 'revisions_data';
    this._initAutoListeners();
  }

  getRevisions() {
    return storageService.get(this.storageKey, DEFAULT_STATE.revisions);
  }

  saveRevisions(revisions) {
    storageService.set(this.storageKey, revisions);
    eventBus.emit('revision:updated', this.getStats());
  }

  _initAutoListeners() {
    // When a syllabus topic is marked completed, automatically queue a 1-day revision task!
    eventBus.on('syllabus:topicCompleted', ({ topicName, subjectName, difficulty }) => {
      this.addRevision({
        topic: topicName,
        subject: subjectName,
        difficulty: difficulty || 'Medium',
        intervalDays: difficulty === 'Hard' ? 1 : 2,
        notes: `Auto-scheduled from completed ${subjectName} syllabus topic`
      });
    });
  }

  addRevision({ topic, subject = 'Physics', difficulty = 'Medium', intervalDays = 1, notes = '' }) {
    if (!topic || !topic.trim()) return null;
    const revisions = this.getRevisions();

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (intervalDays || 1));
    const dueDateStr = targetDate.toISOString().split('T')[0];

    const newRev = {
      id: `rev-${Date.now()}`,
      topic: topic.trim(),
      subject,
      difficulty,
      intervalDays,
      revisionCount: 1,
      dueDate: dueDateStr,
      completed: false,
      notes
    };

    revisions.unshift(newRev);
    this.saveRevisions(revisions);
    return newRev;
  }

  completeRevision(id) {
    const revisions = this.getRevisions();
    const rev = revisions.find(r => r.id === id);
    if (!rev) return;

    rev.revisionCount = (rev.revisionCount || 1) + 1;
    const nextIntervalIdx = Math.min(SPACING_INTERVALS.length - 1, rev.revisionCount - 1);
    let nextInterval = SPACING_INTERVALS[nextIntervalIdx];
    if (rev.difficulty === 'Hard') {
      nextInterval = Math.max(1, Math.floor(nextInterval * 0.75));
    }

    rev.intervalDays = nextInterval;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);
    rev.dueDate = nextDate.toISOString().split('T')[0];
    rev.completed = false;

    this.saveRevisions(revisions);
  }

  deleteRevision(id) {
    let revisions = this.getRevisions();
    revisions = revisions.filter(r => r.id !== id);
    this.saveRevisions(revisions);
  }

  getDueToday() {
    const today = new Date().toISOString().split('T')[0];
    const revisions = this.getRevisions();
    return revisions.filter(r => !r.completed && r.dueDate <= today);
  }

  getUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    const revisions = this.getRevisions();
    return revisions.filter(r => !r.completed && r.dueDate > today);
  }

  getStats() {
    const dueToday = this.getDueToday();
    const upcoming = this.getUpcoming();
    return {
      dueCount: dueToday.length,
      upcomingCount: upcoming.length,
      totalCount: this.getRevisions().length
    };
  }
}

export const revisionService = new RevisionService();
