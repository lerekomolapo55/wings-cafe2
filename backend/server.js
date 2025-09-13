const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data', 'database.json');

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper: read data
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return { products: [], sales: [] };
  } catch (error) {
    console.error('Error reading data:', error);
    return { products: [], sales: [] };
  }
};

// Helper: write data
const writeData = (data) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to file:', error);
    return false;
  }
};

// Init file
if (!fs.existsSync(DATA_FILE)) {
  writeData({ products: [], sales: [] });
}

/* -------------------- PRODUCTS -------------------- */
app.get('/api/products', (req, res) => {
  const data = readData();
  res.json(data.products);
});

app.post('/api/products', (req, res) => {
  try {
    const data = readData();
    const { name, description, category, subCategory, price, quantity, imageUrl } = req.body;
    
    if (!name || !category || !subCategory || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newProduct = {
      id: Date.now().toString(),
      name,
      description: description || '',
      category,
      subCategory,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString()
    };
    
    data.products.push(newProduct);
    
    if (writeData(data)) {
      res.json(newProduct);
    } else {
      res.status(500).json({ error: 'Failed to save product' });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const data = readData();
    const { name, description, category, subCategory, price, quantity, imageUrl } = req.body;
    const index = data.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    data.products[index] = { 
      ...data.products[index], 
      name,
      description: description || data.products[index].description,
      category,
      subCategory,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      imageUrl: imageUrl || data.products[index].imageUrl
    };
    
    if (writeData(data)) {
      res.json(data.products[index]);
    } else {
      res.status(500).json({ error: 'Failed to update product' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const data = readData();
  const index = data.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  data.products.splice(index, 1);
  
  if (writeData(data)) {
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

/* -------------------- SALES -------------------- */
app.get('/api/sales', (req, res) => {
  const data = readData();
  
  // Enhance sales data with product information for frontend
  const salesWithProductInfo = data.sales.map(sale => {
    const product = data.products.find(p => p.id === sale.productId);
    return {
      ...sale,
      productName: product ? product.name : 'Unknown Product',
      productImage: product ? product.imageUrl : '',
      price: product ? product.price : 0
    };
  });
  
  res.json(salesWithProductInfo);
});

app.post('/api/sales', (req, res) => {
  const data = readData();
  const { productId, quantity, total } = req.body;

  const product = data.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (product.quantity < quantity)
    return res.status(400).json({ error: 'Insufficient stock' });

  const newSale = {
    id: Date.now().toString(),
    productId,
    quantity: parseInt(quantity),
    total: parseFloat(total),
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now(),
  };

  data.sales.push(newSale);
  product.quantity -= parseInt(quantity);

  if (writeData(data)) {
    // Add product details to the response for the frontend
    const responseSale = {
      ...newSale,
      productName: product.name,
      productImage: product.imageUrl,
      price: product.price
    };
    res.json(responseSale);
  } else {
    res.status(500).json({ error: 'Failed to save sale' });
  }
});

app.put('/api/sales/:id', (req, res) => {
  const data = readData();
  const { quantity, total } = req.body;
  const saleId = req.params.id;
  
  const saleIndex = data.sales.findIndex(s => s.id === saleId);
  if (saleIndex === -1) return res.status(404).json({ error: 'Sale not found' });
  
  // Get the original sale
  const originalSale = data.sales[saleIndex];
  
  // Find the product
  const product = data.products.find(p => p.id === originalSale.productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  // Calculate the difference in quantity
  const quantityDifference = parseInt(quantity) - originalSale.quantity;
  
  // Check if enough stock is available for the increase
  if (quantityDifference > 0 && product.quantity < quantityDifference) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }
  
  // Update the sale
  data.sales[saleIndex].quantity = parseInt(quantity);
  data.sales[saleIndex].total = parseFloat(total);
  
  // Update the product quantity
  product.quantity -= quantityDifference;
  
  if (writeData(data)) {
    // Add product details to the response
    const updatedSale = {
      ...data.sales[saleIndex],
      productName: product.name,
      productImage: product.imageUrl,
      price: product.price
    };
    res.json(updatedSale);
  } else {
    res.status(500).json({ error: 'Failed to update sale' });
  }
});

app.delete('/api/sales/:id', (req, res) => {
  const data = readData();
  const saleId = req.params.id;
  
  const saleIndex = data.sales.findIndex(s => s.id === saleId);
  if (saleIndex === -1) return res.status(404).json({ error: 'Sale not found' });
  
  const deletedSale = data.sales[saleIndex];
  
  // Find the product and restore stock
  const product = data.products.find(p => p.id === deletedSale.productId);
  if (product) {
    product.quantity += deletedSale.quantity;
  }
  
  // Remove the sale
  data.sales.splice(saleIndex, 1);
  
  if (writeData(data)) {
    res.json({ message: 'Sale deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

/* -------------------- STOCK -------------------- */
app.post('/api/stock/adjust', (req, res) => {
  const { productId, adjustmentType, quantity } = req.body;
  const data = readData();
  const product = data.products.find((p) => p.id === productId);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (adjustmentType === 'add') {
    product.quantity += parseInt(quantity);
  } else if (adjustmentType === 'deduct') {
    product.quantity = Math.max(0, product.quantity - parseInt(quantity));
  } else {
    return res.status(400).json({ error: 'Invalid adjustment type' });
  }

  if (writeData(data)) {
    res.json(product);
  } else {
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running on port 5000' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});