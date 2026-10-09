import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv(".env")
api_key = os.getenv("GEMINI_API_KEY")

async def test():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        print(res.status_code)
        import json
        data = res.json()
        for m in data.get("models", []):
            print(m["name"])

if __name__ == "__main__":
    asyncio.run(test())
