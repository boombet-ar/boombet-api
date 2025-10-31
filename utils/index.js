

const status = {
    ok: {message:"OK", success:true},
    previamenteAfiliado: {message:"Jugador previamente afiliado", success:true},
    error:(err) => ({message:"error", success:false, error:err})
}


const verifyData = (jsonData, requiredFields) => { //Si falta algun elemento devuelve el elemento
    for (const field of requiredFields) {
        if (!jsonData[field]) {
            return field;
        }
    }
  }

function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

const toSentenceCase = (aWord) => {
  return (
    aWord[0].toUpperCase() +
    aWord.slice(1).toLowerCase()
  )
}


module.exports = {verifyData, toTitleCase, toSentenceCase, status}