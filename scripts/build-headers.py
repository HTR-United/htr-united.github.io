""" This script could be more complex to also handle the MENU, but I'd rather have multiple scripts used in order such as:

1. getDataReuseCharter.py
2. build-headers.py
3. build-menu.py *Does not exist at the time of writing*
"""
import glob
import os.path

HTMLs = os.path.join(os.path.dirname(__file__), "..", "*.html")

with open(os.path.join(os.path.dirname(__file__), "base_header.template.html")) as f:
	TEMPLATE = f.read()

for filepath in glob.glob(HTMLs):
	data = ([], []) # Before block, after block
	ignore = False
	with open(filepath) as f:
		for line in f:
			if line.strip() == "<!-- block header -->":
				data[0].append(line)
				ignore = True
			elif line.strip() == "<!-- endblock header -->":
				ignore = False
				data[1].append(line)
			else:
				if ignore:
					continue
				elif data[1]:
					data[1].append(line)
				else:
					data[0].append(line)
	print("".join(data[0])+TEMPLATE+"\n"+"".join(data[1]))
