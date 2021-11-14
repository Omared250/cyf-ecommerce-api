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

    const getOrdersInfoByCustomerId = async (req, res) => {
        const customerId = req.params.customerId;

        const query = `select o.order_reference, o.order_date, p.product_name, p.unit_price, s.supplier_name,
        oi.quantity 
        from orders o 
        inner join order_items oi on oi.order_id=o.id
        inner join products p on p.id=oi.product_id 
        inner join suppliers s on s.id=p.supplier_id
        where o.customer_id=$1;`;

        const result = await connection.query(query, [customerId]);
        return await res.status(200).json(result.rows);
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
            return res.json({rules : ['The order needs a date', 'The order needs a reference']})
        }

        const newOrder = `insert into orders (order_date, order_reference, customer_id) 
        values ($1, $2, $3) returning id`
        const result = await connection.query(newOrder, [orderBody.order_date, orderBody.order_reference, customerId]);
        const response = {orderId : result.rows[0].id};
        return await res.json(response); 
    }

    const customerIsOk = (customer) => {
        return customer.name === '' || customer.address === '' || customer.city === '' || customer.country === '';
    }

    const updateCustomer = async (req, res) => {
        const customerId = req.params.customerId;
        const customerBody = req.body;

        const customerExists = await connection.query('select * from customers where id=$1', [customerId]);
        if (customerExists.rows.length === 0) {
            return res.status(400).json({message : "The customer does not exists!!!"});
        }

        if (customerIsOk(customerBody)) {
            return res.status(400).json({rules : ['The customer need a name', 'The customer need a address', 'The customer needs a city', 'The customer needs a country']})
        }

        const result = await connection.query(`update customers set name=$1, address=$2, 
        city=$3, country=$4 where id=$5 returning id`, [customerBody.name, customerBody.address, customerBody.city, customerBody.country, customerId]);

        return await res.json({
            "customer_id" : result.rows[0].id,
            "name" : customerBody.name,
            "address" : customerBody.address,
            "city" : customerBody.city,
            "country" : customerBody.country
        });
    }

    const orderIdIsOk = async (orderId) => {
        const result = await connection.query('select * from orders where id=$1', [orderId]);
        return result.rows.length > 0 && Number.isInteger(orderId) && orderId > 0;
    }

    const deleteOrder = async (req, res) => {
        const orderId = req.params.orderId;


        if (!orderIdIsOk(orderId)) {
            return res.status(400).json({message : "The order Id is not valid!!"})
        }

        const deleteOrderItem = 'delete from order_items where order_id=$1';
        await connection.query(deleteOrderItem, [orderId])

        const deleteOrder = 'delete from orders where id=$1';
        await connection.query(deleteOrder, [orderId]);

        res.status(200).json({message : "The order and the order item have been deleted!!!"})
    }

    const deleteCustomer = async (req, res) => {
        const customerId = req.params.customerId;
        
        const orderQuery = `select * from orders where customer_id=$1`;
        const getOrder = await connection.query(orderQuery, [customerId]);

        if (!getOrder) {
            return res.status(400).json({message : "The customer cannot be deleted!!"})
        } else {
            await connection.query(`delete from customers where id=$1`, [customerId]);
            return await res.send("The customer have been deleted");
        }
    }
    
    return {
        getAllCustomers,
        getCustomerById,
        getAllSuppliers,
        getAllproducts,
        getOrdersInfoByCustomerId,
        addNewCustomer,
        addNewProduct,
        addNewOrder,
        updateCustomer,
        deleteOrder,
        deleteCustomer
    }
}

module.exports = api;