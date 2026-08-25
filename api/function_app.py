import azure.functions as func
import fastapi
import flickrapi
from httpx_cache import AsyncClient 
from dataaccess.common import USER_AGENT
from dataaccess.mediawiki import router as mediawiki_router
from dataaccess.wikidata import router as wikidata_router
from dataaccess.mapping import router as mapping_router
from wikidataquery import router as wikidata_query_router

client = AsyncClient()
client.headers.update({'User-Agent': USER_AGENT})

fast_app = fastapi.FastAPI()

fast_app.include_router(mediawiki_router, prefix="/api")
fast_app.include_router(wikidata_router, prefix="/api")
fast_app.include_router(wikidata_query_router, prefix="/api")
fast_app.include_router(mapping_router, prefix="/api") 

@fast_app.get("/api/xxx")
async def read_root():
    return {"Hello": "World"}

@fast_app.get("/api/get_children/{wiki}/{category}")
async def get_children(wiki: str, category: str):
    category=category.replace("Category:","")
    url="https://"+wiki+"/w/api.php?action=query&cmtitle=Category:"+category+"&list=categorymembers&format=json&cmtype=subcat&cmlimit=500"
    response = await client.get(url)
    return [{"key":x['title'].replace("Category:", ""),"title":x['title'].replace("Category:", "")} for x in response.json()['query']['categorymembers']]

@fast_app.get("/api/get_files/{wiki}/{category}")
async def get_files(wiki: str, category: str):
    category=category.replace("Category:","")
    url="https://"+wiki+"/w/api.php?action=query&gcmtitle=Category:"+category+"&generator=categorymembers&format=json&gcmtype=file&prop=imageinfo&iiprop=url&gcmlimit=25"
    response = await client.get(url)
    
    
    to_return = []
    if 'query' not in response.json():
        return to_return
    for x in response.json()['query']['pages'].values():
        if 'imageinfo' in x and len(x['imageinfo'])>0:
            to_return.append({"title":x['title'], "url":x['imageinfo'][0]['url']})
    return to_return

@fast_app.get("/api/flickr/by_tag/{tag}")
async def get_flickr_by_tag(tag: str):
    api_key = "5a18587b862f40ef157fb411c6e65a4d"
    api_secret = "ab17e0c812597839"
    flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json')
    photos = flickr.photos.search(tags=tag, per_page=10, extras='url_m')
    return [{"title": photo['title'], "url": photo['url_m']} for photo in photos['photos']['photo']]

app = func.AsgiFunctionApp(app=fast_app,
                           http_auth_level=func.AuthLevel.FUNCTION)