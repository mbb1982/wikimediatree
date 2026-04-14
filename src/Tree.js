import React, { useState, useEffect } from 'react';
import { CloseButton } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';

const TreeList = ( {treeData,onClick,onClose})=>
{
  console.log("TreeList");
  console.log(treeData);
  return (
    <ListGroup>
      {treeData.map((item) => (
        <ListGroupItem key={item.key} eventKey={item.key} onClick={(event) => onClick(event, item)}>
          {item.title}
          {item.children && item.children.length > 0 && (
            <>
              <CloseButton onClick={(event) => onClose(event, item)} />
              <TreeList treeData={item.children} onClick={onClick} onClose={onClose} />
            </>
          )}
        </ListGroupItem>
      ))}
    </ListGroup>
  );
}

const updateTreeData = (treeData, key, children) => {
    return treeData.map(node => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) };
      }
      return node;
    });
  };

const removeChildren = (treeData, key) => {
  return treeData.map(node => {
    if (node.key === key) {
      const { children, ...rest } = node;
      return rest;
    }
    if (node.children) {
      return { ...node, children: removeChildren(node.children, key) };
    }
    return node;
  });
}  

const fetchChildren = (key, endpoint) => {
  return new Promise((resolve) => {
    fetch("/api/get_children/"+endpoint+"/"+key)
    .then(resp => resp.json())
    .then(data => resolve(data))
    
  });
}

const NewTree = ( {topLevel, endpoint='commons.wikimedia.org', onSelect})=>
{
  console.log("NewTree with topLevel:", topLevel);
    const [treeData, setTreeData] = useState([{key:topLevel,title:topLevel}]);
    const [topElement, setTopElement] = useState(topLevel)

    // Add this effect to update treeData when initialTreeData changes
    useEffect(() => {
      if (topLevel !== topElement) {
        setTreeData([{key:topLevel,title:topLevel}]);
        setTopElement(topLevel);
      }
    }, [topLevel]);

    const onClick = (event,item) => {
      onSelect(item);
      event.stopPropagation();
      fetchChildren(item.key, endpoint).then(children => {
        setTreeData(treeData => updateTreeData(treeData, item.key, children));
      });
    }

    const onClose = (event,item) => {
      event.stopPropagation();
      setTreeData(treeData => removeChildren(treeData, item.key));
    }

    return (
        <TreeList treeData={treeData} onClick={onClick} onClose={onClose}/>
    );
}

export default NewTree;