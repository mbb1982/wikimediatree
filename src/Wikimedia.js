import { useFetch } from 'use-http';
import { ListGroup, Accordion } from 'react-bootstrap';
import RenderJson from './RenderJson';

const Categories = ({ endpoint, title }) => {  
    console.log("Fetching categories for:", endpoint, title);
    const { loading, error, data } = useFetch(`/api/mediawiki/categories/${endpoint}/${title}`, {}, [endpoint, title]);

    if (loading) return <div>Loading categories...</div>;
    if (error) return <div>Error loading categories: {error.message}</div>;
    
    return (
        <ListGroup>
            {data.map((category) => (
                <ListGroup.Item key={category}>
                    {category}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}

const Infobox = ({ endpoint, title }) => {  
    const { loading, error, data } = useFetch(`/api/mediawiki/infobox/${endpoint}/${title}`, {}, [endpoint, title]);

    if (loading) return <div>Loading infobox...</div>;
    if (error) return <div>Error loading infobox: {error.message}</div>;
    
    return (
        <RenderJson data={data} />
    );
}

const ResolvedWikidata = ({endpoint, title}) => {
    const { loading, error, data } = useFetch(`/api/wikidata/resolve/${endpoint}/${title}`, {}, [endpoint, title]);
        
    if (loading) return <div>Loading resolved Wikidata...</div>;
    if (error) return <div>Error loading resolved Wikidata: {error.message}</div>;
    return (
        <div>
            {data}
        </div>
    )
}

const Images = ({endpoint,title}) =>
{
   if(!endpoint) endpoint="commons.wikimedia.org";  
   const {loading, error, data} = useFetch(`/api/mediawiki/get_files/${endpoint}/${title}`, {}, [endpoint, title]);

    if (loading) return <div>Loading images...</div>;
    if (error) return <div>Error loading images: {error.message}</div>;
    
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


const WikimediaView = ({ endpoint, title }) => {
    return (
        <Accordion defaultActiveKey={[]} alwaysOpen>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Categories</Accordion.Header>
                <Accordion.Body>
                    <Categories endpoint={endpoint} title={title} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>Infobox</Accordion.Header>
                <Accordion.Body>
                    <Infobox endpoint={endpoint} title={title} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>Images</Accordion.Header>
                <Accordion.Body>
                    <Images endpoint={endpoint} title={title} />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
}

export default WikimediaView;

