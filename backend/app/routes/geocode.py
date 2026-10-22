from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/geocode", tags=["Geocoding & Maps"])

@router.get("/search")
def search_location(q: str = Query(..., description="Address or locality search query")):
    # Standard geocoding response
    results = [
        {
            "display_name": f"{q}, Delhi NCR, India",
            "lat": 28.5355,
            "lon": 77.3910,
            "address": {
                "road": q,
                "city": "Noida",
                "state": "Uttar Pradesh",
                "postcode": "201301"
            }
        },
        {
            "display_name": f"{q}, Gurugram, Haryana, India",
            "lat": 28.4595,
            "lon": 77.0266,
            "address": {
                "road": q,
                "city": "Gurugram",
                "state": "Haryana",
                "postcode": "122018"
            }
        }
    ]
    return {
        "success": True,
        "results": results
    }

@router.get("/reverse")
def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    return {
        "success": True,
        "address": {
            "address_line_1": f"Coordinates ({round(lat, 4)}, {round(lon, 4)})",
            "locality": "Sector 65",
            "city": "Gurugram",
            "state": "Haryana",
            "postal_code": "122018",
            "formatted": f"Pin at {round(lat, 4)}, {round(lon, 4)}, Gurugram, Delhi NCR"
        }
    }
