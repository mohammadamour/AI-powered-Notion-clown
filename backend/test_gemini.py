import asyncio
import os
from dotenv import load_dotenv

# load env variables
load_dotenv(".env")

from app.services.gardener import _process_with_gemini

async def test():
    try:
        content = "Man I am so tired today, barely slept because I was up trying to fix that weird bug in the authentication flow..."
        res = await _process_with_gemini(content)
        print("Success!")
        print(res)
    except Exception as e:
        print("Failed!")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
