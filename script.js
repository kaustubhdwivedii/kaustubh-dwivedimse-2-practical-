
// Get saved data from browser. If no data is saved, use an empty array.
var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var content = document.getElementById("content");
var page = document.body.getAttribute("data-page");

// Save tasks in browser storage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Save notes in browser storage
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Show Home Page
function showHome() {
  var completed = 0;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].status == "Done") completed++;
  }

  content.innerHTML = `
    <h2>Welcome to My Task Manager</h2>
    <p>This website helps you manage your daily tasks, notes and study time.</p>
    <h3>My Progress</h3>
    <p>Total Tasks: <b>${tasks.length}</b></p>
    <p>Completed Tasks: <b>${completed}</b></p>
    <p>Pending Tasks: <b>${tasks.length - completed}</b></p>
    <p>Use the menu above to open different sections.</p>
  `;
}


// Show Dashboard Page
function showDashboard() {
  var completed = 0;
  var doing = 0;
  var pending = 0;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].status == "Done") completed++;
    else if (tasks[i].status == "Doing") doing++;
    else pending++;
  }

  content.innerHTML = `
    <h2>Dashboard</h2>
    <p>Here is a quick summary of your work.</p>
    <h3>Total Tasks: ${tasks.length}</h3>
    <h3>Completed: ${completed}</h3>
    <h3>In Progress: ${doing}</h3>
    <h3>To Do: ${pending}</h3>
    <p><a href="tasks.html">Open My Tasks</a></p>
  `;
}

// Show Tasks Page
function showTasks() {
  content.innerHTML = `
    <h2>My Tasks</h2>
    <p>Add a task and select its priority and status.</p>
    <input type="text" id="taskName" placeholder="Enter task name">
    <input type="date" id="taskDate">
    <select id="taskPriority">
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
    <button onclick="addTask()">Add Task</button>
    <br><br>
    <input type="text" id="searchTask" placeholder="Search task" onkeyup="displayTasks()">
    <select id="filterPriority" onchange="displayTasks()">
      <option value="All">All Priorities</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>
    <div class="task-list">
      <div class="task-column" id="todo" ondragover="allowDrop(event)" ondrop="dropTask(event)">
        <h3>To Do</h3><div id="todoList"></div>
      </div>
      <div class="task-column" id="doing" ondragover="allowDrop(event)" ondrop="dropTask(event)">
        <h3>Doing</h3><div id="doingList"></div>
      </div>
      <div class="task-column" id="done" ondragover="allowDrop(event)" ondrop="dropTask(event)">
        <h3>Done</h3><div id="doneList"></div>
      </div>
    </div>
  `;
  displayTasks();
}

// Add a new task
function addTask() {
  var name = document.getElementById("taskName").value;
  var date = document.getElementById("taskDate").value;
  var priority = document.getElementById("taskPriority").value;

  if (name == "") {
    alert("Please enter a task name");
    return;
  }

  var task = {
    id: new Date().getTime(),
    name: name,
    date: date,
    priority: priority,
    status: "To Do"
  };

  tasks.push(task);
  saveTasks();
  showTasks();
}

// Display all tasks
function displayTasks() {
  var todo = document.getElementById("todoList");
  if (!todo) return;

  document.getElementById("todoList").innerHTML = "";
  document.getElementById("doingList").innerHTML = "";
  document.getElementById("doneList").innerHTML = "";

  var search = document.getElementById("searchTask").value.toLowerCase();
  var filter = document.getElementById("filterPriority").value;

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    if (!task.name.toLowerCase().includes(search)) continue;
    if (filter != "All" && task.priority != filter) continue;

    var card = document.createElement("div");
    card.className = "task";
    card.draggable = true;
    card.ondragstart = function(event) {
      event.dataTransfer.setData("taskId", this.getAttribute("data-id"));
    };
    card.setAttribute("data-id", task.id);

    card.innerHTML = `
      <b>${task.name}</b><br>
      <small>Date: ${task.date || "Not set"} | Priority: ${task.priority}</small><br>
      <button onclick="editTask(${task.id})">Edit</button>
      <button onclick="deleteTask(${task.id})">Delete</button>
    `;

    if (task.status == "To Do") {
      document.getElementById("todoList").appendChild(card);
    } else if (task.status == "Doing") {
      document.getElementById("doingList").appendChild(card);
    } else {
      document.getElementById("doneList").appendChild(card);
    }
  }
}

// Edit a task
function editTask(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id == id) {
      var newName = prompt("Enter new task name", tasks[i].name);
      if (newName != null && newName != "") {
        tasks[i].name = newName;
        saveTasks();
        displayTasks();
      }
    }
  }
}

