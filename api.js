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

        const result = await connection.query(query, [customerId]);
        return await res.json(result.rows)
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

    const addNewCustomer = async (req, res) => {
        const customerBody = req.body;
        const query = 'insert into customers (name, address, city, country) values ($1, $2, $3, $4) returning id'

        const itExist = await connection.query('select * from customers where name=$1', [customerBody.name]);
        if (itExist.rows.length > 0) {
            return res.status(400).json({message : "The customer already exists!!"})
        }

        const result = await connection.query(query, [
            customerBody.name,
            customerBody.address,
            customerBody.city,
            customerBody.country
        ])
        const response = {customerId : result.rows[0].id}
        return await res.json(response);
    }
    
    return {
        getAllCustomers,
        getCustomerById,
        getAllSuppliers,
        getAllproducts,
        addNewCustomer
    }
}

module.exports = api;