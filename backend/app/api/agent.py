from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from app.services.agent.agent import CayugaCompassAgent
import os

router = APIRouter()
agent = CayugaCompassAgent()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    trip_data: Dict = {}


@router.post("/chat")
async def chat(request: ChatRequest):
    """AI agent chat endpoint - uses OpenAI-compatible provider if key configured, otherwise deterministic fallback."""
    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        # Deterministic fallback - no LLM, just tool calls
        return {
            "response": _deterministic_fallback(request.message, request.trip_data),
            "mode": "deterministic",
            "note": "AI chat requires OPENAI_API_KEY in .env. This is a deterministic planning assistant."
        }

    # LLM-powered agent with tool calling
    return await _llm_chat(request.message, request.conversation_history, request.trip_data)


def _deterministic_fallback(message: str, trip_data: Dict) -> str:
    """Deterministic planning assistant without LLM."""
    msg_lower = message.lower()

    if "carbon" in msg_lower or "footprint" in msg_lower or "emissions" in msg_lower:
        if trip_data:
            result = agent.calculator.calculate_trip_footprint(trip_data)
            return f"Your estimated trip footprint is {result['total']:.1f} kg CO2e. Breakdown: Arrival {result['arrival']:.1f}kg, Local {result['local_mobility']:.1f}kg, Lodging {result['lodging']:.1f}kg, Food {result['food']:.1f}kg, Activities {result['activities']:.1f}kg."
        return "I can calculate your carbon footprint. Please provide trip details like transportation, distance, party size, lodging, and activities."

    if "itinerary" in msg_lower or "plan" in msg_lower or "attractions" in msg_lower:
        from app.services.itineraries.generator import ItineraryGenerator
        gen = ItineraryGenerator("data")
        interests = []
        if "hiking" in msg_lower or "nature" in msg_lower or "waterfall" in msg_lower:
            interests.extend(["hiking", "nature"])
        if "food" in msg_lower or "dining" in msg_lower or "restaurant" in msg_lower:
            interests.extend(["dining", "local food"])
        if "museum" in msg_lower or "culture" in msg_lower or "art" in msg_lower:
            interests.extend(["museum", "culture"])
        if "wine" in msg_lower or "cider" in msg_lower or "winery" in msg_lower:
            interests.extend(["wineries"])
        if "shopping" in msg_lower or "downtown" in msg_lower:
            interests.extend(["shopping", "downtown"])
        if "campus" in msg_lower or "cornell" in msg_lower:
            interests.extend(["campus", "education"])
        result = gen.generate(interests, 1)
        if not result["stops"]:
            return "I couldn't find matching attractions for your interests. Try specifying things like hiking, museums, wineries, or campus tours."
        stops = [
            f"  • Day {s.get('day', 1)} {s['time']}: {s['name']} ({s['area']})"
            + (f" [{s['transport_note']}]" if s.get("transport_note") else "")
            for s in result["stops"][:5]
        ]
        explanation = result.get("carbon_explanation")
        response = f"Here's a suggested {result['name'].lower()}:\n" + "\n".join(stops)
        if explanation:
            response += f"\n\n{explanation}"
        return response

    if "bus" in msg_lower or "tcat" in msg_lower or "transit" in msg_lower:
        return ("TCAT (Tompkins Consolidated Area Transit) is the main car-free option: $1.50 per ride "
                "(daily cap $3, free under 18), all buses wheelchair accessible. Documented attraction "
                "connections include Route 67 to Buttermilk and Treman, Route 31 to the Lab of Ornithology, "
                "and Route 13 to the Farmers Market and Stewart Park. Park routes 22/23 run in summer only. "
                "Confirm schedules at tcatbus.com.")

    if "hotel" in msg_lower or "stay" in msg_lower or "lodging" in msg_lower or "b&b" in msg_lower or "camp" in msg_lower:
        result = agent._search_lodging({"query": msg_lower})
        props = result.get("properties", [])
        if props:
            p = props[0]
            note = f" Sustainability: {p['certification_status']}" if p.get("certification_status") else ""
            return (f"{p['name']} ({p['area']}) - {p['description']}. "
                    f"Walkability: {p['walkability']}. Transport: {', '.join(p.get('transportation_access', []))}.{note}")
        return ("I can search our researched lodging - hotels, inns, B&Bs, glamping, camping, and farm stays. "
                "Tell me a name or the kind of place you're looking for.")

    if "alternative" in msg_lower or "sustainable" in msg_lower or "lower" in msg_lower:
        return "Lower-carbon alternatives include: taking intercity buses (OurBus, Greyhound, FlixBus, Cornell Campus-to-Campus) instead of driving, carpooling, using TCAT locally, walking/biking the Cayuga Waterfront and Black Diamond trails, and choosing documented walkable lodging. Would you like me to calculate savings for a specific scenario?"

    return "I can help you plan a sustainable trip to Ithaca. Ask me about your carbon footprint, itineraries, local attractions, where to stay, getting around, or lower-carbon alternatives."


async def _llm_chat(message: str, history: List[ChatMessage], trip_data: Dict) -> Dict:
    """LLM-powered agent with tool calling."""
    import httpx

    tools = agent.get_tools()
    messages = [{"role": "system", "content": "You are Cayuga Compass, a sustainable tourism assistant for Ithaca, NY. Help visitors plan lower-carbon trips, understand their carbon footprint, and discover local attractions. Always use tools for calculations - never fabricate emissions figures, transit routes, schedules, business hours, admission prices, fares, certifications, or travel times. Prefer documented data with verification status; flag anything provisional or seasonal and link to the official source when unsure. Ask clarifying questions when inputs needed for a calculation are missing. Be concise and helpful."}]

    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": message})

    if trip_data:
        messages[-1]["content"] += f"\n\nCurrent trip data: {json.dumps(trip_data)}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{os.environ.get('OPENAI_BASE_URL', 'https://api.openai.com/v1')}/chat/completions",
            headers={"Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}"},
            json={
                "model": "gpt-4o-mini",
                "messages": messages,
                "tools": tools,
                "tool_choice": "auto",
            }
        )
        result = response.json()
        choice = result["choices"][0]["message"]

        # Handle tool calls
        if choice.get("tool_calls"):
            tool_results = []
            for tc in choice["tool_calls"]:
                tool_name = tc["function"]["name"]
                tool_args = json.loads(tc["function"]["arguments"])
                tool_result = await agent.execute_tool(tool_name, tool_args)
                tool_results.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "name": tool_name,
                    "content": json.dumps(tool_result)
                })

            # Get final response with tool results
            messages.append({"role": "assistant", "tool_calls": choice["tool_calls"]})
            messages.extend(tool_results)

            response2 = await client.post(
                f"{os.environ.get('OPENAI_BASE_URL', 'https://api.openai.com/v1')}/chat/completions",
                headers={"Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": messages,
                }
            )
            result2 = response2.json()
            return {
                "response": result2["choices"][0]["message"]["content"],
                "mode": "llm",
                "tools_used": [tc["function"]["name"] for tc in choice["tool_calls"]]
            }

        return {
            "response": choice["content"],
            "mode": "llm"
        }
