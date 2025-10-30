
require('dotenv').config({quiet:true})
const express = require('express');

const register_key = process.env.REGISTER_KEY

const headerAuth = (req, res, next) => {

    const apiKeyClient = req.headers['register_key'];

    if (!apiKeyClient) {
        return res.status(401).json({ error: 'Acceso denegado. API Key requerida.' });
    }

    if (apiKeyClient !== register_key) {
        return res.status(403).json({ error: 'Acceso denegado. API Key inválida.' });
    }

    next();
};

module.exports = headerAuth;