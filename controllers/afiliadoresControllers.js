const db = require('../config/db')

//FALTA AGREGAR VERIFICACION DE VERDAD


const getAfiliadores = async (req, res) => {
    try {
        const rawResult = await db.query('SELECT * FROM afiliadores;')
        const result = rawResult.rows.filter(o => o.estado === 'Listo') //Solo devuelve los que ya hicieron la confirmacion desde telegram
        return res.status(200).json(result)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
    }
}

const toggleAfiliadorActivo = async (req, res) => {
    const idAfiliador = req.params.id
    try {
        const estadoAfiliador = await db.query(`UPDATE afiliadores SET activo = NOT activo WHERE id = $1 RETURNING id,activo`, [idAfiliador])

        if (estadoAfiliador.rowCount === 0) {return res.status(404).json({ message: 'Afiliador no encontrado' });}
        console.log(estadoAfiliador.rows[0])
        return res.status(200).json(estadoAfiliador.rows[0])
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
    }
}

const deleteAfiliador = async(req,res) =>{
    const idAfiliador = req.params.id
    try {
        await db.query('DELETE from afiliadores WHERE id = $1',[idAfiliador])
        return res.status(200).json({message:'Afiliador eliminado'})
        
    } catch (error) {
        return res.status(500).json(error)
        
    }

}

const afAdminLogin = async (req,res) => {
    let isAdmin;

    const {user,password} = req.body

    if(user === process.env.AF_ADMIN_USER &&
        password === process.env.AF_ADMIN_PASS){
        isAdmin = true;
        return res.status(200).json({message:'Ingreso exitoso'})
    }else{
        return res.status(401).json({message:'Error'})
    }
}


module.exports = { getAfiliadores,toggleAfiliadorActivo, afAdminLogin,deleteAfiliador }