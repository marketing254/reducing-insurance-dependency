/**
 * RIDA Academy — Kit (ConvertKit) integration.
 *
 * Submits every RIDA form to BOTH the Apps Script sheet (primary) AND the
 * corresponding Kit list (additive), so leads land in Kit's subscriber
 * database where the team can send broadcasts, sequences, and tagged
 * automations.
 *
 * Why this is browser-side, not server-side
 * -----------------------------------------
 * Kit's anti-spam reads the Origin and Referer headers on the submission
 * POST. Browser fetch() sends both automatically; a server-to-server POST
 * (e.g. from the Apps Script) sends neither, and Kit silently flags those
 * submissions — the endpoint still returns {status:"success"} but the
 * subscriber never appears in the list. The skill at
 * skills/kit-integration/SKILL.md documents this trap in detail.
 *
 * Discovering form IDs and field keys
 * -----------------------------------
 * Each entry below was extracted from the form's published JS bundle via:
 *   curl -sL "https://skilled-originator-8937.kit.com/<slug>/index.js" \
 *     | grep -oE 'app\.kit\.com/forms/[0-9]+/subscriptions|fields\[[a-zA-Z_]+\]' \
 *     | sort -u
 * The *numeric* ID (not the alphanumeric slug) is what the API expects.
 */
(function () {
  var KIT_BASE = 'https://app.kit.com/forms/';

  // RIDA form_type → { id, fields }
  //   id     = numeric form ID (NOT the slug)
  //   fields = { kitFieldKey: ridaPayloadKey }
  //
  // `email_address` is always sent (top-level, not wrapped in fields[]).
  // `timestamp` is always sent (ISO string). Both are implicit — no entry
  // here. Only custom fields the specific Kit form actually accepts are
  // listed; sending an unknown key silently drops it.
  var KIT_FORMS = {
    newsletter: {
      id: 9594048,
      fields: {}
    },
    webinar_access: {
      id: 9594015,
      fields: {
        full_name: 'name',
        webinar:   'webinar',
        resource:  'resource',
        category:  'category'
      }
    },
    podcast_access: {
      id: 9594027,
      fields: {
        full_name: 'name',
        resource:  'resource'
      }
    },
    articles_access: {
      id: 9594043,
      fields: {
        full_name: 'name'
      }
    },
    contact: {
      id: 9594036,
      fields: {
        first_name:    'first_name',
        last_name:     'last_name',
        phone:         'phone',
        practice_name: 'practice',  // RIDA payload uses 'practice'; Kit expects 'practice_name'
        subject:       'subject',
        message:       'message',
        source:        'source'
      }
    },
    partner: {
      id: 9594051,
      fields: {
        first_name: 'first_name',
        last_name:  'last_name',
        phone:      'phone',
        company:    'company',
        role:       'role',
        type:       'type',
        topic:      'topic'
      }
    }
    // waitlist / growth_engine / general_access have no dedicated Kit
    // form — the helper no-ops for those form_types.
  };

  function ridaSubmitToKit(data, formType) {
    var cfg = KIT_FORMS[formType];
    if (!cfg) return;

    var email = String((data && data.email) || '').trim();
    if (!email || email.indexOf('@') < 0) return;

    var body = new URLSearchParams();
    body.set('email_address', email);
    body.set('fields[timestamp]', new Date().toISOString());

    Object.keys(cfg.fields).forEach(function (kitKey) {
      var ridaKey = cfg.fields[kitKey];
      var value = data && data[ridaKey];
      if (value === undefined || value === null) return;
      value = String(value).trim();
      if (!value) return;
      body.set('fields[' + kitKey + ']', value);
    });

    // Fire-and-forget. Never block the primary submission flow on Kit:
    // their endpoint can be slow or briefly unavailable, and the sheet
    // write is what the team relies on. CORS is open on this endpoint.
    try {
      fetch(KIT_BASE + cfg.id + '/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).catch(function () {});
    } catch (e) {
      // Browser blocked the fetch outright (CSP, offline, etc.) — silent.
    }
  }

  window.ridaSubmitToKit = ridaSubmitToKit;
})();
