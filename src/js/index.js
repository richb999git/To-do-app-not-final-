// //////////////////////////////////////////////////////////////////////////
// To do
//
let projects = [];
let tasks = [];
let currentProject = 0;
let nextKey;

// Constructor Pattern for Creating Objects
function Task(project, title, dueDate, complete, taskKey, notes, calDay) {
  this.project = project;
  this.title = title;
  this.dueDate = new Date(dueDate);
  this.complete = complete; // true/false
  this.taskKey = taskKey;
  this.notes = notes;
  this.calDay = calDay; // for calendar view
}

console.log("restarting!!!!!!!");
checkForLocalStorage();
// addDummyData();
showProjectList();
displayProject(currentProject);
dislayTasksInCalendar();

function getTasksInProject(index) {
  // loop through tasks and create a new array that includes index number of tasks with this "index" as a project
  let projectTasks = [];
  let i = 0;
  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].project === projects[index][0]) {
      projectTasks.push(i);
    }
  }
  return projectTasks;
}

// get tasks in the calndar. First first 10 that are dueDate
function getTasksInCalendar(numTasksInCal) {
  // make a copy of the tasks array
  let tasksInCalendar = tasks.map(function(item) {
    return item;
  });
  // replace taskKey with the element number then carry on
  for (let i = 0; i < tasksInCalendar.length; i++) {
    tasksInCalendar[i].taskKey = i;
  }
  // filter out completed tasks
  tasksInCalendar = tasks.filter(function(item) {
    return item.complete === false;
  });
  // sort tasks array of objects by the due date key and keep the first num tasks
  function compare(a, b) {
    const dueDateA = a.dueDate;
    const dueDateB = b.dueDate;
    let comparison = 0;
    if (dueDateA > dueDateB) {
      comparison = 1;
    } else if (dueDateA < dueDateB) {
      comparison = -1;
    }
    return comparison;
  }
  tasksInCalendar.sort(compare);

  // keep first 'numTasksInCal' items
  if (tasksInCalendar.length > numTasksInCal) {
    tasksInCalendar.splice(numTasksInCal);
  }

  tasksInCalendar.forEach(function(item) {
    let today = new Date();
    today = new Date(today.toDateString()); // remove time
    today.setHours(3); // 3am on all tasks
    if (item.dueDate < today) {
      item.calDay = "Overdue";
    } else if (item.dueDate - today == 0) {
      item.calDay = "Today";
    } else if (item.dueDate - today == 86400000) {
      item.calDay = "Tomorrow";
    } else item.calDay = item.dueDate;
  });
  return tasksInCalendar;
}

function toggleCompleteTask(e) {
  // taskCompleteNN
  const task = e.target.id.substring(12);
  tasks[task].complete = !tasks[task].complete;
  displayProject(currentProject);
  dislayTasksInCalendar();
  clearLocalStorage();
  saveTaskToLocalStorage();
}

// need to delete all the task in the project as well
function delProject(index) {
  // loop through tasks and delete any task with this "index" as a project
  const check = confirm("Are you sure?");
  if (check) {
    let i = 0;
    for (i = 0; i < tasks.length; i++) {
      if (tasks[i].project === projects[index][0]) {
        tasks.splice(i, 1);
        i--;
      }
    }
    // delete project from project array
    projects.splice(index, 1);
    showProjectList();
    dislayTasksInCalendar();
    displayBlankProject();
    currentProject = null;
    clearLocalStorage();
    saveTaskToLocalStorage();
  }
}

function delTask(e) {
  tasks.splice(e.target.id.substring(6), 1);
  displayProject(currentProject);
  dislayTasksInCalendar();
  clearLocalStorage();
  saveTaskToLocalStorage();
}

