/**
 * DashboardView - Real Data-Driven Student OS Dashboard Controller
 * Synchronizes all 7 Dashboard cards, sidebar badges, and interactive controls with real user state.
 */

import { eventBus } from '../../services/eventBus.js';
import { storageService } from '../../services/storageService.js';
import { syllabusService } from '../../services/syllabusService.js';
import { taskService } from '../../services/taskService.js';
import { goalService } from '../../services/goalService.js';
import { revisionService } from '../../services/revisionService.js';
import { quizService } from '../../services/quizService.js';
import { flashcardService } from '../../services/flashcardService.js';
import { streakService } from '../../services/streakService.js';

class DashboardView {
  constructor() {
    this.container = null;
  }

  init() {
    this.container = document.getElementById('view-dashboard');
    if (!this.container) return;

    this._bindEvents();
    this.renderAll();
  }

  _bindEvents() {
    // Listen to changes across all services to re-render relevant cards instantly
    eventBus.on('timer:completed', () => this.renderFocusCard());
    eventBus.on('tasks:updated', () => this.renderTasksCard());
    eventBus.on('syllabus:updated', () => {
      this.renderSyllabusCard();
      this.renderSidebarBadges();
    });
    eventBus.on('goals:updated', () => this.renderGoalsCard());
    eventBus.on('revision:updated', () => {
      this.renderRevisionCard();
      this.renderSidebarBadges();
    });
    eventBus.on('quiz:updated', () => {
      this.renderQuizCard();
      this.renderSidebarBadges();
    });
    eventBus.on('flashcards:updated', () => this.renderSidebarBadges());

    // Bind inline task creation from dashboard
    this._bindTaskInput();
  }

  renderAll() {
    this.renderFocusCard();
    this.renderStreakCard();
    this.renderQuizCard();
    this.renderRevisionCard();
    this.renderSyllabusCard();
    this.renderTasksCard();
    this.renderGoalsCard();
    this.renderSidebarBadges();
  }

  /**
   * CARD 1: Today's Focus Time
   */
  renderFocusCard() {
    const card = document.getElementById('card-focus-time');
    if (!card) return;

    const metrics = storageService.getMetrics();
    const minutes = metrics.todayFocusMinutes || 0;
    const targetMinutes = 180; // 3 hours
    const percent = Math.min(100, Math.round((minutes / targetMinutes) * 100));

    // Numbers display
    const hugeVal = card.querySelector('.focus-val-huge');
    if (hugeVal) {
      hugeVal.innerHTML = `${minutes} <small style="font-size: 1rem; color: var(--text-secondary);">min</small>`;
    }

    // Circular SVG Progress Ring
    const circleVal = card.querySelector('.circular-progress-val');
    const percentSpan = card.querySelector('.circular-progress-content span');
    if (circleVal) circleVal.setAttribute('stroke-dasharray', `${percent}, 100`);
    if (percentSpan) percentSpan.textContent = `${percent}%`;

    // Session Dots
    const dotsContainer = card.querySelector('.focus-sessions-row');
    if (dotsContainer) {
      const completed = metrics.todayCompletedSessions || 0;
      let dotsHtml = '';
      for (let i = 0; i < 6; i++) {
        const activeClass = i < completed ? 'active' : '';
        const title = i < completed ? `Session ${i + 1} Done` : `Pending Session ${i + 1}`;
        dotsHtml += `<span class="session-dot ${activeClass}" title="${title}"></span>`;
      }
      dotsContainer.innerHTML = dotsHtml;
    }
  }

  /**
   * CARD 2: Study Streak
   */
  renderStreakCard() {
    const card = document.getElementById('card-study-streak');
    if (!card) return;

    const { streakDays, weekDots } = streakService.getStreakInfo();

    // Streak value
    const streakVal = card.querySelector('.streak-big-val');
    if (streakVal) streakVal.textContent = streakDays;

    // Topbar streak pill
    const topbarStreak = document.querySelector('.streak-pill');
    if (topbarStreak) {
      topbarStreak.innerHTML = `<span>🔥</span><span>${streakDays} Days</span>`;
      topbarStreak.title = `${streakDays}-Day Active Study Streak`;
    }

    // 7-day Heatmap
    const weekDotsContainer = card.querySelector('.streak-week-dots');
    if (weekDotsContainer) {
      weekDotsContainer.innerHTML = weekDots.map(dot => `
        <div class="day-dot-col">
          <span class="day-indicator-dot ${dot.active ? 'active' : ''}"></span>
          <span style="${dot.isToday ? 'color: var(--color-amber); font-weight: 700;' : ''}">${dot.label}</span>
        </div>
      `).join('');
    }
  }

