document.getElementById('queryForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('queryEmail').value;

  const response = await fetch('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const result = await response.json();
  displayResults(result.data);
});

function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (!data || data.length === 0) {
    resultsDiv.innerHTML = '<p class="text-center">Nessuna registrazione trovata.</p>';
    return;
  }

  const table = document.createElement('table');
  table.classList.add('min-w-full');
  const headerRow = document.createElement('tr');
  ['Data', 'Email', 'Nome', 'Cognome', 'Classe'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  data.forEach(record => {
    const row = document.createElement('tr');
    const date = new Date(record.created_at).toLocaleString('it-IT');
    [date, record.email, record.nome, record.cognome, record.classe].forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  resultsDiv.appendChild(table);
}
