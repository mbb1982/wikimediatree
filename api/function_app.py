import azure.functions as func
import fastapi
from httpx_cache import AsyncClient 
from dataaccess.common import USER_AGENT
from dataaccess.mediawiki import router as mediawiki_router
from dataaccess.wikidata import router as wikidata_router
from wikidataquery import router as wikidata_query_router

client = AsyncClient()
client.headers.update({'User-Agent': USER_AGENT})

fast_app = fastapi.FastAPI()

fast_app.include_router(mediawiki_router, prefix="/api")
fast_app.include_router(wikidata_router, prefix="/api")
fast_app.include_router(wikidata_query_router, prefix="/api")

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

app = func.AsgiFunctionApp(app=fast_app,
                           http_auth_level=func.AuthLevel.FUNCTION)