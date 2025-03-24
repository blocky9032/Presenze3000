const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Connessione a Supabase
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://hklekkwammffvxpyqozs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrbGVra3dhbW1mZnZ4cHlxb3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTM5MzgsImV4cCI6MjA1ODM4OTkzOH0.1e1owoIgAtG-0ohzez_TZStbX2ON7b8hpbOKTv6djp8";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = process.env.PORT || 3000;

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configurazione di body-parser per le richieste POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint per registrare la presenza
app.post('/register', async (req, res) => {
  const { email, nome, cognome, classe } = req.body;
  if (!email || !nome || !cognome || !classe) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }
  const { data, error } = await supabase
    .from('presenze')
    .insert([{ email, nome, cognome, classe }]);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ message: 'Presenza registrata con successo', data });
});

// Endpoint per interrogare le presenze tramite email
app.post('/query', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Il campo email è obbligatorio' });
  }
  const { data, error } = await supabase
    .from('presenze')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
});

// Endpoint per cancellare uno o più record
app.post('/delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Nessun ID fornito" });
  }
  const { data, error } = await supabase
    .from('presenze')
    .delete()
    .in('id', ids);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ message: "Record eliminati", data });
});

// Endpoint per aggiornare la data (created_at) di uno o più record
app.put('/update', async (req, res) => {
  const { ids, new_date } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !new_date) {
    return res.status(400).json({ error: "Input non valido" });
  }
  // Controlla che la nuova data non sia già presente (confronto stringa)
  const { data: conflict, error: conflictError } = await supabase
    .from('presenze')
    .select('*')
    .eq('created_at', new_date);
  if (conflictError) {
    return res.status(500).json({ error: conflictError.message });
  }
  if (conflict && conflict.length > 0) {
    return res.status(400).json({ error: "Impossibile continuare: data non valida poiché risulta già un'altra presenza nella data indicata" });
  }
  const { data, error } = await supabase
    .from('presenze')
    .update({ created_at: new_date })
    .in('id', ids);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ message: "Record aggiornati", data });
});

app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});
