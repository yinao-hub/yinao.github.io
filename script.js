const body = document.body;
const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");
const yearNode = document.getElementById("year");
const paperInput = document.getElementById("paperInput");
const paperList = document.getElementById("paperList");
const paperMsg = document.getElementById("paperMsg");
const repoPaperList = document.getElementById("repoPaperList");
const repoPaperMsg = document.getElementById("repoPaperMsg");
const refreshPapersBtn = document.getElementById("refreshPapersBtn");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  body.classList.add("light");
  themeToggle.textContent = "☀️";
}

themeToggle?.addEventListener("click", () => {
  body.classList.toggle("light");
  const isLight = body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
});

menuBtn?.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => mainNav.classList.remove("open"));
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!name || !email || !message) {
    formMsg.textContent = "请完整填写表单后再提交。";
    return;
  }

  formMsg.textContent = "留言已接收（演示版）。如需真实发送，请接入后端服务。";
  contactForm.reset();
});

const uploadedPapers = [];
const GITHUB_OWNER = "yinao-hub";
const GITHUB_REPO = "yinao.github.io";
const GITHUB_BRANCH = "main";
const GITHUB_PAPERS_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/papers?ref=${GITHUB_BRANCH}`;

function formatKB(bytes) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function createPaperItem({ name, url, sizeText }, extraRightNode) {
  const item = document.createElement("li");
  item.className = "paper-item";

  const left = document.createElement("div");
  left.className = "paper-info";

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = name;

  const size = document.createElement("span");
  size.textContent = sizeText;

  left.appendChild(link);
  left.appendChild(size);
  item.appendChild(left);
  if (extraRightNode) item.appendChild(extraRightNode);

  return item;
}

function renderPaperList() {
  if (!paperList) return;
  paperList.innerHTML = "";

  if (uploadedPapers.length === 0) {
    const empty = document.createElement("li");
    empty.className = "paper-empty";
    empty.textContent = "暂无论文，请上传本地文件。";
    paperList.appendChild(empty);
    return;
  }

  uploadedPapers.forEach((paper, index) => {
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.textContent = "删除";
    removeBtn.addEventListener("click", () => {
      URL.revokeObjectURL(paper.url);
      uploadedPapers.splice(index, 1);
      renderPaperList();
    });

    const item = createPaperItem({
      name: paper.name,
      url: paper.url,
      sizeText: formatKB(paper.size),
    }, removeBtn);
    paperList.appendChild(item);
  });
}

paperInput?.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    paperMsg.textContent = "未选择文件。";
    return;
  }

  files.forEach((file) => {
    uploadedPapers.push({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    });
  });

  paperMsg.textContent = `已上传 ${files.length} 个文件（仅当前浏览器会话可见）。`;
  paperInput.value = "";
  renderPaperList();
});

async function loadRepoPapers() {
  if (!repoPaperList || !repoPaperMsg) return;
  repoPaperMsg.textContent = "正在读取 GitHub 仓库论文...";
  repoPaperList.innerHTML = "";

  try {
    const response = await fetch(GITHUB_PAPERS_API);
    if (!response.ok) {
      throw new Error(`读取失败：HTTP ${response.status}`);
    }

    const files = await response.json();
    const papers = files.filter((file) => file.type === "file");

    if (papers.length === 0) {
      const empty = document.createElement("li");
      empty.className = "paper-empty";
      empty.textContent = "papers/ 目录暂无论文文件。";
      repoPaperList.appendChild(empty);
      repoPaperMsg.textContent = "请先把论文上传到仓库 papers/ 目录。";
      return;
    }

    papers
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((paper) => {
        const item = createPaperItem({
          name: paper.name,
          url: paper.download_url || paper.html_url,
          sizeText: formatKB(paper.size || 0),
        });
        repoPaperList.appendChild(item);
      });

    repoPaperMsg.textContent = `已加载 ${papers.length} 篇论文。`;
  } catch (error) {
    const empty = document.createElement("li");
    empty.className = "paper-empty";
    empty.textContent = "加载失败，请检查仓库名、分支或网络。";
    repoPaperList.appendChild(empty);
    repoPaperMsg.textContent = error.message;
  }
}

refreshPapersBtn?.addEventListener("click", loadRepoPapers);

renderPaperList();
loadRepoPapers();

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
