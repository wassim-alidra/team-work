import re, os

ROOT = r"c:\Users\ASUS\Downloads\team-work-agrigov3\team-work\frontend\src"

def fix(path, replacements):
    """Apply a list of (old, new) regex substitutions to a file."""
    full = os.path.join(ROOT, path)
    with open(full, "r", encoding="utf-8") as f:
        text = f.read()
    original = text
    for old, new in replacements:
        result = re.sub(old, new, text, flags=re.DOTALL)
        if result == text:
            print(f"  [WARN] no match in {path}: {repr(old[:80])}")
        else:
            print(f"  [OK]   matched in {path}")
        text = result
    if text != original:
        with open(full, "w", encoding="utf-8", newline="") as f:
            f.write(text)
        print(f"  Saved {path}")
    else:
        print(f"  No changes saved for {path}")

# ─── FarmerDashboard.jsx ──────────────────────────────────────────────────────
print("\n=== FarmerDashboard.jsx ===")
fix("components/dashboards/FarmerDashboard.jsx", [
    # 1. Dashboard quick-view inventory table edit/delete (messy indentation block)
    (
        r'<td className="py-3 pl-2 pr-4">\s*<div className="flex items-center gap-2">\s*'
        r'<button onClick=\{[^}]+handleEditProduct[^}]+\}\s*className="[^"]*text-on-surface-variant[^"]*"[\s\S]*?</button>\s*'
        r'<button onClick=\{[^}]+handleDeleteProduct[^"]+\}\s*className="[^"]*text-error[^"]*"[\s\S]*?</button>\s*'
        r'</div>\s*</td>',
        '<td className="py-3 pl-2 pr-4">\n'
        '                                                <div className="flex items-center gap-2">\n'
        '                                                    <button onClick={() => handleEditProduct(p)} className="action-icon-btn btn-edit" title="Edit Product">\n'
        '                                                        <span className="material-symbols-outlined">edit</span>\n'
        '                                                    </button>\n'
        '                                                    <button onClick={() => handleDeleteProduct(p.id)} className="action-icon-btn btn-delete" title="Remove Product">\n'
        '                                                        <span className="material-symbols-outlined">delete</span>\n'
        '                                                    </button>\n'
        '                                                </div>\n'
        '                                            </td>'
    ),
    # 2. Products tab edit/delete buttons
    (
        r'<button onClick=\{[^}]+handleEditProduct\(p\)[^}]*\} className="text-on-surface-variant hover:text-secondary[^"]*" title="Edit Product">',
        '<button onClick={() => handleEditProduct(p)} className="action-icon-btn btn-edit" title="Edit Product">'
    ),
    (
        r'<button onClick=\{[^}]+handleDeleteProduct\(p\.id\)[^}]*\} className="text-error hover:bg-error-container[^"]*" title="Remove Entry">',
        '<button onClick={() => handleDeleteProduct(p.id)} className="action-icon-btn btn-delete" title="Remove Product">'
    ),
    # 3. Orders accept/cancel icon buttons
    (
        r'<button onClick=\{[^}]+handleUpdateOrderStatus\(o\.id,\s*\'ACCEPTED\'\)[^}]*\} className="text-primary[^"]*" title="Accept">',
        '<button onClick={() => handleUpdateOrderStatus(o.id, \'ACCEPTED\')} className="action-icon-btn btn-approve" title="Accept Order">'
    ),
    (
        r'<button onClick=\{[^}]+handleUpdateOrderStatus\(o\.id,\s*\'CANCELLED\'\)[^}]*\} className="text-error[^"]*" title="Reject">',
        '<button onClick={() => handleUpdateOrderStatus(o.id, \'CANCELLED\')} className="action-icon-btn btn-reject" title="Reject Order">'
    ),
])

