/**
 * RIDA Academy — Shared Form Submission Utility
 * Include this script on any page that has a form.
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets: https://docs.google.com/spreadsheets/d/1FOeB6lyOCKzj4u9caLPxModWYrpCILE0h4-7O_0yR4s
 * 2. Extensions → Apps Script → paste contents of data/form-handler.gs → Save
 * 3. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL and paste it below as RIDA_FORM_ENDPOINT
 */

var RIDA_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwWT5_D6fRC74i6xXRsyOnAsE0l4rkg8K11Oe5So7Pr2UqRxLEQkxHJduKzYtYvmSRggw/exec';

/**
 * Submit form data to the Apps Script endpoint.
 * @param {Object} data        - key/value pairs to store (no need to include form_type)
 * @param {string} formType    - one of: waitlist | newsletter | webinar_access | partner | growth_engine
 * @returns {Promise<boolean>} - resolves true on success, false on failure
 */
function ridaSubmitForm(data, formType) {
  if (!RIDA_FORM_ENDPOINT || RIDA_FORM_ENDPOINT === 'PASTE_YOUR_WEB_APP_URL_HERE') {
    console.warn('RIDA forms: endpoint not configured in data/forms.js');
    return Promise.resolve(false);
  }

  var params = new URLSearchParams();
  params.set('form_type', formType || 'general');
  Object.keys(data).forEach(function(k) {
    if (data[k] !== undefined && data[k] !== null) {
      params.set(k, String(data[k]));
    }
  });

  return fetch(RIDA_FORM_ENDPOINT + '?' + params.toString(), {
    method: 'GET',
    mode: 'no-cors'
  })
    .then(function() { return true; })
    .catch(function(err) {
      console.error('RIDA form error:', err);
      return false;
    });
}
