'''
REQUIREMENTS:
- The script must be run with python3.
- The 'requests' module that can be installed using [pip](https://pypi.org/project/pip/)  "pip install requests". 
Requirements can be managed and installed using Python's [virtual env](https://docs.python.org/3/tutorial/venv.html).
- An API Key for the translation API to be specified on line 21

INPUT:
- A text file with the sentences to be translated. This filename is specified on line 23.
- Source language and target language. Specified on line 24 and 25

OUTPUT:
- A file where each line is a translation of the text in the input file.
'''

import requests
import json
import time

api_url = "https://translate-api.gourmet.newslabs.co/v1"
api_key = ""

original_file = "english.txt"
source_language = "en"
target_language = "bg"

original_sentences = open(original_file, "r").readlines()

output = open("output.txt", 'w')

for sentence in original_sentences:
    query = {"source": "en", "target": "bg", "q": sentence}
    req = requests.post(api_url +"/translate", headers={"x-api-key": api_key}, json=query)
    translation = req.json()['translatedText'].replace("\n", " ")
    output.write(translation)
    # time.sleep(0.5) Option to break between requests if API is overloaded by requests

output.close()
