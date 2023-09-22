/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-syntax */
import { Request, Response } from 'express';

// eslint-disable-next-line import/no-extraneous-dependencies
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
};

const getSoldProductCount = (
  productId: string,
  simulationDay: number
): number => {
  let numberofproductSold = 0;
  if (Accounts.Accounts.length > 0) {
    for (const account of Accounts.Accounts) {
      if (account.purchaseDetails !== undefined) {
        for (const purchase of account.purchaseDetails) {
          if (
            purchase.productId === productId &&
            purchase.SimulatedDayPurchase < simulationDay
          ) {
            numberofproductSold += 1;
          }
        }
      }
    }
  }
  return numberofproductSold;
};

const getAllProducts = (req: Request, res: Response) => {
  let productscopy = [];
  productscopy = JSON.parse(JSON.stringify(products));
  // Check if any purchase happened
  // eslint-disable-next-line no-restricted-syntax
  for (const productcopy of productscopy) {
    const numberofSoldStocks = getSoldProductCount(
      productcopy.id,
      Number(req.headers['simulated-day'])
    );

    if (numberofSoldStocks > 0) {
      productscopy.forEach((indproduct) => {
        if (productcopy.id === indproduct.id) {
          productcopy.stock -= numberofSoldStocks;
        }
      });
    }
  }
  res.status(201).json(productscopy);
};

const getproductById = (req: Request, res: Response) => {
  let productscopy = [];
  productscopy = JSON.parse(JSON.stringify(products));
  const { productId } = req.params;
  const productdtls = productscopy.filter(
    (product) => product.id === productId
  );
  if (productdtls.length === 0) {
    res.status(404).send('None');
  } else {
    for (const product of productdtls) {
      const numberofSoldStocks = getSoldProductCount(
        product.id,
        Number(req.headers['simulated-day'])
      );

      if (numberofSoldStocks > 0) {
        productdtls.forEach((indproduct) => {
          if (product.id === indproduct.id) {
            product.stock -= numberofSoldStocks;
          }
        });
      }
    }
  }
  const updatedproduct = productdtls.find(
    (product) => product.id === productId
  );
  res.status(200).json(updatedproduct);
};

export default {
  addProducts,
  getAllProducts,
  getproductById,
  getSoldProductCount,
};
