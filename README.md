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
