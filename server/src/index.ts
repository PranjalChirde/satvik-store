import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'satvik-store-dev-secret';

app.use(cors());
app.use(express.json());

// Set up local file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Generic Auth Middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};
app.use(express.json());

// Add a new product (Admin)
app.post('/api/products', async (req, res) => {
  try {
    const { title, price, originalPrice, category, badge, description, image, additionalImages } = req.body;
    if (!title || !price || !category || !image) {
      return res.status(400).json({ error: 'Title, price, category, and image are required' });
    }
    const product = await prisma.product.create({
      data: {
        title,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : 0,
        category,
        badge: badge || null,
        description: description || null,
        image,
        images: additionalImages && additionalImages.length > 0 ? { create: additionalImages.map((url: string) => ({ url })) } : undefined
      },
      include: { images: true }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload image (Admin)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the path relative to the server so frontend can build the URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Get all products, optionally filter by category
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let products;
    if (category && typeof category === 'string') {
      products = await prisma.product.findMany({
        where: { category },
        include: { images: true }
      });
    } else {
      products = await prisma.product.findMany({
        include: { images: true }
      });
    }
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Stripe Payments (Adapter Pattern) ───────────────────────────────────────

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    // Attempt real gateway connection if credentials exist
    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      const stripeInstance = require('stripe')(stripeSecretKey);
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to paise
        currency: 'inr',
      });
      return res.json({ clientSecret: paymentIntent.client_secret });
    }
    
    // Trigger Dummy Route (Safe Mode)
    res.json({ clientSecret: 'mock_secret_key' });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// ─── Coupons ─────────────────────────────────────────────────────────────────

app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { code, discountPct } = req.body;
    if (!code || !discountPct) return res.status(400).json({ error: 'Code and discountPct are required' });
    const coupon = await prisma.coupon.create({
      data: { code: code.toUpperCase(), discountPct: parseFloat(discountPct) },
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: 'Code already exists or invalid data.' });
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: 'Invalid or expired promo code.' });
    }
    res.json({ discountPct: coupon.discountPct });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, contactEmail, shippingAddress, paymentMethod, items, totalAmount, couponCode, discountAmt } = req.body;
    let userId = null;
    
    // Optional auth extraction
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const user: any = jwt.verify(token, JWT_SECRET);
          userId = user.userId;
        } catch(e) {}
      }
    }
    
    // items should be [{ productId: 1, quantity: 2 }, ...]

    const order = await prisma.order.create({
      data: {
        customerName,
        contactEmail,
        shippingAddress,
        paymentMethod: paymentMethod || 'card',
        userId,
        totalAmount,
        couponCode,
        discountAmt,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        orderItems: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public Order Tracking
app.get('/api/orders/track', async (req, res) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId || !email) {
      return res.status(400).json({ error: 'Order ID and Email are required' });
    }

    const orderIdNum = typeof orderId === 'string' && orderId.startsWith('#ORD-') 
      ? parseInt(orderId.replace('#ORD-', ''), 10)
      : parseInt(orderId as string, 10);

    const order = await prisma.order.findFirst({
      where: {
        id: orderIdNum,
        contactEmail: {
          equals: email as string,
          // Make case insensitive lookup for sqlite (actually SQLite string match is case sensitive by default, so we lower email strictly if needed - but standard equals is fine if users type it right)
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order || order.contactEmail.toLowerCase() !== (email as string).toLowerCase()) {
      return res.status(404).json({ error: 'Order not found or email does not match.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (Admin)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (isNaN(orderId) || !status) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing product (Admin)
app.patch('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    const { title, price, originalPrice, category, badge, description, image, additionalImages } = req.body;
    
    // Only update fields that are provided
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (originalPrice !== undefined) updateData.originalPrice = parseFloat(originalPrice);
    if (category !== undefined) updateData.category = category;
    if (badge !== undefined) updateData.badge = badge === "" ? null : badge;
    if (description !== undefined) updateData.description = description === "" ? null : description;
    if (image !== undefined) updateData.image = image;

    if (additionalImages !== undefined) {
      updateData.images = {
        deleteMany: {},
        create: additionalImages.map((url: string) => ({ url }))
      };
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: { images: true }
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });
    
    // Cascade delete manually (if needed) or let Prisma handle it 
    // Prisma SQLite doesn't always cascade correctly unless configured, let's delete children first:
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.review.deleteMany({ where: { productId } });
    await prisma.orderItem.deleteMany({ where: { productId } });
    
    await prisma.product.delete({
      where: { id: productId }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Reviews ────────────────────────────────────────────────────────────────

// Get reviews for a product
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post a review for a product
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { authorName, rating, comment } = req.body;
    if (!authorName || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const review = await prisma.review.create({
      data: { productId, authorName, rating: parseInt(rating), comment }
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Authentication ──────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });
    const token = jwt.sign({ userId: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user orders (Protected)
app.get('/api/users/me/orders', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