function editProject(e) {
  // validation of entries is done by HTML 5 form
  //e.preventDefault(); // prevents submitting to server and causing errors
  let projectTitle = document.getElementById("projectEP").value;
  let projectDesc = document.getElementById("projDescEP").value;
  if (projectTitle === "") {
    console.log("IE not validating");
    //alert("Missing data");
  } else {
    // need to change the description on all other tasks in this project
    let tasksInProject = getTasksInProject(currentProject);
    tasksInProject.forEach(function(item) {
      tasks[item].project = projectTitle;
    });
    projects[currentProject][0] = projectTitle;
    projects[currentProject][1] = projectDesc;
    toggleModalEP();
    document.getElementById("editProjForm").reset();
    showProjectList();
    displayProject(currentProject);
    dislayTasksInCalendar();
    clearLocalStorage();
    saveTaskToLocalStorage();
  }
}

function newProject(e) {
  // validation of entries is done by HTML 5 form
  //e.preventDefault(); // prevents submitting to server and causing errors
  let projectTitle = document.getElementById("projectFN").value;
  let projectDesc = document.getElementById("projDescFN").value;
  if (projectTitle === "") {
    console.log("IE not validating");
    //alert("Missing data");
  } else {
    projects.push([projectTitle, projectDesc]);
    toggleModalP();
    document.getElementById("newProjForm").reset();
    showProjectList();
    clearLocalStorage();
    saveTaskToLocalStorage();
  }
}

function newTask(e) {
  // validation of entries is done by HTML 5 form
  e.preventDefault(); // prevents submitting to server and causing errors
  let taskTitle = document.getElementById("taskF").value;
  let dueDate = new Date(document.getElementById("dueDateF").value);
  dueDate = new Date(dueDate.toDateString());  // remove time
  dueDate.setHours(3); // 3am on all tasks
  let notes = document.getElementById("notesF").value;
  if (taskTitle === "" || isNaN(dueDate)) {
    console.log("IE not validating");
    alert("Missing data");
  } else {
    let tempTask = new Task(
      projects[currentProject][0],
      taskTitle,
      dueDate,
      false,
      nextKey,
      notes
    );
    nextKey++;
    tasks.push(tempTask);
    toggleModal();
    document.getElementById("newTaskForm").reset();
    displayProject(currentProject);
    dislayTasksInCalendar();
    clearLocalStorage();
    saveTaskToLocalStorage();
  }
}

function editTask(e) {
  // validation of entries is done by HTML 5 form
  // e.preventDefault(); // prevents submitting to server and causing errors
  let currentTask = document.getElementById("taskNo").value;
  let taskTitle = document.getElementById("taskET").value;
  let dueDate = new Date(document.getElementById("dueDateET").value);
  dueDate = new Date(dueDate.toDateString()); // remove time
  dueDate.setHours(3); // 3am on all tasks
  let complete = document.getElementById("completeET").checked;
  let notes = document.getElementById("notesET").value;
  if (taskTitle === "" || dueDate === "") {
    console.log("IE not validating");
    // alert("Missing data");
  } else {
    tasks[currentTask].project = projects[currentProject][0];
    tasks[currentTask].title = taskTitle;
    tasks[currentTask].dueDate = dueDate;
    tasks[currentTask].complete = complete;
    tasks[currentTask].notes = notes;
    toggleModalET();
    document.getElementById("editTaskForm").reset();
    displayProject(currentProject);
    dislayTasksInCalendar();
    clearLocalStorage();
    saveTaskToLocalStorage();
  }
}

// move tasks up or down the page
function adjPriority(e, direction) {
  // direction: 1 = down, -1 = up
  const task = e.target.id.substring(6 + direction);
  let tasksInProject = getTasksInProject(currentProject);
  tasksInProject.forEach(function(item, index, arr) {
    let tempTaskDetails = tasks[task];
    if (task == item) {
      if (arr[index + direction] !== undefined) {
        tasks[task] = tasks[arr[index + direction]];
        tasks[arr[index + direction]] = tempTaskDetails;
      }
    }
  });
  displayProject(currentProject);
  dislayTasksInCalendar();
  clearLocalStorage();
  saveTaskToLocalStorage();
}


// ////////////////////////////////////////////////////////////////////////
// DOM

