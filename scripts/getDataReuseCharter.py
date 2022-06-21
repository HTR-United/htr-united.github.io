import requests
import markdown
import os

URI = "https://raw.githubusercontent.com/HTR-United/htr-united/master/reuse-charter.md"

req = requests.get(URI)
req.raise_for_status()

text = req.text


html = markdown.markdown(text)

with open(os.path.join(os.path.dirname(__file__), "data-reuse-charter.template.html")) as f:
	with open(os.path.join(os.path.dirname(__file__), "..", "data-reuse-charter.html"), "w") as o:
		o.write(f.read().replace("{{data}}", html))
