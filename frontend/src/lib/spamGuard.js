// Shared anti-spam / junk-data guard for every form on the WeHA site.
// Used client-side for instant, friendly feedback. The same rules are mirrored
// server-side (backend/validation.py and functions/_lib/validate.js) so the
// checks cannot be bypassed by posting directly to the API.

// Temporary / disposable / test inbox providers we refuse.
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "test.com", "test.test", "test.org", "example.com", "example.org", "example.net",
  "email.com", "mailinator.com", "yopmail.com", "guerrillamail.com", "guerrillamail.info",
  "sharklasers.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "throwaway.email",
  "trashmail.com", "fakeinbox.com", "getnada.com", "dispostable.com", "maildrop.cc",
  "mintemail.com", "mohmal.com", "spam4.me", "fakemail.net", "tempr.email", "discard.email",
  "nada.email", "mvrht.com", "getairmail.com", "mailnesia.com", "mailcatch.com",
  "tempmailo.com", "mailto.plus", "emailondeck.com", "spambox.us",
]);

// Obvious placeholder / keyboard-mash values (compared after stripping non-alphanumerics).
const JUNK_WORDS = new Set([
  "test", "testing", "tester", "test123", "testtest", "asdf", "asdfasdf", "asdfgh",
  "asdfghjkl", "qwerty", "qwertyuiop", "qwe", "qweqwe", "qwertz", "zxcvbn", "zxcv",
  "abc", "abcd", "abcde", "abcdef", "xyz", "aaa", "aaaa", "bbbb", "cccc", "xxxx",
  "zzzz", "name", "firstname", "lastname", "fullname", "fname", "lname", "yourname",
  "johndoe", "janedoe", "na", "none", "nil", "null", "nan", "foo", "bar", "baz",
  "foobar", "sample", "demo", "dummy", "user", "username", "admin", "anonymous",
  "anon", "unknown", "blah", "blahblah", "lorem", "ipsum", "nothing", "noname",
]);

const JUNK_EMAIL_LOCALS = new Set([
  "test", "testing", "tester", "asdf", "qwerty", "fake", "spam", "sample", "demo",
  "example", "noreply", "no-reply", "abc", "xyz", "aaa", "user", "admin", "dummy",
]);

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const allSameChar = (s) => s.length > 1 && /^(.)\1+$/.test(s);
const hasKeyboardMash = (n) =>
  ["asdf", "qwert", "zxcv", "asdfgh", "qwerty"].some((seq) => n.includes(seq));
const looksLikeUrl = (s) => /(https?:\/\/|www\.|\.[a-z]{2,}\/)/i.test(String(s || ""));

// Returns an error message string, or null when the value is acceptable.
export function validateName(value) {
  const v = String(value || "").trim();
  if (!v) return "Please enter your name.";
  if (v.length < 2) return "Please enter your full name.";
  if ((v.match(/[a-zA-Z]/g) || []).length < 2) return "Please enter a valid name.";
  if (/\d/.test(v)) return "Names should not contain numbers. Please enter your real name.";
  if (looksLikeUrl(v)) return "Please enter a valid name, not a link.";
  const n = norm(v);
  if (allSameChar(n)) return "That name looks like test data. Please enter your real name.";
  if (JUNK_WORDS.has(n) || hasKeyboardMash(n))
    return "That name looks like test data. Please enter your real name.";
  return null;
}

export function validateEmail(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
    return "Please enter a valid email address.";
  const [local, domain] = v.split("@");
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain))
    return "Please use a real, permanent email (no temporary or test inboxes).";
  if (JUNK_EMAIL_LOCALS.has(local) || allSameChar(local))
    return "Please use a real email address, not a test address.";
  return null;
}

export function validateCompany(value) {
  const v = String(value || "").trim();
  if (!v) return "Please enter your company name.";
  if (v.length < 2) return "Please enter a valid company name.";
  if (looksLikeUrl(v)) return "Please enter a valid company name, not a link.";
  const n = norm(v);
  if (allSameChar(n)) return "That company name looks like test data. Please enter your real company.";
  if (JUNK_WORDS.has(n) || hasKeyboardMash(n))
    return "That company name looks like test data. Please enter your real company.";
  return null;
}

export function validateFreeText(value, label = "this", min = 10) {
  const v = String(value || "").trim();
  if (!v) return `Please describe ${label}.`;
  if (v.length < min) return `Please give a bit more detail about ${label}.`;
  const n = norm(v);
  if (allSameChar(n) || JUNK_WORDS.has(n) || hasKeyboardMash(n))
    return "That looks like test data. Please describe your actual process.";
  return null;
}

// Honeypot: a hidden field real users never fill. If it has any value, it is a bot.
export function isHoneypotTripped(value) {
  return String(value || "").trim().length > 0;
}

// Convenience runners. Each returns the first error message found, or null.
export function checkLeadFields({ name, email, hp } = {}) {
  if (isHoneypotTripped(hp)) return "Submission blocked. Please try again.";
  return validateName(name) || validateEmail(email);
}

export function checkContactFields({ name, company, email, process, hp } = {}) {
  if (isHoneypotTripped(hp)) return "Submission blocked. Please try again.";
  return (
    validateName(name) ||
    validateCompany(company) ||
    validateEmail(email) ||
    validateFreeText(process, "the process you want to fix")
  );
}
