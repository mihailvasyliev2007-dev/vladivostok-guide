let tasks = [];
let currentFilter = 'all';

function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) tasks = JSON.parse(saved);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    
    let filtered = tasks;
    if (currentFilter !== 'all') {
        filtered = tasks.filter(t => t.priority === currentFilter);
    }
    
    filtered.forEach((task, index) => {
        const realIndex = tasks.indexOf(task);
        const div = document.createElement('div');
        div.className = 'todo-item' + (task.done ? ' done' : '');
        
        const priorityClass = task.priority === 'high' ? 'priority-high' : 
                             task.priority === 'medium' ? 'priority-medium' : 'priority-low';
        const priorityLabel = task.priority === 'high' ? 'Высокий' : 
                             task.priority === 'medium' ? 'Средний' : 'Низкий';
        
        div.innerHTML = `
            <input type="checkbox" ${task.done ? 'checked' : ''} 
                   onchange="toggleDone(${realIndex})">
            <span class="task-text">${task.text}</span>
            ${task.date ? `<span style="font-size:14px; color:#666;">${formatDate(task.date)}</span>` : ''}
            <span class="${priorityClass}">${priorityLabel}</span>
            ${realIndex > 0 ? `<button class="move-btn" onclick="moveTask(${realIndex}, 'up')">↑</button>` : ''}
            ${realIndex < tasks.length - 1 ? `<button class="move-btn" onclick="moveTask(${realIndex}, 'down')">↓</button>` : ''}
            <button class="delete-btn" onclick="deleteTask(${realIndex})">✕</button>
        `;
        list.appendChild(div);
    });
}

document.getElementById('addBtn').addEventListener('click', function() {
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const text = input.value.trim();
    if (!text) return;
    
    tasks.push({
        text: text,
        date: dateInput.value || '',
        done: false,
        priority: prioritySelect.value
    });
    
    input.value = '';
    dateInput.value = '';
    saveTasks();
    renderTasks();
});

function toggleDone(index) {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function moveTask(index, direction) {
    if (direction === 'up' && index > 0) {
        [tasks[index], tasks[index - 1]] = [tasks[index - 1], tasks[index]];
    } else if (direction === 'down' && index < tasks.length - 1) {
        [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
    }
    saveTasks();
    renderTasks();
}

document.getElementById('deleteSelectedBtn').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Нет выделенных задач!');
        return;
    }
    if (confirm(`Удалить ${checkboxes.length} задач(и)?`)) {
        const indices = [];
        checkboxes.forEach(cb => {
            const item = cb.closest('.todo-item');
            const index = Array.from(item.parentNode.children).indexOf(item);
            indices.push(index);
        });
        indices.sort((a, b) => b - a);
        indices.forEach(i => tasks.splice(i, 1));
        saveTasks();
        renderTasks();
    }
});

document.getElementById('sortByDateBtn').addEventListener('click', function() {
    tasks.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
    });
    saveTasks();
    renderTasks();
});

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-buttons button').forEach(btn => btn.classList.remove('active'));
    const btnMap = {
        'all': 'filterAll',
        'high': 'filterHigh',
        'medium': 'filterMedium',
        'low': 'filterLow'
    };
    document.getElementById(btnMap[filter]).classList.add('active');
    renderTasks();
}

loadTasks();
renderTasks();