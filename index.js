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

// Serve file statici dalla cartella 'public'
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

app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});
