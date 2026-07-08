"""Shared helpers for driving the document-your-data.html form in tests.

The form's inputs carry stable `data-testid` attributes (see DocumentForm.vue)
specifically so tests don't have to rely on fragile label-text or DOM-order
matching.
"""


def tid(page, name):
    return page.get_by_test_id(name)


def check_role(page, author_idx, role_value):
    tid(page, f"author-role-{author_idx}-{role_value}").check()


def add_language(page, label, value):
    tid(page, "lang-search").fill(label)
    tid(page, f"lang-option-{value}").click()


def add_script(page, label, value):
    tid(page, "script-search").fill(label)
    tid(page, f"script-option-{value}").click()


def fill_minimal_valid_form(page, orcid=None):
    """Fills every field required by the schema with valid sample data."""
    tid(page, "title").fill("Sample HTR Dataset")
    tid(page, "url").fill("https://github.com/example/sample-htr")
    tid(page, "description").fill("A sample ground truth dataset for testing.")
    tid(page, "license").select_option(label="CC-BY 4.0")
    tid(page, "format").select_option(label="ALTO XML")

    tid(page, "software").fill("Kraken")

    tid(page, "author-name-0").fill("Jane")
    tid(page, "author-surname-0").fill("Doe")
    if orcid:
        tid(page, "author-orcid-0").fill(orcid)
    check_role(page, 0, "transcriber")

    tid(page, "date-start").fill("1200")
    tid(page, "date-end").fill("1299")

    add_language(page, "Latin", "lat")
    add_script(page, "Latin", "Latn")

    tid(page, "metric-count-0").fill("42")
