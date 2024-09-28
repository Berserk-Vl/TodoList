const localServer = true;
const localhost = "http://localhost:3000";
const remoteHost = "https://todo.doczilla.pro";
const host = localServer ? localhost : remoteHost;

const searchByNameInput = document.getElementById("searchByNameInput");
const previousMonthButton = document.getElementById("previousMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");
const yearInput = document.getElementById("yearInput");
const monthSelect = document.getElementById("monthSelect");
const dayButtons = getAllDayButtons();
const unfinishedTasksCheckbox = document.getElementById("unfinishedTasksCheckbox");
const sortByDateButton = document.getElementById("sortByDateButton");
const tasksListArea = document.getElementById("tasksListArea");
const tasksList = document.getElementById("tasksList");
const taskDialog = document.getElementById("taskDialog");
const nameTaskDialog = document.getElementById("nameTaskDialog");
const dateTaskDialog = document.getElementById("dateTaskDialog");
const finishedCheckboxTaskDialog = document.getElementById("finishedCheckboxTaskDialog");
const fullDescriptionTaskDialog = document.getElementById("fullDescriptionTaskDialog");

const dateOptions = { hour: "2-digit", minute: "2-digit" };
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var tasks = [];

var searching = false;
var searchInputFocused = false;
var sortDirection = "=";

document.getElementsByTagName("body")[0].addEventListener("click", () => {
    if (searching && !searchInputFocused) {
        hideFoundTasksList();
    }
});
document.getElementById("todayButton").addEventListener("click", todayButtonEventHandler);
document.getElementById("forWeekButton").addEventListener("click", forWeekButtonEventHandler);

searchByNameInput.addEventListener("keyup", searchByNameInputEventHandler);
searchByNameInput.addEventListener("focusin", () => {
    searchInputFocused = true;
    searchByNameInputEventHandler();
});
searchByNameInput.addEventListener("focusout", () => {
    searchInputFocused = false;
});
previousMonthButton.addEventListener("click", previousMonthButtonEventHandler);
monthSelect.addEventListener("change", monthSelectEventHandler);
yearInput.addEventListener("change", yearInputEventHandler);
nextMonthButton.addEventListener("click", nextMonthButtonEventHandler);

unfinishedTasksCheckbox.addEventListener("change", () => {
    updateTaskList();
});

sortByDateButton.addEventListener("click", sortByDateButtonEventHandler);

document.getElementById("doneButton").addEventListener("click", () => {
    taskDialog.close();
});

var startRangeDate = new Date();
var endRangeDate = new Date();

const testTask = {
    id: "000-000-111",
    name: "Name",
    shortDesc: "Short description",
    fullDesc: "Full Descritpion",
    date: new Date(),
};
//tasks[0]=testTask;

currentDate();
//displayTasks();

function sendGetRequest(url) {
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.responseType = "json";
    request.send();
    request.onload = function () {
        if (request.status === 200) {
            let response = request.response;
            console.log(request);
            tasks = response;
            updateTaskList();
        }
    };
}

function getAllTasks() {
    sendGetRequest(host + "/api/todos");
}

function searchByNameInputEventHandler() {
    if (!searching) {
        showFoundTasksList();
    }
    if (searchByNameInput.value.length > 0) {
        searching = true;
        sendGetRequest(host + "/api/todos/find/?q=" + searchByNameInput.value);
    }
}

function showFoundTasksList() {
    let foundItemsList = document.createElement("div");
    foundItemsList.setAttribute("id", "foundTasksList");
    document.getElementById("mainHeader").append(foundItemsList);
}

function hideFoundTasksList() {
    document.getElementById("foundTasksList").remove();
    searching = false;
}

