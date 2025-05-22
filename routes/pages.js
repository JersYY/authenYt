const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth');
const mysql = require('mysql');
const productController = require('../controllers/product');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});


// Apply middleware to retrieve user for all routes
router.use(authMiddleware.getUser);

router.get('/', authMiddleware.getUser, (req, res) => {
    db.query('SELECT * FROM products', (err, products) => {
        if (err) return res.render('index', { products: [] });

        if (!req.user) {
            // User belum login, tidak kirim wishlist id
            return res.render('index', { products, wishlistProductIds: [] });
        }

        const userId = req.user.id;

        db.query('SELECT product_id FROM wishlist WHERE user_id = ?', [userId], (err2, wishlistRows) => {
            if (err2) {
                return res.render('index', { products, wishlistProductIds: [] });
            }

            const wishlistProductIds = wishlistRows.map(row => row.product_id);
            res.render('index', { products, wishlistProductIds });
        });
    });
});
router.get('/allProduk', authMiddleware.getUser, (req, res) => {
  db.query('SELECT * FROM products', (err, products) => {
    if (err) return res.render('allProduk', { products: [] });

    if (!req.user) {
      return res.render('allProduk', { products, wishlistProductIds: [] });
    }

    const userId = req.user.id;

    db.query('SELECT product_id FROM wishlist WHERE user_id = ?', [userId], (err2, wishlistRows) => {
      if (err2) return res.render('allProduk', { products, wishlistProductIds: [] });

      const wishlistProductIds = wishlistRows.map(row => row.product_id);
      res.render('allProduk', { products, wishlistProductIds });
    });
  });
});


router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});
/*
// Protected route - only accessible when logged in
router.get('/dashboard', authMiddleware.isLoggedIn, (req, res) => {
    res.render('dashboard');
});
*/
router.get('/dashboard', authMiddleware.protect, authController.getWishlist);
router.post('/api/wishlist/toggle', authMiddleware.protect, productController.toggleWishlist);

module.exports = router;