function dislayTasksInCalendar() {
  // display tasks in days
  let tasksInCalendar = getTasksInCalendar(10);
  let text = "";
  let overdueItem = false;
  let todayItem = false;
  let tomorrowItem = false;
  document.getElementById('calendarBody').innerHTML = "";
  tasksInCalendar.forEach(function(item, index, arr) {
    // if any items are overdue show overdue heading
    if (item.calDay === "Overdue") {
      if (!overdueItem) {
        overdueItem = true;
        text += '<hr><p class="day">Overdue</p>';
      }
      text += '<p class="taskTitleC" id="taskC' + item.taskKey + '">' + item.title;
      text += '</p><p class="taskProject">' + item.project + '</p>';

    } else if (item.calDay === "Today") {
      if (!todayItem) {
        todayItem = true;
        text += '<hr><p class="day">Today</p>';
      }
      text += '<p class="taskTitleC" id="taskC' + item.taskKey + '">' + item.title;
      text += '</p><p class="taskProject">' +  item.project + '</p>';

    } else if (item.calDay === "Tomorrow") {
      if (!tomorrowItem) {
        tomorrowItem = true;
        text += '<hr><p class="day">Tomorrow</p>';
      }
      text += '<p class="taskTitleC" id="taskC' + item.taskKey + '">' + item.title;
      text += '</p><p class="taskProject">' + item.project + '</p>';

    } else {
        if (item.dueDate - arr[index-1] != 0) {
          text += '<hr><p class="day">' + item.dueDate.toDateString() + '</p>';
        }
        text += '<p class="taskTitleC" id="taskC' + item.taskKey + '">' + item.title;
        text += '</p><p class="taskProject">' + item.project + '</p>';
      }
  });

  document.getElementById('calendarBody').innerHTML = text;

  tasksInCalendar.forEach(function(item, index, arr) {
    let calId = "taskC" + item.taskKey;
    document.getElementById(calId).addEventListener("click", function(e) {
      // edit task
      // show current values
      let currentTask = e.target.id.substring(5); // id is "taskCNN"
      updateEditTaskForm(currentTask);
      toggleModalET();
    });
  });
}

function updateEditTaskForm(currentTask) {
  document.getElementById("taskNo").value = currentTask;
  document.getElementById("taskET").value = tasks[currentTask].title;
  document.getElementById("dueDateET").value = tasks[currentTask].dueDate.toDateString();
  document.getElementById("completeET").checked = tasks[currentTask].complete;
  document.getElementById("notesET").value = tasks[currentTask].notes;
}

// display the list of projects
function showProjectList() {
  let text = "";
  let projectId = "";
  // clear project list first (and listeners)
  document.getElementById('projectList').innerHTML = "";
  projects.forEach(function(element, index) {
    projectId = "proj" + index;
    text += '<p class="project" id="' + projectId + '">' + element[0] + '</p>';
  });
  document.getElementById('projectList').innerHTML = text;
  projects.forEach(function(element, index) {
    projectId = "proj" + index;
    document.getElementById(projectId).addEventListener("click", function(e) {
      currentProject = e.target.id.substring(4); // id is "projNN"
      displayProject(currentProject);
    });
  });
}

