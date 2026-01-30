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

DB_HOST=mysql OLLAMA_URL=http://ollama:11434  
docker compose --profile database --profile ai --profile web up
