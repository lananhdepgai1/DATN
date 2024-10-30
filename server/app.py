from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def convert_to_grayscale(image_data):
    # Decode the image from base64
    with open('image_data.txt', 'w') as f:
        f.write(image_data)
    if image_data.startswith('data:image/jpeg;base64,'):
        image_data = image_data.split(',')[1] 
    nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert the image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Encode the grayscale image back to base64
    _, buffer = cv2.imencode('.png', gray_image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    # Display the grayscale image in a new window
    return image_base64 

@app.route('/api/upload', methods=['POST'])
def upload_image():
    try:
        # Get the base64 image data from the JSON request
        data = request.json
        image_data = data['image']
        
        # Process the image (convert to grayscale)
        processed_image = convert_to_grayscale(image_data)
        # Return the processed image as base64
        return jsonify({"processed_image": processed_image})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=9999, debug=True)