/**
 * Saindani newsletter -> Google Sheets
 * ------------------------------------
 * Receives POSTs from the site's subscribe forms (js/main.js) and appends
 * each email to the bound spreadsheet, with basic validation + de-duping.
 *
 * SETUP
 * 1. Create a new Google Sheet (e.g. "Saindani Subscribers").
 * 2. Extensions -> Apps Script. Delete the boilerplate `myFunction` file
 *    and paste this whole file in its place.
 * 3. Deploy -> New deployment -> gear icon -> "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Click Deploy and authorize the permissions Google asks for.
 * 4. Copy the "Web app URL" it gives you (ends in /exec).
 * 5. Paste that URL into SUBSCRIBE_ENDPOINT in js/main.js, replacing
 *    "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE".
 *
 * Any time you edit this file afterwards, you must push a new version:
 * Deploy -> Manage deployments -> pencil icon -> New version -> Deploy.
 * (The /exec URL stays the same across versions.)
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var email = ((e.parameter && e.parameter.email) || "").trim().toLowerCase();
  var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValid) {
    return jsonResponse({ result: "error", message: "Invalid email" });
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Email", "Source page"]);
  }

  var rowCount = sheet.getLastRow() - 1;
  var existing = rowCount > 0
    ? sheet.getRange(2, 2, rowCount, 1).getValues().flat()
    : [];

  if (existing.indexOf(email) === -1) {
    sheet.appendRow([new Date(), email, (e.parameter && e.parameter.source) || ""]);
  }

  return jsonResponse({ result: "success" });
}

function doGet(e) {
  return ContentService.createTextOutput("This endpoint only accepts POST requests.");
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
