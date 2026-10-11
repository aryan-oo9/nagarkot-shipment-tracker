# Nagarkot Shipment Tracker - Manual API Smoke Test (Windows PowerShell)
# Prerequisites:
# 1. Database migration 001_initial_schema.sql applied to Supabase PostgreSQL.
# 2. Backend server running: npm run dev or npm start on PORT 5000.
# Note: Always invokes curl.exe explicitly to avoid PowerShell Invoke-WebRequest alias collision.

$BASE_URL = "http://localhost:5000/api"
$RANDOM_SUFFIX = Get-Random -Minimum 100000 -Maximum 999999
$REF_NUMBER = "NF-$RANDOM_SUFFIX"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Nagarkot Shipment Tracker - API Verification Smoke Test" -ForegroundColor Cyan
Write-Host "Target Base URL: $BASE_URL" -ForegroundColor Cyan
Write-Host "Generated Reference Number: $REF_NUMBER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n[1/8] Probing API Health (GET /api/health)..." -ForegroundColor Yellow
curl.exe -s -X GET "$BASE_URL/health"

# 2. Create Shipment
Write-Host "`n`n[2/8] Creating New Shipment (POST /api/shipments)..." -ForegroundColor Yellow
$CREATE_BODY = @"
{
  "referenceNumber": "$REF_NUMBER",
  "origin": "Kathmandu, Nepal",
  "destination": "Hamburg, Germany",
  "currentStatus": "Booked",
  "expectedDeliveryDate": "2026-11-20"
}
"@
$CREATE_RES = curl.exe -s -X POST "$BASE_URL/shipments" `
  -H "Content-Type: application/json" `
  -d $CREATE_BODY
Write-Host $CREATE_RES

# Extract ID if jq or string parsing is available, otherwise user provides it
$CREATED_ID = 1
if ($CREATE_RES -match '"id":\s*(\d+)') {
    $CREATED_ID = $matches[1]
    Write-Host "Detected Created Shipment ID: $CREATED_ID" -ForegroundColor Green
}

# 3. List Shipments with Search
Write-Host "`n[3/8] Searching Shipments by Reference (GET /api/shipments?search=$REF_NUMBER)..." -ForegroundColor Yellow
curl.exe -s -X GET "$BASE_URL/shipments?search=$REF_NUMBER"

# 4. Filter Shipments by Status
Write-Host "`n`n[4/8] Filtering Shipments by Status (GET /api/shipments?status=Booked&limit=5)..." -ForegroundColor Yellow
curl.exe -s -X GET "$BASE_URL/shipments?status=Booked&limit=5"

# 5. Retrieve Shipment Details by ID
Write-Host "`n`n[5/8] Fetching Shipment Details (GET /api/shipments/$CREATED_ID)..." -ForegroundColor Yellow
curl.exe -s -X GET "$BASE_URL/shipments/$CREATED_ID"

# 6. Update Shipment Status
Write-Host "`n`n[6/8] Updating Shipment Status (PATCH /api/shipments/$CREATED_ID/status)..." -ForegroundColor Yellow
$UPDATE_BODY = @"
{
  "status": "In Transit",
  "note": "Airway bill dispatched from Tribhuvan International Airport Cargo terminal"
}
"@
curl.exe -s -X PATCH "$BASE_URL/shipments/$CREATED_ID/status" `
  -H "Content-Type: application/json" `
  -d $UPDATE_BODY

# 7. Retrieve Status History Trail
Write-Host "`n`n[7/8] Viewing Complete Status History (GET /api/shipments/$CREATED_ID/history)..." -ForegroundColor Yellow
curl.exe -s -X GET "$BASE_URL/shipments/$CREATED_ID/history"

# 8. Negative Tests (Validation & 404 Not Found)
Write-Host "`n`n[8/8] Testing Negative Cases (Invalid Date & Non-Existent ID)..." -ForegroundColor Yellow
Write-Host "A. Invalid Date (2026-02-31):" -ForegroundColor DarkGray
$INVALID_BODY = @"
{
  "referenceNumber": "NF-ERR",
  "origin": "Kathmandu",
  "destination": "Hamburg",
  "currentStatus": "Booked",
  "expectedDeliveryDate": "2026-02-31"
}
"@
curl.exe -s -X POST "$BASE_URL/shipments" `
  -H "Content-Type: application/json" `
  -d $INVALID_BODY

Write-Host "`nB. Non-Existent ID (GET /api/shipments/9999999):" -ForegroundColor DarkGray
curl.exe -s -X GET "$BASE_URL/shipments/9999999"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Smoke test sequence complete." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
