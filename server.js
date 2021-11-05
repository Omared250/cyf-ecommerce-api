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

const getAllCustomers = (req, res) => {
    connection.query('select * from customers order by id', (error, result) => {
        res.json(result.rows);
    })
}

const getAllSuppliers = (req, res) => {
    connection.query('select * from suppliers order by id', (error, result) => {
        res.json(result.rows);
    })
}

const getAllproducts = (req, res) => {
    connection.query('select p.product_name, s.supplier_name from products p inner join suppliers s on s.id=p.supplier_id', 
    (error, result) => {
        res.json(result.rows);
    })
}

app.get("/customers", getAllCustomers);
app.get("/suppliers", getAllSuppliers);
app.get("/products", getAllproducts);

const port = 4000;
app.listen(port, () => {
    console.log(`app listening on port: ${port}`);
});