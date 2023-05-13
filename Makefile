

weaviate:
	@echo "Starting Weaviate..."
	@docker-compose up -d

weaviate-stop:
	@echo "Stopping Weaviate..."
	@docker-compose down

clean: weaviate-stop
	@echo "Cleaning up..."
	@rm -rf node_modules pnpm-lock.yaml

DEFALT_GOAL := weaviate