


function choseOption(event) {
    const options = document.querySelectorAll('.option'); 
    
    options.forEach(option => {
        option.classList.remove('active');
    });

    const clickedOption = event.target.closest('.option');
    if (clickedOption) {
        clickedOption.classList.add('active');
    }
}
function view(event) {
    const home = document.getElementById('home'); 
    const predict = document.getElementById('predict'); 
    const fileInput = document.getElementById('file-upload');
    const selectedOption = document.querySelector('.option.active');

    if (fileInput.files.length > 0 && selectedOption) {
        home.classList.toggle('hidden');
        predict.classList.toggle('hidden');
    } else {
        alert("Vui lòng chọn file và một trong các tùy chọn (MRI, CT, Da liễu) trước khi xem!");
    }
}
function predict(event) {
    const home = document.getElementById('home'); 
    const predict = document.getElementById('predict'); 
    const fileInput = document.getElementById('file-upload');
    const selectedOption = document.querySelector('.option.active');

    if (fileInput.files.length > 0 && selectedOption) {
        home.classList.toggle('hidden');
        predict.classList.toggle('hidden');
    } else {
        alert("Vui lòng chọn file và một trong các tùy chọn (MRI, CT, Da liễu) trước khi dự đoán!");
    }
}
function home(event) {
    const home = document.getElementById('home'); 
    const predict = document.getElementById('predict'); 
    home.classList.toggle('hidden');
    predict.classList.toggle('hidden')
    window.location.reload();
}

