from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

class TestItem(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    category: str
    price: int
    original_price: Optional[int] = None
    preparation_instructions: Optional[str] = None
    turnaround_description: Optional[str] = None
    sample_type: Optional[str] = None
    active: bool = True

class PackageItem(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    price: int
    original_price: Optional[int] = None
    preparation_instructions: Optional[str] = None
    tests_included: List[str] = []
    active: bool = True

class AddressSchema(BaseModel):
    id: Optional[str] = None
    patient_id: Optional[str] = None
    label: Optional[str] = "Home"
    recipient_name: str
    recipient_phone: Optional[str] = None
    phone: Optional[str] = None
    address_line_1: str
    address_line_2: Optional[str] = None
    locality: Optional[str] = None
    city: str
    state: Optional[str] = "Delhi NCR"
    postal_code: str
    latitude: float
    longitude: float
    landmark: Optional[str] = None
    access_instructions: Optional[str] = None
    is_default: Optional[bool] = False

class BookingItemInput(BaseModel):
    test_id: str
    item_name: str
    unit_price: int
    quantity: int = 1
    line_total: int

class BookingCreateInput(BaseModel):
    patient_id: str
    patient_name: str
    patient_phone: str
    scheduled_date: str
    scheduled_slot: str
    address_snapshot: AddressSchema
    items: List[BookingItemInput]
    subtotal: int
    collection_fee: int
    tax_amount: int = 0
    total_amount: int
    patient_notes: Optional[str] = None

class AssignmentCreateInput(BaseModel):
    booking_id: str
    driver_id: str
    driver_name: str
    driver_phone: Optional[str] = None

class CollectionCompleteInput(BaseModel):
    barcode: str
    notes: Optional[str] = None
    tubes_collected: Optional[List[str]] = None

class CollectionFailInput(BaseModel):
    reason: str
    notes: Optional[str] = None
