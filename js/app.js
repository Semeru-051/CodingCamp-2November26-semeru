/* ============================================================
   Dashboard — app.js
   Vanilla JS, no frameworks. All data in LocalStorage.
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   SECTION 1 · THEME
   ────────────────────────────────────────────────────────────── */
const ThemeManager = (() => {
  const HTML   = document.documentElement;
  const TOGGLE = document.getElementById('theme-toggle');
  const KEY    = 'dashboard_theme';

  function apply(theme) {
    HTML.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }

  function init() {
    const saved = localStorage.getItem(KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    apply(saved);
    TOGGLE.addEventListener('click', () => {
      apply(HTML.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  return { init };
})();


/* ──────────────────────────────────────────────────────────────
   SECTION 2 · CLOCK & GREETING
   ────────────────────────────────────────────────────────────── */
const ClockManager = (() => {
  const clockEl    = document.getElementById('clock');
  const dateEl     = document.getElementById('date-display');
  const greetingEl = document.getElementById('greeting-text');

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function greet(hour) {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  function tick() {
    const now = new Date();
    const h   = now.getHours();
    const m   = now.getMinutes();
    const s   = now.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;

    clockEl.textContent    = `${pad(h12)}:${pad(m)}:${pad(s)} ${ampm}`;
    dateEl.textContent     = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    greetingEl.textContent = greet(h);
  }

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  return { init };
})();


/* ──────────────────────────────────────────────────────────────
   SECTION 3 · FOCUS TIMER
   ────────────────────────────────────────────────────────────── */
const TimerManager = (() => {
  const display       = document.getElementById('timer-display');
  const startBtn      = document.getElementById('timer-start');
  const stopBtn       = document.getElementById('timer-stop');
  const resetBtn      = document.getElementById('timer-reset');
  const customInput   = document.getElementById('custom-minutes');
  const setCustomBtn  = document.getElementById('set-custom');

  let totalSeconds  = 25 * 60;
  let remaining     = totalSeconds;
  let intervalId    = null;
  let isRunning     = false;

  function pad(n) { return String(n).padStart(2, '0'); }

  function render() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    display.textContent = `${pad(m)}:${pad(s)}`;
    display.classList.toggle('running', isRunning);
    display.classList.toggle('finished', remaining === 0 && !isRunning);
  }

  function setDuration(minutes) {
    stop();
    totalSeconds = minutes * 60;
    remaining    = totalSeconds;
    render();
  }

  function start() {
    if (isRunning || remaining === 0) return;
    isRunning  = true;
    startBtn.disabled = true;
    intervalId = setInterval(() => {
      remaining--;
      render();
      if (remaining === 0) {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.disabled = false;
        notify('⏰ Timer finished!');
      }
    }, 1000);
    render();
  }

  function stop() {
    clearInterval(intervalId);
    isRunning = false;
    startBtn.disabled = false;
    render();
  }

  function reset() {
    stop();
    remaining = totalSeconds;
    render();
  }

  function notify(msg) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(msg);
    } else {
      // fallback: flash title
      let count = 0;
      const orig = document.title;
      const id = setInterval(() => {
        document.title = count % 2 === 0 ? '⏰ Time is up!' : orig;
        if (++count > 10) { clearInterval(id); document.title = orig; }
      }, 600);
    }
  }

  function init() {
    // request notification permission quietly
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    render();

    startBtn.addEventListener('click', start);
    stopBtn.addEventListener('click', stop);
    resetBtn.addEventListener('click', reset);

    setCustomBtn.addEventListener('click', () => {
      const val = parseInt(customInput.value, 10);
      if (!isNaN(val) && val > 0) {
        setDuration(val);
        customInput.value = '';
      }
    });

    // allow pressing Enter in custom input
    customInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') setCustomBtn.click();
    });
  }

  return { init };
})();


/* ──────────────────────────────────────────────────────────────
   SECTION 4 · TO-DO LIST
   ────────────────────────────────────────────────────────────── */
const TodoManager = (() => {
  const form      = document.getElementById('todo-form');
  const input     = document.getElementById('todo-input');
  const listEl    = document.getElementById('todo-list');
  const emptyEl   = document.getElementById('todo-empty');
  const KEY       = 'dashboard_todos';

  // Edit modal elements
  const modal         = document.getElementById('edit-modal');
  const backdrop      = document.getElementById('modal-backdrop');
  const editInput     = document.getElementById('edit-input');
  const editSaveBtn   = document.getElementById('edit-save');
  const editCancelBtn = document.getElementById('edit-cancel');

  let todos   = [];
  let editingId = null;
  let draggedId = null;

  /* ── Storage ── */
  function load()  { todos = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function save()  { localStorage.setItem(KEY, JSON.stringify(todos)); }

  /* ── CRUD ── */
  function addTodo(text) {
    todos.push({ id: Date.now(), text: text.trim(), done: false });
    save();
    render();
  }

  function toggleTodo(id) {
    const t = todos.find(t => t.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function saveTodoEdit(id, newText) {
    const t = todos.find(t => t.id === id);
    if (t && newText.trim()) { t.text = newText.trim(); save(); render(); }
  }

  /* ── Drag and Drop ── */
  function handleDragStart(e) {
    draggedId = e.currentTarget.dataset.id;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    // Hide ghost image slightly to improve UX
    setTimeout(() => e.currentTarget.classList.add('dragging'), 0);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const afterElement = getDragAfterElement(listEl, e.clientY);
    const draggable = listEl.querySelector('.dragging');
    if (afterElement == null) {
      listEl.appendChild(draggable);
    } else {
      listEl.insertBefore(draggable, afterElement);
    }
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    draggedId = null;
    // Persist new order
    const newOrder = Array.from(listEl.children).map(li => parseInt(li.dataset.id, 10));
    todos.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    save();
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo__item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  /* ── Render ── */
  function render() {
    listEl.innerHTML = '';
    emptyEl.hidden = todos.length > 0;

    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo__item' + (todo.done ? ' done' : '');
      li.dataset.id = todo.id;
      li.draggable = true;

      // drag handlers
      li.addEventListener('dragstart', handleDragStart);
      li.addEventListener('dragend', handleDragEnd);
      li.addEventListener('dragover', handleDragOver);

      // checkbox
      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'todo__checkbox';
      cb.checked   = todo.done;
      cb.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.done ? 'undone' : 'done'}`);
      cb.addEventListener('change', () => toggleTodo(todo.id));

      // text
      const span = document.createElement('span');
      span.className   = 'todo__text';
      span.textContent = todo.text;

      // actions
      const actions = document.createElement('div');
      actions.className = 'todo__actions';

      const editBtn = document.createElement('button');
      editBtn.className   = 'btn-icon-sm';
      editBtn.textContent = '✏️';
      editBtn.title       = 'Edit task';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.addEventListener('click', () => openEditModal(todo.id, todo.text));

      const delBtn = document.createElement('button');
      delBtn.className   = 'btn-icon-sm danger';
      delBtn.textContent = '🗑️';
      delBtn.title       = 'Delete task';
      delBtn.setAttribute('aria-label', 'Delete task');
      delBtn.addEventListener('click', () => deleteTodo(todo.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(actions);
      listEl.appendChild(li);
    });
  }

  /* ── Edit Modal ── */
  function openEditModal(id, text) {
    editingId         = id;
    editInput.value   = text;
    modal.hidden      = false;
    backdrop.hidden   = false;
    editInput.focus();
    editInput.select();
  }

  function closeEditModal() {
    modal.hidden    = true;
    backdrop.hidden = true;
    editingId       = null;
  }

  /* ── Init ── */
  function init() {
    load();
    render();

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (input.value.trim()) { addTodo(input.value); input.value = ''; }
    });

    editSaveBtn.addEventListener('click', () => {
      if (editingId !== null) { saveTodoEdit(editingId, editInput.value); }
      closeEditModal();
    });

    editCancelBtn.addEventListener('click', closeEditModal);
    backdrop.addEventListener('click', closeEditModal);

    editInput.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { editSaveBtn.click(); }
      if (e.key === 'Escape') { closeEditModal(); }
    });
  }

  return { init };
})();


/* ──────────────────────────────────────────────────────────────
   SECTION 5 · QUICK LINKS
   ────────────────────────────────────────────────────────────── */
const LinksManager = (() => {
  const form     = document.getElementById('link-form');
  const nameInput = document.getElementById('link-name');
  const urlInput  = document.getElementById('link-url');
  const grid      = document.getElementById('links-grid');
  const emptyEl   = document.getElementById('links-empty');
  const KEY       = 'dashboard_links';

  let links = [];

  function load() { links = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function save() { localStorage.setItem(KEY, JSON.stringify(links)); }

  function addLink(label, url) {
    // Ensure URL has a protocol
    const href = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    links.push({ id: Date.now(), label: label.trim(), url: href });
    save();
    render();
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    save();
    render();
  }

  function faviconUrl(url) {
    try {
      const origin = new URL(url).origin;
      return `https://www.google.com/s2/favicons?sz=32&domain_url=${origin}`;
    } catch { return ''; }
  }

  function render() {
    grid.innerHTML  = '';
    emptyEl.hidden  = links.length > 0;

    links.forEach(link => {
      const chip = document.createElement('div');
      chip.className = 'link-chip';

      const img = document.createElement('img');
      img.src   = faviconUrl(link.url);
      img.alt   = '';
      img.width = 14;
      img.height= 14;
      img.onerror = () => { img.style.display = 'none'; };

      const anchor = document.createElement('a');
      anchor.href   = link.url;
      anchor.target = '_blank';
      anchor.rel    = 'noopener noreferrer';

      const labelSpan = document.createElement('span');
      labelSpan.className   = 'link-chip__label';
      labelSpan.textContent = link.label;
      anchor.appendChild(labelSpan);

      const delBtn = document.createElement('button');
      delBtn.className   = 'link-chip__delete';
      delBtn.textContent = '✕';
      delBtn.title       = 'Remove link';
      delBtn.setAttribute('aria-label', `Remove ${link.label}`);
      delBtn.addEventListener('click', e => { e.stopPropagation(); deleteLink(link.id); });

      chip.appendChild(img);
      chip.appendChild(anchor);
      chip.appendChild(delBtn);
      grid.appendChild(chip);
    });
  }

  function init() {
    load();
    render();

    form.addEventListener('submit', e => {
      e.preventDefault();
      const label = nameInput.value.trim();
      const url   = urlInput.value.trim();
      if (label && url) {
        addLink(label, url);
        nameInput.value = '';
        urlInput.value  = '';
      }
    });
  }

  return { init };
})();


/* ──────────────────────────────────────────────────────────────
   BOOT
   ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  ClockManager.init();
  TimerManager.init();
  TodoManager.init();
  LinksManager.init();
});
