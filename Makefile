.PHONY: dev build preview translate install

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

translate:
	npm run translate
