import React, { use, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import NewTree from './Tree';


const Images = ({category}) =>
{
   const [data, setData] = React.useState(null);

   useEffect(() => {
      console.log("Fetching images for category:", category);
      fetch(`/api/get_files/commons.wikimedia.org/${category}`).then(res => res.json()).then(setData)
        
    }, [category]);
    
   if (!data) return <div>Loading...</div>;
   if (data.length === 0) return <div>No images found in this category.</div>;
    
   return (
      <div>
        {data.map((item, index) => (
            <span>
            <img src={item.url} alt={item.title} style={{maxWidth: '200px'}}/>
            </span>
        ))}
      </div>
    );
}




function App() {
  const [topCategory, setTopCategory] = React.useState('Aircraft_at_London_Heathrow_Airport');
  const [currentCategory, setCurrentCategory] = React.useState('Aircraft_at_London_Heathrow_Airport');

  const handleSelect = (node) => {
    setCurrentCategory(node.key)
  }

  return (
    <div>
      <h1>Wikipedia Category Viewer -</h1>
      <Container data-bs-theme="dark" fluid>
      <Form> 
        <Form.Group className="mb-3" controlId="formTopCategory">
          <Form.Label>Top Category</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter top category" 
            value={topCategory} 
            onChange={(e) => {setTopCategory(e.target.value); setCurrentCategory(e.target.value);}} 
          />
        </Form.Group>
      
      </Form>
      <NewTree
          topLevel={topCategory}
          onSelect={handleSelect}
        />
      <Images category={currentCategory} />
      </Container>
    </div>
  );
}

export default App;