  /**
   * CARD 3: Quiz Score & Accuracy
   */
  renderQuizCard() {
    const card = document.getElementById('card-quiz-score');
    if (!card) return;

    const metrics = quizService.getPerformanceMetrics();
    const countSubtitle = card.querySelector('.card-subtitle');
    if (countSubtitle) {
      countSubtitle.textContent = `${metrics.totalQuizzes} Quizzes completed`;
    }

    const accPercent = card.querySelector('.quiz-acc-percent');
    if (accPercent) {
      accPercent.textContent = `${metrics.averageAccuracy}%`;
    }

    const ratioSpan = card.querySelector('.quiz-score-display .mono');
    if (ratioSpan) {
      ratioSpan.textContent = `${metrics.totalCorrect}/${metrics.totalQuestions}`;
    }

    // Subject breakdown tags
    const breakdownContainer = card.querySelector('.quiz-breakdown-tags');
    if (breakdownContainer) {
      if (metrics.subjectStats.length === 0) {
        breakdownContainer.innerHTML = '<span class="text-muted" style="font-size: 0.75rem;">No quizzes taken yet</span>';
      } else {
        breakdownContainer.innerHTML = metrics.subjectStats.map(stat => {
          let badgeClass = 'badge-outline';
          if (stat.subject === 'Physics') badgeClass = 'badge-physics';
          else if (stat.subject === 'Chemistry') badgeClass = 'badge-chemistry';
          else if (stat.subject === 'Maths') badgeClass = 'badge-maths';
          return `<span class="badge ${badgeClass}">${stat.subject}: ${stat.accuracy}%</span>`;
        }).join('');
      }
    }
  }

