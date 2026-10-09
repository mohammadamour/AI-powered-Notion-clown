import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv(".env")

api_key = os.getenv("GEMINI_API_KEY")

async def test(model):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    prompt = """You are an AI "Gardener".
Return JSON only:
{
  "title": "Title",
  "summary": "Summary",
  "tags": ["tag1"],
  "category": "Coding",
  "action_items": ["Action 1"],
  "connections": ["Conn 1"]
}
Input: Need to finish the database setup today, also I need to buy groceries like milk and eggs. I had a great idea for a new feature where blocks can link to each other
"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload)
        print(f"{model}: {res.status_code}")
        if res.status_code != 200:
            print(res.text)
        else:
            print(res.json())

async def main():
    await test("gemini-3.5-flash")

if __name__ == "__main__":
    asyncio.run(main())
