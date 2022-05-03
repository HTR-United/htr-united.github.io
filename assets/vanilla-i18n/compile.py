import csv
import json
from typing import List, Dict, Union


Output: Dict[str, Dict[str, Union[Dict, str]]] = {}


def decomment(csvfile):
	# https://stackoverflow.com/a/50592259
    for row in csvfile:
        raw = row.split('#')[0].strip()
        if raw: yield raw


def augment_dict(keys: List[str], dictionary: Dict[str, Union[Dict, str]]) -> Dict[str, str]:
	""" Given a list of key, produce or returns the dictionary in a recursive fashion


	>>> augment_dict(["a", "b", "c"], {})
	{'a': {'b': {'c': {}}}}
	"""
	first_key = keys.pop(0)

	if first_key not in dictionary:
		dictionary[first_key] = {}

	if keys:
		return augment_dict(keys, dictionary[first_key])

	return dictionary, first_key


# Read input
def treat_csv(filename="htr-united_i18n.csv", dictionary=None):
	with open(filename) as f:
		reader = csv.reader(decomment(f))
		for lineno, line in enumerate(reader):
			# First line gives the languages, we register it in the Output DICT
			if lineno == 0:
				ordered_languages = line[1:]
				if dictionary is None:
					dictionary = {
						lang: {} for lang in ordered_languages
					}
				continue
			# We dezip the line: the first column is the key, the others are translated values
			key, *values = line
			for lang, value in zip(ordered_languages, values):
				referenced_dict, last_key = augment_dict(key.split("."), dictionary[lang])
				referenced_dict[last_key] = value
	return dictionary

Output = treat_csv()
Output = treat_csv("document-your-data-i18n.csv", dictionary=Output)

# Dump output
for lang in Output:
	with open(f"{lang}.json", "w") as f:
		json.dump(Output[lang], f)