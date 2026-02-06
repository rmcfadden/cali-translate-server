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
   http://localhost:3000/api/translate?q=testing&to=spanish&x-api-key=YWE2ODdjMWRlYTI0Y2VmMGZiOWRkMDYxMjA0NjA2YzVmODgyMjdkNTAyMjdlZWQ3MGQ1MWQyYjAzY2Y4OThhNDo3NzRmZjM3OTIzNzBhYTU1OWUwMTJkNmFiYWMwMzIzNTQxMmQzM2E3MmVhOWVkZDdjMmIwYmI0NTY2NDQ3NmY0

4. Docker compose

DB_HOST=mysql OLLAMA_URL=http://ollama:11434 docker compose --profile database --profile ai --profile web up

docker compose --profile database --profile ai --profile web down

5. Docker exec commands:

- docker exec node_app_container ls

- docker exec -it mysql_container mysql -u appuser -papppassword -D services -e "SHOW TABLES;"

- docker exec node_app_container node ./dist/cli/setup create PasswordReplace

- docker exec node_app_container node ./dist/cli/api-keys add admin

- docker exec ollama_container ollama pull wizardlm2
- docker exec ollama_container ollama list
