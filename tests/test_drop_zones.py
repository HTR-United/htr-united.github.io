"""Regression tests for the local-analysis drop zones.

Two failures were reported on the deployed site when dropping a folder:

  1. A drop landing anywhere but the small dropzone let the browser perform its
     default action, i.e. navigate to file:///…, which Firefox rejects with
     "cannot load data or link to file:///". Guarded by asserting the drop
     event is default-prevented at the window level.
  2. zenodo.html's unit card had no directory support at all. Guarded by
     feeding its webkitdirectory input a real folder and checking that stats
     appear.

Run with:
    npm run dev                                   # in one terminal
    env/bin/python -m pytest tests/ -v            # in another
"""
import zipfile
from pathlib import Path

import pytest

from conftest import BASE_URL
from formhelpers import tid

ALTO_DIR = Path(__file__).parent / "fixtures" / "alto"

# Synthesises a file drop at the given coordinates and reports whether the page
# cancelled the browser's default (navigate-to-file://) behaviour.
DROP_SNIPPET = """
([x, y]) => {
  const dt = new DataTransfer()
  dt.items.add(new File(['<alto/>'], 'page.xml', { type: 'application/xml' }))
  const target = document.elementFromPoint(x, y) || document.body
  const ev = new DragEvent('drop', {
    bubbles: true, cancelable: true, clientX: x, clientY: y, dataTransfer: dt,
  })
  target.dispatchEvent(ev)
  return ev.defaultPrevented
}
"""


@pytest.fixture()
def zenodo_page(page):
    page.goto(f"{BASE_URL}/zenodo.html")
    page.wait_for_selector(".zw-steps")
    return page


@pytest.fixture()
def zenodo_unit(zenodo_page):
    """Zenodo wizard on step 2, with one (empty) unit card ready to receive files."""
    # The step buttons only navigate backwards; step 1's Next button moves on.
    zenodo_page.locator("button.btn--olive").last.click()
    zenodo_page.wait_for_selector(".zw-org-choice")
    zenodo_page.locator(".add-row-btn").first.click()
    zenodo_page.wait_for_selector(".unit-card")
    return zenodo_page


def test_stray_drop_is_cancelled_on_form_page(form_page):
    """A file dropped on the page header must not navigate to file:///."""
    assert form_page.evaluate(DROP_SNIPPET, [5, 5]) is True


def test_stray_drop_is_cancelled_on_zenodo_page(zenodo_page):
    assert zenodo_page.evaluate(DROP_SNIPPET, [5, 5]) is True


def test_folder_selection_populates_metrics(form_page):
    """document-your-data.html: picking a folder of ALTO files fills the metrics."""
    tid(form_page, "la-folder-input").set_input_files(str(ALTO_DIR))
    form_page.wait_for_selector(".la-metrics")
    metrics = form_page.locator(".la-metric b").all_inner_texts()
    assert metrics[0] == "2"        # files
    assert int(metrics[1]) == 3     # lines


def test_folder_with_no_xml_reports_no_match(form_page, tmp_path):
    """A folder without XML must say so instead of failing silently."""
    (tmp_path / "notes.txt").write_text("nothing to analyse")
    tid(form_page, "la-folder-input").set_input_files(str(tmp_path))
    form_page.wait_for_selector("[data-testid=la-nomatch]")
    assert "*.xml" in tid(form_page, "la-nomatch").inner_text()


def test_zenodo_unit_accepts_a_folder(zenodo_unit):
    """zenodo.html: the unit card ingests a folder and computes stats."""
    zenodo_unit.get_by_test_id("unit-folder-input").set_input_files(str(ALTO_DIR))
    zenodo_unit.wait_for_selector(".unit-stats")
    assert "2 " in zenodo_unit.locator(".unit-files__count").inner_text()
    stats = zenodo_unit.locator(".unit-stat b").all_inner_texts()
    assert int(stats[0]) == 3       # lines


def test_zenodo_zip_keeps_folder_structure(zenodo_unit, tmp_path):
    """Files in different subfolders must not collide inside the exported ZIP."""
    nested = tmp_path / "corpus"
    for sub in ("vol1", "vol2"):
        (nested / sub).mkdir(parents=True)
        # Same filename in both subfolders: flattening would lose one of them.
        (nested / sub / "page_001.xml").write_text(
            (ALTO_DIR / "page_001.xml").read_text()
        )

    zenodo_unit.get_by_test_id("unit-folder-input").set_input_files(str(nested))
    zenodo_unit.wait_for_selector(".unit-stats")
    zenodo_unit.locator(".unit-card input").first.fill("Paris BnF It 1019")

    zenodo_unit.locator("button.btn--olive").last.click()   # to step 3
    zenodo_unit.wait_for_selector(".zw-badges")

    with zenodo_unit.expect_download() as info:
        zenodo_unit.get_by_text("📦").click()
    target = tmp_path / "out.zip"
    info.value.save_as(target)

    with zipfile.ZipFile(target) as zf:
        names = zf.namelist()
    assert "data/paris-bnf-it-1019/vol1/page_001.xml" in names
    assert "data/paris-bnf-it-1019/vol2/page_001.xml" in names


def test_zenodo_unit_reports_when_no_xml(zenodo_unit, tmp_path):
    (tmp_path / "scan.jpg").write_bytes(b"\xff\xd8\xff")
    zenodo_unit.get_by_test_id("unit-folder-input").set_input_files(str(tmp_path))
    zenodo_unit.wait_for_selector("[data-testid=unit-nomatch]")
