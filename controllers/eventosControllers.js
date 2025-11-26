const db = require('../config/db')

const getEventos = async (req, res) => {
    try {
        const result = (await db.query('SELECT * FROM eventos;')).rows
        return res.status(200).json(result)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
    }
}



const crearEvento = async (req,res) => {
    const {nombre, fecha_inicio, fecha_fin, provincia_id} = req.body
    try{
        const query = (await db.query(
            'INSERT INTO eventos(nombre, fecha_inicio, fecha_fin, provincia_id) values ($1,$2,$3,$4) RETURNING nombre, fecha_inicio, fecha_fin, provincia_id',
            [nombre,fecha_inicio,fecha_fin,provincia_id]  ))
        return res.status(200).json(query.rows)
    }catch(error){
        return res.status(500).json({error})
    }
}

const asignarAfiliador = async(req,res) => {
    const {id_evento} = req.body
    const {id_afiliador} = req.params

    try{        
        const query = (await db.query(
            'UPDATE afiliadores SET id_evento = $1 WHERE id_evento IS NULL AND id = $2 RETURNING nombre_completo as afiliador, (SELECT nombre FROM eventos WHERE id = $1) as nombre_evento ',
            [id_evento,id_afiliador]
            ))

        if(query.rowCount == 0){return res.status(400).json({message:'El afiliador no existe o ya tiene un evento asignado'})}
        return res.status(200).json(query.rows)
    }catch(error){
        return res.status(500).json({error})
    }

}





module.exports = {getEventos, crearEvento, asignarAfiliador}
