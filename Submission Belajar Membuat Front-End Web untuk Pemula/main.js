/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 */

const STORAGE_KEY = 'EXPENSE_TRACKER_TRANSACTIONS';
const UPDATE_EVENT = 'transaction:updated';

// Data utama aplikasi
let transactions = [];
let editingId = null; // null = mode "Tambah", berisi id = mode "Edit"
let searchKeyword = '';

// ---------- Elemen DOM ----------
const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const submitButton = transactionForm.querySelector('button[type="submit"]');
const formHeading = document.getElementById('form-heading');

const searchForm = document.getElementById('searchTransactionForm');
const searchInput = document.getElementById('searchTransactionFormTitleInput');

const balanceElement = document.querySelector('.tracker-summary__balance-amount');
const incomeTotalElement = document.querySelector('.tracker-summary__stat-amount--income');
const expenseTotalElement = document.querySelector('.tracker-summary__stat-amount--expense');

// ---------- Utilitas ----------
function generateId() {
  let id = +new Date();
  // Pastikan ID tidak kembar jika dua transaksi dibuat di milidetik yang sama
  while (transactions.some((transaction) => transaction.id === id)) {
    id += 1;
  }
  return id;
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatRupiah(value) {
  const sign = value < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(value).toLocaleString('id-ID')}`;
}

function typeLabel(type) {
  return type === 'income' ? 'Pemasukan' : 'Pengeluaran';
}

function notifyChange() {
  document.dispatchEvent(new Event(UPDATE_EVENT));
}

// ---------- localStorage ----------
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({ ...item, amount: Number(item.amount) }));
  } catch (error) {
    return [];
  }
}

// ---------- Render ----------
function createTransactionElement(transaction) {
  const isIncome = transaction.type === 'income';

  const card = document.createElement('div');
  card.setAttribute('data-testid', 'transactionItem');
  card.classList.add(
    'tracker-transaction-item',
    isIncome ? 'tracker-transaction-item--income' : 'tracker-transaction-item--expense'
  );
  if (transaction.id === editingId) {
    card.classList.add('tracker-transaction-item--editing');
  }

  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'transactionItemTitle');
  title.classList.add('tracker-transaction-item__title');
  title.textContent = transaction.title;

  const amount = document.createElement('p');
  amount.setAttribute('data-testid', 'transactionItemAmount');
  amount.classList.add('tracker-transaction-item__nominal');
  amount.textContent = `Nominal: Rp${transaction.amount}`;

  const date = document.createElement('p');
  date.setAttribute('data-testid', 'transactionItemDate');
  date.classList.add('tracker-transaction-item__date');
  date.textContent = `Tanggal: ${transaction.date}`;

  const type = document.createElement('p');
  type.setAttribute('data-testid', 'transactionItemType');
  type.classList.add('tracker-transaction-item__type');
  type.textContent = `Tipe: ${typeLabel(transaction.type)}`;

  const actions = document.createElement('div');
  actions.classList.add('tracker-transaction-item__actions');

  const editTypeButton = document.createElement('button');
  editTypeButton.type = 'button';
  editTypeButton.setAttribute('data-testid', 'transactionItemEditTypeButton');
  editTypeButton.classList.add('tracker-transaction-item__btn');
  editTypeButton.textContent = 'Ubah Tipe';
  editTypeButton.addEventListener('click', () => toggleTransactionType(transaction.id));

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.setAttribute('data-testid', 'transactionItemEditButton');
  editButton.classList.add('tracker-transaction-item__btn');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => startEditTransaction(transaction.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteButton.classList.add('tracker-transaction-item__btn', 'tracker-transaction-item__btn--danger');
  deleteButton.textContent = 'Hapus';
  deleteButton.addEventListener('click', () => deleteTransaction(transaction.id));

  actions.append(editTypeButton, editButton, deleteButton);
  card.append(title, amount, date, type, actions);

  return card;
}

function renderTransactions() {
  incomeList.replaceChildren();
  expenseList.replaceChildren();

  const keyword = searchKeyword.trim().toLowerCase();
  const visibleTransactions = keyword
    ? transactions.filter((transaction) => transaction.title.toLowerCase().includes(keyword))
    : transactions;

  visibleTransactions.forEach((transaction) => {
    const card = createTransactionElement(transaction);
    if (transaction.type === 'income') {
      incomeList.appendChild(card);
    } else {
      expenseList.appendChild(card);
    }
  });
}

function updateDashboard() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  balanceElement.textContent = formatRupiah(totalIncome - totalExpense);
  incomeTotalElement.textContent = formatRupiah(totalIncome);
  expenseTotalElement.textContent = formatRupiah(totalExpense);
}

// Satu-satunya listener yang memperbarui seluruh tampilan
document.addEventListener(UPDATE_EVENT, () => {
  renderTransactions();
  updateDashboard();
});

// ---------- Mode form: Tambah / Edit ----------
function setFormMode(id) {
  editingId = id;
  const isEditing = id !== null;
  submitButton.textContent = isEditing ? 'Simpan Perubahan' : 'Simpan';
  formHeading.textContent = isEditing ? 'Edit Pencatatan' : 'Tambah Pencatatan Baru';
  transactionForm.classList.toggle('tracker-form--editing', isEditing);
}

function resetForm() {
  transactionForm.reset();
  setFormMode(null);
}

// ---------- Aksi transaksi ----------
function addTransaction({ title, amount, date, type }) {
  transactions.push({ id: generateId(), title, amount, date, type });
  saveTransactions();
  notifyChange();
}

function updateTransaction(id, { title, amount, date, type }) {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return;
  Object.assign(transaction, { title, amount, date, type });
  saveTransactions();
  notifyChange();
}

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  if (editingId === id) {
    resetForm();
  }
  saveTransactions();
  notifyChange();
}

function toggleTransactionType(id) {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return;
  transaction.type = transaction.type === 'income' ? 'expense' : 'income';
  if (editingId === id) {
    typeSelect.value = transaction.type;
  }
  saveTransactions();
  notifyChange();
}

function startEditTransaction(id) {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return;

  titleInput.value = transaction.title;
  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  typeSelect.value = transaction.type;
  setFormMode(id);
  notifyChange(); // sorot kartu yang sedang diedit

  transactionForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  titleInput.focus();
}

// ---------- Event: form tambah / edit ----------
transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value || todayString();
  const type = typeSelect.value;

  if (title === '') {
    alert('Keterangan transaksi tidak boleh kosong.');
    return;
  }
  if (!Number.isFinite(amount) || amount < 1) {
    alert('Nominal harus minimal Rp1.');
    return;
  }

  const data = { title, amount, date, type };

  if (editingId !== null) {
    updateTransaction(editingId, data);
  } else {
    addTransaction(data);
  }
  resetForm();
});

// ---------- Event: pencarian ----------
searchInput.addEventListener('input', () => {
  searchKeyword = searchInput.value;
  renderTransactions();
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchKeyword = searchInput.value;
  renderTransactions();
});

// ---------- Inisialisasi ----------
transactions = loadTransactions();
notifyChange();
