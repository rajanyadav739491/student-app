/**
 * SyllabusService - Dynamic PCM & Custom Exam Syllabus Engine
 * Fully customizable: Add/Edit/Delete Subjects, Chapters, Topics with live progress calculations.
 */

import { storageService } from './storageService.js';
import { eventBus } from './eventBus.js';
import { DEFAULT_STATE } from '../data/defaultState.js';

class SyllabusService {
  constructor() {
    this.storageKey = 'syllabus_data';
  }

  getSubjects() {
    return storageService.get(this.storageKey, DEFAULT_STATE.syllabus);
  }

  saveSubjects(subjects) {
    storageService.set(this.storageKey, subjects);
    eventBus.emit('syllabus:updated', this.getStats());
  }

  addSubject(name, color = '#6366f1') {
    if (!name || !name.trim()) return null;
    const subjects = this.getSubjects();
    const newSubject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      color,
      badgeClass: 'badge-outline',
      chapters: []
    };
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }

  deleteSubject(subjectId) {
    let subjects = this.getSubjects();
    subjects = subjects.filter(s => s.id !== subjectId);
    this.saveSubjects(subjects);
  }

  addChapter(subjectId, chapterName) {
    if (!chapterName || !chapterName.trim()) return null;
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return null;

    const newChapter = {
      id: `chap-${Date.now()}`,
      name: chapterName.trim(),
      topics: []
    };
    subject.chapters.push(newChapter);
    this.saveSubjects(subjects);
    return newChapter;
  }

  deleteChapter(subjectId, chapterId) {
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    subject.chapters = subject.chapters.filter(c => c.id !== chapterId);
    this.saveSubjects(subjects);
  }

  addTopic(subjectId, chapterId, topicData) {
    if (!topicData || !topicData.name || !topicData.name.trim()) return null;
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return null;
    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter) return null;

    const newTopic = {
      id: `top-${Date.now()}`,
      name: topicData.name.trim(),
      completed: false,
      difficulty: topicData.difficulty || 'Medium',
      priority: topicData.priority || 'Medium',
      notes: topicData.notes || '',
      lastStudied: null
    };

    chapter.topics.push(newTopic);
    this.saveSubjects(subjects);
    return newTopic;
  }

  updateTopic(subjectId, chapterId, topicId, updatedFields) {
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    const topic = chapter.topics.find(t => t.id === topicId);
    if (!topic) return;

    Object.assign(topic, updatedFields);
    this.saveSubjects(subjects);
  }

  deleteTopic(subjectId, chapterId, topicId) {
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    chapter.topics = chapter.topics.filter(t => t.id !== topicId);
    this.saveSubjects(subjects);
  }

  toggleTopicComplete(subjectId, chapterId, topicId) {
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    const topic = chapter.topics.find(t => t.id === topicId);
    if (!topic) return;

    topic.completed = !topic.completed;
    if (topic.completed) {
      topic.lastStudied = new Date().toISOString().split('T')[0];
      // Notify topic completed event for auto-scheduling revision
      eventBus.emit('syllabus:topicCompleted', {
        topicName: topic.name,
        subjectName: subject.name,
        difficulty: topic.difficulty
      });
    }

    this.saveSubjects(subjects);
    return topic.completed;
  }

  /**
   * Calculate overall & subject-wise progress percentages
   */
  getStats() {
    const subjects = this.getSubjects();
    let totalTopics = 0;
    let completedTopics = 0;

    const subjectStats = subjects.map(subject => {
      let subjTotal = 0;
      let subjCompleted = 0;

      subject.chapters.forEach(ch => {
        ch.topics.forEach(top => {
          subjTotal++;
          if (top.completed) subjCompleted++;
        });
      });

      totalTopics += subjTotal;
      completedTopics += subjCompleted;

      const percentage = subjTotal > 0 ? Math.round((subjCompleted / subjTotal) * 100) : 0;
      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        badgeClass: subject.badgeClass || 'badge-outline',
        total: subjTotal,
        completed: subjCompleted,
        percentage
      };
    });

    const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      overallPercentage,
      totalTopics,
      completedTopics,
      subjects: subjectStats
    };
  }
}

export const syllabusService = new SyllabusService();
