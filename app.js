// Frontend SPA logic for Shaik Khaja Naserudden's Portfolio

// Global State
const state = {
  projects: [],
  skills: [],
  comments: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupScrollTracking();
  setupFormHandler();
  
  // Load content from backend database APIs
  loadSkills();
  loadProjects();
  loadComments();
});

// ==========================================
// TOAST NOTIFICATION UTILITY
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toast.addEventListener('click', () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (container.contains(toast)) {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove());
    }
  }, 4000);
}

// ==========================================
// THEME CONFIGURATION (Dark/Light)
// ==========================================
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const sunIcon = toggleBtn.querySelector('.sun-icon');
  const moonIcon = toggleBtn.querySelector('.moon-icon');

  // Check saved preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }

  toggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    if (isLight) {
      localStorage.setItem('theme', 'light');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
      showToast('Swapped to Light Theme', 'info');
    } else {
      localStorage.setItem('theme', 'dark');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
      showToast('Swapped to Dark Theme', 'info');
    }
  });
}

// ==========================================
// SCROLL TRACKER FOR ACTIVE MENU ITEMS
// ==========================================
function setupScrollTracking() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ==========================================
// BACKEND API CONTENT LOADING
// ==========================================

// Fetch and render Skills
async function loadSkills() {
  const container = document.getElementById('skills-grid');
  try {
    const response = await fetch('/api/skills');
    if (!response.ok) throw new Error('Failed to load skills from database.');
    const skills = await response.json();
    state.skills = skills;

    if (skills.length === 0) {
      container.innerHTML = '<div class="loading-placeholder">No skills defined in database.</div>';
      return;
    }

    container.innerHTML = '';
    skills.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'skill-card';
      card.innerHTML = `
        <div class="skill-header">
          <span class="skill-name">${escapeHTML(skill.name)}</span>
          <span class="skill-level-badge">${escapeHTML(skill.level)}</span>
        </div>
        <span class="skill-category">${escapeHTML(skill.category)}</span>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="loading-placeholder color-danger">Error: ${err.message}</div>`;
  }
}

// Fetch and render Projects
async function loadProjects() {
  const container = document.getElementById('projects-grid');
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('Failed to load projects from database.');
    const projects = await response.json();
    state.projects = projects;

    if (projects.length === 0) {
      container.innerHTML = '<div class="loading-placeholder">No projects defined in database.</div>';
      return;
    }

    container.innerHTML = '';
    projects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'project-card';
      
      const linkHtml = proj.projectUrl 
        ? `<a href="${proj.projectUrl}" target="_blank" class="project-link-btn">
            <span>Live Demo</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
           </a>`
        : '';
        
      const gitHtml = proj.githubUrl
        ? `<a href="${proj.githubUrl}" target="_blank" class="project-link-btn">
            <span>Repository</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
           </a>`
        : '';

      card.innerHTML = `
        <span class="project-tech">${escapeHTML(proj.technology)}</span>
        <h3 class="project-title">${escapeHTML(proj.title)}</h3>
        <p class="project-desc">${escapeHTML(proj.description)}</p>
        <div class="project-links">
          ${linkHtml}
          ${gitHtml}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="loading-placeholder color-danger">Error: ${err.message}</div>`;
  }
}

// Fetch and render Comments
async function loadComments() {
  const container = document.getElementById('comments-board');
  try {
    const response = await fetch('/api/messages');
    if (!response.ok) throw new Error('Failed to load feedback from database.');
    const comments = await response.json();
    state.comments = comments;

    if (comments.length === 0) {
      container.innerHTML = '<div class="comments-empty">No comments left yet. Be the first!</div>';
      return;
    }

    container.innerHTML = '';
    comments.forEach(comment => {
      const formattedDate = new Date(comment.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const initial = comment.name.charAt(0).toUpperCase();

      const card = document.createElement('div');
      card.className = 'comment-card';
      card.innerHTML = `
        <div class="comment-avatar">${initial}</div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-name" title="${escapeHTML(comment.name)}">${escapeHTML(comment.name)}</span>
            <span class="comment-date">${formattedDate}</span>
          </div>
          <p class="comment-text">${escapeHTML(comment.content)}</p>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="comments-empty color-danger">Error loading comments.</div>`;
  }
}

// ==========================================
// FORM SUBMISSION HANDLER
// ==========================================
function setupFormHandler() {
  const form = document.getElementById('contact-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const contentInput = document.getElementById('form-content');
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim() || null;
    const content = contentInput.value.trim();

    try {
      submitBtn.disabled = true;
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, content })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit comment.');
      }

      showToast('Thank you for your feedback!', 'success');
      
      // Clear inputs
      nameInput.value = '';
      emailInput.value = '';
      contentInput.value = '';
      
      // Reload comments to show immediately
      loadComments();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/**
 * Escapes tags to prevent XSS.
 */
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
