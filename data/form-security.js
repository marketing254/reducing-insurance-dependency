// ─────────────────────────────────────────────────────────────────
//  RID Academy — Form Security Utility
//  Guards all forms against bots, spam, and repeated submissions.
//  Include on any page with a form:
//    <script src="data/form-security.js"></script>
// ─────────────────────────────────────────────────────────────────
'use strict';
(function (w) {

  /* Shannon entropy — measures randomness of a string (higher = more random) */
  function entropy(s) {
    if (!s || s.length < 2) return 0;
    var f = {}, l = s.length, e = 0;
    for (var i = 0; i < l; i++) f[s[i]] = (f[s[i]] || 0) + 1;
    for (var c in f) { var p = f[c] / l; e -= p * Math.log2(p); }
    return e;
  }

  /* Detect junk / random character strings */
  function isJunk(s) {
    if (!s) return false;
    s = String(s).trim();
    if (s.length < 8) return false;
    var noSpace = s.indexOf(' ') === -1;
    var mixed   = /[A-Z]/.test(s) && /[a-z]/.test(s);
    var allUp   = s === s.toUpperCase() && /[A-Z]{3}/.test(s);
    if (entropy(s) > 3.4 && noSpace && s.length > 10) return true; // random chars
    if (mixed && noSpace && s.length > 8) return true;              // camelCase junk
    if (allUp && noSpace && s.length > 8) return true;              // ALLCAPS junk
    return false;
  }

  /* Phone validation — digits, spaces, dashes, parens, plus, dots only */
  function validPhone(s) {
    if (!s) return true; // optional field — pass
    return /^[\d\s\-\+\(\)\.]{6,20}$/.test(String(s).trim());
  }

  /* Rate limiting — one submission per form key per 24 hours */
  function canSubmit(key) {
    try {
      var t = localStorage.getItem('rida_sub_' + key);
      if (t && Date.now() - parseInt(t) < 86400000) return false;
    } catch (e) {}
    return true;
  }
  function markDone(key) {
    try { localStorage.setItem('rida_sub_' + key, String(Date.now())); } catch (e) {}
  }

  /* Time check — form must be open at least 3 seconds before submission */
  function tooFast(ts) { return Date.now() - (ts || w.RIDASec.t0) < 3000; }

  /* Honeypot — hidden field must remain empty; bots fill it automatically */
  function hpFilled(form) {
    var f = form && form.querySelector('.rida-hp');
    return f && f.value.length > 0;
  }

  w.RIDASec = {
    isJunk:     isJunk,
    validPhone: validPhone,
    canSubmit:  canSubmit,
    markDone:   markDone,
    tooFast:    tooFast,
    hpFilled:   hpFilled,
    t0:         Date.now() // page-load timestamp for speed check
  };

})(window);
