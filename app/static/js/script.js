document.addEventListener("DOMContentLoaded", function () {
  const socket = io();

  const terminalContainer = document.getElementById("terminal");
  const editor = document.getElementById("editor");
  const fileTree = document.getElementById("file-tree");

  // Initialize xterm.js terminal
  const term = new Terminal();
  term.open(terminalContainer);

  // Handle terminal input
  term.onData(function (data) {
    socket.emit("terminal_input", { input: data });
  });

  // Handle terminal output
  socket.on("terminal_output", function (data) {
    term.write(data.output);
  });

  // File tree handling
  function createFileTreeElement(item) {
    const li = document.createElement("li");
    li.textContent = item.name;
    li.dataset.path = item.path;
    li.classList.add(item.is_dir ? "directory" : "file");
    if (item.is_dir) {
      li.addEventListener("click", function (event) {
        event.stopPropagation();
        if (li.classList.contains("expanded")) {
          li.classList.remove("expanded");
          li.querySelector("ul").remove();
        } else {
          li.classList.add("expanded");
          loadDirectory(item.path, li);
        }
      });
    } else {
      li.addEventListener("click", function (event) {
        event.stopPropagation();
        fetch("/file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filepath: item.path }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              alert(data.error);
            } else {
              editor.value = data.content;
              document
                .querySelectorAll("#file-tree li")
                .forEach((li) => li.classList.remove("selected"));
              li.classList.add("selected");
            }
          });
      });
    }
    return li;
  }

  function loadDirectory(dir, parentElement) {
    fetch("/filetree", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dir: dir }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          const ul = document.createElement("ul");
          data.forEach((item) => {
            const li = createFileTreeElement(item);
            ul.appendChild(li);
          });
          if (parentElement) {
            parentElement.appendChild(ul);
          } else {
            fileTree.innerHTML = "";
            fileTree.appendChild(ul);
          }
        }
      });
  }

  editor.addEventListener("blur", function () {
    const selectedFile = document.querySelector("#file-tree li.selected");
    if (selectedFile) {
      const filepath = selectedFile.dataset.path;
      const content = editor.value;
      fetch("/file", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filepath: filepath, content: content }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          }
        });
    }
  });

  loadDirectory("/");
});
