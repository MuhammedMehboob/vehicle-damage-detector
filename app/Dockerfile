FROM python:3.10-slim

# Set up working directory for dependency installation
WORKDIR /code

# Copy requirements.txt first to cache dependencies
COPY ./requirements.txt /code/requirements.txt

# Optimization: Remove CUDA-specific PyTorch requirements and install lightweight CPU-only versions
# This saves ~2GB of space and speeds up Hugging Face build times significantly, as HF CPU tier doesn't have GPUs.
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    sed -i '/torch/d' /code/requirements.txt && \
    pip install --no-cache-dir -r /code/requirements.txt

# Set up user permission context for Hugging Face Spaces (runs under UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Create app directory and set as working directory
WORKDIR $HOME/app

# Copy the rest of the application files, ensuring correct ownership
COPY --chown=user . $HOME/app

# Expose default port for Hugging Face Spaces
EXPOSE 7860

# Run FastAPI app
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]
