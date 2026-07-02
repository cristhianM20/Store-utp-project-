FROM golang:1.21-alpine AS builder

WORKDIR /app

# Instalar dependencias de sistema
RUN apk add --no-cache git ca-certificates

# Copiar archivos de Go
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compilar binario estático
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o backend .

# Imagen final minimalista
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copiar binario desde builder
COPY --from=builder /app/backend .

# Configurar zona horaria
ENV TZ=America/Mexico_City

EXPOSE 8080

CMD ["./backend"]
