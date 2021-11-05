const express = require('express');
const app = express();

const { Pool } = require('pg');

const connection = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cyf_ecommerce',
    password: 'Meneer2021',
    port: '5432'
})

const port = 4000;
app.listen(port, () => {
    console.log(`app listening on port: ${port}`);
});