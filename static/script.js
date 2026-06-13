const expenses = [
  { date: "2026-04-01", description: "pizza order", category: "Food", amount: 250, type: "Expense" },
  { date: "2026-04-02", description: "uber ride", category: "Travel", amount: 180, type: "Expense" },
  { date: "2026-04-03", description: "electricity bill", category: "Bills", amount: 1200, type: "Expense" }
];

const addExpenseBtn = document.getElementById("addExpenseBtn");

function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

async function getPrediction(description) {
  const response = await fetch("/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ description: description })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Prediction failed");
  }

  return data.category;
}

function renderTable() {
  const tbody = document.getElementById("expenseTableBody");
  tbody.innerHTML = "";

  expenses.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.description}</td>
      <td><span class="badge">${item.category}</span></td>
      <td>${formatCurrency(item.amount)}</td>
      <td>${item.type}</td>
    `;
    tbody.appendChild(row);
  });
}

function updateSummary() {
  const onlyExpenses = expenses.filter(item => item.type === "Expense");

  const totalExpense = onlyExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = onlyExpenses.length;

  const categoryTotals = {};
  onlyExpenses.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });

  let topCategory = "-";
  let maxAmount = 0;

  for (const category in categoryTotals) {
    if (categoryTotals[category] > maxAmount) {
      maxAmount = categoryTotals[category];
      topCategory = category;
    }
  }

  document.getElementById("totalExpense").textContent = formatCurrency(totalExpense);
  document.getElementById("totalTransactions").textContent = totalTransactions;
  document.getElementById("topCategory").textContent = topCategory;

  renderChart(categoryTotals, totalExpense);
}

function renderChart(categoryTotals, totalExpense) {
  const chart = document.getElementById("categoryChart");
  chart.innerHTML = "";

  const entries = Object.entries(categoryTotals);

  if (entries.length === 0) {
    chart.innerHTML = "<p>No expense data available.</p>";
    return;
  }

  entries.forEach(([category, amount]) => {
    const percentage = totalExpense ? ((amount / totalExpense) * 100).toFixed(1) : 0;

    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-label">
        <span>${category}</span>
        <span>${formatCurrency(amount)} (${percentage}%)</span>
      </div>
      <div class="bar">
        <div class="bar-fill" style="width:${percentage}%"></div>
      </div>
    `;
    chart.appendChild(row);
  });
}

addExpenseBtn.addEventListener("click", async () => {
  const date = document.getElementById("date").value;
  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const predictedCategoryBox = document.getElementById("predictedCategory");

  if (!date || !description || !amount) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const category = await getPrediction(description);
    predictedCategoryBox.textContent = category;

    expenses.unshift({
      date,
      description,
      category,
      amount,
      type
    });

    renderTable();
    updateSummary();

    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
  } catch (error) {
    alert("Error: " + error.message);
  }
});

renderTable();
updateSummary();