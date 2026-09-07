/**
 * SearchModal - Global Quick-Jump Palette (Ctrl + K)
 * Searches across Syllabus Topics, Tasks, Goals, Flashcards, and Resources.
 */

import { syllabusService } from '../../services/syllabusService.js';
import { taskService } from '../../services/taskService.js';
import { goalService } from '../../services/goalService.js';
import { flashcardService } from '../../services/flashcardService.js';
import { storageService } from '../../services/storageService.js';
import { DEFAULT_STATE } from '../../data/defaultState.js';

class SearchModal {
  constructor() {
    this.modalEl = null;
    this.inputEl = null;
    this.resultsEl = null;
    this.isOpen = false;
  }

  init(onNavigate) {
    this.onNavigate = onNavigate;
    this._injectModalHTML();
    this._bindEvents();
  }

  _injectModalHTML() {
    const existing = document.getElementById('global-search-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'global-search-modal';
    modal.className = 'global-search-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(8, 12, 20, 0.75);
      backdrop-filter: blur(12px);
      z-index: 999;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
    `;

    modal.innerHTML = `
      <div class="search-palette-box card" style="width: 90%; max-width: 580px; padding: var(--space-4); max-height: 70vh; display: flex; flex-direction: column; gap: var(--space-3); border-color: var(--border-light);">
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-3);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="global-search-query-input" placeholder="Search topics, formulas, goals, flashcards..." style="flex: 1; background: transparent; border: none; font-size: var(--font-size-base); color: var(--text-primary);" autofocus>
          <span style="font-size: 0.65rem; padding: 2px 6px; background: var(--bg-surface-elevated); border-radius: 4px; color: var(--text-muted);">ESC</span>
        </div>
        <div id="global-search-results" style="overflow-y: auto; display: flex; flex-direction: column; gap: 4px; max-height: 45vh;">
          <div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">
            Type to search across your Student OS...
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.inputEl = modal.querySelector('#global-search-query-input');
    this.resultsEl = modal.querySelector('#global-search-results');
  }

  _bindEvents() {
    // Open trigger from topbar search bar
    const triggerBtn = document.getElementById('global-search-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.open());
    }

    // Keyboard shortcut (Ctrl + K or Cmd + K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on backdrop click
    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) this.close();
      });
    }

    // Live search input
    if (this.inputEl) {
      this.inputEl.addEventListener('input', (e) => {
        this._search(e.target.value);
      });
    }
  }

  open() {
    if (!this.modalEl) return;
    this.isOpen = true;
    this.modalEl.style.display = 'flex';
    if (this.inputEl) {
      this.inputEl.value = '';
      this.inputEl.focus();
    }
    this._search('');
  }

  close() {
    if (!this.modalEl) return;
    this.isOpen = false;
    this.modalEl.style.display = 'none';
  }

  _search(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      this.resultsEl.innerHTML = `
        <div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">
          Quick jumps: Type <strong>"Physics"</strong>, <strong>"Mechanics"</strong>, <strong>"Integration"</strong>, or <strong>"Exam"</strong>
        </div>
      `;
      return;
    }

    const results = [];

    // 1. Search Syllabus Topics & Chapters
    const subjects = syllabusService.getSubjects();
    subjects.forEach(subj => {
      subj.chapters.forEach(chap => {
        if (chap.name.toLowerCase().includes(q)) {
          results.push({
            type: 'Chapter',
            title: chap.name,
            sub: `${subj.name} Chapter`,
            targetView: 'syllabus'
          });
        }
        chap.topics.forEach(top => {
          if (top.name.toLowerCase().includes(q) || (top.notes && top.notes.toLowerCase().includes(q))) {
            results.push({
              type: 'Topic',
              title: top.name,
              sub: `${subj.name} • ${chap.name}`,
              targetView: 'syllabus'
            });
          }
        });
      });
    });

    // 2. Search Flashcards
    const cards = flashcardService.getCards();
    cards.forEach(card => {
      if (card.question.toLowerCase().includes(q) || card.answer.toLowerCase().includes(q)) {
        results.push({
          type: 'Flashcard',
          title: card.question,
          sub: `${card.subject} • ${card.chapter}`,
          targetView: 'flashcards'
        });
      }
    });

    // 3. Search Goals
    const goals = goalService.getGoals();
    goals.forEach(goal => {
      if (goal.title.toLowerCase().includes(q) || (goal.description && goal.description.toLowerCase().includes(q))) {
        results.push({
          type: 'Goal',
          title: goal.title,
          sub: `Target: ${goal.exam} • ${goal.progress}%`,
          targetView: 'goals'
        });
      }
    });

    // 4. Search Tasks
    const tasks = taskService.getTasks();
    tasks.forEach(task => {
      if (task.title.toLowerCase().includes(q)) {
        results.push({
          type: 'Task',
          title: task.title,
          sub: `${task.subject} Task (${task.completed ? 'Done' : 'Pending'})`,
          targetView: 'dashboard'
        });
      }
    });

    if (results.length === 0) {
      this.resultsEl.innerHTML = `
        <div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">
          No results found for "${query}"
        </div>
      `;
      return;
    }

    this.resultsEl.innerHTML = results.slice(0, 8).map(res => `
      <div class="search-result-item" data-view="${res.targetView}" style="padding: 10px 14px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); display: flex; align-items: center; justify-content: space-between; cursor: pointer; border: 1px solid var(--border-subtle); margin-bottom: 4px;">
        <div>
          <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); display: block;">${res.title}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${res.sub}</span>
        </div>
        <span class="badge badge-outline" style="font-size: 0.65rem;">${res.type} &rarr;</span>
      </div>
    `).join('');

    // Click result to navigate
    this.resultsEl.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const viewId = item.getAttribute('data-view');
        this.close();
        if (this.onNavigate) this.onNavigate(viewId);
      });
    });
  }
}

export const searchModal = new SearchModal();
