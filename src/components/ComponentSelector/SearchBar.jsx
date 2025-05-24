// client/src/components/ComponentSelector/SearchBar.js
import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Button, Modal } from 'react-bootstrap';
import { modelService, categoryService, brandService } from '../../services/api';

const SearchBar = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [newModel, setNewModel] = useState({
    name: '',
    category: '',
    brand: '',
    hsn: '',
    warranty: '',
    purchasePrice: '',
    salesPrice: '',
    gstRate: '18'
  });

  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          categoryService.getAll(),
          brandService.getAll()
        ]);
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Search for models as user types
  useEffect(() => {
    const search = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await modelService.search(searchTerm);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching models:', error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(() => {
      search();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSelect = (model) => {
    onSelect(model);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleCreateNewClick = () => {
    setNewModel({
      ...newModel,
      name: searchTerm
    });
    setShowCreateModal(true);
  };

  const handleNewModelChange = (e) => {
    const { name, value } = e.target;
    setNewModel(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewModelSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert string values to numbers
      const formattedModel = {
        ...newModel,
        purchasePrice: parseFloat(newModel.purchasePrice),
        salesPrice: parseFloat(newModel.salesPrice),
        gstRate: parseFloat(newModel.gstRate)
      };
      
      const response = await modelService.create(formattedModel);
      onSelect(response.data);
      setShowCreateModal(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating new model:', error);
    }
  };

  const handleCreateNewCategory = async () => {
    const categoryName = prompt('Enter new category name:');
    if (!categoryName) return;
    
    try {
      const response = await categoryService.create({ name: categoryName });
      setCategories(prev => [...prev, response.data]);
      setNewModel(prev => ({ ...prev, category: response.data._id }));
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateNewBrand = async () => {
    const brandName = prompt('Enter new brand name:');
    if (!brandName) return;
    
    try {
      const response = await brandService.create({ name: brandName });
      setBrands(prev => [...prev, response.data]);
      setNewModel(prev => ({ ...prev, brand: response.data._id }));
    } catch (error) {
      console.error('Error creating brand:', error);
    }
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Search Components</Form.Label>
        <Form.Control
          type="text"
          placeholder="Search by model name or HSN code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      
      {loading && <div className="text-center">Searching...</div>}
      
      {searchResults.length > 0 && (
        <ListGroup className="mb-3">
          {searchResults.map(model => (
            <ListGroup.Item
              key={model._id}
              action
              onClick={() => handleSelect(model)}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <div><strong>{model.name}</strong></div>
                <div className="text-muted small">
                  {model.category.name} | {model.brand.name} | HSN: {model.hsn}
                </div>
              </div>
              <div>₹{model.salesPrice.toLocaleString()}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      
      {searchTerm.length >= 2 && searchResults.length === 0 && !loading && (
        <div className="text-center mb-3">
          <p>No components found. Would you like to create a new one?</p>
          <Button variant="primary" onClick={handleCreateNewClick}>
            Create New Component
          </Button>
        </div>
      )}

      {/* Modal for creating new model */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Component</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleNewModelSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Model Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newModel.name}
                onChange={handleNewModelChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <div className="d-flex">
                <Form.Select
                  name="category"
                  value={newModel.category}
                  onChange={handleNewModelChange}
                  required
                  className="me-2"
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
                  type="button"
                >
                  +
                </Button>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Brand</Form.Label>
              <div className="d-flex">
                <Form.Select
                  name="brand"
                  value={newModel.brand}
                  onChange={handleNewModelChange}
                  required
                  className="me-2"
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
                  type="button"
                >
                  +
                </Button>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>HSN Code</Form.Label>
              <Form.Control
                type="text"
                name="hsn"
                value={newModel.hsn}
                onChange={handleNewModelChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Warranty</Form.Label>
              <Form.Control
                type="text"
                name="warranty"
                value={newModel.warranty}
                onChange={handleNewModelChange}
                required
                placeholder="e.g., 1 Year"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Purchase Price (with GST)</Form.Label>
              <Form.Control
                type="number"
                name="purchasePrice"
                value={newModel.purchasePrice}
                onChange={handleNewModelChange}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sales Price (with GST)</Form.Label>
              <Form.Control
                type="number"
                name="salesPrice"
                value={newModel.salesPrice}
                onChange={handleNewModelChange}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>GST Rate (%)</Form.Label>
              <Form.Control
                type="number"
                name="gstRate"
                value={newModel.gstRate}
                onChange={handleNewModelChange}
                required
                min="0"
                max="28"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Component
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SearchBar;