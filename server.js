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
    if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const date = new Date().toISOString().replace(/:/g, '-');
    cb(null, `${date}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Rota Principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de Upload (Com HTML de Resposta Bonito)
app.post('/upload', upload.single('foto'), (req, res) => {
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  console.log(`Nova foto recebida em: ${agora}`);
  
  // HTML da página de sucesso embutido
  const htmlSucesso = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); text-align: center; max-width: 400px; width: 90%; }
            h1 { color: #28a745; margin-bottom: 10px; }
            p { color: #555; margin-bottom: 25px; }
            .btn { text-decoration: none; background: #007bff; color: white; padding: 12px 25px; border-radius: 8px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <div style="font-size: 50px;">🎉</div>
            <h1>Registrado!</h1>
            <p>Sua foto foi recebida com sucesso em:<br><strong>${agora}</strong></p>
            <a href="/" class="btn">Voltar</a>
        </div>
    </body>
    </html>
  `;
  
  res.send(htmlSucesso);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
