import express, { Express } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import bodyParser from 'body-parser';
import routesaccount from './assets/routes/accounts';
import routesproduct from './assets/routes/products';

const router: Express = express();
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
/** Routes */
app.use('/', routesaccount);
app.use('/', routesproduct);

app.get('/', (req, res) => {
  res.send({ message: 'welcome' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
