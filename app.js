let employees = [];

try {
    employees = JSON.parse(localStorage.getItem("employees")) || [];
} catch {
    employees = [];
}

const hoursInput = document.getElementById("monthlyHours");

hoursInput.value = localStorage.getItem("monthlyHours") || 240;

function saveData() {
    localStorage.setItem("employees", JSON.stringify(employees));
    localStorage.setItem("monthlyHours", hoursInput.value);
}

function money(value) {
    return value.toFixed(2) + " د.أ";
}

function calculate(employee) {
    const monthlyHours = Number(hoursInput.value) || 240;
    const hourlyRate = employee.salary / monthlyHours;

    const normalPay =
        employee.normalHours * hourlyRate * 1.25;

    const holidayPay =
        employee.holidayHours * hourlyRate * 1.5;

    const overtimeTotal = normalPay + holidayPay;

    return {
        normalPay,
        holidayPay,
        overtimeTotal,
        finalSalary: employee.salary + overtimeTotal
    };
}

function renderEmployees() {
    const list = document.getElementById("employeeList");
    list.innerHTML = "";

    let totalSalaries = 0;
    let totalOvertime = 0;

    employees.forEach((employee) => {
        const result = calculate(employee);

        totalSalaries += employee.salary;
        totalOvertime += result.overtimeTotal;

        const card = document.createElement("div");
        card.className = "employee-card";

        const title = document.createElement("h3");
        title.textContent = employee.name;
        card.appendChild(title);

        const salary = document.createElement("p");
        salary.textContent = "الراتب الأساسي: " + money(employee.salary);
        card.appendChild(salary);

        const inputs = document.createElement("div");
        inputs.className = "overtime-inputs";

        const normalLabel = document.createElement("label");
        normalLabel.textContent = "ساعات إضافية في الأيام العادية";

        const normalInput = document.createElement("input");
        normalInput.type = "number";
        normalInput.min = "0";
        normalInput.step = "0.5";
        normalInput.value = employee.normalHours;
        normalLabel.appendChild(normalInput);

        const holidayLabel = document.createElement("label");
        holidayLabel.textContent = "ساعات إضافية في أيام الإجازة";

        const holidayInput = document.createElement("input");
        holidayInput.type = "number";
        holidayInput.min = "0";
        holidayInput.step = "0.5";
        holidayInput.value = employee.holidayHours;
        holidayLabel.appendChild(holidayInput);

        inputs.appendChild(normalLabel);
        inputs.appendChild(holidayLabel);
        card.appendChild(inputs);

        const resultBox = document.createElement("div");
        resultBox.className = "result";

        function updateOvertime() {
            employee.normalHours = Math.max(0, Number(normalInput.value) || 0);
            employee.holidayHours = Math.max(0, Number(holidayInput.value) || 0);

            saveData();

            const updated = calculate(employee);

            resultBox.textContent =
                "قيمة إضافي الأيام العادية: " + money(updated.normalPay) +
                " | قيمة إضافي الإجازات: " + money(updated.holidayPay) +
                " | مجموع الإضافي: " + money(updated.overtimeTotal) +
                " | الراتب مع الإضافي: " + money(updated.finalSalary);

            updateDashboard();
        }

        normalInput.addEventListener("input", updateOvertime);
        holidayInput.addEventListener("input", updateOvertime);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "حذف الموظف";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function () {
            if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
                employees = employees.filter(item => item.id !== employee.id);
                saveData();
                renderEmployees();
            }
        });

        card.appendChild(resultBox);
        card.appendChild(deleteButton);

        list.appendChild(card);

        updateOvertime();
    });

    updateDashboard();
}

function updateDashboard() {
    let salaries = 0;
    let overtime = 0;

    employees.forEach(employee => {
        salaries += employee.salary;
        overtime += calculate(employee).overtimeTotal;
    });

    document.getElementById("employeeCount").textContent = employees.length;
    document.getElementById("totalSalaries").textContent = money(salaries);
    document.getElementById("totalOvertime").textContent = money(overtime);
    document.getElementById("grandTotal").textContent = money(salaries + overtime);
}

document.getElementById("employeeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("employeeName").value.trim();
    const salary = Number(document.getElementById("employeeSalary").value);

    if (!name || !Number.isFinite(salary) || salary < 0) {
        alert("يرجى إدخال اسم وراتب صحيح.");
        return;
    }

    employees.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        name: name,
        salary: salary,
        normalHours: 0,
        holidayHours: 0
    });

    saveData();
    this.reset();
    renderEmployees();
});

hoursInput.addEventListener("input", function() {
    saveData();
    renderEmployees();
});

renderEmployees();