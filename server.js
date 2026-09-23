'use strict';

const app = require('./src/app');

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`JTEC site rodando em http://localhost:${port}`);
  console.log(`Painel administrativo: http://localhost:${port}/admin`);
});
