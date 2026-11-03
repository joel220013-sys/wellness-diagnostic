export function formatDbBooking(r: any): any {
  const ref = r.order_number || String(r.id);

  let addr = r.address_snapshot;
  if (typeof addr === 'string') {
    try {
      addr = JSON.parse(addr);
    } catch {
      addr = {};
    }
  } else if (!addr || typeof addr !== 'object') {
    addr = {};
  }

  let items = r.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  } else if (!Array.isArray(items)) {
    items = [];
  }

  let sampleDetails = r.sample_details;
  if (typeof sampleDetails === 'string') {
    try {
      sampleDetails = JSON.parse(sampleDetails);
    } catch {
      sampleDetails = undefined;
    }
  }

  let createdStr = new Date().toISOString();
  if (r.created_at) {
    createdStr = r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at);
  }

  let updatedStr = createdStr;
  if (r.updated_at) {
    updatedStr = r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at);
  }

  const dId = r.assigned_driver_id ? String(r.assigned_driver_id) : null;
  const dName = r.driver_name || r.assigned_driver_name || null;
  const dPhone = r.driver_phone || null;
  const dBadge = r.driver_badge_id || null;

  return {
    id: String(r.id),
    booking_reference: ref,
    order_number: ref,
    patient_id: String(r.patient_id || 'user_patient_1'),
    patient_name: r.patient_name || 'Patient',
    patient_phone: r.patient_phone || '',
    scheduled_date: String(r.scheduled_date || r.collection_date || ''),
    scheduled_slot: r.scheduled_slot || r.time_slot || '07:30 AM – 09:00 AM',
    status: r.status || 'Pending',
    total_amount: Number(r.total_amount) || 0,
    subtotal: Number(r.subtotal ?? r.total_amount) || 0,
    collection_fee: Number(r.collection_fee) || 0,
    payment_status: r.payment_status || 'Pending',
    payment_method: r.payment_method || 'Cash on Collection',
    address_snapshot: addr,
    items,
    sample_details: sampleDetails,
    driver_id: dId,
    assigned_driver_id: dId,
    driver_name: dName,
    assigned_driver_name: dName,
    driver_phone: dPhone,
    driver_badge_id: dBadge,
    patient_notes: r.patient_notes || '',
    report_id: r.report_id || null,
    created_at: createdStr,
    updated_at: updatedStr,
  };
}
