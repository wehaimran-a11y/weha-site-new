"""Server-side anti-spam / junk-data validation.

Mirrors the rules in frontend/src/lib/spamGuard.js so the same checks apply
whether a form is submitted through the UI or posted directly to the API.
Each helper raises fastapi.HTTPException(422, detail=...) on bad input.
"""
import re
from fastapi import HTTPException

DISPOSABLE_EMAIL_DOMAINS = {
    "test.com", "test.test", "test.org", "example.com", "example.org", "example.net",
    "email.com", "mailinator.com", "yopmail.com", "guerrillamail.com", "guerrillamail.info",
    "sharklasers.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "throwaway.email",
    "trashmail.com", "fakeinbox.com", "getnada.com", "dispostable.com", "maildrop.cc",
    "mintemail.com", "mohmal.com", "spam4.me", "fakemail.net", "tempr.email", "discard.email",
    "nada.email", "mvrht.com", "getairmail.com", "mailnesia.com", "mailcatch.com",
    "tempmailo.com", "mailto.plus", "emailondeck.com", "spambox.us",
}

JUNK_WORDS = {
    "test", "testing", "tester", "test123", "testtest", "asdf", "asdfasdf", "asdfgh",
    "asdfghjkl", "qwerty", "qwertyuiop", "qwe", "qweqwe", "qwertz", "zxcvbn", "zxcv",
    "abc", "abcd", "abcde", "abcdef", "xyz", "aaa", "aaaa", "bbbb", "cccc", "xxxx",
    "zzzz", "name", "firstname", "lastname", "fullname", "fname", "lname", "yourname",
    "johndoe", "janedoe", "na", "none", "nil", "null", "nan", "foo", "bar", "baz",
    "foobar", "sample", "demo", "dummy", "user", "username", "admin", "anonymous",
    "anon", "unknown", "blah", "blahblah", "lorem", "ipsum", "nothing", "noname",
}

JUNK_EMAIL_LOCALS = {
    "test", "testing", "tester", "asdf", "qwerty", "fake", "spam", "sample", "demo",
    "example", "noreply", "no-reply", "abc", "xyz", "aaa", "user", "admin", "dummy",
}

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
_URL_RE = re.compile(r"(https?://|www\.|\.[a-z]{2,}/)", re.IGNORECASE)
_KEYBOARD = ("asdf", "qwert", "zxcv", "asdfgh", "qwerty")


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def _all_same_char(s: str) -> bool:
    return len(s) > 1 and len(set(s)) == 1


def _has_keyboard_mash(n: str) -> bool:
    return any(seq in n for seq in _KEYBOARD)


def _fail(msg: str):
    raise HTTPException(status_code=422, detail=msg)


def validate_name(value):
    v = (value or "").strip()
    if not v:
        _fail("Please enter your name.")
    if len(v) < 2:
        _fail("Please enter your full name.")
    if len(re.findall(r"[a-zA-Z]", v)) < 2:
        _fail("Please enter a valid name.")
    if re.search(r"\d", v):
        _fail("Names should not contain numbers. Please enter your real name.")
    if _URL_RE.search(v):
        _fail("Please enter a valid name, not a link.")
    n = _norm(v)
    if _all_same_char(n) or n in JUNK_WORDS or _has_keyboard_mash(n):
        _fail("That name looks like test data. Please enter your real name.")


def validate_email(value, required=True):
    v = (value or "").strip().lower()
    if not v:
        if required:
            _fail("Please enter your email address.")
        return
    if not _EMAIL_RE.match(v):
        _fail("Please enter a valid email address.")
    local, _, domain = v.partition("@")
    if domain in DISPOSABLE_EMAIL_DOMAINS:
        _fail("Please use a real, permanent email (no temporary or test inboxes).")
    if local in JUNK_EMAIL_LOCALS or _all_same_char(local):
        _fail("Please use a real email address, not a test address.")


def validate_company(value, required=True):
    v = (value or "").strip()
    if not v:
        if required:
            _fail("Please enter your company name.")
        return
    if len(v) < 2:
        _fail("Please enter a valid company name.")
    if _URL_RE.search(v):
        _fail("Please enter a valid company name, not a link.")
    n = _norm(v)
    if _all_same_char(n) or n in JUNK_WORDS or _has_keyboard_mash(n):
        _fail("That company name looks like test data. Please enter your real company.")


def validate_free_text(value, label="this", min_len=10):
    v = (value or "").strip()
    if not v:
        _fail(f"Please describe {label}.")
    if len(v) < min_len:
        _fail(f"Please give a bit more detail about {label}.")
    n = _norm(v)
    if _all_same_char(n) or n in JUNK_WORDS or _has_keyboard_mash(n):
        _fail("That looks like test data. Please describe your actual process.")


def check_honeypot(value):
    if (value or "").strip():
        # Looks like a bot. Reject generically.
        _fail("Submission could not be processed.")
