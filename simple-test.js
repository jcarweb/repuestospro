const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Ruta de prueba funcionando' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
