async function sendMessage() {
    const msg = document.getElementById("chatInput").value;

    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    document.getElementById("chatWindow").innerHTML += `
        <div class="bot">${data.reply}</div>
    `;
}
