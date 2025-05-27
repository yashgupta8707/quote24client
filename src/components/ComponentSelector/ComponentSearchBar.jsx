// client/src/components/ComponentSelector/ComponentSearchBar.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Form, 
  InputGroup, 
  Button, 
  ListGroup, 
  Spinner,
  Badge,
  Card
} from 'react-bootstrap';
import { 
  modelService, 
  categoryService, 
  brandService, 
  componentService,
  enhancedComponentService as enhancedComponents,
  enhancedModelService as enhancedModels,
  enhancedCategoryService as enhancedCategories,
  enhancedBrandService as enhancedBrands
} from '../../services/api';

const ComponentSearchBar = ({ 
  onSelect, 
  placeholder = "Search components by name, category, brand, HSN...",
  autoFocus = false,
  className = "",
  size = "md"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allComponents, setAllComponents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Load all components, categories, and brands on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelsRes, categoriesRes, brandsRes] = await Promise.all([
          fetchModels(),
          fetchCategories(), 
          fetchBrands()
        ]);
        
        setAllComponents(modelsRes);
        setCategories(categoriesRes);
        setBrands(brandsRes);
      } catch (error) {
        console.error('Error loading component data:', error);
      }
    };

    loadData();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await modelService.getAll();
      return response.data || [];
    } catch (error) {
      try {
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
      return [];
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await brandService.getAll();
      return response.data || [];
    } catch (error) {
      console.warn('Brands API not available');
      return [];
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTerm.length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allComponents, categories, brands]);

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

  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    const queryLower = query.toLowerCase().trim();
    const results = [];

    try {
      // Search through all components
      allComponents.forEach(component => {
        let matchScore = 0;
        let matchReasons = [];

        // Get category and brand names
        const categoryName = component.category?.name || '';
        const brandName = component.brand?.name || '';
        const componentName = component.name || '';
        const hsn = component.hsn || '';
        const description = component.description || '';
        const specifications = component.specifications || '';

        // Check different fields for matches
        if (componentName.toLowerCase().includes(queryLower)) {
          matchScore += 10;
          matchReasons.push('name');
        }

        if (categoryName.toLowerCase().includes(queryLower)) {
          matchScore += 8;
          matchReasons.push('category');
        }

        if (brandName.toLowerCase().includes(queryLower)) {
          matchScore += 8;
          matchReasons.push('brand');
        }

        if (hsn.toLowerCase().includes(queryLower)) {
          matchScore += 7;
          matchReasons.push('hsn');
        }

        if (description.toLowerCase().includes(queryLower)) {
          matchScore += 5;
          matchReasons.push('description');
        }

        if (specifications.toLowerCase().includes(queryLower)) {
          matchScore += 3;
          matchReasons.push('specifications');
        }

        // Partial matches
        if (componentName.toLowerCase().includes(queryLower.substring(0, 3))) {
          matchScore += 2;
        }

        if (matchScore > 0) {
          results.push({
            component,
            matchScore,
            matchReasons,
            displayName: componentName,
            subtitle: `${categoryName} • ${brandName}${hsn ? ` • HSN: ${hsn}` : ''}`,
            price: component.salesPrice || component.price || 0
          });
        }
      });

      // Sort by match score (highest first) and limit results
      const sortedResults = results
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      setSearchResults(sortedResults);
      setShowResults(sortedResults.length > 0);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result) => {
    setShowResults(false);
    setSearchTerm('');
    
    if (onSelect) {
      // Pass the component in the expected format
      onSelect(result.component);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 1) {
      setShowResults(true);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 1 && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className={`position-relative ${className}`} ref={searchRef}>
      <Card className="mb-3">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center">
            <i className="fas fa-search me-2 text-muted"></i>
            <strong>Add Components to Quotation</strong>
          </div>
        </Card.Header>
        <Card.Body>
          <InputGroup size={size}>
            <Form.Control
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
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
                onClick={clearSearch}
                title="Clear search"
              >
                ✕
              </Button>
            )}
          </InputGroup>

          {searchTerm && (
            <small className="text-muted mt-2 d-block">
              {searchResults.length > 0 
                ? `Found ${searchResults.length} component${searchResults.length !== 1 ? 's' : ''} matching "${searchTerm}"`
                : loading 
                  ? 'Searching...' 
                  : `No components found for "${searchTerm}"`
              }
            </small>
          )}
        </Card.Body>
      </Card>

      {/* Search Results Dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="position-absolute w-100 mt-1 shadow-lg border rounded bg-white"
          style={{ zIndex: 1050, maxHeight: '500px', overflowY: 'auto' }}
        >
          {searchResults.length > 0 ? (
            <ListGroup variant="flush">
              {searchResults.map((result, index) => (
                <ListGroup.Item
                  key={`${result.component._id}-${index}`}
                  action
                  onClick={() => handleSelect(result)}
                  className="py-3"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <strong 
                          className="me-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(result.displayName, searchTerm)
                          }}
                        />
                        {result.matchReasons.map(reason => (
                          <Badge 
                            key={reason} 
                            bg="light" 
                            text="dark" 
                            className="me-1"
                            style={{ fontSize: '0.7em' }}
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                      <div 
                        className="text-muted small"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(result.subtitle, searchTerm)
                        }}
                      />
                      {result.component.description && (
                        <div 
                          className="text-muted small mt-1"
                          style={{ fontSize: '0.8em' }}
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(
                              result.component.description.substring(0, 100) + 
                              (result.component.description.length > 100 ? '...' : ''), 
                              searchTerm
                            )
                          }}
                        />
                      )}
                    </div>
                    <div className="text-end">
                      {result.price > 0 && (
                        <div className="fw-bold text-success">
                          ₹{result.price.toLocaleString()}
                        </div>
                      )}
                      <div className="text-muted small">
                        <i className="fas fa-plus-circle"></i> Add
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="p-4 text-center text-muted">
              <i className="fas fa-search fa-2x mb-3 opacity-50"></i>
              <div>
                <strong>No components found</strong>
              </div>
              <div className="small">
                Try searching by:
                <ul className="list-unstyled mt-2 small">
                  <li>• Component name</li>
                  <li>• Category (e.g., "Electronics")</li>
                  <li>• Brand name</li>
                  <li>• HSN code</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show all components when no search term */}
      {!searchTerm && !showResults && allComponents.length > 0 && (
        <Card className="mt-3">
          <Card.Header>
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Start typing to search through {allComponents.length} available components
            </small>
          </Card.Header>
        </Card>
      )}
    </div>
  );
};

export default ComponentSearchBar;