"""
End-to-end tests for the document-your-data.html metadata generator form.

Drives the real Vue page with Playwright (not just the generate() logic in
isolation) since the class of bug being guarded against is "the UI never
actually produces schema-valid output".

Run with:
    npm run dev                                   # in one terminal
    env/bin/python -m pytest tests/ -v            # in another
"""
import json
from pathlib import Path

import jsonschema
import pytest
import yaml

from formhelpers import fill_minimal_valid_form, check_role, tid

SCHEMA = json.loads((Path(__file__).parent / "fixtures" / "schema.json").read_text())


def generate_and_get_output(page):
    tid(page, "generate-btn").click()
    return tid(page, "output").input_value()


def validate_yaml(yaml_text):
    doc = yaml.safe_load(yaml_text)
    jsonschema.validate(doc, SCHEMA)
    return doc


def test_happy_path_validates_against_schema(form_page):
    fill_minimal_valid_form(form_page, orcid="0000-0001-2345-6789")
    output = generate_and_get_output(form_page)
    assert output.strip() != ""
    doc = validate_yaml(output)
    assert doc["schema"] == "https://htr-united.github.io/schema/2023-06-27/schema.json"
    assert doc["format"] == "Alto-XML"
    assert doc["script"] == [{"iso": "Latn"}]
    assert doc["hands"]["count"] == "1-per-file"
    assert isinstance(doc["volume"][0]["count"], int)
    assert doc["license"] == {
        "name": "CC-BY 4.0",
        "url": "https://creativecommons.org/licenses/by/4.0/",
    }
    assert doc["authors"][0]["roles"] == ["transcriber"]
    assert doc["authors"][0]["orcid"] == "0000-0001-2345-6789"


def test_orcid_url_is_stripped_to_bare_id(form_page):
    fill_minimal_valid_form(form_page, orcid="https://orcid.org/0000-0001-2345-6789")
    output = generate_and_get_output(form_page)
    doc = validate_yaml(output)
    assert doc["authors"][0]["orcid"] == "0000-0001-2345-6789"


def test_generate_is_blocked_when_required_fields_are_missing(form_page):
    # Deliberately leave everything empty.
    output = generate_and_get_output(form_page)
    assert output.strip() == ""
    assert tid(form_page, "validation-errors").is_visible()


def test_single_global_hand_and_images_metric_options_are_valid(form_page):
    fill_minimal_valid_form(form_page)
    tid(form_page, "hands-count").select_option(label="1 for the whole dataset")
    tid(form_page, "metric-type-0").select_option(label="Images")
    output = generate_and_get_output(form_page)
    doc = validate_yaml(output)
    assert doc["hands"]["count"] == "1"
    assert doc["volume"][0]["metric"] == "images"


@pytest.mark.parametrize(
    "role_value",
    ["project-manager", "quality-control", "digitization", "data-provider"],
)
def test_all_new_role_enum_values_validate(form_page, role_value):
    fill_minimal_valid_form(form_page)
    check_role(form_page, 0, role_value)
    output = generate_and_get_output(form_page)
    doc = validate_yaml(output)
    assert role_value in doc["authors"][0]["roles"]


def test_regression_reported_broken_combination_now_validates(form_page):
    """
    Reproduces (as closely as the UI allows) the field choices behind the two
    originally-reported broken catalog entries: a format pick, hands 'per
    file', a 'project manager'-style role, and a license selection all now
    have to come out schema-valid.
    """
    fill_minimal_valid_form(form_page, orcid="https://orcid.org/0000-0003-1955-556X")
    tid(form_page, "format").select_option(label="PAGE XML")
    check_role(form_page, 0, "project-manager")
    check_role(form_page, 0, "quality-control")

    output = generate_and_get_output(form_page)
    doc = validate_yaml(output)
    assert doc["format"] == "Page-XML"
    assert set(doc["authors"][0]["roles"]) >= {"transcriber", "project-manager", "quality-control"}
    assert doc["authors"][0]["orcid"] == "0000-0003-1955-556X"
