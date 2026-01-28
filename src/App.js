import React, { use, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import NewTree from './Tree';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import WikimediaView from './Wikimedia';
import { useParams } from 'react-router-dom';

const Images = ({wiki,category}) =>
{
   if(!wiki) wiki="commons.wikimedia.org";  
   const [data, setData] = React.useState(null);

   useEffect(() => {
      console.log("Fetching images for category:", category);
      setData(null);
      fetch(`/api/mediawiki/get_files/${wiki}/${category}`).then(res => res.json()).then(setData)
        
    }, [wiki,category]);
    
   if (!data) return <div>Loading...</div>;
   console.log(data);
   if (data.length === 0) return <div>No images found in this category.</div>;
    
   return (
      <div>
        {data.map((item, index) => (
            <span key={index}>
            <img src={item.url} alt={item.title} style={{maxWidth: '200px'}}/>
            </span>
        ))}
      </div>
    );
}

function Layout() {
  return (
    <div className="App">
      <header className="App-header">
        <Outlet />
      </header>
    </div>
  );
}


function WMTree() {
  const [topCategory, setTopCategory] = React.useState('Aircraft_at_London_Heathrow_Airport');
  const [currentCategory, setCurrentCategory] = React.useState('Aircraft_at_London_Heathrow_Airport');

  const handleSelect = (node) => {
    setCurrentCategory(node.key)
  }

  // Add some CSS for scrollable columns
  // You can put this in App.css or inside a <style> tag
  // Example inline style below

  return (
    <div>
      <style>
        {`
          .scrollable-column {
            max-height: 70vh;
            overflow-y: auto;
          }
        `}
      </style>
      <Container data-bs-theme="dark" fluid>
        <h1 className="display-4 text-center text-primary">Wikimedia Category Viewer </h1>
        <Row>
          <Col>
            <Form>
              <Form.Group className="mb-3" controlId="formTopCategory">
                <Form.Label>Top Category</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter top category"
                  value={topCategory}
                  onChange={(e) => { setTopCategory(e.target.value); setCurrentCategory(e.target.value); }}
                />
              </Form.Group>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col xs={4} className="scrollable-column">
            <NewTree
              topLevel={topCategory}
              onSelect={handleSelect}
            />
          </Col>
          <Col xs={8} className="scrollable-column">
            <Images category={currentCategory} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

const WikimediaViewWrapper = () => {
  const { endpoint, title } = useParams();
  return <WikimediaView endpoint={endpoint} title={title} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WMTree />} />
          <Route path="wikimedia/:endpoint/:title" element={<WikimediaViewWrapper />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
