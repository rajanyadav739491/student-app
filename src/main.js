/**
 * Ultimate Student OS - Master Application Coordinator
 * Bootstraps modular services, URL hash routing, live views, and event subscriptions.
 */

import { eventBus } from './services/eventBus.js';
import { storageService } from './services/storageService.js';
import { timerView } from './modules/timer/timerView.js';
import { deepWorkView } from './modules/timer/deepWorkView.js';
import { dashboardView } from './modules/dashboard/dashboardView.js';
import { searchModal } from './modules/search/searchModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Navigation & URL Hash Routing
  initViewNavigation();
  initThemeToggle();
  initMobileDrawer();

  // 2. Initialize Core Modules
  timerView.init();
  deepWorkView.init();
  dashboardView.init();

  // 3. Initialize Global Quick Search Palette (Ctrl + K)
  searchModal.init((targetViewId) => {
    navigateToView(targetViewId);
  });
});

/**
 * Global Navigation & URL Hash Router
 */
export function navigateToView(targetViewId) {
  if (!targetViewId) return;
  window.location.hash = targetViewId;
}

function initViewNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const viewContainers = document.querySelectorAll('.view-container');
  const quickActionTiles = document.querySelectorAll('[data-goto]');
  const cardActions = document.querySelectorAll('.card-action[data-goto]');

  function updateViewFromRoute(targetViewId) {
    const validView = targetViewId ? targetViewId.replace(/^#/, '') : 'dashboard';

    // Verify if view exists, fallback to dashboard
    const targetEl = document.getElementById(`view-${validView}`);
    const activeViewId = targetEl ? validView : 'dashboard';

    // Update Sidebar Navigation active state
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === activeViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update View Containers
    viewContainers.forEach(container => {
      if (container.id === `view-${activeViewId}`) {
        container.classList.add('active');
      } else {
        container.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }

    // Smooth scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Listen to browser hash changes (back/forward & clicks)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace(/^#/, '');
    updateViewFromRoute(hash);
  });

  // Sidebar item clicks
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = item.getAttribute('data-view');
      navigateToView(viewId);
    });
  });

  // Quick action buttons clicks
  quickActionTiles.forEach(tile => {
    tile.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = tile.getAttribute('data-goto');
      navigateToView(viewId);
    });
  });

  // Card action links ("Timer ->", "New Quiz ->", etc.)
  cardActions.forEach(action => {
    action.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = action.getAttribute('data-goto');
      navigateToView(viewId);
    });
  });

  // Logo button returns to dashboard
  const logoBtn = document.getElementById('brand-logo-btn');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToView('dashboard');
    });
  }

  // Load initial view based on URL hash or default to dashboard
  const initialHash = window.location.hash.replace(/^#/, '');
  updateViewFromRoute(initialHash || 'dashboard');
}

/**
 * Handle Theme switching (Dark / Light mode)
 */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');
  const htmlRoot = document.documentElement;

  // Retrieve saved preference or default to dark
  const savedTheme = localStorage.getItem('student_os_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('student_os_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    if (theme === 'light') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  }
}

/**
 * Handle Mobile Drawer navigation
 */
function initMobileDrawer() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (mobileToggle && sidebar && overlay) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
}
