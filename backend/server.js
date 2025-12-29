// backend/server.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;
const SECRET_KEY = "my_super_secret_key_for_placement_project"; // In real app, put in .env

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE: Check Logic  ---
// Verifies the user is logged in and attaches their Org ID to the request
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Attach user info (including orgId) to request
    next();
  });
};

// --- ROUTES ---

// 1. AUTH: Signup [cite: 20]
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, organizationName } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create Org AND User in one transaction [cite: 28]
    const result = await prisma.$transaction(async (prisma) => {
      const org = await prisma.organization.create({
        data: { name: organizationName }
      });
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          organizationId: org.id
        }
      });
      return { user, org };
    });

    res.json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: "Email already exists or error creating account" });
  }
});

// 2. AUTH: Login [cite: 25]
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    // We store the Organization ID in the token for easy scoping later
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId }, 
      SECRET_KEY, 
      { expiresIn: '1h' }
    );
    res.json({ token, organizationId: user.organizationId });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// 3. DASHBOARD: Stats [cite: 63]
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  const { organizationId } = req.user;

  // Get total products
  const totalProducts = await prisma.product.count({
    where: { organizationId }
  });

  // Get total quantity [cite: 67]
  const inventorySum = await prisma.product.aggregate({
    where: { organizationId },
    _sum: { quantity: true }
  });

  // Get low stock items [cite: 69]
  // Logic: Quantity <= Threshold
  const lowStockItems = await prisma.product.findMany({
    where: {
      organizationId,
      quantity: { lte: prisma.product.fields.lowStockThreshold } // Dynamic comparison
    }
  });

  res.json({
    totalProducts,
    totalStock: inventorySum._sum.quantity || 0,
    lowStockItems
  });
});

// 4. PRODUCTS: Create [cite: 46]
app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, sku, quantity, price, lowStockThreshold } = req.body;
  const { organizationId } = req.user;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        lowStockThreshold: parseInt(lowStockThreshold || 5), // Default to 5 if empty [cite: 80]
        organizationId
      }
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Error creating product (SKU might be duplicate)" });
  }
});

// 5. PRODUCTS: Read List [cite: 48]
app.get('/api/products', authenticateToken, async (req, res) => {
  const { organizationId } = req.user;
  const products = await prisma.product.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(products);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});