function getInDateRange() {
    startRangeDate.setHours(0, 0, 0, 0);
    endRangeDate.setHours(23, 59, 59, 999);
    console.log(startRangeDate + " " + endRangeDate);

    sendGetRequest(
        host +
            "/api/todos/date" +
            "?from=" +
            startRangeDate.getTime() +
            "&to=" +
            endRangeDate.getTime() +
            (unfinishedTasksCheckbox.checked ? "&status=false" : "")
    );
}

function todayButtonEventHandler() {
    startRangeDate = new Date();
    endRangeDate = new Date();
    console.log(
        "TodayButton: " +
            startRangeDate.toLocaleDateString() +
            " ~ " +
            endRangeDate.toLocaleDateString()
    );
    updateCalendar(new Date());
    getInDateRange();
}

function forWeekButtonEventHandler() {
    let dayOfWeek = new Date().getDay();
    startRangeDate = new Date();
    endRangeDate = new Date();
    let daysBefore = dayOfWeek;
    let daysAfter = 6 - dayOfWeek;
    startRangeDate.setDate(new Date().getDate() - daysBefore);
    endRangeDate.setDate(new Date().getDate() + daysAfter);
    console.log(
        "ForWeekButton: " +
            startRangeDate.toLocaleDateString() +
            " ~ " +
            endRangeDate.toLocaleDateString()
    );
    updateCalendar(startRangeDate);
    getInDateRange();
}

function displayTasks() {
    tasks.forEach((task) => {
        /* console.log(
            "     ID: " +
                task.id +
                "     NAME: " +
                task.name +
                " ".repeat(40 - task.name.length) +
                "     DATE: " +
                task.date
        ); */
        if ((unfinishedTasksCheckbox.checked && !task.status) || !unfinishedTasksCheckbox.checked) {
            addTaskCard(task, false);
            if (searching) {
                addTaskCard(task, true);
            }
        }
    });
}

function currentDate() {
    let date = new Date();
    yearInput.value = date.getFullYear();
    monthSelect.value = months[date.getMonth()];
    let currentDate = document.getElementById("currentDate");
    currentDate.textContent =
        date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();

    updateCalendar(date);
}

function updateCalendar(date) {
    monthSelect.value = months[date.getMonth()];
    yearInput.value = date.getFullYear();
    let initialDay = date.getDate();
    date.setDate(1);
    let firstDay = date.getDay();
    date.setDate(initialDay);

    let foundFirstDay = false;
    let daysInMonth = getNumberOfDaysInMonth(date.getMonth(), date);

    for (let i = 0, dayNumber = 1; i < dayButtons.length; i++) {
        dayButtons[i].textContent = "-";
        dayButtons[i].setAttribute(
            "class",
            dayButtons[i].getAttribute("class").split(" ")[0] + " collapse"
        );
        if (!foundFirstDay && i === firstDay) {
            foundFirstDay = true;
        }
        if (foundFirstDay && dayNumber <= daysInMonth) {
            dayButtons[i].textContent = dayNumber++;
            dayButtons[i].setAttribute("class", dayButtons[i].getAttribute("class").split(" ")[0]);

            let currentDay = new Date(
                Number.parseInt(yearInput.value),
                getMonthIndex(monthSelect.value),
                Number.parseInt(dayButtons[i].textContent)
            );

            if (
                compareDates(currentDay, startRangeDate) >= 0 &&
                compareDates(currentDay, endRangeDate) <= 0
            ) {
                dayButtons[i].setAttribute(
                    "class",
                    dayButtons[i].getAttribute("class").split(" ")[0] + " daysRange"
                );
            }
            if (
                Number.parseInt(dayButtons[i].textContent) === new Date().getDate() &&
                getMonthIndex(monthSelect.value) === new Date().getMonth() &&
                Number.parseInt(yearInput.value) === new Date().getFullYear()
            ) {
                dayButtons[i].setAttribute(
                    "class",
                    dayButtons[i].getAttribute("class").split(" ")[0] + " today"
                );
            }
        }
    }
}

function getMonthIndex(monthName) {
    for (let i = 0; i < months.length; i++) {
        if (months[i] === monthName) {
            return i;
        }
    }
    return -1;
}

