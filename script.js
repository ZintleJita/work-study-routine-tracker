/***************************************
 * TABLE REFERENCE
 ***************************************/
const tableBody = document.getElementById("tableBody");


/***************************************
 * DATE UTILITY — CHECK IF DATE IS IN THE PAST
 ***************************************/
function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // remove time for accurate comparison

  const rowDate = new Date(date);
  rowDate.setHours(0, 0, 0, 0);

  return rowDate < today;
}


/***************************************
 * LOCK A ROW (PREVENT EDITING)
 ***************************************/
function lockRow(row) {
  row.classList.add("locked");
  row.querySelectorAll("input, select").forEach(el => el.disabled = true);
  calculateProgress(row); // recalc on lock to freeze %
}


/***************************************
 * GENERATE TABLE ROWS FOR A MONTH
 ***************************************/
function generateRows(year = new Date().getFullYear(), month = new Date().getMonth()) {
  tableBody.innerHTML = ""; // Clear existing rows
  let dayCount = 1;

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const row = document.createElement("tr");
    const isoDate = d.toISOString();

    // Create row HTML
    row.innerHTML = `
      <td>${dayCount}</td>
      <td data-date="${isoDate}">${d.toLocaleDateString()}</td>
      <td><input type="checkbox" class="task active"></td>
      <td><input type="checkbox" class="task"></td>
      <td><input type="checkbox" class="task"></td>
      <td><input type="checkbox" class="task"></td>
      <td><input type="checkbox" class="task"></td>
      <td><input type="checkbox" class="task"></td>
      <td><input type="checkbox" class="task"></td>
      <td><input type="checkbox" class="task"></td>
      <td>
        <select multiple class="tags">
          <option value="study">📖 Study</option>
          <option value="revision">🔁 Revision</option>
          <option value="practice">✍🏽 Practice</option>
          <option value="notes">📝 Notes</option>
        </select>
      </td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill">0%</div>
        </div>
      </td>
      <td>
  <button class="lock-btn">🔒</button>
</td>
    `;

    tableBody.appendChild(row);

   /***************************************
 * RESTORE MANUALLY LOCKED DAYS
 ***************************************/
const dateKey = isoDate.split("T")[0];
if (localStorage.getItem("locked-" + dateKey)) {
  lockRow(row);
}
    dayCount++;
  }
}


/***************************************
 * TAG MULTI-SELECT TOGGLE 
 ***************************************/
document.addEventListener("change", (e) => {
  const row = e.target.closest("tr");
  if (row && !row.classList.contains("locked")) {
    if (e.target.classList.contains("tags") || e.target.classList.contains("task")) {
      calculateProgress(row);
      calculateMonthlySummary(parseInt(monthSelect.value));
    }
  }
});

/***************************************
 * CALCULATE DAILY PROGRESS PERCENTAGE
 ***************************************/
function calculateProgress(row) {
  const tasks = row.querySelectorAll(".task");
  const tags = row.querySelector(".tags");

  let completed = 0;
  let total = tasks.length + 1; // tags count as 1

  tasks.forEach(task => {
    if (task.checked) completed++;
  });

  if (tags && tags.selectedOptions.length > 0) {
    completed++;
  }

  const percentage = Math.round((completed / total) * 100);

  const bar = row.querySelector(".progress-fill");
  bar.style.width = percentage + "%";
  bar.textContent = percentage + "%";
}
/***************************************
 * MANUAL DAY LOCK SYSTEM (USER CONTROL)
 ***************************************/
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("lock-btn")) {
    const row = e.target.closest("tr");
    const dateValue = row.querySelector("td[data-date]").dataset.date;
    const dateKey = dateValue.split("T")[0];

    // Save lock state
    localStorage.setItem("locked-" + dateKey, "true");

    // Lock row
    lockRow(row);
  }
});

/***************************************
 * UPDATE PROGRESS WHEN USER MAKES CHANGES
 ***************************************/
document.addEventListener("change", (e) => {
  const row = e.target.closest("tr");

  // Only update if row is not locked
  if (row && !row.classList.contains("locked")) {
    calculateProgress(row);
  }
});


/***************************************
 * INITIAL TABLE GENERATION
 ***************************************/
generateRows();


/***************************************
 * MONTH DROPDOWN & SUMMARY REFERENCES
 ***************************************/
const monthSelect = document.getElementById("monthSelect");
const summaryContent = document.getElementById("summaryContent");


/***************************************
 * MONTH LIST
 ***************************************/
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];


/***************************************
 * POPULATE MONTH DROPDOWN
 ***************************************/
months.forEach((m, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = m;
  monthSelect.appendChild(option);
});


/***************************************
 * CALCULATE MONTHLY SUMMARY STATISTICS
 ***************************************/
function calculateMonthlySummary(monthIndex) {
  const rows = document.querySelectorAll("#trackerTable tbody tr");

  let totalDays = 0;
  let activeDays = 0;
  let studyDays = 0;
  let totalPercent = 0;
  let bestDay = 0;

  rows.forEach(row => {
    const dateValue = row.children[1].getAttribute("data-date");
    const date = new Date(dateValue);

    // Only count rows from selected month
    if (date.getMonth() === monthIndex) {
      totalDays++;

      const tasks = row.querySelectorAll(".task");
      const tags = row.querySelector(".tags");

      let completed = 0;
      let totalTasks = tasks.length + 1;

      tasks.forEach(task => {
        if (task.checked) completed++;
      });

    if (tags && tags.selectedOptions.length > 0) {
      completed++;
      studyDays++;
    }

      const percent = Math.round((completed / totalTasks) * 100);
      totalPercent += percent;

      if (percent > bestDay) bestDay = percent;

      // Active day = first checkbox checked
      if (tasks[0].checked) activeDays++;
    }
  });

  const avgPercent = totalDays ? Math.round(totalPercent / totalDays) : 0;
  const consistency = totalDays ? Math.round((activeDays / totalDays) * 100) : 0;

  // Display summary
  summaryContent.innerHTML = `
    <strong>${months[monthIndex]} Summary</strong><br>
    📅 Total Days: ${totalDays}<br>
    ✅ Active Days: ${activeDays}<br>
    📚 Study Days: ${studyDays}<br>
    📊 Average Completion: ${avgPercent}%<br>
    🏆 Best Day: ${bestDay}%<br>
    🔥 Consistency: ${consistency}%
  `;
}


/***************************************
 * CHANGE MONTH (REBUILD TABLE + SUMMARY)
 ***************************************/
monthSelect.addEventListener("change", () => {
  const selectedMonth = parseInt(monthSelect.value);

  generateRows(new Date().getFullYear(), selectedMonth);
  calculateMonthlySummary(selectedMonth);
});


/***************************************
 * UPDATE SUMMARY WHEN DATA CHANGES
 ***************************************/
document.addEventListener("change", (e) => {
  const row = e.target.closest("tr");
  if (row && !row.classList.contains("locked")) {
    calculateProgress(row);
  }
  calculateMonthlySummary(parseInt(monthSelect.value));
});

/***************************************
 * DEFAULT TO CURRENT MONTH
 ***************************************/
monthSelect.value = new Date().getMonth();
calculateMonthlySummary(new Date().getMonth());



