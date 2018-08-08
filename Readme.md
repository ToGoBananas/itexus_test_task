### How to run:

Install pip, yarn.


1) In project dir run: `pip install -r requirements.txt`

2) Run `cd react-app && yarn install && yarn build && cd -`

3) Run app with `python server.py`


## About app

You can drag and drop .txt file to web page. After that file uploads to backend throught websocket connection. Backend processes content of the file (tokenize, POS tagging) and looks for synonyms using NLTK lemmas. 


## About

I more like Typescript+Angular/Vue guy, so I wasted some time on React part due to lack of experience.

For real world application it make sense to use uWSGI+nginx instead of meinheld and run NLTK tasks separately from web server (celery or smth).

Also tests are missing)