  /**
   * CARD 4: Revision Due
   */
  renderRevisionCard() {
    const card = document.getElementById('card-revision-due');
    if (!card) return;

    const dueItems = revisionService.getDueToday();
    const countBadge = card.querySelector('.card-header .badge');
    if (countBadge) {
      countBadge.textContent = `${dueItems.length} Today`;
      countBadge.className = dueItems.length > 0 ? 'badge badge-urgent' : 'badge badge-success';
    }

    const listContainer = card.querySelector('.revision-due-list');
    if (!listContainer) return;

    if (dueItems.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs); background: var(--bg-surface-elevated); border-radius: var(--radius-md);">
          ✓ All caught up! Zero revision overdue for today.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = dueItems.slice(0, 3).map(item => {
      let badgeClass = 'badge-outline';
      if (item.subject === 'Physics') badgeClass = 'badge-physics';
      else if (item.subject === 'Chemistry') badgeClass = 'badge-chemistry';
      else if (item.subject === 'Maths') badgeClass = 'badge-maths';

      return `
        <div class="revision-item" data-id="${item.id}">
          <div class="revision-item-meta">
            <span class="revision-item-title">${item.topic}</span>
            <span class="revision-item-sub">Interval: ${item.intervalDays}d (Cycle #${item.revisionCount || 1})</span>
          </div>
          <button class="btn btn-sm btn-ghost revision-check-btn" data-id="${item.id}" title="Mark Revision Complete" style="font-size: 0.75rem; color: var(--color-emerald);">
            ✓ Done
          </button>
        </div>
      `;
    }).join('');

    // Bind quick completion
    const checkBtns = listContainer.querySelectorAll('.revision-check-btn');
    checkBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        revisionService.completeRevision(id);
      });
    });
  }

  /**
   * CARD 5: Syllabus Progress
   */
  renderSyllabusCard() {
    const card = document.getElementById('card-syllabus-progress');
    if (!card) return;

    const stats = syllabusService.getStats();

    // Overall % Big Metric
    const bigPercent = card.querySelector('.syllabus-overall-box .mono');
    if (bigPercent) bigPercent.textContent = `${stats.overallPercentage}%`;

    const topicRatio = card.querySelector('.syllabus-overall-box p');
    if (topicRatio) {
      topicRatio.textContent = `Overall Completion (${stats.completedTopics} / ${stats.totalTopics} Topics)`;
    }

    // Subjects progress list
    const subjectList = card.querySelector('.syllabus-stat-row');
    if (!subjectList) return;

    subjectList.innerHTML = stats.subjects.map(subj => {
      let fillClass = 'fill-primary';
      if (subj.name === 'Physics') fillClass = 'fill-physics';
      else if (subj.name === 'Chemistry') fillClass = 'fill-chemistry';
      else if (subj.name === 'Mathematics' || subj.name === 'Maths') fillClass = 'fill-maths';

      return `
        <div class="subject-item-progress">
          <div class="subject-header-mini">
            <span style="color: ${subj.color || 'var(--text-primary)'};">${subj.name}</span>
            <span class="mono">${subj.percentage}% (${subj.completed}/${subj.total})</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${fillClass}" style="width: ${subj.percentage}%; background-color: ${subj.color || 'var(--color-primary)'};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * CARD 6: Today's Tasks
   */
  renderTasksCard() {
    const card = document.getElementById('card-todays-tasks');
    if (!card) return;

    const tasks = taskService.getTasks();
    const stats = taskService.getStats();

    // Header badge
    const headerBadge = card.querySelector('.card-header .badge');
    if (headerBadge) {
      headerBadge.textContent = `${stats.completed}/${stats.total} Done`;
    }

    // Task items container
    const listContainer = card.querySelector('.task-list');
    if (!listContainer) return;

    if (tasks.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">
          No tasks added yet. Add one below!
        </div>
      `;
    } else {
      listContainer.innerHTML = tasks.map(task => {
        let badgeClass = 'badge-outline';
        if (task.subject === 'Physics') badgeClass = 'badge-physics';
        else if (task.subject === 'Chemistry') badgeClass = 'badge-chemistry';
        else if (task.subject === 'Maths') badgeClass = 'badge-maths';

        return `
          <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-left">
              <div class="task-checkbox-mock ${task.completed ? 'checked' : ''}">
                ${task.completed ? '✓' : ''}
              </div>
              <span class="task-title">${task.title}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge ${badgeClass}">${task.subject}</span>
              <button class="btn btn-sm btn-ghost delete-task-btn" data-task-id="${task.id}" title="Delete Task" style="color: var(--text-muted); font-size: 0.9rem; padding: 2px 6px;">
                &times;
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Bind checkboxes & delete buttons
    listContainer.querySelectorAll('.task-item').forEach(item => {
      const taskId = item.getAttribute('data-task-id');
      const checkbox = item.querySelector('.task-checkbox-mock');
      const deleteBtn = item.querySelector('.delete-task-btn');

      if (checkbox) {
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
          taskService.toggleTask(taskId);
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          taskService.deleteTask(taskId);
        });
      }
    });
  }

  /**
   * Bind inline Quick-Add task input right on the dashboard card
   */
  _bindTaskInput() {
    const card = document.getElementById('card-todays-tasks');
    if (!card) return;

    // Check if input row already exists
    let inputRow = card.querySelector('.dashboard-task-input-row');
    if (!inputRow) {
      inputRow = document.createElement('div');
      inputRow.className = 'dashboard-task-input-row';
      inputRow.style.cssText = 'display: flex; gap: 8px; margin-top: 12px;';
      inputRow.innerHTML = `
        <input type="text" id="dash-new-task-input" placeholder="+ Add a study task for today..." style="flex: 1; padding: 8px 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: var(--font-size-xs); color: var(--text-primary);">
        <select id="dash-task-subject-select" style="padding: 8px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: var(--font-size-xs); color: var(--text-secondary);">
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Maths">Maths</option>
          <option value="Revision">Revision</option>
        </select>
        <button id="dash-add-task-btn" class="btn btn-primary btn-sm">Add</button>
      `;
      card.appendChild(inputRow);

      const addBtn = inputRow.querySelector('#dash-add-task-btn');
      const textInput = inputRow.querySelector('#dash-new-task-input');
      const subjSelect = inputRow.querySelector('#dash-task-subject-select');

      const handleAdd = () => {
        const title = textInput.value.trim();
        if (title) {
          taskService.addTask(title, subjSelect.value);
          textInput.value = '';
        }
      };

      addBtn.addEventListener('click', handleAdd);
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdd();
      });
    }
  }

  /**
   * CARD 7: Goals & Milestones
   */
  renderGoalsCard() {
    const card = document.getElementById('card-goals-progress');
    if (!card) return;

    const goals = goalService.getGoals();
    const listContainer = card.querySelector('.goals-progress-list');
    if (!listContainer) return;

    if (goals.length === 0) {
      listContainer.innerHTML = '<div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">No active goals. Add goals in the Goals module!</div>';
      return;
    }

    listContainer.innerHTML = goals.slice(0, 3).map(goal => `
      <div class="goal-track-item">
        <div class="progress-info">
          <span style="font-weight: 600;">${goal.title}</span>
          <span class="mono" style="color: var(--color-primary);">${goal.progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill fill-primary" style="width: ${goal.progress}%;"></div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Synchronize Sidebar Badges to real live numbers
   */
  renderSidebarBadges() {
    // 1. Syllabus badge
    const syllabusBadge = document.querySelector('#nav-syllabus .nav-badge');
    if (syllabusBadge) {
      const stats = syllabusService.getStats();
      syllabusBadge.textContent = `${stats.overallPercentage}%`;
    }

    // 2. Revision badge
    const revisionBadge = document.querySelector('#nav-revision .nav-badge');
    if (revisionBadge) {
      const dueCount = revisionService.getDueToday().length;
      revisionBadge.textContent = `${dueCount} Due`;
      revisionBadge.className = dueCount > 0 ? 'nav-badge badge-urgent' : 'nav-badge badge-outline';
    }

    // 3. Flashcards badge
    const flashcardsBadge = document.querySelector('#nav-flashcards .nav-badge');
    if (flashcardsBadge) {
      const fcStats = flashcardService.getStats();
      flashcardsBadge.textContent = `${fcStats.total}`;
    }

    // 4. Quiz badge
    const quizBadge = document.querySelector('#nav-quiz .nav-badge');
    if (quizBadge) {
      const qMetrics = quizService.getPerformanceMetrics();
      quizBadge.textContent = `${qMetrics.averageAccuracy}%`;
    }
  }
}

export const dashboardView = new DashboardView();
