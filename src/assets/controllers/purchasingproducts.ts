export const products = [
  {
    id: 'solar',
    title: 'Solar Panel',
    description: 'Super duper Essent solar panel',
    stock: 10,
    price: 750,
  },
  {
    id: 'insulation',
    title: 'Insulation',
    description: 'Cavity wall insulation',
    stock: 10,
    price: 2500,
  },
  {
    id: 'heatpump',
    title: 'Awesome Heatpump',
    description: 'Hybrid heat pump',
    stock: 3,
    price: 5000,
  },
];
export type SimulatedDay = number;

export interface Deposit {
  id: string;
  amount: number;
  SimulatedDayDeposit: SimulatedDay;
  depositdate: Date;
}

export interface Purchases {
  productId: string;
  SimulatedDayPurchase: SimulatedDay;
}
