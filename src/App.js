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
import { useLazyAccordion } from './useLazyAccordion';
import useSWRImmutable from 'swr/immutable';

const fetcher = (...args) => fetch(...args).then(res => res.json());

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
    console.log("Selected node:", node);
    setCurrentCategory(node.key);
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
    setCurrentCategory(node.key.replace(/ /g, '_'));
  }
  
  return (
    <>
    <style>
        {`
          .scrollable-column {
            max-height: 99vh;
            overflow-y: auto;
          }
        `}
      </style>
    <Container data-bs-theme="dark" fluid>
      <Row>
        <Col>
          <h2 className="text-primary mb-3">Current Category: {currentCategory.replace(/_/g, ' ')}</h2>
        </Col>
      </Row>
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
    </>
  );}

const WikidataInWikimedia = ({ endpoint, title }) => {
    const {data, error, isLoading} = useSWRImmutable(`/api/wikidata/resolve/${endpoint}/${title}`,fetcher);
    if (isLoading) return <div>Loading Wikidata item...</div>;
    if (error) return <div>Error loading Wikidata item: {error.message}</div>;
    if (!data) return <div>No Wikidata item found.</div>;
    return <WikidataView wditem={data} />;
}

const WikimediaInWikimedia = ({ originalEndpoint, title, targetEndpoint }) => {
    const {data: wditem, error: wderror, isLoading: wdloading} = useSWRImmutable(`/api/wikidata/resolve/${originalEndpoint}/${title}`,fetcher);
    const {data: targetTitle, error: targetError, isLoading: targetLoading} = useSWRImmutable(() => wditem ? `/api/wikidata/wikimedia/${targetEndpoint}/` + wditem : null, fetcher);

    if (wdloading || targetLoading) return <div>Loading...</div>;
    if (wderror) return <div>Error loading Wikidata item: {wderror.message}</div>;
    if (targetError) return <div>Error loading target Wikimedia page: {targetError.message}</div>;
    if (!wditem) return <div>No Wikidata item found.</div>;
    if (!targetTitle) return <div>No target Wikimedia page found.</div>;

    return <WikimediaView endpoint={targetEndpoint} title={targetTitle} />;
}

const WikimediaPage = ({ endpoint, title }) => {
    const ignore_wikidata = title.search(/\bat\b.*(Airport|Station)/i) !== -1;
    const { activeKey, onSelect, isOpened } = useLazyAccordion(["0"]);
    return (
    <Accordion activeKey={activeKey} onSelect={onSelect} alwaysOpen>
        <Accordion.Item eventKey="0">
            <Accordion.Header>Wikimedia Data</Accordion.Header>
            <Accordion.Body>
                {isOpened("0") && <WikimediaView endpoint={endpoint} title={title} />}
            </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
            <Accordion.Header>Wikidata</Accordion.Header>
            <Accordion.Body>
                { isOpened("1") && !ignore_wikidata && <WikidataInWikimedia endpoint={endpoint} title={title} /> }
            </Accordion.Body>
        </Accordion.Item>
          { endpoint !== 'en.wikipedia.org' && <Accordion.Item eventKey="2">
            <Accordion.Header>English Wikipedia</Accordion.Header>
            <Accordion.Body>
                { isOpened("2") && <WikimediaInWikimedia originalEndpoint={endpoint} title={title} targetEndpoint="en.wikipedia.org" /> }
            </Accordion.Body>
        </Accordion.Item>}
        { endpoint !== 'commons.wikimedia.org' && <Accordion.Item eventKey="3">
            <Accordion.Header>Commons</Accordion.Header>
            <Accordion.Body>
                { isOpened("3") && <WikimediaInWikimedia originalEndpoint={endpoint} title={title} targetEndpoint="commons.wikimedia.org" /> }
            </Accordion.Body>
        </Accordion.Item>}
    </Accordion>

  );
};

const WikimediaInWikidata = ({ wditem, endpoint }) => {
    const {data, error, isLoading} = useSWRImmutable(`/api/wikidata/wikimedia/${endpoint}/${wditem}`, fetcher);
    if (isLoading) return <div>Loading Wikimedia page...</div>;
    if (error) return <div>Error loading Wikimedia page: {error.message}</div>;
    if (!data) return <div>No Wikimedia page found for this Wikidata item.</div>;
    return <WikimediaView endpoint={endpoint} title={data} />;
}


const WikidataPage = ({wditem}) => {
    const { activeKey, onSelect, isOpened } = useLazyAccordion([]);

    return (
      <>
        <h1>{wditem}</h1>
        <Accordion activeKey={activeKey} onSelect={onSelect} alwaysOpen>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Wikidata</Accordion.Header>
                <Accordion.Body>
                    {isOpened("0") && <WikidataView wditem={wditem} />}
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>English Wikipedia</Accordion.Header>
                <Accordion.Body>
                    { isOpened("1") && <WikimediaInWikidata wditem={wditem} endpoint="en.wikipedia.org" /> }
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>Commons</Accordion.Header>
                <Accordion.Body>
                    { isOpened("2") && <WikimediaInWikidata wditem={wditem} endpoint="commons.wikimedia.org" /> }
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
