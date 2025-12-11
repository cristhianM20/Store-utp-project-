FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    espeak-ng \
    wget \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Install Piper TTS
RUN wget -O piper.tar.gz https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz && \
    tar -xzf piper.tar.gz && \
    rm piper.tar.gz && \
    mv piper /usr/local/bin/piper_bin

# Create wrapper script for piper because the binary is inside a directory
RUN echo '#!/bin/bash\n/usr/local/bin/piper_bin/piper "$@"' > /usr/local/bin/piper && \
    chmod +x /usr/local/bin/piper

# Download Piper Voice Model (Spanish)
RUN mkdir -p /app/models && \
    wget -O /app/models/es_ES-sharvard-medium.onnx https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx && \
    wget -O /app/models/es_ES-sharvard-medium.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx.json

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