// display projects and all it's tasks
function displayProject(proj) {
  // clear project task view and all listeners
  displayBlankProject();
  if (currentProject !== null) {
    // create text for chosen project and new task button
    let text = '<h3><span id="currentProject">' + projects[proj][0];
    text += '</span><button class="delete" id="delProj">&#x2717;</button></h3>';
    text += '<p id="currentProjectDesc">' + projects[proj][1];
    text += '</p><button id="newTask">New Task</button>';

    // show each task in the project and the details of tasks
    let tasksInProject = getTasksInProject(proj);
    tasksInProject.forEach(function(item) {
      text += '<p><img class="boxTick" src="';
      if (tasks[item].complete) {
        text += 'boxtick1';
      } else {
        text += 'box1';
      }
      text += '.jpg" id="taskComplete' + item +'"/><span class="taskTitle" ';
      text += 'id="taskTitle' + item + '">' + tasks[item].title;
      text += '</span><button class="delete" id="delete';
      text += item + '">&#x2717;</button></p>';
      text += '<p class="task2ndline"><span class="dueDate">Due Date: </span>';
      text += '<span class="dueDateDate" id="dueDateDate' + item + '">';
      text += tasks[item].dueDate.toDateString() + '</span>'; // convert readable form
      text += '<button class="btnUpx" id="btnUp' + item + '">&#x25B2;</button>';
      text += '<button class="btnDownx" id="btnDown' + item;
      text += '">&#x25BC;</button></p>';
    });
    document.getElementById('projectDisplay').innerHTML = text;

    // loop though items on task section and set ALL listeners
    tasksInProject.forEach(function(item) {
      let taskId = "taskComplete" + item;
      document.getElementById(taskId).addEventListener("click", function(e) {
        toggleCompleteTask(e); // id is "taskCompleteNN"
      });
      taskId = "delete" + item;
      document.getElementById(taskId).addEventListener("click", function(e) {
        delTask(e); // id is "deleteNN"
      });
      taskId = "taskTitle" + item;
      document.getElementById(taskId).addEventListener("click", function(e) {
        // edit task
        // show current values
        let currentTask = e.target.id.substring(9); // id is "taskTitleNN"
        updateEditTaskForm(currentTask);
        toggleModalET();
      });
      taskId = "btnDown" + item;
      document.getElementById(taskId).addEventListener("click", function(e) {
        adjPriority(e, 1); // id is "btnDownNN" 1 = up
      });
      taskId = "btnUp" + item;
      document.getElementById(taskId).addEventListener("click", function(e) {
        adjPriority(e, -1); // id is "btnUpNN" -1 = down
      });
    });

    // current project delete button
    document.getElementById("delProj").addEventListener("click", function() {
      delProject(currentProject);
    });

    // set listener for edit project function
    document.getElementById("currentProject").addEventListener("click", function(e) {
      // edit project details
      // show current values
      document.getElementById("projectEP").value = projects[currentProject][0];
      document.getElementById("projDescEP").value = projects[currentProject][1];
      toggleModalEP();
    });
    // set listener for new task button
    document.getElementById("newTask").addEventListener("click", toggleModal);
  }
}

document.getElementById('submitTask').addEventListener("click", function(e) {
  newTask(e);
});

document.getElementById('submitTaskET').addEventListener("click", function(e) {
  editTask(e);
});

document.getElementById('submitProj').addEventListener("click", function(e) {
  newProject(e);
});

document.getElementById('submitProjEP').addEventListener("click", function(e) {
  editProject(e);
});

function displayBlankProject() {
  document.getElementById('projectDisplay').innerHTML = "";
}

const modal = document.querySelector(".modal");
const modalET = document.querySelector(".modalET");
const modalP = document.querySelector(".modalP");
const modalEP = document.querySelector(".modalEP");
const closeButton = document.querySelector(".close-button");
const closeButtonET = document.querySelector(".close-buttonET");
const closeButtonP = document.querySelector(".close-buttonP");
const closeButtonEP = document.querySelector(".close-buttonEP");

function toggleModal() {
  modal.classList.toggle("show-modal");
}

function toggleModalET() {
  modalET.classList.toggle("show-modal");
}

function toggleModalP() {
  modalP.classList.toggle("show-modal");
}

function toggleModalEP() {
  modalEP.classList.toggle("show-modal");
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  } else {
    if (event.target === modalP) {
      toggleModalP();
    } else {
      if (event.target === modalET) {
        toggleModalET();
      } else {
        if (event.target === modalEP) {
          toggleModalEP();
        }
      }
    }
  }
}

document.getElementById("newProject").addEventListener("click", toggleModalP);
closeButton.addEventListener("click", toggleModal);
closeButtonET.addEventListener("click", toggleModalET);
closeButtonP.addEventListener("click", toggleModalP);
closeButtonEP.addEventListener("click", toggleModalEP);
window.addEventListener("click", windowOnClick);

// ///////////////////////////// LocaStorage functions ////////////////////////

function clearLocalStorage() {
  if (storageAvailable("localStorage")) {
    localStorage.removeItem("tasks");
    localStorage.removeItem("projects");
    localStorage.removeItem("currentProject");
    localStorage.removeItem("nextKey");
  }
}

