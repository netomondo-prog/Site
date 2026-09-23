'use strict';

const app = require('./src/app');
const engine = require('./src/lib/engine');

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Sistema de disparo WhatsApp rodando em http://localhost:${port}`);
  // Fila de campanhas: retoma envios interrompidos e dispara agendamentos
  engine.startWorker();
});