# ─── TransporterDashboard.jsx ─────────────────────────────────────────────────
print("\n=== TransporterDashboard.jsx ===")
fix("components/dashboards/TransporterDashboard.jsx", [
    # 1. Dashboard "Refresh" button
    (
        r'<button className="text-primary font-button text-body-sm hover:underline" onClick=\{[^}]+fetchAvailableOrders[^}]*\}>Refresh</button>',
        '<button className="btn-clear" onClick={() => fetchAvailableOrders()}>Refresh</button>'
    ),
    # 2. Dashboard "View" button (small card)
    (
        r'<button className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded border border-primary/20 hover:bg-primary/20 transition-colors" onClick=\{[^}]+setSelectedOrder\(o\)[^}]*\}>\s*<MapPin[^/]*/> View\s*</button>',
        '<button className="btn-action-outline flex-1" onClick={() => setSelectedOrder(o)}><MapPin size={14} /> View</button>'
    ),
    # 3. Dashboard "Accept" button (small card)
    (
        r'<button\s+className="flex-1 bg-secondary-container text-on-secondary-container py-2 rounded hover:bg-secondary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\s+onClick=\{[^}]+handleAccept\(o\.id\)[^}]*\}\s+disabled=\{user\.has_active_mission\}\s+title=\{[^}]+\}\s*>\s*Accept\s*</button>',
        '<button className="btn-action-secondary flex-1" onClick={() => handleAccept(o.id)} disabled={user.has_active_mission} title={user.has_active_mission ? "You already have an active mission" : ""}>Accept</button>'
    ),
    # 4. Requests tab "View Details" button
    (
        r'className=\{`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-outline-variant/30 transition-colors \$\{[^`]+\}`\}',
        'className="btn-action-outline flex-1"'
    ),
    # 5. Requests tab "Accept" button (full page)
    (
        r'<button\s+className="flex-1 bg-primary text-on-primary py-2 rounded-lg hover:bg-tertiary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"\s+onClick=\{[^}]+handleAccept\(o\.id\)[^}]*\}\s+disabled=\{user\.has_active_mission\}\s+title=\{[^}]+\}\s*>\s*<CheckCircle[^/]*/> Accept\s*</button>',
        '<button className="btn-action-secondary flex-1" onClick={() => handleAccept(o.id)} disabled={user.has_active_mission} title={user.has_active_mission ? "You already have an active mission" : ""}><CheckCircle size={16} /> Accept</button>'
    ),
    # 6. "Update Status" button
    (
        r'<button\s+className="bg-secondary text-on-secondary px-6 py-2 rounded-lg font-button hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm active:scale-95"\s+onClick=\{[^}]+handleUpdateStatus[^}]+\}\s*>\s*Update Status\s*</button>',
        '<button className="btn-action-secondary" onClick={() => { const nextStatus = {\'ASSIGNED\': \'ON_WAY\', \'ON_WAY\': \'CHARGING\', \'CHARGING\': \'DELIVERED\'}[d.status]; handleUpdateStatus(d.id, nextStatus); }}>Update Status</button>'
    ),
])

# ─── BuyerDashboard.jsx ───────────────────────────────────────────────────────
print("\n=== BuyerDashboard.jsx ===")
fix("components/dashboards/BuyerDashboard.jsx", [
    # All large round detail buttons
    (
        r'className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-\[[^\]]+\] transition-all active:scale-90 hover:opacity-90"',
        'className="circle-btn"'
    ),
    (
        r'class="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-\[[^\]]+\] transition-all active:scale-90 hover:opacity-90"',
        'className="circle-btn"'
    ),
    # Fix span class -> className inside those buttons
    (
        r'<span class="material-symbols-outlined text-\[28px\]"',
        '<span className="material-symbols-outlined text-[24px]"'
    ),
])

