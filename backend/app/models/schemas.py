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
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    phone: Optional[str] = None
    address_line_1: Optional[str] = "Home Address"
    address_line_2: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = "Davangere"
    state: Optional[str] = "Karnataka"
    postal_code: Optional[str] = "577004"
    latitude: Optional[float] = 14.44086
    longitude: Optional[float] = 75.93329
    landmark: Optional[str] = None
    access_instructions: Optional[str] = None
    is_default: Optional[bool] = False

class BookingItemInput(BaseModel):
    test_id: Optional[str] = "test_default"
    item_name: Optional[str] = "Diagnostic Test"
    unit_price: Optional[float] = 0.0
    quantity: Optional[int] = 1
    line_total: Optional[float] = 0.0

class BookingCreateInput(BaseModel):
    patient_id: Optional[str] = "guest_patient"
    patient_name: str
    patient_phone: str
    scheduled_date: Optional[str] = None
    scheduled_slot: Optional[str] = "07:00 AM – 07:30 AM"
    address_snapshot: Optional[AddressSchema] = None
    items: Optional[List[BookingItemInput]] = []
    subtotal: Optional[float] = 0.0
    collection_fee: Optional[float] = 50.0
    tax_amount: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0
    patient_notes: Optional[str] = None
    booking_reference: Optional[str] = None
    payment_method: Optional[str] = "Cash on Collection"
    payment_status: Optional[str] = "Pending"

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
