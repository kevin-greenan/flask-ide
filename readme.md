# Flask IDE
Flask IDE is a lightweight integrated development environment (IDE) built with Flask, Socket.IO, and xterm.js. It provides a file tree view, a text editor, and an interactive terminal, enabling users to manage files and execute commands in a containerized environment.

## Features
- **File Tree View**: Explore the filesystem hierarchy of the running container, with support for expanding and collapsing folders.
- **Text Editor**: Edit files in real-time with a simple text editor.
- **Interactive Terminal**: Execute commands and view their output in a fully interactive terminal environment.

## Prerequisites
- Docker installed on your system


## Getting Started
1. Clone this repository:

```bash
git clone https://github.com/kevin-greenan/flask-ide.git
```

2. Navigate to the project directory:

```bash
cd flask-ide
```

3. Build the Docker image:

```bash
make build
```

4. Run the Docker container:

```bash
make run
```

5. Open your web browser and navigate to `http://localhost:8080` to access the Flask IDE.

## Usage
- **File Tree View**: Click on folders to expand/collapse them. Click on files to view/edit their contents.
- **Text Editor**: Edit files directly in the text editor. Changes are automatically saved.
- **Interactive Terminal**: Enter commands in the terminal and press Enter to execute them. View command output directly in the terminal.
