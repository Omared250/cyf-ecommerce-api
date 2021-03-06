const express = require('express');
const app = express();

const apiFunction = require('./api.js');
const api = apiFunction();

app.use(express.json());
app.get("/customers", api.getAllCustomers);
app.get("/customers/:customerId", api.getCustomerById);
app.get("/suppliers", api.getAllSuppliers);
app.get("/products/", api.getAllproducts);
app.get("/customers/:customerId/orders", api.getOrdersInfoByCustomerId);
app.post("/customers", api.addNewCustomer);
app.post("/products", api.addNewProduct);
app.post("/customers/:customerId/orders", api.addNewOrder);
app.put("/customers/:customerId", api.updateCustomer);
app.delete("/orders/:orderId", api.deleteOrder);
app.delete("/customers/:customerId", api.deleteCustomer);

const port = 4000;
app.listen(port, () => {
    console.log(`app listening on port: ${port}`);
});