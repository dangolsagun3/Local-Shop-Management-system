// server.js - single-file Local Shop Management System

// --- required packages ---------------------------------------------------
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

// --- app configuration ---------------------------------------------------
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'local-shop-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// --- mongo connection ----------------------------------------------------
mongoose
  .connect('mongodb://127.0.0.1:27017/localshop', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error', err));

// --- schemas & models ----------------------------------------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
});
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
});
const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  totalAmount: Number,
  date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Sale = mongoose.model('Sale', saleSchema);

// --- middleware ----------------------------------------------------------
function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// --- routes --------------------------------------------------------------
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/login');
});

// login page
app.get('/login', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login - Local Shop</title>
  <style>
    body{font-family:sans-serif;background:#f4f6f8;margin:0;padding:0}
    .container{max-width:400px;margin:80px auto;padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    h2{text-align:center;margin-bottom:20px}
    input{width:100%;padding:10px;margin:8px 0;border:1px solid #ccc;border-radius:4px}
    button{width:100%;padding:10px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer}
    button:hover{background:#0056b3}
    a{color:#007bff;text-decoration:none}
    #error{color:red;margin-top:10px;text-align:center}
  </style>
</head>
<body>
  <div class="container">
    <h2>Login</h2>
    <form method="POST" action="/login" id="login-form">
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p style="text-align:center">Don't have an account? <a href="/register">Register</a></p>
    <div id="error"></div>
  </div>
  <script>
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new URLSearchParams(new FormData(form));
      const resp = await fetch('/login', {
        method: 'POST',
        body: data,
      });
      if (resp.redirected) {
        window.location = resp.url;
      } else {
        const text = await resp.text();
        document.getElementById('error').innerText = text;
      }
    });
  </script>
</body>
</html>`);
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid credentials');
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Invalid credentials');
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// registration page
app.get('/register', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Register - Local Shop</title>
  <style>
    body{font-family:sans-serif;background:#f4f6f8;margin:0;padding:0}
    .container{max-width:400px;margin:80px auto;padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    h2{text-align:center;margin-bottom:20px}
    input{width:100%;padding:10px;margin:8px 0;border:1px solid #ccc;border-radius:4px}
    button{width:100%;padding:10px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer}
    button:hover{background:#218838}
    a{color:#007bff;text-decoration:none}
    #error{color:red;margin-top:10px;text-align:center}
  </style>
</head>
<body>
  <div class="container">
    <h2>Register</h2>
    <form method="POST" action="/register" id="reg-form">
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p style="text-align:center">Already have an account? <a href="/login">Login</a></p>
    <div id="error"></div>
  </div>
  <script>
    const form = document.getElementById('reg-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new URLSearchParams(new FormData(form));
      const resp = await fetch('/register', {
        method: 'POST',
        body: data,
      });
      if (resp.redirected) {
        window.location = resp.url;
      } else {
        const text = await resp.text();
        document.getElementById('error').innerText = text;
      }
    });
  </script>
</body>
</html>`);
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    await user.save();
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).send('Email already exists');
    }
    res.status(500).send('Server error');
  }
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// main application page (dashboard + product/sales SPA)
app.get('/dashboard', ensureLoggedIn, (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dashboard - Local Shop</title>
  <style>
    body{margin:0;font-family:sans-serif;background:#f4f6f8}
    #wrapper{display:flex;min-height:100vh}
    #sidebar{width:220px;background:#343a40;color:#fff;flex-shrink:0}
    #sidebar h2{padding:20px;margin:0;font-size:1.5em;text-align:center;border-bottom:1px solid #495057}
    #sidebar nav ul{list-style:none;padding:0;margin:0}
    #sidebar nav li{border-bottom:1px solid #495057}
    #sidebar nav a{display:block;color:#adb5bd;padding:15px 20px;text-decoration:none}
    #sidebar nav a:hover,#sidebar nav a.active{background:#495057;color:#fff}
    #content{flex-grow:1;padding:20px}
    .view{display:none}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{border:1px solid #dee2e6;padding:8px;text-align:left}
    th{background:#e9ecef}
    input,select{padding:8px;margin:4px 0;border:1px solid #ccc;border-radius:4px;width:100%}
    button{padding:8px 12px;border:none;border-radius:4px;background:#007bff;color:#fff;cursor:pointer}
    button:hover{background:#0056b3}
    #message{color:red}
  </style>
</head>
<body>
  <div id="wrapper">
    <aside id="sidebar">
      <h2>Local Shop</h2>
      <nav>
        <ul>
          <li><a href="#" id="nav-dashboard" class="active">Dashboard</a></li>
          <li><a href="#" id="nav-products">Products</a></li>
          <li><a href="#" id="nav-sales">Sales</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
    </aside>
    <main id="content">
      <!-- dashboard view -->
      <div id="view-dashboard" class="view" style="display:block;">
        <h2>Welcome, <span id="username"></span></h2>
        <p>Total products: <span id="total-products">0</span></p>
        <p>Total sales amount: $<span id="total-sales">0</span></p>
      </div>
      <!-- products view -->
      <div id="view-products" class="view">
        <h2>Products</h2>
        <div id="message"></div>
        <form id="product-form">
          <input type="hidden" id="prod-id" />
          <input id="prod-name" placeholder="Name" required />
          <input id="prod-price" type="number" step="0.01" placeholder="Price" required />
          <input id="prod-qty" type="number" placeholder="Quantity" required />
          <button type="submit">Save</button>
        </form>
        <table id="product-table">
          <thead>
            <tr><th>Name</th><th>Price</th><th>Quantity</th><th>Actions</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <!-- sales view -->
      <div id="view-sales" class="view">
        <h2>Sales</h2>
        <div id="sale-msg"></div>
        <form id="sale-form">
          <select id="sale-product" required></select>
          <input id="sale-qty" type="number" min="1" placeholder="Quantity" required />
          <button type="submit">Create Sale</button>
        </form>
        <table id="sale-table">
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Total</th><th>Date</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </main>
  </div>
  <script>
    // navigation
    const navLinks = document.querySelectorAll('#sidebar nav a');
    const views = document.querySelectorAll('.view');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        views.forEach(v=>v.style.display='none');
        if (link.id === 'nav-dashboard') showDashboard();
        if (link.id === 'nav-products') showProducts();
        if (link.id === 'nav-sales') showSales();
      });
    });

    async function showDashboard() {
      document.getElementById('view-dashboard').style.display = 'block';
      const resp = await fetch('/api/dashboard');
      const data = await resp.json();
      document.getElementById('username').innerText = data.username;
      document.getElementById('total-products').innerText = data.totalProducts;
      document.getElementById('total-sales').innerText = data.totalSales.toFixed(2);
    }

    async function fetchProducts() {
      const resp = await fetch('/api/products');
      return resp.json();
    }

    async function showProducts() {
      document.getElementById('view-products').style.display = 'block';
      const products = await fetchProducts();
      const tbody = document.querySelector('#product-table tbody');
      tbody.innerHTML = '';
      products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.name}</td><td>${p.price.toFixed(2)}</td><td>${p.quantity}</td><td><button onclick="editProduct('${p._id}')">Edit</button> <button onclick="deleteProduct('${p._id}')">Delete</button></td>`;
        tbody.appendChild(tr);
      });
    }

    async function editProduct(id) {
      const prod = (await fetch('/api/products')).find(p=>p._id===id);
      document.getElementById('prod-id').value = prod._id;
      document.getElementById('prod-name').value = prod.name;
      document.getElementById('prod-price').value = prod.price;
      document.getElementById('prod-qty').value = prod.quantity;
    }

    async function deleteProduct(id) {
      await fetch('/api/products/' + id, { method: 'DELETE' });
      showProducts();
    }

    document.getElementById('product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('prod-id').value;
      const name = document.getElementById('prod-name').value;
      const price = parseFloat(document.getElementById('prod-price').value);
      const quantity = parseInt(document.getElementById('prod-qty').value,10);
      const body = JSON.stringify({ name, price, quantity });
      if (id) {
        await fetch('/api/products/' + id, { method: 'PUT', headers:{'Content-Type':'application/json'}, body });
      } else {
        await fetch('/api/products', { method: 'POST', headers:{'Content-Type':'application/json'}, body });
      }
      document.getElementById('product-form').reset();
      showProducts();
    });

    async function showSales() {
      document.getElementById('view-sales').style.display = 'block';
      const products = await fetchProducts();
      const sel = document.getElementById('sale-product');
      sel.innerHTML = '';
      products.forEach(p=>{
        const opt = document.createElement('option');
        opt.value = p._id;
        opt.text = p.name + ' ($' + p.price.toFixed(2) + ', stock:' + p.quantity + ')';
        sel.appendChild(opt);
      });
      const sales = await fetch('/api/sales').then(r=>r.json());
      const tbody = document.querySelector('#sale-table tbody');
      tbody.innerHTML = '';
      sales.forEach(s=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.productId.name}</td><td>${s.quantity}</td><td>$${s.totalAmount.toFixed(2)}</td><td>${new Date(s.date).toLocaleString()}</td>`;
        tbody.appendChild(tr);
      });
    }

    document.getElementById('sale-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const productId = document.getElementById('sale-product').value;
      const quantity = parseInt(document.getElementById('sale-qty').value,10);
      const resp = await fetch('/api/sales', {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ productId, quantity }),
      });
      const result = await resp.json();
      if (result.error) {
        document.getElementById('sale-msg').innerText = result.error;
      } else {
        document.getElementById('sale-form').reset();
        showSales();
      }
    });

    // initialize
    showDashboard();
  </script>
</body>
</html>`);
});

// API endpoints ----------------------------------------------------------
app.get('/api/dashboard', ensureLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const totalProducts = await Product.countDocuments();
    const agg = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = agg[0] ? agg[0].total : 0;
    res.json({ username: user.name, totalProducts, totalSales });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products', ensureLoggedIn, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', ensureLoggedIn, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    const prod = new Product({ name, price, quantity });
    await prod.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/products/:id', ensureLoggedIn, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { name, price, quantity });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/products/:id', ensureLoggedIn, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/sales', ensureLoggedIn, async (req, res) => {
  try {
    const sales = await Sale.find().populate('productId');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/sales', ensureLoggedIn, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const prod = await Product.findById(productId);
    if (!prod) return res.status(400).json({ error: 'Product not found' });
    if (prod.quantity < quantity)
      return res.status(400).json({ error: 'Not enough stock' });
    prod.quantity -= quantity;
    await prod.save();
    const totalAmount = prod.price * quantity;
    const sale = new Sale({ productId, quantity, totalAmount });
    await sale.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// start server -----------------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
