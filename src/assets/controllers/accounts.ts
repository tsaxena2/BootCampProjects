import { Request, Response } from 'express';

import { v4 as uuidv4 } from 'uuid';

import { Deposit, Purchases, products } from './purchasingproducts';
// eslint-disable-next-line import/no-cycle, @typescript-eslint/no-redeclare
import productdetails from './products';

interface Account {
  id: string;
  name: string;
  balance: number;
  DepositDetails?: Deposit[];
  purchaseDetails?: Purchases[];
}

interface RegisterDepositResponse {
  id: string;
  name: string;
  balance: number;
}

const Accounts: Account[] = [];

const createAccount = (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { name } = req.body;
    const balance = 0;
    Accounts.push({ id, name, balance });
    return res.status(201).json({ id, name, balance });
  } catch (error) {
    return res.status(500).json('Something went wrong');
  }
};

const getAllAccounts = (req: Request, res: Response) =>
  res.status(200).json(Accounts);

const getAccount = (req: Request, res: Response) => {
  try {
    const getAccountdtl = Accounts.filter(
      (Account) => Account.id === req.params.accountId
    );
    if (getAccountdtl.length === 0) {
      res.status(404).send('None');
    } else {
      res.status(200).json(getAccountdtl);
    }
  } catch (error) {
    res.status(500).json('Something went wrong');
  }
};

// Validating the input request for register deposit
const validateInputdeposit = (req: Request) => {
  const findaccount = Accounts.find(
    (account) => account.id === req.params.accountId
  );
  if (
    Math.sign(req.body.amount) === 1 &&
    Math.sign(Number(req.headers['simulated-day'])) === 1 &&
    findaccount !== undefined
  ) {
    return true;
  }
  return false;
};

const registerDeposit = (req: Request, res: Response) => {
  try {
    if (!validateInputdeposit(req)) {
      return res.status(400).send('None');
    }
    const { accountId } = req.params;
    const { amount } = req.body;
    const id: string = uuidv4();
    const SimulatedDayDeposit = Number(req.headers['simulated-day']);
    const depositdate: Date = new Date();
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const account = Accounts.find((account) => account.id === accountId);
    if (account.DepositDetails === undefined) {
      account.DepositDetails = [];
    }

    const depositDetails: Deposit = {
      id,
      amount,
      SimulatedDayDeposit,
      depositdate,
    };
    account.DepositDetails.push(depositDetails);
    const registerDepositRes: RegisterDepositResponse = {
      id,
      name: account.name,
      balance: account.balance,
    };

    return res.status(201).json(registerDepositRes);
  } catch (error) {
    return res.status(500).json('Something went wrong');
  }
};

const validateStock = (productid: string, simmulationDay: number): boolean => {
  const soldstock = productdetails.getSoldProductCount(
    productid,
    simmulationDay
  );
  const productStock = products.find(
    (product) => product.id === productid
  ).stock;
  if (productStock - soldstock > 0) {
    return true;
  }
  return false;
};

const validateFunds = (
  accountId: string,
  simmulationDay: number,
  productId: string
): boolean => {
  const account = Accounts.find((Account) => Account.id === accountId);
  const depositbalanceonPurchaseDay = account.DepositDetails.reduce(
    (total, depostdtl) => {
      if (depostdtl.SimulatedDayDeposit + 1 <= simmulationDay) {
        return total + depostdtl.amount;
      }
      return account.balance;
    },
    0
  );
  let amountPurchased = 0;
  if (account.purchaseDetails !== undefined) {
    amountPurchased = account.purchaseDetails.reduce(
      (total, purchasedtl) =>
        total +
        products.find((product) => product.id === purchasedtl.productId).price,
      0
    );
  }

  const productPrice = products.find(
    (product) => product.id === productId
  ).price;
  if (productPrice <= depositbalanceonPurchaseDay - amountPurchased) {
    return true;
  }
  return false;
};

// Legal Purchase check
const checkLegalPurchase = (
  accountId: string,
  simmulatiedDay: number
): boolean => {
  const account = Accounts.find((Account) => Account.id === accountId);
  if (account.purchaseDetails === undefined) {
    return true;
  }
  // sorting purchase details based on time
  let purchaseDtls = account.purchaseDetails;
  purchaseDtls = purchaseDtls.sort(
    (a: Purchases, b: Purchases) =>
      b.SimulatedDayPurchase - a.SimulatedDayPurchase
  );
  if (purchaseDtls[0].SimulatedDayPurchase < simmulatiedDay) {
    return true;
  }
  return false;
};
const validateInputPurchase = (req: Request): number => {
  let statuscode = 200;
  const purchaseproduct = products.find(
    (product) => product.id === req.body.productId
  );
  const purchaseproductId = purchaseproduct.id;
  const purchaseSimulationDay = Number(req.headers['simulated-day']);
  const findaccount = Accounts.find(
    (account) => account.id === req.params.accountId
  );
  // Validate Input
  if (
    // eslint-disable-next-line eqeqeq
    Math.sign(purchaseSimulationDay) != 1 ||
    findaccount === undefined ||
    purchaseproductId === undefined
  ) {
    statuscode = 400;
    return statuscode;
  }
  if (validateStock(purchaseproduct.id, purchaseSimulationDay) === false) {
    statuscode = 409;
    return statuscode;
  }

  if (
    validateFunds(findaccount.id, purchaseSimulationDay, purchaseproduct.id) ===
    false
  ) {
    statuscode = 409;
    return statuscode;
  }
  if (checkLegalPurchase(findaccount.id, purchaseSimulationDay) === false) {
    statuscode = 400;
    return statuscode;
  }
  return statuscode;
};

const registerPurchase = (req: Request, res: Response) => {
  try {
    const validatePurchase = validateInputPurchase(req);
    if (validatePurchase !== 200) {
      return res.status(validatePurchase).send('None');
    }
    const account = Accounts.find(
      (indaccount) => indaccount.id === req.params.accountId
    );
    const { productId } = req.body;
    const SimulatedDayPurchase: Purchases['SimulatedDayPurchase'] = Number(
      req.headers['simulated-day']
    );

    if (account.purchaseDetails === undefined) {
      account.purchaseDetails = [];
    }

    const purchaseDetails: Purchases = {
      productId,
      SimulatedDayPurchase,
    };
    account.purchaseDetails.push(purchaseDetails);

    return res.status(201).send('Success');
  } catch (error) {
    return res.status(500).json('Something went wrong');
  }
};

export default {
  createAccount,
  getAccount,
  getAllAccounts,
  registerDeposit,
  registerPurchase,
  Accounts,
};
