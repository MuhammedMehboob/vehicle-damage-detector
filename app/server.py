import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from model_helper import predict

app = FastAPI(
    title="Vehicle Damage Detection API",
    description="API for detecting front and rear vehicle damage using a trained PyTorch model.",
    version="1.0.0"
)

# Enable CORS for external frontend applications if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Severity and recommendation database based on predicted class
DIAGNOSIS_DATABASE = {
    'Front Breakage': {
        'severity': 'Medium',
        'badge_color': '#ffb020',
        'part': 'Front',
        'status': 'Damage Detected (Breakage)',
        'description': 'Moderate damage observed on the front section of the vehicle. This typically includes bumper cracks, broken grille, or headlamp housing fractures.',
        'recommendation': 'Recommended to schedule a mechanical inspection of the radiator support and front sensors. Vehicle is safe for short-distance driving, but repair is recommended soon to prevent structural loosening.'
    },
    'Front Crushed': {
        'severity': 'High',
        'badge_color': '#d11a2a',
        'part': 'Front',
        'status': 'Critical Damage (Crushed)',
        'description': 'Severe structural crash damage detected on the front end. Major impact has likely compromised energy-absorbing structures, crumple zones, or engine components.',
        'recommendation': 'DO NOT DRIVE. The structural integrity, cooling system, and airbag deployment sensors could be compromised. We advise immediate towing to an authorized collision center.'
    },
    'Front Normal': {
        'severity': 'None',
        'badge_color': '#10b981',
        'part': 'Front',
        'status': 'No Damage Detected',
        'description': 'No visible structural damage, cracks, or crush impacts detected in the front section.',
        'recommendation': 'Front area appears in standard condition. No immediate action required.'
    },
    'Rear Breakage': {
        'severity': 'Medium',
        'badge_color': '#ffb020',
        'part': 'Rear',
        'status': 'Damage Detected (Breakage)',
        'description': 'Moderate rear-end damage detected. Typically includes cracked bumper covers, trunk lid misalignment, or broken taillight housings.',
        'recommendation': 'Ensure taillights and turn signals are fully operational. Schedule a rear bumper inspection to check the inner absorber foam and trunk latch mechanism.'
    },
    'Rear Crushed': {
        'severity': 'High',
        'badge_color': '#d11a2a',
        'part': 'Rear',
        'status': 'Critical Damage (Crushed)',
        'description': 'Significant impact damage detected on the rear section. The rear impact bar, exhaust system, trunk floor, or suspension alignments are highly likely to be damaged.',
        'recommendation': 'Driving is NOT recommended, as exhaust leaks can enter the cabin or rear structural parts could detach. Have the vehicle towed for an inspection of the frame and fuel tank integrity.'
    },
    'Rear Normal': {
        'severity': 'None',
        'badge_color': '#10b981',
        'part': 'Rear',
        'status': 'No Damage Detected',
        'description': 'No visible structural damage, cracks, or crush impacts detected in the rear section.',
        'recommendation': 'Rear area appears in standard condition. No immediate action required.'
    }
}

@app.post("/predict")
async def get_prediction(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image_path = "temp_file.jpg"
        with open(image_path, "wb") as f:
            f.write(image_bytes)

        prediction = predict(image_path)
        
        # Get details from database, fallback if not found
        details = DIAGNOSIS_DATABASE.get(prediction, {
            'severity': 'Unknown',
            'badge_color': '#6b7280',
            'part': 'Unknown',
            'status': 'Prediction Made',
            'description': f'Model predicted: {prediction}. No detailed description available.',
            'recommendation': 'Please inspect the vehicle manually.'
        })

        return {
            "prediction": prediction,
            "severity": details['severity'],
            "badge_color": details['badge_color'],
            "part": details['part'],
            "status": details['status'],
            "description": details['description'],
            "recommendation": details['recommendation']
        }

    except Exception as e:
        return {"error": str(e)}

@app.get("/debug")
async def get_debug():
    import model_helper
    import sys
    return {
        "cwd": os.getcwd(),
        "model_helper_file": model_helper.__file__,
        "python_executable": sys.executable,
        "cuda_available": torch.cuda.is_available() if 'torch' in sys.modules else "unknown",
        "sys_path": sys.path
    }

# Serve frontend files
# We mount static files directory and serve index.html at root
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def get_index():
    index_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Welcome to Vehicle Damage Detection API. Please create a static/index.html file."}