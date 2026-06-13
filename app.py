
from flask import Flask, render_template, request, jsonify
import pickle

app = Flask(__name__)

# Load trained model and vectorizer
with open("expense_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "description" not in data:
        return jsonify({"error": "Description is required"}), 400

    description = data["description"].strip()

    if not description:
        return jsonify({"error": "Empty description provided"}), 400

    text_vector = vectorizer.transform([description])
    prediction = model.predict(text_vector)[0]

    return jsonify({"category": prediction})

if __name__ == "__main__":
    app.run(debug=True)