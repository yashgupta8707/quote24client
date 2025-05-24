// client/src/components/Party/PartyDetail.js - Updated to show Party ID
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { partyService, quotationService } from '../../services/api';

const PartyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partyResponse, quotationsResponse] = await Promise.all([
          partyService.getById(id),
          quotationService.getByParty(id)
        ]);
        
        setParty(partyResponse.data);
        setQuotations(quotationsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: 'secondary',
      sent: 'primary',
      lost: 'danger',
      sold: 'success'
    };
    
    return <Badge bg={statusMap[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const handleDeleteParty = async () => {
    if (window.confirm(`Are you sure you want to delete client ${party.partyId} (${party.name})? This action cannot be undone.`)) {
      try {
        await partyService.delete(id);
        navigate('/parties');
      } catch (error) {
        console.error('Error deleting party:', error);
        setDeleteError(error.response?.data?.message || 'Failed to delete client. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!party) {
    return (
      <Container className="mt-4">
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Client not found</Card.Title>
            <Link to="/parties">
              <Button variant="primary">Back to Clients</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>
            Client Details - <Badge bg="info" className="fs-6">{party.partyId}</Badge>
          </h2>
        </Col>
        <Col className="text-end">
          <Link to={`/quotations/add/${id}`}>
            <Button variant="success" className="me-2">Create Quotation</Button>
          </Link>
          <Link to={`/parties/edit/${id}`}>
            <Button variant="warning" className="me-2">Edit Client</Button>
          </Link>
          <Button 
            variant="danger" 
            onClick={handleDeleteParty}
            disabled={quotations.length > 0}
          >
            Delete Client
          </Button>
        </Col>
      </Row>

      {deleteError && (
        <Alert variant="danger" dismissible onClose={() => setDeleteError('')}>
          {deleteError}
        </Alert>
      )}

      {quotations.length > 0 && (
        <Alert variant="warning">
          <Alert.Heading>Cannot Delete Client</Alert.Heading>
          This client has {quotations.length} quotation(s) associated with them. 
          Please delete all quotations first before deleting the client.
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>
          <h5>Client Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Party ID:</strong> <Badge bg="info">{party.partyId}</Badge></p>
              <p><strong>Name:</strong> {party.name}</p>
              <p><strong>Phone:</strong> {party.phone}</p>
            </Col>
            <Col md={6}>
              <p><strong>Email:</strong> {party.email || '-'}</p>
              <p><strong>Address:</strong> {party.address}</p>
              <p><strong>Client Since:</strong> {new Date(party.createdAt).toLocaleDateString()}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Quotations ({quotations.length})</h3>
        {quotations.length > 0 && (
          <div>
            <Badge bg="secondary" className="me-2">
              Total: {quotations.length}
            </Badge>
            <Badge bg="success">
              Total Value: ₹{quotations.reduce((sum, q) => sum + q.totalAmount, 0).toLocaleString()}
            </Badge>
          </div>
        )}
      </div>

      {quotations.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>No quotations found</Card.Title>
            <Card.Text>
              This client doesn't have any quotations yet. Create your first quotation for this client.
            </Card.Text>
            <Link to={`/quotations/add/${id}`}>
              <Button variant="primary">Create Quotation</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Version</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quote) => (
              <tr key={quote._id}>
                <td>
                  <Link to={`/quotations/${quote._id}`}>
                    <Badge bg="light" text="dark" className="me-1">
                      {quote.title}
                    </Badge>
                  </Link>
                  {quote.originalQuote && (
                    <Badge bg="info" size="sm" className="ms-1">
                      Revision
                    </Badge>
                  )}
                </td>
                <td>
                  <Badge bg={quote.version === 1 ? 'primary' : 'secondary'}>
                    V{quote.version}
                  </Badge>
                </td>
                <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                <td>₹{quote.totalAmount.toLocaleString()}</td>
                <td>{getStatusBadge(quote.status)}</td>
                <td>
                  <Link to={`/quotations/${quote._id}`}>
                    <Button variant="info" size="sm" className="me-2">View</Button>
                  </Link>
                  <Link to={`/quotations/edit/${quote._id}`}>
                    <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  </Link>
                  <Link to={`/quotations/revise/${quote._id}`}>
                    <Button variant="primary" size="sm">Revise</Button>
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

export default PartyDetail;