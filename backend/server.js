// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;
const SECRET_KEY = process.env.JWT_SECRET; 

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE: Check Logic  ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ROUTES ---
//1. SignUp Route:
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
//2.Login Route
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
//3. Dashboard:
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
//4. Create Products:
// 4. PRODUCTS: Create
app.post('/api/products', authenticateToken, async (req, res) => {
  // Added costPrice and description to extraction
  const { name, sku, quantity, price, costPrice, description, lowStockThreshold } = req.body;
  const { organizationId } = req.user;

  try {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    
    // Logic: Use provided threshold OR global default
    const finalThreshold = lowStockThreshold !== '' 
        ? parseInt(lowStockThreshold) 
        : org.defaultLowStockThreshold;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        costPrice: parseFloat(costPrice), // <--- NEW
        lowStockThreshold: finalThreshold, 
        organizationId
      }
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Error creating product" });
  }
});
//5.Get Products:
app.get('/api/products', authenticateToken, async (req, res) => {
  const { organizationId } = req.user;
  const products = await prisma.product.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(products);
});
//6.Delete:
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { organizationId } = req.user;

  try {
    // Verify product belongs to this user's organization before deleting
    const product = await prisma.product.findFirst({
        where: { id, organizationId }
    });

    if (!product) return res.status(404).json({ error: "Product not found or access denied" });

    // Actually delete it
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});
// 7. PRODUCTS: Update (Edit)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity, price, costPrice, description, lowStockThreshold } = req.body;
  const { organizationId } = req.user;

  try {
    const product = await prisma.product.findFirst({ where: { id, organizationId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        description,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        costPrice: parseFloat(costPrice), // <--- NEW
        lowStockThreshold: lowStockThreshold !== '' ? parseInt(lowStockThreshold) : undefined
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: "Error updating product" });
  }
});

// 8. SETTINGS:
app.get('/api/settings', authenticateToken, async (req, res) => {
  const { organizationId } = req.user;
  const org = await prisma.organization.findUnique({
    where: { id: organizationId }
  });
  res.json({ defaultLowStockThreshold: org.defaultLowStockThreshold });
});

// 9. SETTINGS: 
app.put('/api/settings', authenticateToken, async (req, res) => {
  const { organizationId } = req.user;
  const { defaultLowStockThreshold } = req.body;

  try {
    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: { defaultLowStockThreshold: parseInt(defaultLowStockThreshold) }
    });
    res.json(updatedOrg);
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});