// Nasconde il form di query e visualizza la tabella con i dati
document.getElementById('queryForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('queryEmail').value.trim();

  const response = await fetch('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const result = await response.json();
  // Nasconde il form di query
  document.getElementById('queryFormSection').classList.add('hidden');
  displayResults(result.data);
});

// Funzione per mostrare notifiche popup
function showPopup(message, type) {
  const popup = document.getElementById('popup');
  const div = document.createElement('div');
  div.className = `popup-message ${type === 'success' ? 'popup-success' : 'popup-error'}`;
  div.textContent = message;
  popup.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 5000);
}

// Costruisce la tabella con i record ricevuti
function displayResults(data) {
  const tableContainer = document.getElementById('tableContainer');
  tableContainer.innerHTML = '';
  if (!data || data.length === 0) {
    tableContainer.innerHTML = '<p class="text-center">Nessuna registrazione trovata.</p>';
    return;
  }

  // Crea la tabella
  const table = document.createElement('table');
  table.classList.add('min-w-full');
  const headerRow = document.createElement('tr');
  
  // Header con checkbox di selezione, dati e azioni
  const headers = ['Seleziona', 'Data', 'Email', 'Nome', 'Cognome', 'Classe', 'Azioni'];
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Crea una riga per ogni record
  data.forEach(record => {
    const row = document.createElement('tr');
    
    // Checkbox
    const checkboxTd = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'record-checkbox';
    checkbox.value = record.id;
    checkboxTd.appendChild(checkbox);
    row.appendChild(checkboxTd);
    
    // Colonne dati
    const date = new Date(record.created_at).toLocaleString('it-IT');
    [date, record.email, record.nome, record.cognome, record.classe].forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      row.appendChild(td);
    });
    
    // Colonna azioni: bottone cancellazione individuale
    const actionTd = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = "Cancella presenza";
    delBtn.className = "px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-all duration-300";
    delBtn.addEventListener('click', () => deleteRecords([record.id]));
    actionTd.appendChild(delBtn);
    row.appendChild(actionTd);

    table.appendChild(row);
  });

  tableContainer.appendChild(table);
  // Mostra la sezione dei risultati (la combobox e la tabella)
  document.getElementById('resultsSection').classList.remove('hidden');
}

// Funzione per cancellare record (singolo o multiplo)
async function deleteRecords(ids) {
  if (!ids || ids.length === 0) return;
  const response = await fetch('/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  const result = await response.json();
  if (result.error) {
    showPopup(result.error, 'error');
  } else {
    showPopup(result.message, 'success');
    // Dopo cancellazione, ricarica la pagina (oppure puoi rifare una query per aggiornare la tabella)
    location.reload();
  }
}

// Gestione azione multi-record tramite combobox
document.getElementById('applyAction').addEventListener('click', () => {
  const action = document.getElementById('actionSelect').value;
  const checkboxes = document.querySelectorAll('.record-checkbox:checked');
  const ids = Array.from(checkboxes).map(cb => parseInt(cb.value));
  if (ids.length === 0) {
    showPopup("Nessun record selezionato", "error");
    return;
  }
  if (action === "delete") {
    deleteRecords(ids);
  } else if (action === "update") {
    // Mostra il popup per la modifica della data
    document.getElementById('updatePopup').classList.remove('hidden');
    // Salva gli ID selezionati come proprietà temporanea sul popup
    document.getElementById('updatePopup').dataset.ids = JSON.stringify(ids);
  }
});

// Gestione popup update
document.getElementById('cancelUpdate').addEventListener('click', () => {
  document.getElementById('updatePopup').classList.add('hidden');
  document.getElementById('newDateTime').value = '';
  document.getElementById('updateError').classList.add('hidden');
});

document.getElementById('confirmUpdate').addEventListener('click', async () => {
  const newDate = document.getElementById('newDateTime').value;
  if (!newDate) {
    showPopup("Inserisci una data valida", "error");
    return;
  }
  const ids = JSON.parse(document.getElementById('updatePopup').dataset.ids);
  // Invia richiesta di update
  const response = await fetch('/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, new_date: newDate })
  });
  const result = await response.json();
  if (result.error) {
    // Mostra errore nel popup
    const errorDiv = document.getElementById('updateError');
    errorDiv.textContent = result.error;
    errorDiv.classList.remove('hidden');
  } else {
    showPopup(result.message, 'success');
    // Chiudi il popup e ricarica la pagina per aggiornare la tabella
    document.getElementById('updatePopup').classList.add('hidden');
    location.reload();
  }
});
