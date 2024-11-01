import cloudinary
import cloudinary.uploader
import nibabel as nib
import numpy as np
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
import io
from PIL import Image
from flask_cors import CORS
import matplotlib
matplotlib.use('Agg')  # Sử dụng backend không GUI
app = Flask(__name__)
CORS(app)  # Cho phép tất cả các nguồn


cloudinary.config(
    cloud_name='lananh113388',
    api_key='364541294553339',
    api_secret='MsLVygO4DlB8BBL357WFSGzg1Pg'
)

def nii_to_png(nii_path):
    img = nib.load(nii_path)
    data = img.get_fdata()
    mid_slice = data[:, :, data.shape[2] // 2]
    plt.imshow(mid_slice, cmap="gray")
    plt.axis('off')
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', pad_inches=0)
    buffer.seek(0)
    return Image.open(buffer)

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['image']
    # Lưu tệp vào một vị trí tạm thời
    file.save("temp.nii")

    # Gỡ lỗi: Kiểm tra xem tệp có tồn tại và in kích thước của nó
    import os
    if os.path.exists("temp.nii"):
        file_size = os.path.getsize("temp.nii")
        print(f"Tệp đã lưu: temp.nii, Kích thước: {file_size} bytes")
    else:
        return jsonify({"error": "Failed to save file"}), 500

    try:
        png_image = nii_to_png("temp.nii")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    buffer = io.BytesIO()
    png_image.save(buffer, format="PNG")
    buffer.seek(0)
    result = cloudinary.uploader.upload(buffer, resource_type="image")

    if result.get("secure_url"):
        # In ra URL được tạo bởi Cloudinary
        print("Image URL uploaded to Cloudinary:", result["secure_url"])
        return jsonify({"image_url": result["secure_url"]})
    else:
        return jsonify({"error": "Failed to upload to Cloudinary"}), 500
if __name__ == '__main__':
    app.run(port=9999, debug=True)
