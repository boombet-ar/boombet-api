const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes')
app.use(express.json());


app.use(router)
app.listen(port, () => {
  console.log(`✅ Servidor escuchando en puerto ${port}`);
});


