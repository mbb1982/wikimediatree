import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import { LinkIfURL } from './Wrapper';

const RenderJson = ({ data }) => {
  if (Array.isArray(data)) {
    const hasNestedElements = data.some(item => Array.isArray(item) || (typeof item === 'object' && item !== null));
    return (
      <ListGroup horizontal={!hasNestedElements}>
        {data.map((item, index) => (
        <ListGroupItem key={index}>
          <RenderJson data={item} />
        </ListGroupItem>
        ))}
      </ListGroup>
      );
  } else if (typeof data === 'object' && data !== null) {
    return (
      <ListGroup>
        {Object.keys(data).map((key) => (
          <ListGroupItem key={key}>
            <Badge bg="light" text="dark">{key}</Badge> <RenderJson data={data[key]} />
          </ListGroupItem>
        ))}
      </ListGroup>
    );
  } else {
    return <span><LinkIfURL text={String(data)} target="_blank">{String(data)}</LinkIfURL></span>;
  }
};

export default RenderJson;