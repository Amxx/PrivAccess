import * as React from 'react';
import { Container, Card, Modal, Button, Form } from 'react-bootstrap';

import Loading from './Loading'

export default (props) => {
  const [ loading, setLoading ] = React.useState(false);
  const [ result,  setResult  ] = React.useState();

  React.useEffect(() => {
    console.log(result)
    setLoading(false);
  }, [ result ]);

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('http://localhost:3000/secure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sig: event.target.elements.token.value })
    })
      .then(response => response.json())
      .then(setResult)
      .catch(() => setResult(undefined));

    setLoading(true);
  };

  return (
    !!loading
    ? <Loading/>
    : <Container className='d-flex flex-column' style={{ 'minHeight': '100vh' }}>
      <Card className='m-auto' style={{ 'minHeight': '30vh', 'minWidth': '30vw' }}>
        <Card.Header className='text-center'>
          Secure login
        </Card.Header>
        <Card.Body className='text-center'>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Access token</Form.Label>
              <Form.Control as="textarea" name="token" rows={5} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Connect
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Modal
        show={!!result}
        onHide={() => setResult(null)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Server responded</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { result?.error ?? result?.data }
        </Modal.Body>
      </Modal>
    </Container>
  );
}
