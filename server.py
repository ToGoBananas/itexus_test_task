import json

import nltk
nltk.download('all')
from flask import Flask, request, render_template
from meinheld import server, middleware
from nltk.corpus import wordnet

DEBUG = True

app = Flask(__name__, static_folder="./react-app/build/static", template_folder="./react-app/build")
app.config.from_object(__name__)


clients = set()
NON_WORD_TAGS = ('CC', 'CD', 'DT', 'EX', 'IN', 'LS', 'MD', 'POS', 'PRP', 'PRP$', 'PDT', ',', '.', 'NNP', 'TO')


def process_text(text):
    tokens = nltk.word_tokenize(text)
    tagged = nltk.pos_tag(tokens)
    only_words = [word.lower() for word, tag in tagged if tag not in NON_WORD_TAGS and word.isalpha()]

    return nltk.FreqDist(only_words).most_common(5)


def find_synonym(original_word):
    synonyms = set()
    syns = wordnet.synsets(original_word)
    for syn in syns:
        for word_syn in syn.lemmas():
            word = word_syn.name()
            if word != original_word and word[0].islower() and '_' not in word:
                synonyms.add(word)
    return synonyms


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api')
def api():
    ws = request.environ.get('wsgi.websocket')
    clients.add(ws)
    try:
        while True:
            message = ws.wait()
            if message is None:
                break
            else:
                response = {word: ', '.join(find_synonym(word)) for word, num in process_text(message)}
                ws.send(json.dumps(response))
    finally:
        clients.remove(ws)
    return ""


if __name__ == "__main__":
    server.listen(("0.0.0.0", 8000))
    server.run(middleware.WebSocketMiddleware(app))
