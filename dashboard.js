/* ══════════════════════════════════════
   Dark / Light Mode
══════════════════════════════════════ */
const themeBtn = document.getElementById('theme-toggle');

function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    themeBtn.textContent = dark ? '☀️' : '🌙';
    themeBtn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
}

function toggleTheme() {
    const isDark = !document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme(isDark);
}

// Restore saved theme on load
applyTheme(localStorage.getItem('theme') === 'dark');


/* ══════════════════════════════════════
   Custom Name & Greeting
══════════════════════════════════════ */
let userName = localStorage.getItem('userName') || '';

function renderName() {
    const display = document.getElementById('display-name');
    display.textContent = userName ? `Hi, ${userName}` : '';
}

function openNameEditor() {
    document.getElementById('name-input').value = userName;
    document.getElementById('name-editor').style.display = 'flex';
    document.getElementById('name-input').focus();
}

function closeNameEditor() {
    document.getElementById('name-editor').style.display = 'none';
}

function saveName() {
    const val = document.getElementById('name-input').value.trim();
    userName = val;
    localStorage.setItem('userName', userName);
    renderName();
    closeNameEditor();
}

document.getElementById('name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') closeNameEditor();
});

renderName();


/* ══════════════════════════════════════
   Clock
══════════════════════════════════════ */
const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function updateClock() {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2,'0');
    const m   = String(now.getMinutes()).padStart(2,'0');
    const s   = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('clock').textContent = `${h}:${m}:${s}`;

    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    document.getElementById('date').textContent = dateStr;

    const hour = now.getHours();
    let greet = 'Good Evening';
    if (hour < 12)      greet = 'Good Morning';
    else if (hour < 17) greet = 'Good Afternoon';

    const nameTag = userName ? `, ${userName}` : '';
    document.getElementById('greeting').textContent = greet + nameTag + '!';
}
updateClock();
setInterval(updateClock, 1000);


/* ══════════════════════════════════════
   Focus Timer (Pomodoro)
══════════════════════════════════════ */
let pomodoroMinutes = parseInt(localStorage.getItem('pomodoroMinutes') || '25', 10);
let timerSeconds    = pomodoroMinutes * 60;
let timerInterval   = null;

// Sync the number input with saved value
document.getElementById('pomodoro-minutes').value = pomodoroMinutes;

function renderTimer() {
    const m = String(Math.floor(timerSeconds / 60)).padStart(2,'0');
    const s = String(timerSeconds % 60).padStart(2,'0');
    document.getElementById('timer-display').textContent = `${m}:${s}`;
}

function applyPomodoroTime() {
    const input = document.getElementById('pomodoro-minutes');
    const mins  = Math.max(1, Math.min(120, parseInt(input.value, 10) || 25));
    input.value        = mins;
    pomodoroMinutes    = mins;
    localStorage.setItem('pomodoroMinutes', mins);
    stopTimer();
    timerSeconds = mins * 60;
    renderTimer();
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            return;
        }
        timerSeconds--;
        renderTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    timerSeconds = pomodoroMinutes * 60;
    renderTimer();
}

renderTimer();

// Allow pressing Enter in the minutes input
document.getElementById('pomodoro-minutes').addEventListener('keydown', e => {
    if (e.key === 'Enter') applyPomodoroTime();
});


/* ══════════════════════════════════════
   Tasks
══════════════════════════════════════ */
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const ul = document.getElementById('task-list');
    ul.innerHTML = '';
    tasks.forEach((task, i) => {
        const li = document.createElement('li');

        const cb = document.createElement('input');
        cb.type    = 'checkbox';
        cb.checked = task.done;
        cb.onchange = () => { tasks[i].done = cb.checked; saveTasks(); renderTasks(); };

        const span = document.createElement('span');
        span.textContent = task.text;
        if (task.done) span.classList.add('done');

        const del = document.createElement('button');
        del.className   = 'btn btn-danger';
        del.textContent = 'Delete';
        del.style.padding   = '5px 12px';
        del.style.fontSize  = '0.85rem';
        del.onclick = () => { tasks.splice(i, 1); saveTasks(); renderTasks(); };

        li.append(cb, span, del);
        ul.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById('task-input');
    const text  = input.value.trim();
    if (!text) return;
    tasks.push({ text, done: false });
    saveTasks();
    renderTasks();
    input.value = '';
}

document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
});

renderTasks();


/* ══════════════════════════════════════
   Quick Links
══════════════════════════════════════ */
let links = JSON.parse(localStorage.getItem('links') || JSON.stringify([
    { name: 'Google',   url: 'https://google.com' },
    { name: 'Gmail',    url: 'https://mail.google.com' },
    { name: 'Calendar', url: 'https://calendar.google.com' }
]));

function saveLinks() {
    localStorage.setItem('links', JSON.stringify(links));
}

function renderLinks() {
    const container = document.getElementById('link-list');
    container.innerHTML = '';
    links.forEach((link, i) => {
        const a = document.createElement('a');
        a.href      = link.url;
        a.target    = '_blank';
        a.className = 'link-btn';
        a.textContent = link.name;

        const x = document.createElement('button');
        x.className   = 'remove-link';
        x.textContent = '×';
        x.onclick = (e) => {
            e.preventDefault();
            links.splice(i, 1);
            saveLinks();
            renderLinks();
        };

        a.appendChild(x);
        container.appendChild(a);
    });
}

function addLink() {
    const name = document.getElementById('link-name').value.trim();
    let   url  = document.getElementById('link-url').value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    links.push({ name, url });
    saveLinks();
    renderLinks();
    document.getElementById('link-name').value = '';
    document.getElementById('link-url').value  = '';
}

document.getElementById('link-url').addEventListener('keydown', e => {
    if (e.key === 'Enter') addLink();
});

renderLinks();
