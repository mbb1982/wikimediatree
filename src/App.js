import React, { useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Accordion } from 'react-bootstrap';
import NewTree from './Tree';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import WikimediaView from './Wikimedia';
import WikidataView from './Wikidata';
import { useParams } from 'react-router-dom';
import { useFetch } from 'use-http';


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

const WikimediaTree = () => {
  const {endpoint,title: category} = useParams();
  const [currentCategory, setCurrentCategory] = React.useState(category);

  const handleSelect = (node) => {
    setCurrentCategory(node.key)
  }
  
  return (
    <Container data-bs-theme="dark" fluid>
      <Row>
        <Col xs={4} className="scrollable-column">
          <NewTree
            topLevel={category}
            endpoint={endpoint}
            onSelect={handleSelect}
          />
        </Col>
        <Col xs={8} className="scrollable-column">
          <WikimediaPage endpoint={endpoint} title={`Category:${currentCategory}`} />
        </Col>
      </Row>
    </Container>
  );
}

const WikimediaPage = ({ endpoint, title }) => {
    const { loading: wdloading, error: wderror, data: wditemid } = useFetch(`/api/wikidata/resolve/${endpoint}/${title}`, {}, [endpoint, title]);
     
    return (
    <Accordion defaultActiveKey={["0","1"]} alwaysOpen>
        <Accordion.Item eventKey="0">
            <Accordion.Header>Wikimedia Data</Accordion.Header>
            <Accordion.Body>
                <WikimediaView endpoint={endpoint} title={title} />
            </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
            <Accordion.Header>Wikidata</Accordion.Header>
            <Accordion.Body>
                { wditemid ? <WikidataView wditem={wditemid} /> : (wdloading ? <div>Loading Wikidata...</div> : (wderror ? <div>Error loading Wikidata: {wderror.message}</div> : <div>No Wikidata item found. {wditemid}</div>)) }
            </Accordion.Body>
        </Accordion.Item>
    </Accordion>
    );
}

const WikidataPage = ({wditem}) => {
    const { loading: enloading, error: enerror, data: enpageid } = useFetch(`/api/wikidata/wikimedia/en.wikipedia.org/${wditem}`, {}, [wditem]);
    const { loading: comloading, error: comerror, data: compageid } = useFetch(`/api/wikidata/wikimedia/commons.wikimedia.org/${wditem}`, {}, [wditem]);

    return (
      <>
        <h1>{enpageid ? enpageid.replace(/_/g, ' ') : "No English Wikipedia page found."}</h1>
        <Accordion defaultActiveKey={[]} alwaysOpen>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Wikidata</Accordion.Header>
                <Accordion.Body>
                    <WikidataView wditem={wditem} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>English Wikipedia</Accordion.Header>
                <Accordion.Body>
                    { enpageid ? <WikimediaView endpoint="en.wikipedia.org" title={enpageid} /> : (enloading ? <div>Loading English Wikipedia...</div> : (enerror ? <div>Error loading English Wikipedia: {enerror.message}</div> : <div>No English Wikipedia page found.</div>)) }
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>Commons</Accordion.Header>
                <Accordion.Body>
                    { compageid ? <WikimediaView endpoint="commons.wikimedia.org" title={compageid} /> : (comloading ? <div>Loading Commons...</div> : (comerror ? <div>Error loading Commons: {comerror.message}</div> : <div>No Commons page found.</div>)) }
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
      </>
    );
}

const WikimediaTop = () => {
  const { endpoint, title } = useParams();
  return <WikimediaPage endpoint={endpoint} title={title} />; 
}



const WikidataTop = () => {
  const { wditem } = useParams();
  return <WikidataPage wditem={wditem} />;
}

const CRSTop = () => {
  const { crs } = useParams();
  const { loading, error, data } = useFetch(`/api/wikidata/property/P4755/${crs}`, {}, [crs]);
  
  if (loading) return <div>Loading CRS data...</div>;
  if (error) return <div>Error loading CRS data: {error.message}</div>;
  return (
    <div>
      {data ? <WikidataPage wditem={data} /> : <div>No Wikidata item found for CRS {crs}.</div>}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WMTree />} />
          <Route path="wikimedia/tree/:endpoint/:title" element={<WikimediaTree />} />
          <Route path="wikimedia/:endpoint/:title" element={<WikimediaTop />} />
          <Route path="wikidata/:wditem" element={<WikidataTop />} />
          <Route path="crs/:crs" element={<CRSTop />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
