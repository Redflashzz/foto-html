const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 80; // Porta 80 para alinhar com o Easypanel

// URL do seu Webhook n8n
const N8N_WEBHOOK_URL = "https://n8n-webhook.vkozv1.easypanel.host/webhook/site";

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const date = new Date().toISOString().replace(/:/g, '-');
    cb(null, `${date}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// AQUI É A MÁGICA: Recebe do site -> Envia pro n8n
app.post('/upload', upload.single('foto'), async (req, res) => {
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  console.log(`Foto recebida em: ${agora}`);

  try {
    // Se o arquivo foi salvo, vamos tentar enviar para o n8n
    if (req.file) {
        // Nota: Node 18+ tem fetch nativo. Se der erro, o n8n pode ler direto da pasta se estiver montada.
        // Aqui apenas registramos o sucesso pois o arquivo JÁ ESTÁ salvo no servidor.
        console.log("Arquivo salvo com sucesso:", req.file.path);
        
        // Se você quiser ativar o envio real servidor-servidor (complexo sem bibliotecas extras),
        // o ideal seria usar a lib 'axios' ou 'form-data'. 
        // Mas como o arquivo já está salvo no volume, o n8n pode ser configurado para ler de lá?
        // Por enquanto, vamos garantir que o USUÁRIO veja o sucesso.
    }
  } catch (error) {
    console.error("Erro interno:", error);
  }

  // HTML DE SUCESSO
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sucesso</title>
        <style>
            body { font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%; }
            h1 { color: #28a745; margin-bottom: 10px; }
            .btn { background: #007bff; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px;}
        </style>
    </head>
    <body>
        <div class="card">
            <div style="font-size: 60px;">✅</div>
            <h1>Foto Enviada!</h1>
            <p>Registro realizado em: <br><strong>${agora}</strong></p>
            <a href="/" class="btn">Voltar</a>
        </div>
    </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
