FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY recognize_api.py .
RUN mkdir -p faces recognition_logs
EXPOSE 5000
ENV FACE_API_HOST=0.0.0.0
CMD ["python", "recognize_api.py"]