function readNIFTI(name, data) {
    var canvasNav = document.querySelector('.origin-image');
    var canvasMain = document.querySelector('.main-image');
    var slider = document.getElementById('niiRange');
    var niftiHeader, niftiImage;

    if (nifti.isCompressed(data)) {
        data = nifti.decompress(data);
    }

    if (nifti.isNIFTI(data)) {
        niftiHeader = nifti.readHeader(data);
        niftiImage = nifti.readImage(niftiHeader, data);
    }

    var slices = niftiHeader.dims[3];
    slider.max = slices - 1;
    slider.value = Math.round(slices / 2);

    drawCanvas(canvasNav, slider.value, niftiHeader, niftiImage);
    drawCanvas(canvasMain, slider.value, niftiHeader, niftiImage);

    slider.oninput = function () {
        var currentSlice = parseInt(slider.value);
        if (currentSlice >= 0 && currentSlice < slices) {
            drawCanvas(canvasNav, currentSlice, niftiHeader, niftiImage);
            drawCanvas(canvasMain, currentSlice, niftiHeader, niftiImage);
            if (localStorage.getItem("negative") === "true") {
                applyNegativeEffect("main-image");
            }
            
        }
    };
}
function drawCanvas(canvas, slice, niftiHeader, niftiImage) {  
    var cols = niftiHeader.dims[1];  
    var rows = niftiHeader.dims[2];  
    canvas.width = cols;  
    canvas.height = rows;  

    var ctx = canvas.getContext("2d");  
    var canvasImageData = ctx.createImageData(canvas.width, canvas.height);  

    var typedData;  
    if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {  
        typedData = new Uint8Array(niftiImage);  
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {  
        typedData = new Int16Array(niftiImage);  
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {  
        typedData = new Int32Array(niftiImage);  
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {  
        typedData = new Float32Array(niftiImage);  
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {  
        typedData = new Float64Array(niftiImage);  
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {  
        typedData = new Int8Array(niftiImage);  
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {  
        typedData = new Uint16Array(niftiImage);  
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {  
        typedData = new Uint32Array(niftiImage);  
    } else {  
        return;  
    }  

    var sliceSize = cols * rows;  
    var sliceOffset = sliceSize * slice;  

    // Điều chỉnh hệ số cường độ và độ sáng để tối ưu rõ nét  
    var intensityMultiplier = 1.5; // Tăng hệ số này để ảnh sáng hơn  
    var brightnessOffset = 5;     // Giảm độ sáng  

    // Tìm giá trị tối đa và tối thiểu để điều chỉnh tương phản  
    var min = Infinity;  
    var max = -Infinity;  
    for (var i = 0; i < typedData.length; i++) {  
        var value = typedData[i];  
        if (value < min) min = value;  
        if (value > max) max = value;  
    }  

    // Duyệt qua các pixel và chuẩn hóa  
    for (var row = 0; row < rows; row++) {  
        var rowOffset = row * cols;  

        for (var col = 0; col < cols; col++) {  
            var offset = sliceOffset + rowOffset + col;  
            var value = typedData[offset];  

            // Chuẩn hóa giá trị pixel  
            var normalizedValue = (value - min) / (max - min);  
            value = Math.round(normalizedValue * 255); // Giới hạn từ 0 đến 255  

            // Điều chỉnh giá trị pixel  
            value = value * intensityMultiplier + brightnessOffset;  
            value = Math.min(Math.max(value, 0), 255); // Giới hạn từ 0 đến 255  

            canvasImageData.data[(rowOffset + col) * 4] = value;  
            canvasImageData.data[(rowOffset + col) * 4 + 1] = value;  
            canvasImageData.data[(rowOffset + col) * 4 + 2] = value;  
            canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF;  
        }  
    }  

    ctx.putImageData(canvasImageData, 0, 0);  
}
function readFile(file) {
    var blob = file.slice(0, file.size);

    var reader = new FileReader();

    reader.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) {
            readNIFTI(file.name, evt.target.result);
        }
    };

    reader.readAsArrayBuffer(blob);
}
function handleFileSelect(evt) {
    var files = evt.target.files;
    if (files.length > 0) {
        readFile(files[0]);
    }
}
document.getElementById('file-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileNameElement = document.getElementById('file-name');
    handleFileSelect(event)
    if (file) {
        fileNameElement.textContent = `${file.name}`;
        
    } else {
        fileNameElement.textContent = '';
    
    }
});

function applyNegativeEffect(canvasClass) {
    // Lấy canvas và context từ class truyền vào
    const canvas = document.querySelector(`.${canvasClass}`);
    const context = canvas.getContext("2d");
    
    // Lấy dữ liệu ảnh từ canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Duyệt qua từng pixel và tạo âm bản
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];       // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
        // Alpha (data[i + 3]) không đổi
    }

    // Cập nhật dữ liệu ảnh với hiệu ứng âm bản
    context.putImageData(imageData, 0, 0);
}

// Thêm sự kiện vào nút "negative"
document.querySelector(".negative").addEventListener("click", () => {
    if (!localStorage.getItem("negative") || localStorage.getItem("negative") === "false") {
        localStorage.setItem("negative", "true");
    } else {
        localStorage.setItem("negative", "false");
    }
    applyNegativeEffect("main-image");
});

window.addEventListener('load', () => {
    localStorage.removeItem("negative");
});


// xoay ảnh 
const mainImageCanvas = document.querySelector('.main-image');
const ctx = mainImageCanvas.getContext('2d');
let isRotating = false;
let currentAngle = 0; // Góc xoay hiện tại

// Lưu ảnh gốc vào biến
const originalImage = new Image();
originalImage.src = mainImageCanvas.toDataURL();

// Xử lý sự kiện click cho nút rotate
const rotateButton = document.querySelector('.rotate');
rotateButton.addEventListener('click', () => {
    const currentRotateStatus = localStorage.getItem("rotate") === "true";
    localStorage.setItem("rotate", currentRotateStatus ? "false" : "true");
    isRotating = !currentRotateStatus;
});

// Xử lý xoay khi nhấn và kéo chuột trên main-image
mainImageCanvas.addEventListener('mousedown', (event) => {
    if (localStorage.getItem("rotate") === "true") {
        isRotating = true;
        mainImageCanvas.addEventListener('mousemove', rotateImage);
    }
});

mainImageCanvas.addEventListener('mouseup', () => {
    isRotating = false;
    mainImageCanvas.removeEventListener('mousemove', rotateImage);
});

// Hàm thực hiện xoay ảnh dựa trên di chuyển chuột
function rotateImage(event) {
    if (isRotating) {
        const rotationAmount = event.movementX * 0.05; // Tốc độ xoay theo di chuyển chuột
        currentAngle += rotationAmount; // Cập nhật góc xoay tổng
        ctx.clearRect(0, 0, mainImageCanvas.width, mainImageCanvas.height); // Xóa canvas cũ
        ctx.save();
        ctx.translate(mainImageCanvas.width / 2, mainImageCanvas.height / 2); // Đặt tâm xoay
        ctx.rotate(currentAngle); // Xoay canvas
        ctx.translate(-mainImageCanvas.width / 2, -mainImageCanvas.height / 2); // Đặt lại vị trí gốc
        ctx.drawImage(originalImage, 0, 0, mainImageCanvas.width, mainImageCanvas.height); // Vẽ lại ảnh xoay từ ảnh gốc
        ctx.restore();
    }
}
