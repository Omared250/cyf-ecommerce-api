const { Pool } = require('pg');
const secret = require('./secrets.json');
const connection = new Pool(secret);

const api = () => {
    const getAllCustomers = (req, res) => {
        connection.query('select * from customers order by id', (error, result) => {
            res.json(result.rows);
        })
    }

    const getCustomerById = async (req, res) => {
        const customerId = req.params.customerId;
        const query = "select * from customers where id=$1";
        
    }
    
    const getAllSuppliers = (req, res) => {
        connection.query('select * from suppliers order by id', (error, result) => {
            res.json(result.rows);
        })
    }
    
    const getAllproducts = async (req, res) => {
        const productName = req.query.productName;
        const query = "select * from products where product_name like '%$1%'"
        if (productName) {
            const result = await connection.query(query, [productName]);
            return await res.json(result.rows);
        } else {
            const allproducts = await connection.query('select * from products order by id');
            return res.json(allproducts.rows);
        }
    }
    
    return {
        getAllCustomers,
        getAllSuppliers,
        getAllproducts
    }
}

module.exports = api;