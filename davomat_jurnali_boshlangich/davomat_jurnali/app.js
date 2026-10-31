// Sinov uchun 25 ta bo‘sh o‘quvchi qatori.
const students = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1, name: `O‘quvchi ${i + 1}`, className: "", year: "", number: "", parent: ""
}));

const monthPicker = document.getElementById("monthPicker");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
const dialog = document.getElementById("markDialog");
const selectedInfo = document.getElementById("selectedInfo");

const now = new Date();
monthPicker.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

let selectedCell = null;
let attendance = JSON.parse(localStorage.getItem("davomat-demo") || "{}");

function monthKey() { return monthPicker.value; }
function daysInMonth() {
  const [year, month] = monthKey().split("-").map(Number);
  return new Date(year, month, 0).getDate();
}
function save() {
  localStorage.setItem("davomat-demo", JSON.stringify(attendance));
}
function cellKey(studentId, day) { return `${monthKey()}_${studentId}_${day}`; }

function render() {
  const days = daysInMonth();
  let head = `<tr>
    <th>№</th><th>Ism-familiya</th><th>Sinf</th><th>Yili</th>
    <th>Raqami</th><th>Ota-ona</th>`;
  for (let d = 1; d <= days; d++) {
    const date = new Date(Number(monthKey().slice(0,4)), Number(monthKey().slice(5,7))-1, d);
    const weekdays = ["Ya","Du","Se","Ch","Pa","Ju","Sh"];
    head += `<th>${d}<br>${weekdays[date.getDay()]}</th>`;
  }
  head += `<th>Kelgan</th><th>Kelmagan</th></tr>`;
  tableHead.innerHTML = head;

  let body = "";
  let allPresent = 0, allAbsent = 0;
  students.forEach(student => {
    let present = 0, absent = 0;
    let row = `<tr>
      <td>${student.id}</td>
      <td class="name">${student.name}</td>
      <td>${student.className || "—"}</td>
      <td>${student.year || "—"}</td>
      <td>${student.number || "—"}</td>
      <td>${student.parent || "—"}</td>`;
    for (let d = 1; d <= days; d++) {
      const mark = attendance[cellKey(student.id, d)] || "";
      if (mark === "+") present++;
      if (mark === "-") absent++;
      const cls = mark === "+" ? "present" : mark === "-" ? "absent" : "empty";
      row += `<td class="mark-cell ${cls}" data-student="${student.id}" data-day="${d}">${mark || "·"}</td>`;
    }
    allPresent += present;
    allAbsent += absent;
    row += `<td class="count">${present}</td><td class="count">${absent}</td></tr>`;
    body += row;
  });
  tableBody.innerHTML = body;
  document.getElementById("studentTotal").textContent = students.length;
  document.getElementById("presentTotal").textContent = allPresent;
  document.getElementById("absentTotal").textContent = allAbsent;
}

tableBody.addEventListener("click", event => {
  const cell = event.target.closest(".mark-cell");
  if (!cell) return;
  selectedCell = { student: cell.dataset.student, day: cell.dataset.day };
  const student = students[Number(selectedCell.student) - 1];
  selectedInfo.textContent = `${student.name} — ${selectedCell.day}-sana`;
  dialog.showModal();
});

document.querySelectorAll("[data-mark]").forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedCell) return;
    const key = cellKey(selectedCell.student, selectedCell.day);
    const mark = button.dataset.mark;
    if (mark) attendance[key] = mark;
    else delete attendance[key];
    save();
    dialog.close();
    render();
  });
});

document.querySelector(".close").addEventListener("click", () => dialog.close());
monthPicker.addEventListener("change", render);
document.getElementById("resetMonth").addEventListener("click", () => {
  if (!confirm("Tanlangan oyning barcha davomat belgilarini tozalaysizmi?")) return;
  const prefix = monthKey() + "_";
  Object.keys(attendance).forEach(key => { if (key.startsWith(prefix)) delete attendance[key]; });
  save();
  render();
});

render();
