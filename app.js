const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes')
const cors = require('cors')
app.use(express.json());

app.use(cors())
app.get('/', (req,res) => { 
  res.send('BOOMBET')
})

app.use(router)
app.listen(port, () => {
  console.log(`✅ Servidor escuchando en puerto ${port}`);
});


