const STORAGE_KEY = 'tulio-control-transactions-v1';
const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
const $ = (selector) => document.querySelector(selector);
const dialog = $('#transaction-dialog');
let transactions = loadTransactions();

function loadTransactions() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function saveTransactions() { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }
function formatMoney(value) { return money.format(value).replace('BOB', 'Bs'); }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function render() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = transactions.filter(item => item.date.startsWith(currentMonth));
  const income = thisMonth.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = thisMonth.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const balance = transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount), 0);
  $('#balance').textContent = formatMoney(balance);
  $('#income').textContent = formatMoney(income);
  $('#expense').textContent = formatMoney(expense);

  const query = $('#search').value.trim().toLocaleLowerCase('es');
  const type = $('#type-filter').value;
  const filtered = [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .filter(item => (type === 'all' || item.type === type) && `${item.description} ${item.category}`.toLocaleLowerCase('es').includes(query));
  $('#transactions').innerHTML = filtered.map(item => {
    const incomeItem = item.type === 'income';
    return `<tr>
      <td><div class="transaction-name"><span class="transaction-icon ${incomeItem ? 'income' : 'expense'}">${incomeItem ? '↗' : '↘'}</span>${escapeHtml(item.description)}</div></td>
      <td><span class="category-pill">${escapeHtml(item.category)}</span></td>
      <td>${dateFormat.format(new Date(`${item.date}T12:00:00`))}</td>
      <td class="amount ${incomeItem ? 'positive' : ''}">${incomeItem ? '+' : '−'} ${formatMoney(item.amount)}</td>
      <td class="row-actions"><button class="delete-button" data-delete="${item.id}" aria-label="Eliminar ${escapeHtml(item.description)}" title="Eliminar">×</button></td>
    </tr>`;
  }).join('');
  const empty = filtered.length === 0;
  $('#empty-state').classList.toggle('hidden', !empty);
  $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'movimiento' : 'movimientos'}`;
  $('#empty-state strong').textContent = transactions.length && empty ? 'No hay resultados' : 'Aún no hay movimientos';
  $('#empty-state p').textContent = transactions.length && empty ? 'Prueba otra búsqueda o cambia el filtro seleccionado.' : 'Registra tu primer ingreso o gasto para ver aquí tu actividad.';
  $('#empty-add').classList.toggle('hidden', Boolean(transactions.length && empty));
}
function openForm() {
  const today = new Date();
  $('#date').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  dialog.showModal();
  $('#description').focus();
}
$('#today').textContent = new Intl.DateTimeFormat('es-BO', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
$('#open-form').addEventListener('click', openForm);
$('#empty-add').addEventListener('click', openForm);
$('#close-form').addEventListener('click', () => dialog.close());
$('#cancel-form').addEventListener('click', () => dialog.close());
$('#search').addEventListener('input', render);
$('#type-filter').addEventListener('change', render);
$('#transactions').addEventListener('click', event => {
  const button = event.target.closest('[data-delete]');
  if (!button) return;
  transactions = transactions.filter(item => item.id !== button.dataset.delete);
  saveTransactions();
  render();
});
$('#transaction-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const amount = Number(form.get('amount'));
  if (!Number.isFinite(amount) || amount <= 0) return;
  transactions.push({
    id: crypto.randomUUID(),
    type: form.get('type'),
    description: String(form.get('description')).trim(),
    amount: Math.round(amount * 100) / 100,
    category: form.get('category'),
    date: form.get('date'),
    createdAt: Date.now()
  });
  saveTransactions();
  event.currentTarget.reset();
  dialog.close();
  render();
});
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
render();
