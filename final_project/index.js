const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true, 
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the authorization header is present
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access, token missing" });
    }

    // Verify the token
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized access, invalid token" });
        }

        // Attach the decoded token to the request for use in other routes
        req.user = decoded;
        next(); // User is authenticated, proceed to the next middleware or route handler
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
