const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuração para salvar as fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Salva com o nome: DATA-HORA-original.jpg
    const date = new Date().toISOString().replace(/:/g, '-');
    cb(null, `${date}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Serve o arquivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Recebe a foto
app.post('/upload', upload.single('foto'), (req, res) => {
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  console.log(`Nova foto recebida em: ${agora}`);
  res.send(`<h1>Sucesso!</h1><p>Foto recebida em: ${agora}</p><a href="/">Voltar</a>`);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});