function getNumberOfDaysInMonth(monthIndex, date) {
    let daysInMonth = 27;
    if (monthIndex % 2 === 0) {
        if (monthIndex < 7) {
            daysInMonth = 31;
        } else {
            daysInMonth = 30;
        }
    } else {
        if (monthIndex === 1) {
            if (date.getFullYear() % 4 === 0) {
                daysInMonth = 29;
            } else {
                daysInMonth = 28;
            }
        } else if (monthIndex < 7) {
            daysInMonth = 30;
        } else {
            daysInMonth = 31;
        }
    }
    return daysInMonth;
}

function compareDates(dateA, dateB) {
    if (dateA.getFullYear() === dateB.getFullYear()) {
        if (dateA.getMonth() === dateB.getMonth()) {
            return dateA.getDate() - dateB.getDate();
        }
        return dateA.getMonth() - dateB.getMonth();
    }
    return dateA.getFullYear() - dateB.getFullYear();
}

function previousMonthButtonEventHandler() {
    changeMonth("<");
}

function monthSelectEventHandler() {
    updateCalendar(new Date(Number.parseInt(yearInput.value), getMonthIndex(monthSelect.value), 1));
}

function yearInputEventHandler() {
    updateCalendar(new Date(Number.parseInt(yearInput.value), getMonthIndex(monthSelect.value), 1));
}

function nextMonthButtonEventHandler() {
    changeMonth(">");
}

function changeMonth(direction) {
    let currentMonthIndex = getMonthIndex(monthSelect.value);
    let currentPickerDate = new Date(Number.parseInt(yearInput.value), currentMonthIndex, 1);
    if (direction === "<") {
        if (currentMonthIndex - 1 < 0) {
            currentPickerDate.setFullYear(currentPickerDate.getFullYear() - 1);
            currentPickerDate.setMonth(11);
        } else {
            currentPickerDate.setMonth(currentMonthIndex - 1);
        }
    } else if (direction === ">") {
        if (currentMonthIndex + 1 > 11) {
            currentPickerDate.setFullYear(currentPickerDate.getFullYear() + 1);
            currentPickerDate.setMonth(0);
        } else {
            currentPickerDate.setMonth(currentMonthIndex + 1);
        }
    }
    yearInput.value = currentPickerDate.getFullYear();
    monthSelect.value = months[currentPickerDate.getMonth()];
    updateCalendar(currentPickerDate);
}

function dayButtonEventHandler(element) {
    let prefix = "day";
    let suffix = "Button";
    let id = element.target.getAttribute("id");
    let buttonIndex = Number.parseInt(id.substring(prefix.length, id.length - suffix.length));

    let pickedDate = new Date(
        Number.parseInt(yearInput.value),
        getMonthIndex(monthSelect.value),
        Number.parseInt(dayButtons[buttonIndex].textContent)
    );

    if (
        compareDates(pickedDate, startRangeDate) < 0 ||
        (compareDates(pickedDate, startRangeDate) > 0 && compareDates(pickedDate, endRangeDate) < 0)
    ) {
        startRangeDate = new Date(pickedDate);
    } else if (compareDates(pickedDate, endRangeDate) > 0) {
        endRangeDate = new Date(pickedDate);
    } else if (
        compareDates(pickedDate, startRangeDate) === 0 ||
        compareDates(pickedDate, endRangeDate) === 0
    ) {
        startRangeDate = new Date(pickedDate);
        endRangeDate = new Date(pickedDate);
    }
    updateCalendar(pickedDate);
    getInDateRange();
}

