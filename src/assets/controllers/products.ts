import { Request, Response } from 'express';

import { v4 as uuidv4 } from 'uuid';

import { products } from './purchasingproducts';
import Accounts from './accounts';

export interface Product {
  id: string;
  title: string;
  description: string;
  stock: number;
  price: number;
}
const addProducts = (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { title } = req.body;
    const { description } = req.body;
    const { price } = req.body;
    const { stock } = req.body;
    const productDetails: Product = {
      id,
      title,
      description,
      price,
      stock,
    };
    products.push(productDetails);
    res.status(201).json(productDetails);
  } catch (error) {
    res.status(500).json('Something went wrong');
  }
};

const getAllProducts = (req: Request, res: Response) => {
  try {
    let productscopy = [];
    productscopy = JSON.parse(JSON.stringify(products));
    // Check if any purchase happened
    productscopy.forEach((productcopy) => {
      const numberofSoldStocks = Accounts.getSoldProductCount(
        productcopy.id,
        Number(req.headers['simulated-day'])
      );
      const productdtls = productcopy;
      if (numberofSoldStocks > 0) {
        productdtls.stock -= numberofSoldStocks;
      }
    });
    res.status(201).json(productscopy);
  } catch (error) {
    res.status(500).json('Something went wrong');
  }
};

const getproductById = (req: Request, res: Response) => {
  try {
    let productscopy = [];
    productscopy = JSON.parse(JSON.stringify(products));
    const { productId } = req.params;
    const productdtls = productscopy.find(
      (product) => product.id === productId
    );
    if (productdtls === undefined) {
      res.status(404).send('None');
    } else {
      const numberofSoldStocks = Accounts.getSoldProductCount(
        productdtls.id,
        Number(req.headers['simulated-day'])
      );
      if (numberofSoldStocks > 0) {
        productdtls.stock -= numberofSoldStocks;
      }
    }

    res.status(200).json(productdtls);
  } catch (error) {
    res.status(500).json('Something went wrong');
  }
};

export default {
  addProducts,
  getAllProducts,
  getproductById,
};
