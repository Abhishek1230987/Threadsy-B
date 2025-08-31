import express from 'express';


import {
  addProduct,
  listProducts,
  getSingleProduct,
  updateProduct,
  removeProduct
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// Route: /api/products/add
productRouter.post('/add', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]),
  addProduct
);

// Route: /api/products/list
productRouter.get('/list', listProducts);

// Route: /api/products/update
productRouter.put('/update', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]), updateProduct);

// Route: /api/products/single
productRouter.post('/single', getSingleProduct);

// Route: /api/products/remove
productRouter.post('/remove', adminAuth, removeProduct);

export default productRouter;
