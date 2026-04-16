const body = document.body;
const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");
const yearNode = document.getElementById("year");

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

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