// Delete a task
function deleteTask(id) {
  if (confirm("Do you want to delete this task?")) {
    tasks = tasks.filter(function(task) {
      return task.id != id;
    });
    saveTasks();
    displayTasks();
  }
}

// Drag and drop functions
function allowDrop(event) {
  event.preventDefault();
}

function dropTask(event) {
  event.preventDefault();
  var id = event.dataTransfer.getData("taskId");
  var column = event.currentTarget.id;
  var newStatus = "To Do";

  if (column == "doing") newStatus = "Doing";
  if (column == "done") newStatus = "Done";

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id == id) {
      tasks[i].status = newStatus;
    }
  }

  saveTasks();
  displayTasks();
}

// Show Calendar Page
function showCalendar() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var firstDay = new Date(year, month, 1).getDay();
  var totalDays = new Date(year, month + 1, 0).getDate();

  var output = `<h2>Calendar - ${date.toLocaleString("default", {month:"long"})} ${year}</h2>
    <p>Your current month's calendar.</p><div class="calendar">`;

  var names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (var i = 0; i < names.length; i++) {
    output += `<div class="day-name">${names[i]}</div>`;
  }

  for (var blank = 0; blank < firstDay; blank++) {
    output += "<div></div>";
  }

  for (var day = 1; day <= totalDays; day++) {
    output += `<div>${day}</div>`;
  }

  output += "</div><h3>Tasks with Due Dates</h3>";
  for (var j = 0; j < tasks.length; j++) {
    if (tasks[j].date != "") {
      output += `<p>${tasks[j].date} - ${tasks[j].name}</p>`;
    }
  }
  content.innerHTML = output;
}

// Show Notes Page
function showNotes() {
  content.innerHTML = `
    <h2>My Notes</h2>
    <input type="text" id="noteTitle" placeholder="Note title"><br>
    <textarea id="noteText" placeholder="Write your note here"></textarea><br>
    <button onclick="addNote()">Save Note</button>
    <div id="notesList"></div>
  `;
  displayNotes();
}

function addNote() {
  var title = document.getElementById("noteTitle").value;
  var text = document.getElementById("noteText").value;

  if (title == "" || text == "") {
    alert("Please enter both title and note");
    return;
  }

  notes.push({title: title, text: text});
  saveNotes();
  showNotes();
}

function displayNotes() {
  var list = document.getElementById("notesList");
  for (var i = 0; i < notes.length; i++) {
    var note = document.createElement("div");
    note.className = "note";
    note.innerHTML = `<h3>${notes[i].title}</h3><p>${notes[i].text}</p>
      <button onclick="deleteNote(${i})">Delete</button>`;
    list.appendChild(note);
  }
}

function deleteNote(index) {
  notes.splice(index, 1);
  saveNotes();
  showNotes();
}

// Show Focus Timer Page
var timerSeconds = 25 * 60;
var timerInterval = null;

function showFocus() {
  content.innerHTML = `
    <h2>Pomodoro Focus Timer</h2>
    <p>Study for 25 minutes, then take a break.</p>
    <div id="timer">25:00</div>
    <button onclick="startTimer()">Start</button>
    <button onclick="pauseTimer()">Pause</button>
    <button onclick="resetTimer()">Reset</button>
  `;
  updateTimer();
}

function updateTimer() {
  var minutes = Math.floor(timerSeconds / 60);
  var seconds = timerSeconds % 60;
  var timer = document.getElementById("timer");
  if (timer) {
    timer.innerHTML = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
}

function startTimer() {
  if (timerInterval == null) {
    timerInterval = setInterval(function() {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimer();
      } else {
        pauseTimer();
        alert("Time is over! Take a break.");
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  timerSeconds = 25 * 60;
  updateTimer();
}

// Show Settings Page
function showSettings() {
  var dark = localStorage.getItem("darkMode") == "true";
  content.innerHTML = `
    <h2>Settings</h2>
    <p>Change website theme.</p>
    <label><input type="checkbox" id="darkMode" ${dark ? "checked" : ""}> Enable Dark Mode</label>
    <p><button onclick="saveTheme()">Save Settings</button></p>
    <p>Tasks and notes are saved in your browser.</p>
  `;
}

function saveTheme() {
  var checked = document.getElementById("darkMode").checked;
  localStorage.setItem("darkMode", checked);
  document.body.classList.toggle("dark", checked);
  alert("Settings saved");
}

// Apply saved theme
if (localStorage.getItem("darkMode") == "true") {
  document.body.classList.add("dark");
}

// Open correct page
if (page == "home") showHome();
if (page == "dashboard") showDashboard();
if (page == "tasks") showTasks();
if (page == "calendar") showCalendar();
if (page == "notes") showNotes();
if (page == "focus") showFocus();
if (page == "settings") showSettings();
