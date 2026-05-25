const express = require('express');

const router = express.Router();

const upload = require('../middleware/uploadMiddleware');

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getVendorProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
  uploadProductImage,
  uploadProductImages
} = require('../controllers/productController');

const {
  protect,
  authorizeRoles
} = require('../middleware/authMiddleware');


// GET ALL PRODUCTS
router.get('/', getAllProducts);


// SEARCH PRODUCTS
router.get('/search', searchProducts);


// GET VENDOR PRODUCTS
router.get(
  '/vendor',
  protect,
  authorizeRoles('vendor'),
  getVendorProducts
);


// GET SINGLE PRODUCT BY ID
router.get('/:id', getSingleProduct);


// CREATE PRODUCT
router.post(
  '/create',
  protect,
  authorizeRoles('vendor'),
  createProduct
);


// UPDATE PRODUCT
router.put(
  '/:id',
  protect,
  authorizeRoles('vendor'),
  updateProduct
);


// DELETE PRODUCT
router.delete(
  '/:id',
  protect,
  authorizeRoles('vendor'),
  deleteProduct
);


// UPLOAD PRODUCT IMAGE
router.post(
  '/upload-image',
  protect,
  authorizeRoles('vendor'),
  upload.single('image'),
  uploadProductImage
);

// UPLOAD MULTIPLE PRODUCT IMAGES (Max 5)
router.post(
  '/upload-images',
  protect,
  authorizeRoles('vendor'),
  upload.array('images', 5),
  uploadProductImages
);

module.exports = router;