function sortByDateButtonEventHandler() {
    if (sortDirection === "=") {
        sortDirection = "-";
        tasks.sort((a, b) => {
            return compareDates(new Date(b.date), new Date(a.date));
        });
    } else if (sortDirection === "-") {
        sortDirection = "+";
        tasks.sort((a, b) => {
            return compareDates(new Date(a.date), new Date(b.date));
        });
    } else if (sortDirection === "+") {
        sortDirection = "=";
        if (tasks.length > 0) {
            getInDateRange();
        }
    }
    sortByDateButton.textContent = sortDirection + " Sort by date";

    updateTaskList();
}

function taskCardEventHandler(element) {
    let task = findTaskById(element.currentTarget.getAttribute("id"));
    nameTaskDialog.textContent = task.name;
    dateTaskDialog.textContent = new Date(task.date).toLocaleDateString(undefined, dateOptions);
    finishedCheckboxTaskDialog.value = task.status;
    fullDescriptionTaskDialog.textContent = task.fullDesc;
    taskDialog.showModal();
    if (searching) {
        hideFoundTasksList();
    }
}

function findTaskById(id) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            return tasks[i];
        }
    }
    return null;
}

function addTaskCard(task, smallCard) {
    let taskCardElement = document.createElement("div");
    taskCardElement.setAttribute("class", "taskCard" + (smallCard ? "Small" : ""));
    taskCardElement.setAttribute("id", task.id);
    taskCardElement.addEventListener("click", (element) => taskCardEventHandler(element));

    let taskName = document.createElement("div");
    taskName.textContent = task.name;
    taskName.setAttribute("class", "taskNameHeading" + (smallCard ? "Small" : ""));

    let taskShortDescription;
    if (!smallCard) {
        taskShortDescription = document.createElement("div");
        taskShortDescription.setAttribute("class", "taskShortDescription");
        taskShortDescription.textContent = task.shortDesc;
    }

    let taskAllText = document.createElement("div");
    taskAllText.setAttribute("class", "taskAllText" + (smallCard ? "Small" : ""));

    let taskFinished = document.createElement("input");
    taskFinished.setAttribute("class", "finishedCheckbox" + (smallCard ? "Small" : ""));
    taskFinished.setAttribute("type", "checkbox");
    if (task.status) {
        taskFinished.setAttribute("checked", "");
    }
    taskFinished.setAttribute("disabled", "");

    let taskDate = document.createElement("span");
    taskDate.setAttribute("class", "taskDateLabel" + (smallCard ? "Small" : ""));
    taskDate.textContent = new Date(task.date).toLocaleDateString(undefined, dateOptions);

    let taskAdditionalInfo = document.createElement("div");
    taskAdditionalInfo.setAttribute("class", "taskAdditionalInfo" + (smallCard ? "Small" : ""));

    taskAllText.append(taskName);
    if (smallCard) {
        taskAllText.append(taskDate);
        taskCardElement.append(taskAllText);
        taskAdditionalInfo.append(taskFinished);
        taskCardElement.append(taskAdditionalInfo);
        document.getElementById("foundTasksList").append(taskCardElement);
    } else {
        taskCardElement.append(taskAllText);
        taskAdditionalInfo.append(taskFinished);
        taskAdditionalInfo.append(taskDate);
        taskCardElement.append(taskAdditionalInfo);
        taskAllText.append(taskShortDescription);
        tasksList.append(taskCardElement);
    }
}

function deleteTasksCards() {
    if (!searching) {
        let childrenLength = tasksList.children.length;
        for (let i = 0; i < childrenLength; i++) {
            tasksList.children.item(0).remove();
        }
    } else {
        childrenLength = document.getElementById("foundTasksList").children.length;
        for (let i = 0; i < childrenLength; i++) {
            document.getElementById("foundTasksList").children.item(0).remove();
        }
    }
}

function updateTaskList() {
    deleteTasksCards();
    displayTasks();
}

function getAllDayButtons() {
    let buttons = [];
    for (let i = 0; i < 37; i++) {
        buttons[i] = document.getElementById("day" + i + "Button");
        buttons[i].addEventListener("click", (element) => dayButtonEventHandler(element));
    }
    return buttons;
}
