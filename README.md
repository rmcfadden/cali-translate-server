Docker Translate Server

1. Build:

```
docker build -t cali-translate-server .
```

2. Run

```
docker run -p 4000:3000 cali-translate-server
```

1. Build Mysql:

```
docker build -f Dockerfile.mysql -t my-mysql .
```

2. Run Mysql

```
docker run -p 3306:3306 my-mysql
```

3. Test Url:
   http://localhost:3000/api/translate?q=testing&to=spanish&x-api-key=YmM4OGU4YmEwOTQ5MDQ5MDg3N2U1ZjM3ZWFmMmZiYTk3OThhOWMwYTU5NmVkOWFiMzM0OTMyOTQ2NGU2ZTU5NzoyMTkwYTdmYzQxZGQ5OWJhYWZmYzA0YWUwMjBkODZkNWViOTI2MmZlMmQyZTBjOGQxNDQwNTZkNjNmZjZiZjky


4. Docker compose 

**Core services only (Node.js + Nginx):**
```
docker-compose up
```

**With profiles (Docker Compose v1.28.0+):**
```
docker-compose --profile database up
docker-compose --profile ai up  
docker-compose --profile database --profile ai up
```

**Alternative for older Docker Compose versions:**
```
# Core only
docker-compose up nodeapp nginx

# With database
docker-compose up nodeapp nginx mysql

# With AI
docker-compose up nodeapp nginx ollama

# With both
docker-compose up nodeapp nginx mysql ollama
```