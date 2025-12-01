const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// --- MUDANÇA CRUCIAL AQUI ---
// Define a porta como 80 (padrão do Easypanel) ou usa a variável de ambiente
const port = process.env.PORT || 80;

// Configuração para salvar as fotos na pasta 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    // Cria a pasta se ela não existir
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

// Serve o arquivo index.html quando acessa a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Recebe a foto e mostra a tela de confirmação bonita
app.post('/upload', upload.single('foto'), (req, res) => {
  // Pega a hora certa do Brasil
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  console.log(`Nova foto recebida em: ${agora}`);
  
  // HTML da página de "Sucesso" (Estilo App)
  const htmlSucesso = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmado</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: #f0f2f5; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                color: #333;
            }
            .card { 
                background: white; 
                padding: 2.5rem; 
                border-radius: 16px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.08); 
                text-align: center; 
                max-width: 400px; 
                width: 90%; 
            }
            h1 { color: #28a745; margin-bottom: 10px; margin-top: 0; }
            p { color: #555; margin-bottom: 30px; font-size: 1.1rem; line-height: 1.5; }
            .icon { font-size: 60px; margin-bottom: 15px; display: block; }
            .btn { 
                text-decoration: none; 
                background: #007bff; 
                color: white; 
                padding: 15px 30px; 
                border-radius: 10px; 
                font-weight: bold; 
                display: block;
                width: 100%;
                box-sizing: border-box;
                transition: background 0.3s;
            }
            .btn:active { background: #0056b3; transform: scale(0.98); }
        </style>
    </head>
    <body>
        <div class="card">
            <span class="icon">✅</span>
            <h1>Recebido!</h1>
            <p>Sua foto foi registrada com sucesso.<br><strong>Data: ${agora}</strong></p>
            <a href="/" class="btn">Voltar</a>
        </div>
    </body>
    </html>
  `;
  
  res.send(htmlSucesso);
});

// --- MUDANÇA CRUCIAL AQUI TAMBÉM ---
// O '0.0.0.0' é OBRIGATÓRIO para funcionar dentro do Docker/Easypanel
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
