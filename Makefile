CONTAINER = flask_ide
PORT = 8080

init:
	pip install --upgrade pip
	pip install -r requirements.txt

build:
	docker build --platform linux/amd64 -t $(CONTAINER):latest .

run:
	docker run -d -p $(PORT):5000 --name $(CONTAINER) --platform linux/amd64 $(CONTAINER):latest

clean:
	docker stop $(CONTAINER) || true
	docker rm $(CONTAINER) || true

restart: clean build run

.PHONY: init build run clean restart
