from fastapi import APIRouter
from dataaccess.wikidata import get_wikidata_sparql
router = APIRouter()



def query_wikidata(wd_item: str, wikibase_type: str) -> str:
    return f"""
    SELECT ?propertyLabel ?property ?value ?valueLabel ?propertyTypeLabel WHERE {{
      VALUES ?item {{ wd:{wd_item} }}
      ?item ?p ?value .
      ?property wikibase:directClaim ?p .
      ?property wikibase:propertyType ?propertyType .
      FILTER(?propertyType = wikibase:{wikibase_type})
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """

def query_incoming_properties(wd_item: str) -> str:
    return f"""
    SELECT ?propertyLabel ?property ?value ?valueLabel WHERE {{
      VALUES ?item {{ wd:{wd_item} }}
      ?value ?p ?item .
      ?property wikibase:directClaim ?p .
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """

def get_qualifier_query(item_id: str) -> str:
    """
    Generates a SPARQL query to find all cases where a specific item 
    is used as a qualifier value, including the main property's value.
    
    Args:
        item_id (str): The Wikidata QID (e.g., 'Q922967')
        
    Returns:
        str: The formatted SPARQL query string.
    """
    # Ensure the item_id has the 'wd:' prefix for the query
    if not item_id.startswith('wd:'):
        item_id = f"wd:{item_id}"

    query = f"""
    SELECT ?item ?itemLabel ?mainProperty ?mainPropertyLabel ?mainValue ?mainValueLabel ?qualifierProperty ?qualifierPropertyLabel WHERE {{
      # 1. Look for a statement node (?s) where the item is a qualifier value
      ?s ?pq {item_id} .
      ?qualifierProperty wikibase:qualifier ?pq .

      # 2. Find the subject item and the property linking to this statement
      ?item ?p ?s .
      ?mainProperty wikibase:claim ?p .

      # 3. Retrieve the value of that main statement
      ?mainProperty wikibase:statementProperty ?ps .
      ?s ?ps ?mainValue .

      # 4. Label service for human-readable names
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    ORDER BY ?itemLabel
    """
    return query




def get_uri_suffix(uri: str) -> str:
    """Extract the suffix from a Wikidata URI."""
    return uri.split("/")[-1]

@router.get("/wikidata/related/{wd_item}")
async def wikidata_related(wd_item: str):
    """Get all properties and values for the specified Wikidata item."""
    result = await get_wikidata_sparql(query_wikidata(wd_item, "WikibaseItem"))
    return [{
        "propertyId": get_uri_suffix(binding['property']['value']),
        "propertyLabel": binding['propertyLabel']['value'],
        "valueId": get_uri_suffix(binding['value']['value']),
        "valueLabel": binding['valueLabel']['value']
    } for binding in result['results']['bindings']]

@router.get("/wikidata/identifiers/{wd_item}")
async def wikidata_external_ids(wd_item: str):
    """Get all external identifier properties and values for the specified Wikidata item."""
    result = await get_wikidata_sparql(query_wikidata(wd_item, "ExternalId"))
    return [{
        "propertyId": get_uri_suffix(binding['property']['value']),
        "propertyLabel": binding['propertyLabel']['value'],
        "value": binding['value']['value']
    } for binding in result['results']['bindings']]

@router.get("/wikidata/incoming/{wd_item}")
async def wikidata_incoming(wd_item: str):
    """Get all properties and values for items that have the specified Wikidata item as a value."""
    result = await get_wikidata_sparql(query_incoming_properties(wd_item))
    return [{
        "propertyId": get_uri_suffix(binding['property']['value']),
        "propertyLabel": binding['propertyLabel']['value'],
        "valueId": get_uri_suffix(binding['value']['value']),
        "valueLabel": binding['valueLabel']['value']
    } for binding in result['results']['bindings']]

@router.get("/wikidata/media/{wd_item}")
async def wikidata_media(wd_item: str):
    """Get all media files associated with the specified Wikidata item."""
    result = await get_wikidata_sparql(query_wikidata(wd_item, "CommonsMedia"))
    return [{
        "propertyId": get_uri_suffix(binding['property']['value']),
        "propertyLabel": binding['propertyLabel']['value'],
        "mediaFile": binding['valueLabel']['value']
    } for binding in result['results']['bindings']]

@router.get("/wikidata/qualifiers/{wd_item}")
async def wikidata_qualifiers(wd_item: str):
    """Get all qualifiers for statements where the specified Wikidata item is used as a qualifier value."""
    result = await get_wikidata_sparql(get_qualifier_query(wd_item))
    return [{
        "itemId": get_uri_suffix(binding['item']['value']),
        "itemLabel": binding['itemLabel']['value'],
        "mainPropertyId": get_uri_suffix(binding['mainProperty']['value']),
        "mainPropertyLabel": binding['mainPropertyLabel']['value'],
        "mainValueId": get_uri_suffix(binding['mainValue']['value']),
        "mainValueLabel": binding['mainValueLabel']['value'],
        "qualifierPropertyId": get_uri_suffix(binding['qualifierProperty']['value']),
        "qualifierPropertyLabel": binding['qualifierPropertyLabel']['value']
    } for binding in result['results']['bindings']]



@router.get("/wikidata/properties/{wd_item}/{wikibase_type}")
async def wikidata_query(wd_item: str, wikibase_type: str):
    """Query Wikidata for properties of the specified type for the given item."""
    return await get_wikidata_sparql(query_wikidata(wd_item, wikibase_type))