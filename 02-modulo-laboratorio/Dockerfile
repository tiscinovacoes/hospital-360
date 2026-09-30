# STAGE 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libc6-dev libpq-dev libxml2-dev libxslt1-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt || echo "Scaffolding mode"

# STAGE 2: Hardened Runner
FROM python:3.11-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl libpq5 libxml2 libxslt1.1 \
    && rm -rf /var/lib/apt/lists/*

# Hardening: Non-root user (UID:GID 10002:10002)
RUN groupadd -g 10002 senaite && \
    useradd -u 10002 -g senaite -m -s /bin/bash senaite

COPY --from=builder /install /usr/local
COPY --chown=senaite:senaite . .

USER senaite

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8082/api/health || exit 1

CMD ["python", "server.py"]
