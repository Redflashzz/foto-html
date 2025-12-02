const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
// Configura porta 80 (Padrão Easypanel)
const port = process.env.PORT || 80;

// URL DO SEU WEBHOOK (Confira se está exata)
const N8N_WEBHOOK_URL = "https://n8n-webhook.vkozv1.easypanel.host/webhook/site";

// Configuração de onde salvar as fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Cria um nome único: 2023-10-01-foto.jpg
    const date = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    cb(null, `${date}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Rota principal (Formulário)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de Upload (Recebe a foto -> Salva -> Avisa o n8n)
app.post('/upload', upload.single('foto'), async (req, res) => {
  // Pega data/hora do Brasil
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  console.log(`[LOG] Foto recebida em: ${agora}`);

  // --- BLOCO QUE ACIONA O N8N ---
  if (req.file) {
    try {
      console.log(`[LOG] Tentando acionar webhook: ${N8N_WEBHOOK_URL}`);
      
      // Envia um JSON para o n8n avisando que chegou foto nova
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: "nova_foto_ponto",
          data_hora: agora,
          nome_arquivo_original: req.file.originalname,
          nome_arquivo_salvo: req.file.filename,
          caminho_servidor: req.file.path,
          tamanho: req.file.size
        })
      });

      if (response.ok) {
        console.log("[SUCESSO] Webhook acionado com sucesso!");
      } else {
        console.error(`[ERRO] N8N rejeitou o envio. Status: ${response.status}`);
      }

    } catch (error) {
      console.error("[ERRO FATAL] Falha ao conectar no n8n:", error.message);
    }
  }
  // ------------------------------

  // Resposta bonita para o usuário
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmado</title>
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
            <h1>Ponto Registrado!</h1>
            <p>Seus dados foram enviados.</p>
            <p style="font-size: 0.8rem; color: #777;">Processado às: ${agora}</p>
            <a href="/" class="btn">Voltar</a>
        </div>
    </body>
    </html>
  `);
});

// Inicia o servidor aceitando conexões de fora (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});

