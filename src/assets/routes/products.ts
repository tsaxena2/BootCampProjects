import express from 'express';
import controllers from '../controllers/products';

const router = express.Router();
export = router;

router.post('/products', controllers.addProducts);
router.get('/products', controllers.getAllProducts);
router.get('/products/:productId', controllers.getproductById);