# ─── AdminDashboard.jsx ───────────────────────────────────────────────────────
print("\n=== AdminDashboard.jsx ===")
fix("components/dashboards/AdminDashboard.jsx", [
    # 1. Users table "Review" button
    (
        r'<button className="font-button text-button text-primary hover:text-secondary mr-2 transition-colors" onClick=\{[^}]+setSelectedUser\(u\)[^}]*\}>Review</button>',
        '<button className="btn-action-outline" onClick={() => setSelectedUser(u)}>Review</button>'
    ),
    # 2. Regulation table icon buttons (edit / history / delete)
    (
        r'<button[^>]+className="text-on-surface-variant hover:text-primary[^"]*"[^>]*>\s*<span className="material-symbols-outlined">edit</span>\s*</button>',
        '<button className="action-icon-btn btn-edit" title="Edit Regulation"><span className="material-symbols-outlined">edit</span></button>'
    ),
    (
        r'<button[^>]+className="text-on-surface-variant hover:text-secondary[^"]*"[^>]*>\s*<span className="material-symbols-outlined">history</span>\s*</button>',
        '<button className="action-icon-btn btn-history" title="View History"><span className="material-symbols-outlined">history</span></button>'
    ),
    (
        r'<button[^>]+className="text-on-surface-variant hover:text-error[^"]*"[^>]*>\s*<span className="material-symbols-outlined">delete</span>\s*</button>',
        '<button className="action-icon-btn btn-delete" title="Delete Regulation"><span className="material-symbols-outlined">delete</span></button>'
    ),
    # 3. Actor modal — Suspend button
    (
        r'<button className="px-4 py-2 border border-error text-error rounded-lg font-button text-button hover:bg-error-container transition-colors" onClick=\{[^}]+handleUserAction\(\'suspend\'[^}]+\} disabled=\{loading\}>[\s\S]*?</button>',
        '<button className="btn-review-suspend" onClick={() => handleUserAction(\'suspend\', selectedUser.id)} disabled={loading}>{loading ? "..." : "Suspend"}</button>'
    ),
    # 4. Actor modal — Activate button
    (
        r'<button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-button text-button hover:bg-secondary transition-colors" onClick=\{[^}]+handleUserAction\(\'activate\'[^}]+\} disabled=\{loading\}>[\s\S]*?</button>',
        '<button className="btn-review-activate" onClick={() => handleUserAction(\'activate\', selectedUser.id)} disabled={loading}>{loading ? "..." : "Activate"}</button>'
    ),
    # 5. Actor modal — Approve Account button
    (
        r'<button className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-button text-button hover:bg-secondary-fixed transition-colors" onClick=\{[^}]+handleUserAction\(\'approve_account\'[^}]+\} disabled=\{loading\}>[\s\S]*?</button>',
        '<button className="btn-review-approve" onClick={() => handleUserAction(\'approve_account\', selectedUser.id)} disabled={loading}>{loading ? "..." : "Approve Account"}</button>'
    ),
    # 6. Actor modal — Delete button
    (
        r'<button className="px-4 py-2 bg-error text-on-error rounded-lg font-button text-button hover:bg-error/90 transition-colors" onClick=\{[^}]+handleUserAction\(\'delete_account\'[^}]+\} disabled=\{loading\}>[\s\S]*?</button>',
        '<button className="btn-review-delete" onClick={() => handleUserAction(\'delete_account\', selectedUser.id)} disabled={loading}>{loading ? "..." : "Delete"}</button>'
    ),
    # 7. Actor modal — Close button
    (
        r'<button className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-button text-button hover:bg-surface-container transition-colors" onClick=\{[^}]+setSelectedUser\(null\)[^}]+\}>Close</button>',
        '<button className="btn-review-close" onClick={() => { setSelectedUser(null); setTempMessage(""); }}>Close</button>'
    ),
])

# ─── Topbar.jsx ───────────────────────────────────────────────────────────────
print("\n=== Topbar.jsx ===")
fix("components/layout/Topbar.jsx", [
    # Fix oversized bell
    (
        r'<Bell size=\{40\} color="#127120ff" />',
        '<Bell size={22} />'
    ),
    # In case it was already partially changed
    (
        r'<Bell size=\{40\}[^/]*/>', 
        '<Bell size={22} />'
    ),
])

print("\nAll done!")
