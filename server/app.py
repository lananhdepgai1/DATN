import cloudinary
import cloudinary.uploader
from flask import Flask, request, jsonify

app = Flask(__name__)

# Configure Cloudinary with your credentials
cloudinary.config(
    cloud_name='your_cloud_name',
    api_key='your_api_key',
    api_secret='your_api_secret'
)

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['image']
    
    # Upload file to Cloudinary
    result = cloudinary.uploader.upload(file, resource_type="raw")  # 'raw' for non-standard image files
    
    if result.get("secure_url"):
        return jsonify({"image_url": result["secure_url"]})
    else:
        return jsonify({"error": "Failed to upload to Cloudinary"}), 500

if __name__ == '__main__':
    app.run(port=9999, debug=True)
