/**
 * QuizService - Interactive Quiz Engine & History Analytics
 */

import { storageService } from './storageService.js';
import { eventBus } from './eventBus.js';
import { DEFAULT_STATE } from '../data/defaultState.js';

class QuizService {
  constructor() {
    this.storageKey = 'quiz_data';
  }

  getData() {
    return storageService.get(this.storageKey, DEFAULT_STATE.quiz);
  }

  saveData(data) {
    storageService.set(this.storageKey, data);
    eventBus.emit('quiz:updated', this.getPerformanceMetrics());
  }

  recordAttempt({ title, subject, score, total, timeTakenSec = 0 }) {
    const data = this.getData();
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const newAttempt = {
      id: `qh-${Date.now()}`,
      title: title || `${subject} Quiz`,
      subject: subject || 'General',
      score,
      total,
      accuracy,
      date: new Date().toISOString().split('T')[0],
      timeTakenSec
    };

    data.history.unshift(newAttempt);
    this.saveData(data);
    return newAttempt;
  }

  getPerformanceMetrics() {
    const data = this.getData();
    const history = data.history || [];

    if (history.length === 0) {
      return {
        hasData: false,
        totalQuizzes: 0,
        averageAccuracy: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        subjectStats: [],
        weakTopics: [],
        strongTopics: []
      };
    }

    let totalScore = 0;
    let totalQuestions = 0;
    const subjectMap = {};

    history.forEach(att => {
      totalScore += att.score;
      totalQuestions += att.total;

      if (!subjectMap[att.subject]) {
        subjectMap[att.subject] = { score: 0, total: 0 };
      }
      subjectMap[att.subject].score += att.score;
      subjectMap[att.subject].total += att.total;
    });

    const averageAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    const subjectStats = Object.keys(subjectMap).map(subj => {
      const item = subjectMap[subj];
      const acc = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;
      return { subject: subj, accuracy: acc, score: item.score, total: item.total };
    });

    return {
      hasData: true,
      totalQuizzes: history.length,
      averageAccuracy,
      totalCorrect: totalScore,
      totalQuestions,
      subjectStats,
      weakTopics: data.weakTopics || [],
      strongTopics: data.strongTopics || []
    };
  }
}

export const quizService = new QuizService();
