// client/src/components/ComponentLibrary/ComponentsList.js - Fixed version
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Alert,
  Spinner,
  Badge,
  Modal
} from 'react-bootstrap';
import { modelService, categoryService, brandService, componentService } from '../../services/api';

const ComponentsList = () => {
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    category: '',
    brand: '',
    hsn: '',
    warranty: '',
    purchasePrice: '',
    salesPrice: '',
    gstRate: '18',
    description: '',
    specifications: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch data with fallbacks
      const [modelsRes, categoriesRes, brandsRes] = await Promise.all([
        fetchModels(),
        fetchCategories(),
        fetchBrands()
      ]);
      
      setModels(modelsRes);
      setCategories(categoriesRes);
      setBrands(brandsRes);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load component data. Some features may be limited.');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      // Try modelService first, then componentService
      const response = await modelService.getAll();
      return response.data || [];
    } catch (error) {
      try {
        // Fallback to componentService
        const response = await componentService.getAll();
        return response.data || [];
      } catch (fallbackError) {
        console.warn('Models/Components API not available');
        return [];
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      return response.data || [];
    } catch (error) {
      console.warn('Categories API not available');
      return [
        { _id: 'default-1', name: 'Electronics' },
        { _id: 'default-2', name: 'Hardware' },
        { _id: 'default-3', name: 'Software' },
        { _id: 'default-4', name: 'Accessories' }
      ];
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await brandService.getAll();
      return response.data || [];
    } catch (error) {
      console.warn('Brands API not available');
      return [
        { _id: 'default-1', name: 'Generic' },
        { _id: 'default-2', name: 'Premium' },
        { _id: 'default-3', name: 'Standard' }
      ];
    }
  };

  const handleNewModelChange = (e) => {
    const { name, value } = e.target;
    setNewModel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateNewCategory = async () => {
    const categoryName = prompt('Enter new category name:');
    if (!categoryName?.trim()) return;
    
    try {
      const response = await categoryService.create({ name: categoryName.trim() });
      const newCategory = response.data || { _id: Date.now().toString(), name: categoryName.trim() };
      setCategories(prev => [...prev, newCategory]);
      setNewModel(prev => ({ ...prev, category: newCategory._id }));
    } catch (error) {
      console.error('Error creating category:', error);
      // Add locally if API fails
      const newCategory = { _id: Date.now().toString(), name: categoryName.trim() };
      setCategories(prev => [...prev, newCategory]);
      setNewModel(prev => ({ ...prev, category: newCategory._id }));
    }
  };

  const handleCreateNewBrand = async () => {
    const brandName = prompt('Enter new brand name:');
    if (!brandName?.trim()) return;
    
    try {
      const response = await brandService.create({ name: brandName.trim() });
      const newBrand = response.data || { _id: Date.now().toString(), name: brandName.trim() };
      setBrands(prev => [...prev, newBrand]);
      setNewModel(prev => ({ ...prev, brand: newBrand._id }));
    } catch (error) {
      console.error('Error creating brand:', error);
      // Add locally if API fails
      const newBrand = { _id: Date.now().toString(), name: brandName.trim() };
      setBrands(prev => [...prev, newBrand]);
      setNewModel(prev => ({ ...prev, brand: newBrand._id }));
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newModel.name.trim() || !newModel.category || !newModel.brand) {
      alert('Please fill in all required fields (Name, Category, Brand)');
      return;
    }
    
    try {
      setFormLoading(true);
      
      // Convert string values to numbers
      const formattedModel = {
        ...newModel,
        name: newModel.name.trim(),
        hsn: newModel.hsn.trim(),
        warranty: newModel.warranty.trim(),
        description: newModel.description.trim(),
        specifications: newModel.specifications.trim(),
        purchasePrice: parseFloat(newModel.purchasePrice) || 0,
        salesPrice: parseFloat(newModel.salesPrice) || 0,
        gstRate: parseFloat(newModel.gstRate) || 18
      };
      
      // Find category and brand names for display
      const category = categories.find(c => c._id === formattedModel.category);
      const brand = brands.find(b => b._id === formattedModel.brand);
      
      try {
        // Try to create via API
        const response = await modelService.create(formattedModel);
        const createdModel = response.data || {
          ...formattedModel,
          _id: Date.now().toString(),
          category,
          brand
        };
        setModels(prev => [...prev, createdModel]);
      } catch (apiError) {
        console.warn('API create failed, adding locally:', apiError.message);
        // Fallback: add locally
        const localModel = {
          ...formattedModel,
          _id: Date.now().toString(),
          category,
          brand,
          createdAt: new Date().toISOString()
        };
        setModels(prev => [...prev, localModel]);
      }
      
      // Reset form
      setNewModel({
        name: '',
        category: '',
        brand: '',
        hsn: '',
        warranty: '',
        purchasePrice: '',
        salesPrice: '',
        gstRate: '18',
        description: '',
        specifications: ''
      });
      
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Error adding model:', error);
      alert('Failed to add component. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (!window.confirm('Are you sure you want to delete this component?')) {
      return;
    }

    try {
      await modelService.delete(modelId);
      setModels(prev => prev.filter(m => m._id !== modelId));
    } catch (error) {
      console.warn('API delete failed, removing locally');
      setModels(prev => prev.filter(m => m._id !== modelId));
    }
  };

  // Filter models based on search and filters
  const filteredModels = models.filter(model => {
    const matchesSearch = searchTerm === '' || 
      model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.hsn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === '' || 
      (model.category?._id === categoryFilter || model.category === categoryFilter);
    const matchesBrand = brandFilter === '' || 
      (model.brand?._id === brandFilter || model.brand === brandFilter);
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading component library...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2>Component Library</h2>
          <p className="text-muted">
            Manage your product components, pricing, and specifications
          </p>
        </Col>
        <Col className="text-end">
          <Button 
            variant="primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add New Component'}
          </Button>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Add Component Form */}
      {showAddForm && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Add New Component</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleAddModel}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Component Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newModel.name}
                      onChange={handleNewModelChange}
                      required
                      placeholder="Enter component name"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Category *</Form.Label>
                    <InputGroup>
                      <Form.Select
                        name="category"
                        value={newModel.category}
                        onChange={handleNewModelChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleCreateNewCategory}
                        title="Add new category"
                      >
                        +
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Brand *</Form.Label>
                    <InputGroup>
                      <Form.Select
                        name="brand"
                        value={newModel.brand}
                        onChange={handleNewModelChange}
                        required
                      >
                        <option value="">Select Brand</option>
                        {brands.map(brand => (
                          <option key={brand._id} value={brand._id}>
                            {brand.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleCreateNewBrand}
                        title="Add new brand"
                      >
                        +
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>HSN Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="hsn"
                      value={newModel.hsn}
                      onChange={handleNewModelChange}
                      placeholder="Enter HSN code"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={newModel.description}
                      onChange={handleNewModelChange}
                      placeholder="Enter component description"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Warranty</Form.Label>
                    <Form.Control
                      type="text"
                      name="warranty"
                      value={newModel.warranty}
                      onChange={handleNewModelChange}
                      placeholder="e.g., 1 Year, 6 Months"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={newModel.purchasePrice}
                      onChange={handleNewModelChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Sales Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="salesPrice"
                      value={newModel.salesPrice}
                      onChange={handleNewModelChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>GST Rate (%)</Form.Label>
                    <Form.Select
                      name="gstRate"
                      value={newModel.gstRate}
                      onChange={handleNewModelChange}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Specifications</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="specifications"
                      value={newModel.specifications}
                      onChange={handleNewModelChange}
                      placeholder="Enter technical specifications"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAddForm(false)} 
                  className="me-2"
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Component'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Header>
          <h5>🔍 Search & Filter</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name, HSN, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {(searchTerm || categoryFilter || brandFilter) && (
            <div className="mt-3">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setBrandFilter('');
                }}
              >
                Clear Filters
              </Button>
              <span className="ms-3 text-muted">
                Showing {filteredModels.length} of {models.length} components
              </span>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Components Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Components ({filteredModels.length})</h5>
            {models.length > 0 && (
              <Badge bg="success">
                Total Value: ₹{models.reduce((sum, m) => sum + (m.salesPrice || 0), 0).toLocaleString()}
              </Badge>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {filteredModels.length === 0 ? (
            <div className="text-center p-4">
              {models.length === 0 ? (
                <div>
                  <div className="mb-3">
                    <i className="bi bi-box" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  </div>
                  <h5>No Components Yet</h5>
                  <p className="text-muted">Add your first component to get started with your library.</p>
                  <Button variant="primary" onClick={() => setShowAddForm(true)}>
                    Add First Component
                  </Button>
                </div>
              ) : (
                <div>
                  <h5>No Components Match Your Filters</h5>
                  <p className="text-muted">Try adjusting your search criteria or clear filters.</p>
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setBrandFilter('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>HSN</th>
                    <th>Warranty</th>
                    <th>Purchase Price</th>
                    <th>Sales Price</th>
                    <th>Margin</th>
                    <th>GST</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.map(model => {
                    const purchasePrice = model.purchasePrice || 0;
                    const salesPrice = model.salesPrice || 0;
                    const margin = salesPrice - purchasePrice;
                    const marginPercent = purchasePrice > 0 ? (margin / purchasePrice * 100) : 0;
                    
                    return (
                      <tr key={model._id}>
                        <td>
                          <div>
                            <strong>{model.name}</strong>
                            {model.description && (
                              <div className="small text-muted">{model.description}</div>
                            )}
                          </div>
                        </td>
                        <td>{model.category?.name || 'N/A'}</td>
                        <td>{model.brand?.name || 'N/A'}</td>
                        <td>{model.hsn || '-'}</td>
                        <td>{model.warranty || '-'}</td>
                        <td>₹{purchasePrice.toLocaleString()}</td>
                        <td>₹{salesPrice.toLocaleString()}</td>
                        <td>
                          {margin > 0 ? (
                            <span className="text-success">
                              ₹{margin.toLocaleString()} ({marginPercent.toFixed(1)}%)
                            </span>
                          ) : margin < 0 ? (
                            <span className="text-danger">
                              ₹{margin.toLocaleString()} ({marginPercent.toFixed(1)}%)
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          <Badge bg="info">{model.gstRate || 18}%</Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteModel(model._id)}
                            title="Delete component"
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ComponentsList;