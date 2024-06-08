import os
import pty
import subprocess
import select
from flask import Blueprint, render_template, request, jsonify
from . import socketio

bp = Blueprint('main', __name__)

def read_and_forward_pty_output(fd):
    max_read_bytes = 1024 * 20
    while True:
        socketio.sleep(0.01)
        if select.select([fd], [], [], 0)[0]:
            output = os.read(fd, max_read_bytes).decode()
            socketio.emit('terminal_output', {'output': output})

@bp.route('/')
def index():
    return render_template('index.html')

@socketio.on('terminal_input')
def handle_terminal_input(data):
    if 'pty_fd' not in handle_terminal_input.__dict__:
        master_fd, slave_fd = pty.openpty()
        handle_terminal_input.pty_fd = master_fd
        handle_terminal_input.process = subprocess.Popen(
            ['/bin/bash'],
            preexec_fn=os.setsid,
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            universal_newlines=True,
        )
        socketio.start_background_task(target=read_and_forward_pty_output, fd=master_fd)
    os.write(handle_terminal_input.pty_fd, data['input'].encode())

@bp.route('/filetree', methods=['POST'])
def filetree():
    data = request.json
    path = data.get('dir', '/')
    try:
        files = []
        if path != '/':
            parent_path = os.path.abspath(os.path.join(path, os.pardir))
            files.append({
                'name': '..',
                'path': parent_path,
                'is_dir': True
            })
        for entry in os.scandir(path):
            files.append({
                'name': entry.name,
                'path': entry.path,
                'is_dir': entry.is_dir()
            })
        return jsonify(files)
    except Exception as e:
        return jsonify({'error': str(e)})

@bp.route('/file', methods=['POST'])
def read_file():
    data = request.json
    filepath = data.get('filepath')
    try:
        with open(filepath, 'r') as file:
            content = file.read()
        return jsonify({'content': content})
    except Exception as e:
        return jsonify({'error': str(e)})

@bp.route('/file', methods=['PUT'])
def write_file():
    data = request.json
    filepath = data.get('filepath')
    content = data.get('content')
    try:
        with open(filepath, 'w') as file:
            file.write(content)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)})
