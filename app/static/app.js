document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const previewOverlay = document.getElementById('preview-overlay');
    const imagePreview = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-btn');
    const scanLaser = document.getElementById('scan-laser');
    
    // States
    const stateEmpty = document.getElementById('state-empty');
    const stateLoading = document.getElementById('state-loading');
    const stateResults = document.getElementById('state-results');
    
    // Results DOM elements
    const resultReportId = document.getElementById('result-report-id');
    const resultStatusTitle = document.getElementById('result-status-title');
    const resultSeverityBadge = document.getElementById('result-severity-badge');
    const resultZone = document.getElementById('result-zone');
    const resultClass = document.getElementById('result-class');
    const resultDescription = document.getElementById('result-description');
    const actionStepsList = document.getElementById('action-steps-list');
    const meterFill = document.getElementById('meter-fill');
    const meterMarker = document.getElementById('meter-marker');
    
    // History DOM elements
    const historyGrid = document.getElementById('history-grid');
    const historyEmpty = document.getElementById('history-empty');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    let currentFile = null;
    let history = JSON.parse(localStorage.getItem('vroom_inspection_history') || '[]');

    // Initialize App
    renderHistory();

    // ----------------------------------------------------
    // Drag and Drop Handlers
    // ----------------------------------------------------
    
    // Click on dropzone triggers input
    dropzone.addEventListener('click', (e) => {
        // Prevent trigger if clicking on remove button
        if (e.target.closest('#remove-btn')) return;
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleSelectedFile(e.target.files[0]);
        }
    });

    // Drag-over styling
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    // Drop file
    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleSelectedFile(files[0]);
        }
    });

    // Remove current image button
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    // Clear history button
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all inspection history logs?")) {
            history = [];
            localStorage.setItem('vroom_inspection_history', JSON.stringify(history));
            renderHistory();
        }
    });

    // ----------------------------------------------------
    // Main Business Logic
    // ----------------------------------------------------

    function handleSelectedFile(file) {
        // Validation
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPG, JPEG, or PNG).');
            return;
        }
        
        currentFile = file;

        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewOverlay.classList.remove('hidden');
            
            // Run prediction pipeline
            uploadAndPredict(file);
        };
        reader.readAsDataURL(file);
    }

    function resetUpload() {
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '#';
        previewOverlay.classList.add('hidden');
        scanLaser.classList.add('hidden');
        
        // Reset results display
        showState('empty');
    }

    function showState(state) {
        stateEmpty.classList.add('hidden');
        stateLoading.classList.add('hidden');
        stateResults.classList.add('hidden');

        if (state === 'empty') {
            stateEmpty.classList.remove('hidden');
        } else if (state === 'loading') {
            stateLoading.classList.remove('hidden');
        } else if (state === 'results') {
            stateResults.classList.remove('hidden');
        }
    }

    async function uploadAndPredict(file) {
        // Show loading state and enable scanning laser line
        showState('loading');
        scanLaser.classList.remove('hidden');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Deactivate laser
            scanLaser.classList.add('hidden');

            if (data.error) {
                throw new Error(data.error);
            }

            displayResults(data);
            
            // Create a small base64 thumbnail to save in history without hitting localStorage limits
            createLowResThumbnail(file, (thumbnailBase64) => {
                saveToHistory(data, thumbnailBase64);
            });

        } catch (error) {
            scanLaser.classList.add('hidden');
            showState('empty');
            alert(`Analysis failed: ${error.message}. Please verify the backend server is running and try again.`);
            resetUpload();
        }
    }

    function displayResults(data) {
        // Report ID
        const reportNum = Math.floor(100000 + Math.random() * 900000);
        resultReportId.textContent = `REPORT: #VR-${reportNum}`;
        
        // Title & Severity Badge
        resultStatusTitle.textContent = data.status.toUpperCase();
        resultSeverityBadge.textContent = `${data.severity.toUpperCase()} SEVERITY`;
        resultSeverityBadge.style.backgroundColor = data.badge_color;
        
        // Metrics
        resultZone.textContent = data.part;
        resultClass.textContent = data.prediction;
        
        // Details
        resultDescription.textContent = data.description;

        // Severity Meter
        let percentage = 5; // Default "None"
        if (data.severity.toLowerCase() === 'medium') {
            percentage = 50;
        } else if (data.severity.toLowerCase() === 'high') {
            percentage = 95;
        }
        meterFill.style.width = `${percentage}%`;
        meterMarker.style.left = `${percentage}%`;

        // Render Action Plan
        renderActionPlan(data.severity.toLowerCase(), data.recommendation);

        // Transition views
        showState('results');
    }

    function renderActionPlan(severity, customRecommendation) {
        actionStepsList.innerHTML = '';
        
        let steps = [];
        if (severity === 'high') {
            steps = [
                { text: 'DO NOT DRIVE this vehicle. High impact damage detected.', class: 'step-critical', icon: 'fa-circle-xmark' },
                { text: customRecommendation, class: 'step-critical', icon: 'fa-truck-tow' },
                { text: 'File a comprehensive claim report with your insurance provider.', class: 'step-critical', icon: 'fa-file-signature' },
                { text: 'Arrange structural frame and safety sensor calibration.', class: 'step-critical', icon: 'fa-wrench' }
            ];
        } else if (severity === 'medium') {
            steps = [
                { text: customRecommendation, class: 'step-moderate', icon: 'fa-circle-exclamation' },
                { text: 'Check that headlights, turn signals, and crash sensors are intact.', class: 'step-moderate', icon: 'fa-lightbulb' },
                { text: 'Schedule a body shop repair appointment to prevent loosening or rust.', class: 'step-moderate', icon: 'fa-calendar-days' }
            ];
        } else {
            steps = [
                { text: 'Vehicle structure is standard.', class: 'step-normal', icon: 'fa-circle-check' },
                { text: customRecommendation, class: 'step-normal', icon: 'fa-clipboard-check' },
                { text: 'Maintain regular service intervals and visual safety logs.', class: 'step-normal', icon: 'fa-check' }
            ];
        }

        steps.forEach(step => {
            const li = document.createElement('li');
            li.className = step.class;
            li.innerHTML = `<i class="fa-solid ${step.icon}"></i> <span>${step.text}</span>`;
            actionStepsList.appendChild(li);
        });
    }

    // ----------------------------------------------------
    // History & LocalStorage Management
    // ----------------------------------------------------

    function createLowResThumbnail(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const max_size = 90; // Small thumbnail to conserve localStorage space (max 5MB limit)
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Low-quality JPEG to make it extremely light
                callback(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function saveToHistory(apiData, thumbnailBase64) {
        const newRecord = {
            id: 'rec_' + Date.now(),
            prediction: apiData.prediction,
            severity: apiData.severity,
            badge_color: apiData.badge_color,
            status: apiData.status,
            part: apiData.part,
            description: apiData.description,
            recommendation: apiData.recommendation,
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            thumbnail: thumbnailBase64
        };

        // Put at front of array
        history.unshift(newRecord);
        
        // Cap history at 15 items to save storage
        if (history.length > 15) {
            history.pop();
        }

        localStorage.setItem('vroom_inspection_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        // Clear grid contents
        const historyCards = historyGrid.querySelectorAll('.history-card');
        historyCards.forEach(card => card.remove());

        if (history.length === 0) {
            historyEmpty.classList.remove('hidden');
            clearHistoryBtn.classList.add('hidden');
        } else {
            historyEmpty.classList.add('hidden');
            clearHistoryBtn.classList.remove('hidden');

            history.forEach(item => {
                const card = document.createElement('div');
                card.className = 'history-card';
                card.dataset.id = item.id;
                
                card.innerHTML = `
                    <div class="history-thumb">
                        <img src="${item.thumbnail}" alt="Thumbnail">
                    </div>
                    <div class="history-info">
                        <span class="history-class">${item.prediction}</span>
                        <span class="history-date">${item.date}</span>
                        <span class="history-badge" style="background-color: ${item.badge_color}">${item.severity.toUpperCase()}</span>
                    </div>
                `;

                // Add click listener to reload this historical record to dashboard
                card.addEventListener('click', () => {
                    loadHistoryItem(item);
                });

                historyGrid.appendChild(card);
            });
        }
    }

    function loadHistoryItem(item) {
        // Mock loading response
        imagePreview.src = item.thumbnail;
        previewOverlay.classList.remove('hidden');
        
        // Trigger results panel loading
        displayResults({
            prediction: item.prediction,
            severity: item.severity,
            badge_color: item.badge_color,
            part: item.part,
            status: item.status,
            description: item.description,
            recommendation: item.recommendation
        });

        // Set input value to empty since we loaded history
        fileInput.value = '';
        currentFile = null;
    }
});
