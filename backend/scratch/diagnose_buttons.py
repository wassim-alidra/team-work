import re, os

ROOT = r"c:\Users\ASUS\Downloads\team-work-agrigov3\team-work\frontend\src"

def load(path):
    with open(os.path.join(ROOT, path), "r", encoding="utf-8") as f:
        return f.read()

def save(path, text):
    with open(os.path.join(ROOT, path), "w", encoding="utf-8", newline="") as f:
        f.write(text)

# ─── 1. TransporterDashboard - Update Status button ─────────────────────────
print("=== TransporterDashboard ===")
text = load("components/dashboards/TransporterDashboard.jsx")
# Find exact className of Update Status button
idx = text.find("Update Status")
print("Full button context:", repr(text[max(0,idx-400):idx+20]))

# ─── 2. AdminDashboard - catalog table buttons + modal close ─────────────────
print("\n=== AdminDashboard ===")
text = load("components/dashboards/AdminDashboard.jsx")

# Find modal close button area
idx = text.find("Close")
while idx >= 0:
    snippet = text[max(0,idx-200):idx+100]
    if "button" in snippet.lower():
        print(f"Close button at {idx}:\n{repr(snippet)}\n---")
    idx = text.find("Close", idx+1)

# Find catalog table action buttons
for kw in ["handleDeleteCatalog", "handleEditPriceItem", "priceHistory", "setSelectedCatalog"]:
    idx = text.find(kw)
    if idx >= 0:
        print(f"\nFound '{kw}':\n{repr(text[max(0,idx-300):idx+300])}")
