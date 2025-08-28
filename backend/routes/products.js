const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../config/multer');

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Admin routes
router.post('/', auth, admin, upload.array('images', 5), createProduct);
router.put('/:id', auth, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', auth, admin, deleteProduct);
router.post('/categories', auth, admin, upload.single('image'), createCategory);
router.put('/categories/:id', auth, admin, upload.single('image'), updateCategory);
router.delete('/categories/:id', auth, admin, deleteCategory);

module.exports = router;