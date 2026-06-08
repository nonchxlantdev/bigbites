import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const menuPath = path.join(dataDir, 'menu.json');
const ordersPath = path.join(dataDir, 'orders.json');

const app = express();
const PORT = process.env.PORT || 3001;
const STATUSES = ['New Order', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];

app.use(cors());
app.use(express.json());

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJson(filePath, fallback);
      return fallback;
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function orderNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(2, 10).replaceAll('-', '');
  return `BB-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

app.get('/api/menu', async (_req, res) => {
  const menu = await readJson(menuPath, []);
  res.json(menu.filter((item) => item.enabled !== false));
});

app.get('/api/admin/menu', async (_req, res) => {
  res.json(await readJson(menuPath, []));
});

app.post('/api/admin/menu', async (req, res) => {
  const menu = await readJson(menuPath, []);
  const item = {
    id: `item-${Date.now()}`,
    category: req.body.category,
    name: req.body.name,
    price: Number(req.body.price || 0),
    description: req.body.description || '',
    enabled: req.body.enabled !== false
  };
  menu.push(item);
  await writeJson(menuPath, menu);
  res.status(201).json(item);
});

app.put('/api/admin/menu/:id', async (req, res) => {
  const menu = await readJson(menuPath, []);
  const index = menu.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Menu item not found' });
  menu[index] = { ...menu[index], ...req.body, price: Number(req.body.price ?? menu[index].price) };
  await writeJson(menuPath, menu);
  res.json(menu[index]);
});

app.delete('/api/admin/menu/:id', async (req, res) => {
  const menu = await readJson(menuPath, []);
  const nextMenu = menu.filter((item) => item.id !== req.params.id);
  await writeJson(menuPath, nextMenu);
  res.json({ ok: true });
});

app.post('/api/orders', async (req, res) => {
  const orders = await readJson(ordersPath, []);
  const menu = await readJson(menuPath, []);
  const items = (req.body.items || []).map((cartItem) => {
    const menuItem = menu.find((item) => item.id === cartItem.id);
    return {
      id: cartItem.id,
      name: menuItem?.name || cartItem.name,
      price: Number(menuItem?.price || cartItem.price || 0),
      quantity: Number(cartItem.quantity || 1)
    };
  });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: `order-${Date.now()}`,
    orderNumber: orderNumber(),
    customerName: req.body.customerName,
    phone: req.body.phone,
    pickupTime: req.body.pickupTime,
    notes: req.body.notes || '',
    items,
    subtotal: total,
    total,
    status: 'New Order',
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  await writeJson(ordersPath, orders);
  res.status(201).json(order);
});

app.get('/api/admin/orders', async (_req, res) => {
  const orders = await readJson(ordersPath, []);
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  if (!STATUSES.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const orders = await readJson(ordersPath, []);
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  await writeJson(ordersPath, orders);
  res.json(order);
});

app.post('/api/admin/login', (req, res) => {
  if (req.body.username === 'owner' && req.body.password === 'bigbite123') {
    return res.json({ token: 'demo-owner-token', owner: 'Big Bite Owner' });
  }
  res.status(401).json({ message: 'Invalid login' });
});

app.listen(PORT, () => {
  console.log(`Big Bite API running on http://localhost:${PORT}`);
});
