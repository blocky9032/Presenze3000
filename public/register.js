document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const nome = document.getElementById('nome').value;
  const cognome = document.getElementById('cognome').value;
  const classe = document.getElementById('classe').value;

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, nome, cognome, classe })
  });
  const result = await response.json();
  const messageEl = document.getElementById('registerMessage');
  messageEl.textContent = result.message || result.error;
  messageEl.classList.add('transition', 'duration-500', 'ease-in-out');
  setTimeout(() => messageEl.classList.remove('transition', 'duration-500', 'ease-in-out'), 500);
  document.getElementById('registerForm').reset();
});
