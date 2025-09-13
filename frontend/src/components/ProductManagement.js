import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSubCategory, setProductSubCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Predefined categories with image options
  const categories = {
    'Beverages': {
      'Hot Drinks': [
        'tea_2.jpg',
        'dark-coffee.jpeg',
        'cappuccino.jpg'
      ],
      'Cold Drinks': [
        'coke.jpg',
        'orange-juice.jpg',
        'water.png',
        'juice-box.png'
      ]
    },
    'Food': {
      'Bakery Items': [
        'donut.jpg',
        'muffins.jpg',
        'bread.jpg'
      ],
      'Grab-and-Go': [
        'sandwich.jpeg',
        'wraps.jpg',
        'burger.jpg'
      ],
      'Meals': [
        'pork.jpeg',
        'wors.jpg',
        'One-Pot-Vegetable-Rice.jpg',
        'meat.jpeg'
      ]
    },
    'Snacks': {
      'Fruits': [
        'apples.2.jpg',
        'oranges.jpeg',
        'bananas.jpg'
      ],
      'Takeaway Snacks': [
        'biscuit.jpeg',
        'snack-box.jpeg',
        'peanuts.jpg'
      ],
      'Light Snacks': [
        'loly pop.jpg',
        'kit kat.jpeg',
        'gummy bear.jpg'
      ]
    },
    'Study-Friendly Offerings': {
      'Cables': [
        'power-cable.jpg',
        'USB-cable.jpeg',
        'power-extension.jpg'
      ],
      'Stationary': [
        'ball-pen.jpeg',
        'notebook.jpg',
        'pencil.jpg'
      ]
    }
  };

  // Default images for each category
  const defaultImages = {
    'Beverages': '/images/default-beverage.jpg',
    'Food': '/images/default-food.jpg',
    'Snacks': '/images/default-snack.jpg',
    'Study-Friendly Offerings': '/images/default-stationary.jpg'
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Network error. Please make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!productName || !productDescription || !productCategory || !productSubCategory || !productPrice || !productQuantity) {
      setError('Please fill all fields');
      return;
    }
    
    // Validate price and quantity
    const price = parseFloat(productPrice);
    const quantity = parseInt(productQuantity);
    
    if (isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 0) {
      setError('Price must be a positive number and quantity must be a non-negative integer');
      return;
    }
    
    try {
      const productData = {
        name: productName,
        description: productDescription,
        category: productCategory,
        subCategory: productSubCategory,
        price: price,
        quantity: quantity,
        imageUrl: selectedImage || defaultImages[productCategory] || '/images/default-product.jpg'
      };
      
      const url = editingProductId 
        ? `http://localhost:5000/api/products/${editingProductId}`
        : 'http://localhost:5000/api/products';
      
      const method = editingProductId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (response.ok) {
        const newProduct = await response.json();
        
        if (editingProductId) {
          // Update existing product in the list
          setProducts(products.map(product => 
            product.id === editingProductId ? newProduct : product
          ));
          alert('Product updated successfully!');
        } else {
          // Add new product to the list
          setProducts([...products, newProduct]);
          alert('Product added successfully!');
        }
        
        // Reset form
        resetForm();
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || (editingProductId ? 'Failed to update product' : 'Failed to add product'));
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Network error. Please make sure the backend server is running on port 5000.');
    }
  };

  const handleEditProduct = (product) => {
    setProductName(product.name);
    setProductDescription(product.description);
    setProductCategory(product.category);
    setProductSubCategory(product.subCategory || '');
    setProductPrice(product.price.toString());
    setProductQuantity(product.quantity.toString());
    setSelectedImage(product.imageUrl || '');
    setEditingProductId(product.id);
    setError('');
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProducts(products.filter(product => product.id !== id));
          alert('Product deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Network error. Please make sure the backend server is running on port 5000.');
      }
    }
  };

  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setProductCategory('');
    setProductSubCategory('');
    setProductPrice('');
    setProductQuantity('');
    setSelectedImage('');
    setEditingProductId(null);
  };

  const handleCancelEdit = () => {
    resetForm();
    setError('');
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      
      {/* Category Containers Display */}
      <h1>Product list</h1>
      <div className="category-containers">
        {Object.entries(categories).map(([category, subCategories]) => (
          <div key={category} className="category-container">
            <h2>{category}</h2>
            <div className="subcategory-grid">
              {Object.entries(subCategories).map(([subCategory, images]) => {
                const subCategoryProducts = products.filter(
                  p => p.category === category && p.subCategory === subCategory
                );
                
                return (
                  <div key={subCategory} className="subcategory-container">
                    <h3>{subCategory}</h3>
                    <div className="product-grid">
                      {subCategoryProducts.length > 0 ? (
                        subCategoryProducts.map(product => (
                          <div key={product.id} className="product-card">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="product-image"
                            />
                            <div className="product-info">
                              <h4>{product.name}</h4>
                              <p>{product.description}</p>
                              <p className="product-price">M{product.price.toFixed(2)}</p>
                              <p className={`product-stock ${product.quantity < 10 ? 'low-stock' : ''}`}>
                                Stock: {product.quantity}
                              </p>
                              <div className="product-actions">
                                <button 
                                  onClick={() => handleEditProduct(product)}
                                  className="edit-btn"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="delete-btn"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-products">
                          <p>No products in this category yet</p>
                          <div className="image-placeholders">
                            {images.map((image, index) => (
                              <div key={index} className="image-placeholder">
                                <img src={image} alt={`Placeholder ${index + 1}`} />
                                <p>Space {index + 1}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <h1>Product Management</h1>
      
      <div className="product-form-container">
        <div className="product-form">
          <h2>{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleAddProduct}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name:</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Main Category:</label>
                <select
                  value={productCategory}
                  onChange={(e) => {
                    setProductCategory(e.target.value);
                    setProductSubCategory('');
                    setSelectedImage('');
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Sub Category:</label>
                <select
                  value={productSubCategory}
                  onChange={(e) => {
                    setProductSubCategory(e.target.value);
                    setSelectedImage('');
                  }}
                  required
                  disabled={!productCategory}
                >
                  <option value="">Select Sub Category</option>
                  {productCategory && Object.keys(categories[productCategory] || {}).map(subCategory => (
                    <option key={subCategory} value={subCategory}>{subCategory}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price (M):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Initial Quantity:</label>
                <input
                  type="number"
                  min="0"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {productCategory && productSubCategory && (
              <div className="form-group">
                <label>Select Product Image:</label>
                <div className="image-options">
                  {(categories[productCategory]?.[productSubCategory] || []).map((image, index) => (
                    <div
                      key={index}
                      className={`image-option ${selectedImage === image ? 'selected' : ''}`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img src={image} alt={`Option ${index + 1}`} />
                    </div>
                  ))}
                </div>
                {selectedImage && (
                  <div className="selected-image-preview">
                    <p>Selected Image:</p>
                    <img src={selectedImage} alt="Selected" />
                  </div>
                )}
              </div>
            )}
            
            <div className="form-buttons">
              <button type="submit">
                {editingProductId ? 'Update Product' : 'Add Product'}
              </button>
              
              {editingProductId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div> 
  );
};

export default ProductManagement
