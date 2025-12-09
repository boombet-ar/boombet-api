

const status = {
    ok: (url) => ({ message: "OK", success: true, casinoUrl: url }),
    previamenteAfiliado: {message:"Jugador previamente afiliado", success:true},
    error:(err) => ({message:"error", success:false, error:err})
}


const verifyData = (jsonData, requiredFields) => { //devuelve lista con elementos faltantes
    const missingFields = []
    for (const field of requiredFields) {
        if (!jsonData[field]) {
          missingFields.push(field)
        }
      }
      return missingFields;
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