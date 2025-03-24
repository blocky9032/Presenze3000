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

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const nome = document.getElementById('nome').value.trim();
  const cognome = document.getElementById('cognome').value.trim();
  const classe = document.getElementById('classe').value.trim();

  if (!email.endsWith('@itiangioy.org')) {
    showPopup('L\'email deve terminare con @itiangioy.org', 'error');
    return;
  }

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, nome, cognome, classe })
  });
  const result = await response.json();

  if (result.error) {
    showPopup(result.error, 'error');
  } else {
    showPopup(result.message, 'success');
    document.getElementById('registerForm').reset();
  }
});
