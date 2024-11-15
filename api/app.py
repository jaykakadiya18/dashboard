from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import httpx

app = FastAPI()

# Function to fetch data from external API
async def fetch_external_data():
    url = "https://screenpalss.online/test/gettraffic.php"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Route to get data
@app.get("/data")
async def get_data():
    data = await fetch_external_data()
    return JSONResponse(content=data)

# Serve static files for HTML and JS
app.mount("/static", StaticFiles(directory="../static"), name="static")
