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
        let query = 'select * from products order by id';

        if (productName) {
            query = `select * from products where product_name like '%${productName}%'`
        }

        const result = await connection.query(query);

        if (result.rows.length === 0) {
            return res.json({message : "The product does not exists!!"})
        }

        return res.json(result.rows);
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

    const getBadRequestProductResponse = () => {
        return {message : "The current product is not valid",
                rules : ["The supplier must exists", "The unit price must be a positive number"]}
    }

    const productIsOk = async (product) => {
        const result = await connection.query('select * from suppliers where id=$1', [product.supplier_id]);
        return Number.isInteger(product.unit_price) && result.rows.length === 1 && product.unit_price > 0;
    }

    const addNewProduct = async (req, res) => {
        const productBody = req.body;

        if (!await productIsOk(productBody)) {
            return res.status(400).json(getBadRequestProductResponse());
        } 

        const newProduct = `insert into products (product_name, unit_price, supplier_id) 
        values ($1, $2, $3) returning id`;

        const result = await connection.query(newProduct, [
            productBody.product_name,
            productBody.unit_price,
            productBody.supplier_id
        ])
        const response = {productId : result.rows[0].id};
        return await res.json(response);
    }

    const orderIsOk = (order) => {
        return order.order_date === '' || order.order_reference === '';
    }

    const addNewOrder = async (req, res) => {
        const customerId = req.params.customerId;
        const orderBody = req.body;

        const itExists = await connection.query('select * from customers where id=$1', [customerId]);
        if (itExists.rows.length === 0) {
            return res.json({message : "The customer does not exists!"})
        }

        if (orderIsOk(orderBody)) {
            return res.json({rules : ['The order need a date', 'The order need a reference']})
        }

        const newOrder = `insert into orders (order_date, order_reference, customer_id) 
        values ($1, $2, $3) returning id`
        const result = await connection.query(newOrder, [orderBody.order_date, orderBody.order_reference, customerId]);
        const response = {orderId : result.rows[0].id};
        return await res.json(response); 
    }
    
    return {
        getAllCustomers,
        getCustomerById,
        getAllSuppliers,
        getAllproducts,
        addNewCustomer,
        addNewProduct,
        addNewOrder
    }
}

module.exports = api;