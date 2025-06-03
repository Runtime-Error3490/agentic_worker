# 1. Pick a Debian-based Python image. Debian Slim is smaller.
FROM python:3.10-slim

# 2. Install Chromium and ChromeDriver + build-essentials for selenium/webdriver
#    - chromium-driver in Debian pulls in a matching Chromium version
#    - Also install fonts, libs, and Xvfb shims so headless really can run.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
       chromium-driver \
       chromium \
       wget \
       curl \
       gnupg \
       ca-certificates \
       build-essential \
       libglib2.0-0 \
       libnss3 \
       libx11-6 \
       libx11-xcb1 \
       libxcomposite1 \
       libxcursor1 \
       libxdamage1 \
       libxext6 \
       libxfixes3 \
       libxi6 \
       libxrandr2 \
       libxrender1 \
       libxtst6 \
       libgbm1 \
       libasound2 \
       libcups2 \
       libxss1 \
       libatk-bridge2.0-0 \
       libgtk-3-0 \
       libdbus-glib-1-2 \
       && \
    rm -rf /var/lib/apt/lists/*

# 3. Create a workdir and copy requirements
WORKDIR /app
COPY requirements.txt ./

# 4. Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the FastAPI/Selenium code into /app
COPY . .

# 6. Ensure ChromeDriver and Chrome (Chromium) can run headless:
#    We’ll pass flags from Python to run in headless mode, but leave this as a reminder.
ENV CHROME_BIN="/usr/bin/chromium"
ENV CHROMEDRIVER_PATH="/usr/bin/chromedriver"

# 7. Expose the port (Render will set $PORT at runtime—uvicorn can pick it up)
ARG PORT=8000
ENV PORT=${PORT}

# 8. Default command: run uvicorn on 0.0.0.0:${PORT}
#    "python_service:app" assumes your FastAPI app lives in python_service.py as "app".
CMD ["uvicorn", "python_service:app", "--host", "0.0.0.0", "--port", "8000"]
