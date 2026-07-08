import pytest
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


@pytest.fixture()
def page(browser):
    context = browser.new_context()
    pg = context.new_page()
    yield pg
    context.close()


@pytest.fixture()
def form_page(page):
    page.goto(f"{BASE_URL}/document-your-data.html")
    page.wait_for_selector("text=Record New Data")
    return page
