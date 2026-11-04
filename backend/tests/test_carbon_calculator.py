import pytest
from app.services.carbon.calculator import CarbonCalculator


def test_regional_weekend_visitor():
    """Test Persona A - Regional Weekend Visitor."""
    calculator = CarbonCalculator()

    inputs = {
        "arrival_mode": "transport_passenger_car_gasoline",
        "one_way_distance_miles": 105,
        "round_trip": True,
        "vehicles": 1,
        "party_size": 2,
        "local_driving_miles": 30,
        "local_vehicle_type": "transport_passenger_car_gasoline",
        "transit_passenger_miles_per_person": 0,
        "lodging_type": "lodging_hotel_us_average",
        "nights": 1,
        "rooms": 1,
        "food_type": "food_full_service",
        "food_spending_per_person_per_day": 50,
        "days": 2,
        "activities": [
            {"category": "activity_festivals_events", "spending_whole_party": 50},
            {"category": "activity_shopping", "spending_whole_party": 30}
        ]
    }

    result = calculator.calculate_trip_footprint(inputs)

    # Expected values from spreadsheet (allowing for rounding)
    assert abs(result["arrival"] - 62.7) < 0.5, f"Expected arrival ~62.7, got {result['arrival']}"
    assert abs(result["local_mobility"] - 9.0) < 0.5, f"Expected local mobility ~9.0, got {result['local_mobility']}"
    assert abs(result["lodging"] - 16.1) < 0.5, f"Expected lodging ~16.1, got {result['lodging']}"
    assert abs(result["food"] - 38.8) < 0.5, f"Expected food ~38.8, got {result['food']}"
    assert abs(result["activities"] - 8.0) < 0.5, f"Expected activities ~8.0, got {result['activities']}"
    assert abs(result["total"] - 134.5) < 1.0, f"Expected total ~134.5, got {result['total']}"
    assert abs(result["per_person"] - 67.3) < 0.5, f"Expected per person ~67.3, got {result['per_person']}"
    assert abs(result["per_person_per_day"] - 33.6) < 0.5, f"Expected per person per day ~33.6, got {result['per_person_per_day']}"


def test_leisure_traveler():
    """Test Persona B - Experience-Seeking Leisure Traveler."""
    calculator = CarbonCalculator()

    inputs = {
        "arrival_mode": "transport_air_medium_haul",
        "one_way_distance_miles": 1300,
        "round_trip": True,
        "vehicles": 0,
        "party_size": 2,
        "local_driving_miles": 80,
        "local_vehicle_type": "transport_passenger_car_gasoline",
        "transit_passenger_miles_per_person": 0,
        "lodging_type": "lodging_hotel_us_average",
        "nights": 2,
        "rooms": 1,
        "food_type": "food_full_service",
        "food_spending_per_person_per_day": 80,
        "days": 3,
        "activities": [
            {"category": "activity_wineries", "spending_whole_party": 120},
            {"category": "activity_outdoor_recreation", "spending_whole_party": 75}
        ]
    }

    result = calculator.calculate_trip_footprint(inputs)

    # Expected values from spreadsheet (allowing for rounding)
    assert abs(result["arrival"] - 676.5) < 1.0, f"Expected arrival ~676.5, got {result['arrival']}"
    assert abs(result["local_mobility"] - 23.9) < 0.5, f"Expected local mobility ~23.9, got {result['local_mobility']}"
    assert abs(result["lodging"] - 32.2) < 0.5, f"Expected lodging ~32.2, got {result['lodging']}"
    assert abs(result["food"] - 93.1) < 0.5, f"Expected food ~93.1, got {result['food']}"
    assert abs(result["activities"] - 39.5) < 0.5, f"Expected activities ~39.5, got {result['activities']}"
    assert abs(result["total"] - 865.2) < 2.0, f"Expected total ~865.2, got {result['total']}"
    assert abs(result["per_person"] - 432.6) < 1.0, f"Expected per person ~432.6, got {result['per_person']}"
    assert abs(result["per_person_per_day"] - 144.2) < 0.5, f"Expected per person per day ~144.2, got {result['per_person_per_day']}"


def test_university_visitor():
    """Test Persona C - University-Connected Visitor."""
    calculator = CarbonCalculator()

    inputs = {
        "arrival_mode": "transport_passenger_car_gasoline",
        "one_way_distance_miles": 250,
        "round_trip": True,
        "vehicles": 1,
        "party_size": 2,
        "local_driving_miles": 40,
        "local_vehicle_type": "transport_passenger_car_gasoline",
        "transit_passenger_miles_per_person": 5,
        "lodging_type": "lodging_hotel_us_average",
        "nights": 2,
        "rooms": 1,
        "food_type": "food_full_service",
        "food_spending_per_person_per_day": 50,
        "days": 3,
        "activities": [
            {"category": "activity_shopping", "spending_whole_party": 60},
            {"category": "activity_festivals_events", "spending_whole_party": 60}
        ]
    }

    result = calculator.calculate_trip_footprint(inputs)

    # Expected values from spreadsheet (allowing for rounding)
    assert abs(result["arrival"] - 149.3) < 0.5, f"Expected arrival ~149.3, got {result['arrival']}"
    assert abs(result["local_mobility"] - 12.6) < 0.5, f"Expected local mobility ~12.6, got {result['local_mobility']}"
    assert abs(result["lodging"] - 32.2) < 0.5, f"Expected lodging ~32.2, got {result['lodging']}"
    assert abs(result["food"] - 58.2) < 0.5, f"Expected food ~58.2, got {result['food']}"
    assert abs(result["activities"] - 12.2) < 0.5, f"Expected activities ~12.2, got {result['activities']}"
    assert abs(result["total"] - 264.6) < 1.0, f"Expected total ~264.6, got {result['total']}"
    assert abs(result["per_person"] - 132.3) < 0.5, f"Expected per person ~132.3, got {result['per_person']}"
    assert abs(result["per_person_per_day"] - 44.1) < 0.5, f"Expected per person per day ~44.1, got {result['per_person_per_day']}"


def test_missing_factors():
    """Test handling of missing factors."""
    calculator = CarbonCalculator()

    inputs = {
        "arrival_mode": "transport_passenger_car_gasoline",
        "one_way_distance_miles": 100,
        "round_trip": True,
        "vehicles": 1,
        "party_size": 2,
        "local_driving_miles": 0,
        "local_vehicle_type": "transport_passenger_car_gasoline",
        "transit_passenger_miles_per_person": 0,
        "lodging_type": "lodging_vacation_rental",  # This factor is unavailable
        "nights": 1,
        "rooms": 1,
        "food_type": "food_full_service",
        "food_spending_per_person_per_day": 50,
        "days": 2,
        "activities": []
    }

    result = calculator.calculate_trip_footprint(inputs)

    assert "lodging: Vacation rental / Airbnb" in result["missing_factors"]
    assert result["lodging"] == 0.0


def test_flight_category_determination():
    """Test flight distance category logic."""
    calculator = CarbonCalculator()

    assert calculator.get_flight_category(200) == "transport_air_short_haul"
    assert calculator.get_flight_category(300) == "transport_air_medium_haul"
    assert calculator.get_flight_category(1000) == "transport_air_medium_haul"
    assert calculator.get_flight_category(2300) == "transport_air_medium_haul"
    assert calculator.get_flight_category(3000) == "transport_air_long_haul"
