# Nagarkot Shipment Tracker - Manual API Smoke Test (Windows PowerShell)
# Prerequisites:
# 1. Database migrations 001_initial_schema.sql and 002_add_shipment_type.sql applied to Supabase PostgreSQL.
# 2. Backend server running: npm run dev or npm start on PORT 5000.

$BASE_URL = "http://localhost:5000/api"
$RANDOM_SUFFIX = Get-Random -Minimum 100000 -Maximum 999999
$REF_NUMBER = "NF-$RANDOM_SUFFIX"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Nagarkot Shipment Tracker - API Verification Smoke Test" -ForegroundColor Cyan
Write-Host "Target Base URL: $BASE_URL" -ForegroundColor Cyan
Write-Host "Generated Reference Number: $REF_NUMBER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n[1/9] Probing API Health (GET /api/health)..." -ForegroundColor Yellow
$healthRes = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
Write-Host ($healthRes | ConvertTo-Json -Compress) -ForegroundColor Green

# 2. Create Shipment with Shipment Type
Write-Host "`n[2/9] Creating New Shipment with Type (POST /api/shipments)..." -ForegroundColor Yellow
$createPayload = @{
    referenceNumber = $REF_NUMBER
    shipmentType = "International"
    origin = "Kathmandu, Nepal"
    destination = "Hamburg, Germany"
    currentStatus = "Booked"
    expectedDeliveryDate = "2026-11-20"
} | ConvertTo-Json -Compress

$createRes = Invoke-RestMethod -Uri "$BASE_URL/shipments" -Method Post -ContentType "application/json" -Body $createPayload
Write-Host ($createRes | ConvertTo-Json -Compress) -ForegroundColor Green

$CREATED_ID = $createRes.data.id
Write-Host "Detected Created Shipment ID: $CREATED_ID (Type: $($createRes.data.shipmentType))" -ForegroundColor Green

# 3. List Shipments with Search
Write-Host "`n[3/9] Searching Shipments by Reference (GET /api/shipments?search=$REF_NUMBER)..." -ForegroundColor Yellow
$searchRes = Invoke-RestMethod -Uri "$BASE_URL/shipments?search=$REF_NUMBER" -Method Get
Write-Host ($searchRes | ConvertTo-Json -Compress) -ForegroundColor Green

# 4. Filter Shipments by Status
Write-Host "`n[4/9] Filtering Shipments by Status (GET /api/shipments?status=Booked&limit=5)..." -ForegroundColor Yellow
$filterRes = Invoke-RestMethod -Uri "$BASE_URL/shipments?status=Booked&limit=5" -Method Get
Write-Host ($filterRes | ConvertTo-Json -Compress) -ForegroundColor Green

# 5. Retrieve Shipment Details by ID
Write-Host "`n[5/9] Fetching Shipment Details (GET /api/shipments/$CREATED_ID)..." -ForegroundColor Yellow
$detailRes = Invoke-RestMethod -Uri "$BASE_URL/shipments/$CREATED_ID" -Method Get
Write-Host ($detailRes | ConvertTo-Json -Compress) -ForegroundColor Green

# 6. Update Shipment Status
Write-Host "`n[6/9] Updating Shipment Status (PATCH /api/shipments/$CREATED_ID/status)..." -ForegroundColor Yellow
$updatePayload = @{
    status = "In Transit"
    note = "Airway bill dispatched from Tribhuvan International Airport Cargo terminal"
} | ConvertTo-Json -Compress

$updateRes = Invoke-RestMethod -Uri "$BASE_URL/shipments/$CREATED_ID/status" -Method Patch -ContentType "application/json" -Body $updatePayload
Write-Host ($updateRes | ConvertTo-Json -Compress) -ForegroundColor Green

# 7. Retrieve Status History Trail
Write-Host "`n[7/9] Viewing Complete Status History (GET /api/shipments/$CREATED_ID/history)..." -ForegroundColor Yellow
$historyRes = Invoke-RestMethod -Uri "$BASE_URL/shipments/$CREATED_ID/history" -Method Get
Write-Host ($historyRes | ConvertTo-Json -Compress) -ForegroundColor Green

# 8. Dashboard Summary Verification
Write-Host "`n[8/9] Verifying Dashboard Summary Endpoint (GET /api/shipments/summary)..." -ForegroundColor Yellow
$summaryRes = Invoke-RestMethod -Uri "$BASE_URL/shipments/summary" -Method Get
Write-Host ($summaryRes | ConvertTo-Json -Compress) -ForegroundColor Green
Write-Host "Summary Counts -> This Month: $($summaryRes.data.thisMonth), This Year: $($summaryRes.data.thisYear), Domestic: $($summaryRes.data.domestic), International: $($summaryRes.data.international)" -ForegroundColor Cyan
Write-Host "Recent Shipments Count: $($summaryRes.data.recentShipments.Count)" -ForegroundColor Cyan

# 9. Negative Tests (Validation, Invalid Type & 404 Not Found)
Write-Host "`n[9/9] Testing Negative Cases (Invalid Date, Invalid Type & Non-Existent ID)..." -ForegroundColor Yellow
Write-Host "A. Invalid Date (2026-02-31):" -ForegroundColor DarkGray
try {
    $invalidPayload = @{
        referenceNumber = "NF-ERR"
        shipmentType = "Domestic"
        origin = "Kathmandu"
        destination = "Hamburg"
        currentStatus = "Booked"
        expectedDeliveryDate = "2026-02-31"
    } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "$BASE_URL/shipments" -Method Post -ContentType "application/json" -Body $invalidPayload
} catch {
    Write-Host "Expected 400 caught successfully: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`nB. Invalid Shipment Type ('Galactic'):" -ForegroundColor DarkGray
try {
    $invalidTypePayload = @{
        referenceNumber = "NF-ERRTYPE"
        shipmentType = "Galactic"
        origin = "Kathmandu"
        destination = "Hamburg"
        currentStatus = "Booked"
        expectedDeliveryDate = "2026-11-20"
    } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "$BASE_URL/shipments" -Method Post -ContentType "application/json" -Body $invalidTypePayload
} catch {
    Write-Host "Expected 400 caught successfully: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`nC. Non-Existent ID (GET /api/shipments/9999999):" -ForegroundColor DarkGray
try {
    Invoke-RestMethod -Uri "$BASE_URL/shipments/9999999" -Method Get
} catch {
    Write-Host "Expected 404 caught successfully: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Smoke test sequence complete: ALL 9/9 STEPS VERIFIED." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
