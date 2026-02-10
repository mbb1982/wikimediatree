import {useFetch } from "use-http";
import Table from 'react-bootstrap/Table';
import { Accordion } from "react-bootstrap";

const WikidataRelated = ({wditem})   => {
    const { loading, error, data } = useFetch(`/api/wikidata/related/${wditem}`, {}, [wditem]);
        
    if (loading) return <div>Loading Wikidata properties...</div>;
    if (error) return <div>Error loading Wikidata properties: {error.message}</div>;
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Property ID</th>
                    <th>Property Label</th>
                    <th>Value ID</th>
                    <th>Value Label</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.propertyId}</td>
                        <td>{item.propertyLabel}</td>
                        <td>{item.valueId}</td>
                        <td>{item.valueLabel}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

 const WikidataIncoming = ({wditem})   => {
    const { loading, error, data } = useFetch(`/api/wikidata/incoming/${wditem}`, {}, [wditem]);
        
    if (loading) return <div>Loading incoming Wikidata properties...</div>;
    if (error) return <div>Error loading incoming Wikidata properties: {error.message}</div>;
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Item ID</th>
                    <th>Item Label</th>
                    <th>Property ID</th>
                    <th>Property Label</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.valueId}</td>
                        <td>{item.valueLabel}</td>
                        <td>{item.propertyId}</td>
                        <td>{item.propertyLabel}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

const WikidataIdentifiers = ({wditem})   => {
    const { loading, error, data } = useFetch(`/api/wikidata/identifiers/${wditem}`, {}, [wditem]);
        
    if (loading) return <div>Loading Wikidata identifiers...</div>;
    if (error) return <div>Error loading Wikidata identifiers: {error.message}</div>;
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Identifier ID</th>
                    <th>Identifier Label</th>
                    <th>Identifier Value</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.propertyId}</td>
                        <td>{item.propertyLabel}</td>
                        <td>{item.value}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

const WikidataQualifiers = ({wditem})   => {
    const { loading, error, data } = useFetch(`/api/wikidata/qualifiers/${wditem}`, {}, [wditem]);
        
    if (loading) return <div>Loading Wikidata qualifiers...</div>;
    if (error) return <div>Error loading Wikidata qualifiers: {error.message}</div>;
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Item ID</th>
                    <th>Item Label</th>
                    <th>Main Property ID</th>
                    <th>Main Property Label</th>
                    <th>Main Value ID</th>
                    <th>Main Value Label</th>
                    <th>Qualifier Property ID</th>
                    <th>Qualifier Property Label</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.itemId}</td>
                        <td>{item.itemLabel}</td>
                        <td>{item.mainPropertyId}</td>
                        <td>{item.mainPropertyLabel}</td>
                        <td>{item.mainValueId}</td>
                        <td>{item.mainValueLabel}</td>
                        <td>{item.qualifierPropertyId}</td>
                        <td>{item.qualifierPropertyLabel}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

const WikidataMedia = ({wditem}) => {
    const { loading, error, data } = useFetch(`/api/wikidata/media/${wditem}`, {}, [wditem]);
        
    if (loading) return <div>Loading Wikidata media...</div>;
    if (error) return <div>Error loading Wikidata media: {error.message}</div>;
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Property ID</th>
                    <th>Property Label</th>
                    <th>Media File</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.propertyId}</td>
                        <td>{item.propertyLabel}</td>
                        <td><img src={item.mediaFile} alt={item.propertyLabel} style={{maxWidth: '200px'}}/></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

const wikidataView = ({wditem}) => {
    return (
        <Accordion defaultActiveKey={["0","1","2","3","4"]} alwaysOpen>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Related Properties</Accordion.Header>
                <Accordion.Body>
                    <WikidataRelated wditem={wditem} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>Incoming Properties</Accordion.Header>
                <Accordion.Body>
                    <WikidataIncoming wditem={wditem} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>Identifiers</Accordion.Header>
                <Accordion.Body>
                    <WikidataIdentifiers wditem={wditem} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
                <Accordion.Header>Qualifiers</Accordion.Header>
                <Accordion.Body>
                    <WikidataQualifiers wditem={wditem} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
                <Accordion.Header>Media</Accordion.Header>
                <Accordion.Body>
                    <WikidataMedia wditem={wditem} />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
}

export default wikidataView;