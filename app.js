const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorsController = require('./controllers/error');
const sequelize = require('./util/database');
const utility = require('./util/utility');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const Order = require('./models/order');
const OrderItem = require('./models/orderItems');

const adminRouts = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRootes = require('./routes/auth');

const csrfProtection = csrf();
const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        callback(null, utility.createGuid().substr(0, 16) + '-' + file.originalname);
    }
});
const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        callback(null, true);
    }
    else {
        callback(null, false);
    }
}
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('file'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: 'my secret', resave: true, saveUninitialized: true, cookie: {
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000
    }
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session || !req.session.user) {
        res.locals.cartQuantity = 0;
        return next();
    }
    User.findOne({ where: { userId: req.session.user.userId }, include: Cart })
        .then(user => {
            if (!user) {
                req.user = null;
                res.locals.cartQuantity = 0;
                res.locals.isAdmin = null;
                return next();
            }
            req.user = user;
            res.locals.isAdmin = req.user.isAdmin;
            if (user.cart) {
                user.cart.getCartItems().then(cartItems => {
                    res.locals.cartQuantity = cartItems.length;
                    next();
                });
            }
            else {
                res.locals.cartQuantity = 0;
                next();
            }
        })
        .catch(err => console.log(err))
});
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use('/admin', adminRouts);
app.use(shopRoutes);
app.use(authRootes);
app.use('/500', errorsController.getError500);
app.use(errorsController.getError404);
app.use((error, req, res, next) => {
    res.redirect('/500');
    // return next();
});

app.set('view engine', 'ejs');
app.set('views', 'views');

// ONE TO MANY RELATIONSHIP
Product.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, constraints: true, onDelete: 'CASCADE' }); //OR
User.hasMany(Product, { foreignKey: { name: 'userId', allowNull: false }, constraints: true, onDelete: 'CASCADE' });

User.hasMany(Order, { foreignKey: { name: 'userId', allowNull: false }, constraints: true, onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, constraints: true, onDelete: 'CASCADE' });

Order.hasMany(OrderItem, { foreignKey: { name: 'orderId', allowNull: false }, constraints: true, onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: { name: 'orderId', allowNull: false }, constraints: true, onDelete: 'CASCADE' });

// ONE TO ONE RELATIONSHIP
User.hasOne(Cart, { foreignKey: { name: 'userId', allowNull: false } });

// MANY TO MANY RELATIONSHIP
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });

// ONE TO MANY RELATIONSHIP => MANY TO MANY RELATIONSHIP
CartItem.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false }, constraints: true });
Product.hasMany(CartItem, { foreignKey: { name: 'productId', allowNull: false }, constraints: true });

CartItem.belongsTo(Cart, { foreignKey: { name: 'cartId', allowNull: false }, constraints: true, onDelete: 'CASCADE' });
Cart.hasMany(CartItem, { foreignKey: { name: 'cartId', allowNull: false }, constraints: true, onDelete: 'CASCADE' });

sequelize
    // .sync()
    .authenticate()
    // .sync({ force: true })
    .then(result => {
        return User.findOne({ where: { userEmail: 'mostafa.zj@gmail.com' } });
        // console.log(result);
    }).then(user => {
        if (!user) {
            return bcrypt.hash('123456', 6)
                .then(hashedPass => {
                    return User.create({
                        userName: 'mostafa',
                        userEmail: 'mostafa.zj@gmail.com',
                        userPassword: hashedPass,
                        isAdmin: true,
                    })
                })
            // .then(user => {
            //     app.listen(process.env.PORT || 3000);
            // })
        }
        return Promise.resolve(user);
    }).then(result => {
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log(err));