function saveTaskToLocalStorage() {
  if (storageAvailable("localStorage")) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem("currentProject", JSON.stringify(currentProject));
    localStorage.setItem("nextKey", JSON.stringify(nextKey));
  }
}

function checkForLocalStorage() {
  if (storageAvailable('localStorage')) {
    // Yippee! We can use localStorage awesomeness
    console.log("LocalStorage available");
    if (localStorage.length !== 0) {
      tasks = JSON.parse(localStorage.getItem('tasks'));
      projects = JSON.parse(localStorage.getItem('projects'));
      currentProject = JSON.parse(localStorage.getItem('currentProject'));
      nextKey = JSON.parse(localStorage.getItem('nextKey'));
      // loop through tasks and convert datestrings to Date Objects
      tasks.forEach(function(item) {
        item.dueDate = new Date(item.dueDate);
      });
    } else {
      // add dummy project
      projects[0] = ["General", "Basic project for miscellaneous tasks"];
      nextKey = 0;
      // add dummy task
      tasks[0] = new Task(
        projects[0][0],
        "do stuff",
        new Date(2018, 7, 25, 3),
        false,
        nextKey,
        "notes on stuff"
      );
      nextKey++;
    }
  }
  else {
    // Too bad, no localStorage for us
    console.log("LocalStorage NOT available");
    // Some sample tasks/projects when localStorage not available
    if (tasks.length == 0) {  
      addDummyData();
    }
  }
}

function storageAvailable(type) {
  try {
    var storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}

// /////////// Dummy data //////////////////////////////////////////////
//

function addDummyData() {
  // add dummy project titles
  alert("Adding dummy data");
  projects[0] = ["General", "Basic project for miscellaneous tasks"];
  projects.push(["ProjAwe", "Awesome project. Words cannot express just how awesome"]);
  projects.push(["projDel", "Project used to test the delete project function"]);
  projects.push(["projPump", "Pumpingly good project about pumping activity."]);
  projects.push(["projCakes", "A cake making project. Many designs to test"]);

  nextKey = 0;
  // add dummy tasks
  tasks[0] = new Task(
    projects[0][0],
    "get milk",
    new Date(2018, 6, 25, 3),
    false,
    nextKey,
    "lots of notes lalala"
  );
  nextKey++;
  tasks[1] = new Task(
    projects[0][0],
    "get potatoes",
    new Date(2018, 6, 26, 3),
    true,
    nextKey,
    "lots of notes yipyip"
  );
  nextKey++;
  tasks[2] = new Task(
    projects[1][0],
    "get diamonds",
    new Date(2018, 7, 31, 3),
    true,
    nextKey,
    "lots of notes dosh"
  );
  nextKey++;
  tasks[3] = new Task(
    projects[2][0],
    "get proj notes",
    new Date(2018, 7, 31, 3),
    true,
    nextKey,
    "lots of notes proj"
  );
  nextKey++;
  tasks[4] = new Task(
    projects[2][0],
    "get proj1 notes",
    new Date(2018, 7, 31, 3),
    false,
    nextKey,
    "lots of notes proj2"
  );
  nextKey++;
  tasks[5] = new Task(
    projects[0][0],
    "get veggies",
    new Date(2018, 6, 27, 3),
    false,
    nextKey,
    "lots of notes on veggies"
  );
  nextKey++;
  tasks[6] = new Task(
    projects[0][0],
    "get choc",
    new Date(2018, 6, 29, 3), // 29th Jul 2018 3am
    false,
    nextKey,
    "lots of notes on chocolate"
  );
  nextKey++;
  tasks[7] = new Task(
    projects[0][0],
    "get balloons",
    new Date(2018, 6, 30, 3),
    false,
    nextKey,
    "lots of notes on balloons"
  );
  nextKey++;
}

const picker = datepicker('#dueDateF');
const picker2 = datepicker('#dueDateET');

// bubbling test
// document.getElementById('calendarBody').addEventListener("click", function(e) {
//   alert("calendar element clicked");
//   alert(e.target);
//   console.log(e.target.id);
// });
