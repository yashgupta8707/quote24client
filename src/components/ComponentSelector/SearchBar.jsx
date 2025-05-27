// client/src/components/SearchBar/SearchBar.jsx - Universal Search Component
import React, { useState, useEffect, useRef } from 'react';
import { 
  Form, 
  InputGroup, 
  Button, 
  Dropdown, 
  ListGroup, 
  Spinner,
  Badge 
} from 'react-bootstrap';
import { 
  partyService, 
  quotationService, 
  componentService,
  brandService,
  productService,
} from '../../services/api';

const SearchBar = ({ 
  onSelect, 
  placeholder = "Search clients, quotations, products...",
  searchTypes = ['parties', 'quotations', 'components'],
  autoFocus = false,
  className = "",
  size = "md"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        resultsRef.current && 
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    const results = [];

    try {
      // Search parties/clients
      if (selectedType === 'all' || selectedType === 'parties') {
        if (searchTypes.includes('parties')) {
          try {
            const partiesResponse = await partyService.search({ search: query });
            const parties = partiesResponse.data?.parties || partiesResponse.data || [];
            parties.slice(0, 5).forEach(party => {
              results.push({
                id: party._id,
                type: 'party',
                title: party.name,
                subtitle: `${party.partyId} • ${party.phone}`,
                icon: '👤',
                data: party
              });
            });
          } catch (error) {
            console.warn('Party search failed:', error.message);
          }
        }
      }

      // Search quotations
      if (selectedType === 'all' || selectedType === 'quotations') {
        if (searchTypes.includes('quotations')) {
          try {
            const quotationsResponse = await quotationService.getAll();
            const quotations = quotationsResponse.data || [];
            const filteredQuotations = quotations.filter(q => 
              q.title?.toLowerCase().includes(query.toLowerCase()) ||
              q.party?.name?.toLowerCase().includes(query.toLowerCase())
            );
            filteredQuotations.slice(0, 5).forEach(quotation => {
              results.push({
                id: quotation._id,
                type: 'quotation',
                title: quotation.title || `Quote #${quotation._id.slice(-6)}`,
                subtitle: `${quotation.party?.name || 'Unknown Client'} • ₹${quotation.totalAmount?.toLocaleString()}`,
                icon: '📄',
                data: quotation
              });
            });
          } catch (error) {
            console.warn('Quotation search failed:', error.message);
          }
        }
      }

      // Search components/products
      if (selectedType === 'all' || selectedType === 'components') {
        if (searchTypes.includes('components')) {
          try {
            const componentsResponse = await componentService.search(query);
            const components = componentsResponse.data || [];
            components.slice(0, 5).forEach(component => {
              results.push({
                id: component._id,
                type: 'component',
                title: component.name || component.title,
                subtitle: `${component.category || 'Component'} • ₹${component.price?.toLocaleString() || 'N/A'}`,
                icon: '🔧',
                data: component
              });
            });
          } catch (error) {
            console.warn('Component search failed:', error.message);
          }
        }
      }

      // Search brands
      if (selectedType === 'all' || selectedType === 'brands') {
        if (searchTypes.includes('brands')) {
          try {
            const brandsResponse = await brandService.search(query);
            const brands = brandsResponse.data || [];
            brands.slice(0, 5).forEach(brand => {
              results.push({
                id: brand._id,
                type: 'brand',
                title: brand.name,
                subtitle: brand.description || 'Brand',
                icon: '🏷️',
                data: brand
              });
            });
          } catch (error) {
            console.warn('Brand search failed:', error.message);
          }
        }
      }

      // Search products
      if (selectedType === 'all' || selectedType === 'products') {
        if (searchTypes.includes('products')) {
          try {
            const productsResponse = await productService.search(query);
            const products = productsResponse.data || [];
            products.slice(0, 5).forEach(product => {
              results.push({
                id: product._id,
                type: 'product',
                title: product.name,
                subtitle: `${product.brand?.name || 'Product'} • ₹${product.price?.toLocaleString() || 'N/A'}`,
                icon: '📦',
                data: product
              });
            });
          } catch (error) {
            console.warn('Product search failed:', error.message);
          }
        }
      }

      setSearchResults(results);
      setShowResults(results.length > 0);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result) => {
    setShowResults(false);
    setSearchTerm('');
    if (onSelect) {
      onSelect(result);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length >= 2) {
      setShowResults(true);
    }
  };

  const getTypeDisplayName = (type) => {
    const typeNames = {
      all: 'All',
      parties: 'Clients',
      quotations: 'Quotations',
      components: 'Components',
      brands: 'Brands',
      products: 'Products',
      categories: 'Categories'
    };
    return typeNames[type] || type;
  };

  const getResultTypeColor = (type) => {
    const colors = {
      party: 'primary',
      quotation: 'success',
      component: 'warning',
      brand: 'info',
      product: 'secondary',
      category: 'dark'
    };
    return colors[type] || 'light';
  };

  return (
    <div className={`position-relative ${className}`} ref={searchRef}>
      <InputGroup size={size}>
        {searchTypes.length > 1 && (
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size={size}>
              {getTypeDisplayName(selectedType)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSelectedType('all')}>
                All Types
              </Dropdown.Item>
              <Dropdown.Divider />
              {searchTypes.map(type => (
                <Dropdown.Item 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  active={selectedType === type}
                >
                  {getTypeDisplayName(type)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          autoFocus={autoFocus}
        />
        
        {loading && (
          <InputGroup.Text>
            <Spinner size="sm" animation="border" />
          </InputGroup.Text>
        )}
        
        {searchTerm && (
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
              setShowResults(false);
            }}
          >
            ✕
          </Button>
        )}
      </InputGroup>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="position-absolute w-100 mt-1 shadow-lg border rounded bg-white"
          style={{ zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}
        >
          <ListGroup variant="flush">
            {searchResults.map((result, index) => (
              <ListGroup.Item
                key={`${result.type}-${result.id}-${index}`}
                action
                onClick={() => handleSelect(result)}
                className="d-flex align-items-center py-3"
                style={{ cursor: 'pointer' }}
              >
                <div className="me-3">
                  <span style={{ fontSize: '1.2em' }}>{result.icon}</span>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{result.title}</div>
                      <small className="text-muted">{result.subtitle}</small>
                    </div>
                    <Badge bg={getResultTypeColor(result.type)} className="ms-2">
                      {result.type}
                    </Badge>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          
          {searchResults.length === 0 && !loading && (
            <ListGroup.Item className="text-center text-muted py-3">
              No results found for "{searchTerm}"
            </ListGroup.Item>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;