const tableBody = document.getElementById("tableBody");


function generateRows(year = new Date().getFullYear(), month = new Date().getMonth()) {
  tableBody.innerHTML = ""; // clear table
  let dayCount = 1;

  const startDate = new Date(year, month, 1); 
  const endDate = new Date(year, month + 1, 0); // last day of month

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${dayCount}</td>
      <td data-date="${d.toISOString()}">${d.toLocaleDateString()}</td>
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
    `;

    tableBody.appendChild(row);
    dayCount++;
  }
}
document.addEventListener("mousedown", function (e) {
  if (e.target.tagName === "OPTION" && e.target.parentElement.classList.contains("tags")) {
    e.preventDefault(); // stop default select behavior
    e.target.selected = !e.target.selected;
  }
});

function calculateProgress(row) {
  const tasks = row.querySelectorAll(".task");
  const tags = row.querySelector(".tags");
  let completed = 0;
  let total = tasks.length + 1; // tags count as 1 task

  tasks.forEach(task => {
    if (task.checked) completed++;
  });

  if ([...tags.selectedOptions].length > 0) completed++;

  const percentage = Math.round((completed / total) * 100);
  const bar = row.querySelector(".progress-fill");
  bar.style.width = percentage + "%";
  bar.textContent = percentage + "%";
}

document.addEventListener("change", (e) => {
  const row = e.target.closest("tr");
  if (row) calculateProgress(row);
});

generateRows();
const monthSelect = document.getElementById("monthSelect");
const summaryContent = document.getElementById("summaryContent");

// Populate months
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

months.forEach((m, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = m;
  monthSelect.appendChild(option);
});

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


    if (date.getMonth() === monthIndex) {
      totalDays++;

      const tasks = row.querySelectorAll(".task");
      const tags = row.querySelector(".tags");
      const bar = row.querySelector(".progress-fill");

      let completed = 0;
      let totalTasks = tasks.length + 1;

      tasks.forEach(task => {
        if (task.checked) completed++;
      });

      if ([...tags.selectedOptions].length > 0) {
        completed++;
        studyDays++;
      }

      const percent = Math.round((completed / totalTasks) * 100);
      totalPercent += percent;

      if (percent > bestDay) bestDay = percent;

      if (tasks[0].checked) activeDays++; // Active Day = first checkbox
    }
  });

  const avgPercent = totalDays ? Math.round(totalPercent / totalDays) : 0;
  const consistency = totalDays ? Math.round((activeDays / totalDays) * 100) : 0;

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

// Update summary when month changes or data changes
monthSelect.addEventListener("change", () => {
  const selectedMonth = parseInt(monthSelect.value);

  // Update table to show selected month
  generateRows(new Date().getFullYear(), selectedMonth);

  // Update monthly summary
  calculateMonthlySummary(selectedMonth);
});


document.addEventListener("change", () => {
  calculateMonthlySummary(parseInt(monthSelect.value));
});

// Default to current month
monthSelect.value = new Date().getMonth();
calculateMonthlySummary(new Date().getMonth());

