
const monthPicker = document.getElementById("monthPicker");

let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

if (students.length === 0) {
    for (let i = 1; i <= 25; i++) {
        students.push({
            id: i,
            name: "",
            className: "",
            year: "",
            phone: "",
            parent: "",
            monthlyFee: 0
        });
    }
    saveStudents();
}

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function saveAttendance() {
    localStorage.setItem("attendance", JSON.stringify(attendance));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function formatMoney(amount) {
    return (Number(amount) || 0).toLocaleString("de-DE") + " so‘m";
}

function formatMoneyInput(amount) {
    return String(amount || "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function updateTotalFee() {
    const sum = students.reduce(
        (total, student) => total + (Number(student.monthlyFee) || 0), 0
    );

    document.getElementById("totalFee").textContent = formatMoney(sum);
}

function editStudent(id, field, value) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    student[field] = value;
    saveStudents();
    updateTotalFee();
}

function formatFeeInput(input, id) {
    const digits = input.value.replace(/\D/g, "");
    const student = students.find(s => s.id === id);
    if (!student) return;

    student.monthlyFee = Number(digits) || 0;
    input.value = formatMoneyInput(digits);

    saveStudents();
    updateTotalFee();
}

function changeMark(id, day) {
    const key = `${monthPicker.value}_${id}_${day}`;

    const answer = prompt(
        "Davomat:\n+ = Keldi\n- = Kelmadi\n0 = Belgini o‘chirish"
    );

    if (answer === null) return;

    if (answer === "+") {
        attendance[key] = "+";
    } else if (answer === "-") {
        attendance[key] = "-";
    } else if (answer === "0") {
        delete attendance[key];
    } else {
        alert("Faqat +, - yoki 0 kiriting!");
        return;
    }

    saveAttendance();
    render();
}

function render() {
    if (!monthPicker.value) return;

    const [year, month] = monthPicker.value.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const weekdays = [
        "Yakshanba", "Dushanba", "Seshanba",
        "Chorshanba", "Payshanba", "Juma", "Shanba"
    ];

    // HAFTA KUNLARI TEPADA
    let head = `
        <tr>
            <th rowspan="2">№</th>
            <th rowspan="2">Ism familiya</th>
            <th rowspan="2">Sinf</th>
            <th rowspan="2">Yil</th>
            <th rowspan="2">Telefon</th>
            <th rowspan="2">Ota-ona</th>
            <th rowspan="2">To‘lov</th>
    `;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        head += `
            <th class="day-column">
                <span class="weekday-name">${weekdays[date.getDay()]}</span>
            </th>
        `;
    }

    head += `
            <th rowspan="2">Kelgan</th>
            <th rowspan="2">Kelmagan</th>
        </tr>
        <tr>
    `;

    // SANALAR RAQAMI TEPADA EMAS, PASTKI SARLAVHA QATORIDA
    for (let day = 1; day <= daysInMonth; day++) {
        head += `<th class="date-number">${day}</th>`;
    }

    head += `</tr>`;

    document.getElementById("tableHead").innerHTML = head;

    let body = "";
    let totalPresent = 0;
    let totalAbsent = 0;

    students.forEach((student, index) => {
        let presentCount = 0;
        let absentCount = 0;

        let row = `
            <tr>
                <td>${index + 1}</td>
                <td><input class="student-input" value="${escapeHTML(student.name)}"
                    onchange="editStudent(${student.id}, 'name', this.value)"></td>
                <td><input class="student-input" value="${escapeHTML(student.className)}"
                    onchange="editStudent(${student.id}, 'className', this.value)"></td>
                <td><input class="student-input" value="${escapeHTML(student.year)}"
                    onchange="editStudent(${student.id}, 'year', this.value)"></td>
                <td><input class="student-input" value="${escapeHTML(student.phone)}"
                    onchange="editStudent(${student.id}, 'phone', this.value)"></td>
                <td><input class="student-input" value="${escapeHTML(student.parent)}"
                    onchange="editStudent(${student.id}, 'parent', this.value)"></td>
                <td><input class="student-input" value="${formatMoneyInput(student.monthlyFee)}"
                    oninput="formatFeeInput(this, ${student.id})"></td>
        `;

        for (let day = 1; day <= daysInMonth; day++) {
            const key = `${monthPicker.value}_${student.id}_${day}`;
            const mark = attendance[key] || "";

            if (mark === "+") presentCount++;
            if (mark === "-") absentCount++;

            const cls = mark === "+" ? "present" : mark === "-" ? "absent" : "";

            row += `
                <td class="attendance-cell ${cls} mark"
                    onclick="changeMark(${student.id}, ${day})">${mark}</td>
            `;
        }

        totalPresent += presentCount;
        totalAbsent += absentCount;

        row += `
            <td>${presentCount}</td>
            <td>${absentCount}</td>
            </tr>
        `;

        body += row;
    });

    document.getElementById("tableBody").innerHTML = body;

    document.getElementById("total").textContent = students.length;
    document.getElementById("present").textContent = totalPresent;
    document.getElementById("absent").textContent = totalAbsent;

    updateTotalFee();
}

function addStudent() {
    const newId = students.length
        ? Math.max(...students.map(s => s.id)) + 1 : 1;

    students.push({
        id: newId,
        name: "",
        className: "",
        year: "",
        phone: "",
        parent: "",
        monthlyFee: 0
    });

    saveStudents();
    render();
}

function removeStudent() {
    const number = prompt("Qaysi raqamdagi o‘quvchini o‘chirmoqchisiz?");
    if (number === null) return;

    const index = Number(number) - 1;

    if (!Number.isInteger(index) || index < 0 || index >= students.length) {
        alert("Bunday o‘quvchi yo‘q!");
        return;
    }

    const student = students[index];

    if (!confirm(`${number}-o‘quvchini o‘chirasizmi?`)) return;

    students = students.filter(s => s.id !== student.id);

    Object.keys(attendance).forEach(key => {
        if (Number(key.split("_")[1]) === student.id) {
            delete attendance[key];
        }
    });

    saveStudents();
    saveAttendance();
    render();
}

const now = new Date();

monthPicker.value =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

monthPicker.addEventListener("change", render);

render();
