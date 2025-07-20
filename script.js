// Gestor de Tareas Pro - Lógica principal

// Selección de elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskTime = document.getElementById('task-time');
const taskCategory = document.getElementById('task-category');
const taskList = document.getElementById('task-list');

// Cargar tareas desde localStorage al iniciar
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();
startAlarmChecker();

/**
 * Renderiza todas las tareas en la lista
 */
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-index', idx);

    // Contenido de la tarea
    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    // Checkbox para completar
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.tabIndex = 0;
    checkbox.setAttribute('aria-label', 'Marcar tarea como completada');
    checkbox.addEventListener('change', () => toggleTask(idx));

    // Texto de la tarea
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(span);

    // Categoría visual
    if (task.category) {
      const catSpan = document.createElement('span');
      catSpan.className = 'category-badge category-' + task.category.toLowerCase();
      catSpan.textContent = task.category;
      contentDiv.appendChild(catSpan);
    }

    // Hora de la tarea (si existe)
    if (task.time) {
      const timeSpan = document.createElement('span');
      timeSpan.className = 'task-time';
      timeSpan.textContent = task.time;
      contentDiv.appendChild(timeSpan);
    }

    // Botón eliminar
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.title = 'Eliminar tarea';
    delBtn.setAttribute('aria-label', 'Eliminar tarea');
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', () => removeTask(idx, li));

    li.appendChild(contentDiv);
    li.appendChild(delBtn);

    taskList.appendChild(li);
  });
}

/**
 * Agrega una nueva tarea
 */
taskForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  const time = taskTime.value;
  const category = taskCategory.value;
  if (!text) return;
  const newTask = { text, completed: false, time: time || null, notificada: false, category };
  tasks.unshift(newTask);
  saveTasks();
  taskInput.value = '';
  taskTime.value = '';
  taskCategory.value = 'Trabajo';
  renderTasks();
});

/**
 * Marca/desmarca una tarea como completada
 */
function toggleTask(idx) {
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks();
  renderTasks();
}

/**
 * Elimina una tarea con animación
 */
function removeTask(idx, li) {
  li.classList.add('removing');
  setTimeout(() => {
    tasks.splice(idx, 1);
    saveTasks();
    renderTasks();
  }, 220); // Duración de la animación CSS
}

/**
 * Guarda las tareas en localStorage
 */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Revisa cada minuto si hay tareas con hora y muestra alerta si corresponde
 */
function startAlarmChecker() {
  checkAlarms();
  setInterval(checkAlarms, 60000); // Cada minuto
}

// ========== BOTÓN MODO OSCURO ==========
const btnModoOscuro = document.getElementById('modo-oscuro-btn');
function actualizarModoOscuro() {
  if (localStorage.getItem('modoOscuro') === 'true') {
    document.body.classList.add('dark-mode');
    btnModoOscuro.textContent = '☀️ Modo Claro';
  } else {
    document.body.classList.remove('dark-mode');
    btnModoOscuro.textContent = '🌙 Modo Oscuro';
  }
}
btnModoOscuro.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark-mode');
  localStorage.setItem('modoOscuro', isDark);
  actualizarModoOscuro();
});
actualizarModoOscuro();

// ========== EXPORTAR JSON ==========
document.getElementById('export-json').addEventListener('click', () => {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tareas-taskflowpro.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// ========== EXPORTAR PDF ==========
document.getElementById('export-pdf').addEventListener('click', () => {
  document.body.classList.add('print-tasks');
  setTimeout(() => {
    window.print();
    setTimeout(() => document.body.classList.remove('print-tasks'), 500);
  }, 100);
});

// ========== ALARMA: SONIDO Y VISUAL ==========
function mostrarAlerta(texto) {
  const alerta = document.getElementById("alerta");
  alerta.textContent = texto;
  alerta.classList.remove("hidden");
  setTimeout(() => alerta.classList.add("hidden"), 4000);
}

// Sonido de alarma
const alarmAudio = document.getElementById('alarm-audio');
const alarmTone = document.getElementById('alarm-tone');
const customAudioInput = document.getElementById('custom-audio');
let sonidoActivo = localStorage.getItem('sonidoActivo') !== 'false'; // Por defecto ON

// Mantener tono seleccionado y personalizado
const savedTone = localStorage.getItem('alarmTone');
const savedCustom = localStorage.getItem('customAlarmAudio');
if (savedTone) {
  alarmTone.value = savedTone;
  if (savedTone === 'custom' && savedCustom) {
    alarmAudio.src = savedCustom;
  } else {
    alarmAudio.src = savedTone;
  }
}

alarmTone.addEventListener('change', function() {
  if (this.value === 'custom') {
    customAudioInput.style.display = 'inline-block';
    customAudioInput.click();
  } else {
    alarmAudio.src = this.value;
    localStorage.setItem('alarmTone', this.value);
    customAudioInput.style.display = 'none';
  }
});

customAudioInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('audio/')) {
    const url = URL.createObjectURL(file);
    alarmAudio.src = url;
    localStorage.setItem('alarmTone', 'custom');
    localStorage.setItem('customAlarmAudio', url);
    alarmTone.value = 'custom';
    mostrarAlerta('🔊 ¡Audio de alarma personalizado cargado!');
  } else {
    mostrarAlerta('El archivo seleccionado no es un audio válido.');
    alarmTone.value = 'audios/alarma1.mp3';
    alarmAudio.src = 'audios/alarma1.mp3';
  }
});

// ========== CHECK ALARMS SIN BLOQUEAR ==========
function checkAlarms() {
  const now = new Date();
  const nowStr = now.toTimeString().slice(0,5); // "HH:MM"
  tasks.forEach((task, idx) => {
    if (
      task.time &&
      !task.completed &&
      !task.notificada &&
      task.time === nowStr
    ) {
      mostrarAlerta(`⏰ ¡Es hora de: "${task.text}"!`);
if (sonidoActivo) {
  alarmAudio.currentTime = 0;
  alarmAudio.play();
}
      tasks[idx].notificada = true;
      saveTasks();
    }
  });
}

// ========== BOTÓN ACTIVAR/DESACTIVAR SONIDO ==========
const btnToggleSound = document.getElementById('toggle-sound-btn');

function actualizarBotonSonido() {
  btnToggleSound.textContent = sonidoActivo ? '🔔 Sonido ON' : '🔕 Sonido OFF';
}

btnToggleSound.addEventListener('click', () => {
  sonidoActivo = !sonidoActivo;
  localStorage.setItem('sonidoActivo', sonidoActivo);
  actualizarBotonSonido();
});

actualizarBotonSonido();

// Selector de temas desplegable
const themeToggleBtn = document.querySelector('.theme-toggle-btn');
const themeSelector = document.querySelector('.theme-selector');
themeToggleBtn.addEventListener('click', () => {
  themeSelector.classList.toggle('active');
});

// Cambiar tema divertido
const themeBtns = document.querySelectorAll('.theme-btn');
function setTheme(theme) {
  document.body.className = document.body.className
    .replace(/\btheme-\w+\b/g, '') // elimina cualquier tema anterior
    .trim();
  if (theme !== 'default') document.body.classList.add('theme-' + theme);
  localStorage.setItem('theme', theme);
  themeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
}
themeBtns.forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});
// Al cargar, aplicar tema guardado
const savedTheme = localStorage.getItem('theme') || 'default';
setTheme(savedTheme);
