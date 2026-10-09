import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv(".env")

api_key = os.getenv("GEMINI_API_KEY")

async def test(model):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": "Hello"}]}],
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload)
        print(f"{model}: {res.status_code}")
        if res.status_code != 200:
            print(res.text)

async def main():
    await test("gemini-1.5-pro")
    await test("gemini-1.5-pro-latest")
    await test("gemini-pro")

if __name__ == "__main__":
    asyncio.run(main())
