// client/src/components/Party/PartyList.js - Updated to show Party ID
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { partyService } from '../../services/api';
import { Table, Button, Container, Row, Col, Card, Form, InputGroup, Badge } from 'react-bootstrap';

const PartyList = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await partyService.getAll();
        setParties(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parties:', error);
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  // Filter parties based on search term
  const filteredParties = parties.filter(party => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      party.partyId?.toLowerCase().includes(searchLower) ||
      party.name?.toLowerCase().includes(searchLower) ||
      party.phone?.toLowerCase().includes(searchLower) ||
      party.email?.toLowerCase().includes(searchLower) ||
      party.address?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Clients/Parties</h2>
          <p className="text-muted">Total Clients: <Badge bg="primary">{parties.length}</Badge></p>
        </Col>
        <Col className="text-end">
          <Link to="/parties/add">
            <Button variant="primary">Add New Client</Button>
          </Link>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by Party ID, name, phone, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </Button>
            )}
          </InputGroup>
          {searchTerm && (
            <small className="text-muted">
              Showing {filteredParties.length} of {parties.length} clients
            </small>
          )}
        </Col>
      </Row>

      {parties.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>No clients found</Card.Title>
            <Card.Text>
              You haven't added any clients yet. Add your first client to get started.
            </Card.Text>
            <Link to="/parties/add">
              <Button variant="primary">Add New Client</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : filteredParties.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>No clients match your search</Card.Title>
            <Card.Text>
              No clients found matching "{searchTerm}". Try adjusting your search term.
            </Card.Text>
            <Button variant="outline-primary" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Party ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.map((party) => (
              <tr key={party._id}>
                <td>
                  <Badge bg="info">{party.partyId}</Badge>
                </td>
                <td>
                  <Link to={`/parties/${party._id}`}>
                    {searchTerm && party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                      <span dangerouslySetInnerHTML={{
                        __html: party.name.replace(
                          new RegExp(`(${searchTerm})`, 'gi'),
                          '<mark>$1</mark>'
                        )
                      }} />
                    ) : (
                      party.name
                    )}
                  </Link>
                </td>
                <td>
                  {searchTerm && party.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                    <span dangerouslySetInnerHTML={{
                      __html: party.phone.replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<mark>$1</mark>'
                      )
                    }} />
                  ) : (
                    party.phone
                  )}
                </td>
                <td>
                  {party.email ? (
                    searchTerm && party.email.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                      <span dangerouslySetInnerHTML={{
                        __html: party.email.replace(
                          new RegExp(`(${searchTerm})`, 'gi'),
                          '<mark>$1</mark>'
                        )
                      }} />
                    ) : (
                      party.email
                    )
                  ) : '-'}
                </td>
                <td>
                  {searchTerm && party.address?.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                    <span dangerouslySetInnerHTML={{
                      __html: party.address.replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<mark>$1</mark>'
                      )
                    }} />
                  ) : (
                    party.address
                  )}
                </td>
                <td>
                  <Link to={`/parties/${party._id}`}>
                    <Button variant="info" size="sm" className="me-2">View</Button>
                  </Link>
                  <Link to={`/parties/edit/${party._id}`}>
                    <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  </Link>
                  <Link to={`/quotations/add/${party._id}`}>
                    <Button variant="success" size="sm">New Quote</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PartyList;