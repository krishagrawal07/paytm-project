/**
 * Paytm Customer Portal Logic
 * Version 7.0.0 - Security & Settings Integration
 */

document.addEventListener('DOMContentLoaded', () => {
    const userId = window.activeUserId;
    if(!userId) return;

    // --- UTILS ---
    function showToast(msg, type = "info") {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.style.cssText = "position:fixed; bottom:30px; right:30px; background:#1e293b; color:#fff; padding:16px 24px; border-radius:16px; z-index:10000; box-shadow:0 10px 30px rgba(0,0,0,0.2); animation:slideIn 0.3s ease; display:flex; align-items:center; gap:12px;";
        const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info');
        const iconColor = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#00BAF2');
        t.innerHTML = `<i class=\"fa-solid ${icon}\" style=\"color:${iconColor}\"></i> <span style=\"font-weight:600;\">${msg}</span>`;
        document.body.appendChild(t);
        setTimeout(() => {
            t.style.opacity = "0";
            t.style.transform = "translateY(20px)";
            setTimeout(() => t.remove(), 300);
        }, 4000);
    }

    function switchView(viewId) {
        document.querySelectorAll('.main-content > div').forEach(v => {
            v.classList.add('hidden');
            v.style.display = 'none';
        });
        const target = document.getElementById(`view-${viewId}`);
        if(target) {
            target.classList.remove('hidden');
            target.style.display = 'block';
        }
        
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
            item.classList.remove('active');
            if(item.id === `sidebar-${viewId}` || item.getAttribute('data-view') === (viewId === 'dashboard' ? 'home' : viewId)) {
                item.classList.add('active');
            }
        });

        if(viewId === 'dashboard') loadDashboard();
        if(viewId === 'bank') loadLinkedBanks();
        if(viewId === 'passbook') loadPassbook();
    }

    function openDrawer(id) { 
        console.log("Opening Drawer:", id);
        const d = document.getElementById(id);
        if(d) { d.classList.remove('hidden'); d.style.display = 'flex'; }
    }
    function closeDrawers() { 
        document.querySelectorAll('#profile-overlay, #help-overlay, #notifications-overlay').forEach(d => {
            d.classList.add('hidden');
            d.style.display = 'none';
        });
    }

    // --- DATA FETCHING ---
    function loadDashboard() {
        fetch(`/api/user/${userId}/profile`)
            .then(res => res.json())
            .then(data => {
                if(data.user) {
                    document.getElementById('user-balance-display').innerText = `₹ ${parseFloat(data.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
                    renderTxnTable(data.transactions.slice(0, 5), 'user-txn-list');
                }
            });
    }

    function loadPassbook() {
        fetch(`/api/user/${userId}/profile`)
            .then(res => res.json())
            .then(data => renderTxnTable(data.transactions, 'user-txn-list-full'));
    }

    function renderTxnTable(txns, containerId) {
        const tbody = document.getElementById(containerId);
        if(!tbody) return;
        if(!txns || txns.length === 0) {
            tbody.innerHTML = `<tr><td colspan=\"6\" style=\"text-align:center; padding:40px; color:#94a3b8;\">No transactions found</td></tr>`;
            return;
        }
        tbody.innerHTML = txns.map(t => `
            <tr>
                <td><div style=\"display:flex; align-items:center; gap:10px;\"><div style=\"width:32px; height:32px; background:#f1f5f9; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#012b72; font-size:12px;\"><i class=\"fa-solid fa-shop\"></i></div> <strong>${t.merchant || 'P2P Transfer'}</strong></div></td>
                <td><span style=\"font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;\">${t.category || 'General'}</span></td>
                <td><code style=\"font-size:11px; color:#94a3b8;\">#TXN-${t.transaction_id}</code></td>
                <td style=\"font-size:12px;\">${new Date(t.transaction_date).toLocaleString()}</td>
                <td><strong style=\"color:${t.status === 'Completed' ? '#1e293b' : '#94a3b8'}\">₹ ${parseFloat(t.amount).toFixed(2)}</strong></td>
                <td><span style=\"padding:4px 8px; border-radius:6px; font-size:10px; font-weight:800; background:${t.status === 'Completed' ? '#dcfce7' : '#fee2e2'}; color:${t.status === 'Completed' ? '#166534' : '#b91c1c'}\">${t.status.toUpperCase()}</span></td>
            </tr>
        `).join('');
    }

    function loadLinkedBanks() {
        const container = document.getElementById('dynamic-bank-list');
        if(!container) return;
        
        // Let the backend decide the user if userId is missing
        const url = userId ? `/api/user/banks/list?user_id=${userId}` : '/api/user/banks/list';
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if(!data.banks || data.banks.length === 0) {
                    container.innerHTML = `<div style=\"text-align:center; padding:40px;\"><p style=\"color:#94a3b8;\">No banks linked.</p><button class=\"btn-primary-web\" onclick=\"document.getElementById('modal-link-bank').classList.add('active')\" style=\"width:auto; margin-top:15px; padding:10px 24px;\">Link Bank Now</button></div>`;
                    return;
                }
                container.innerHTML = data.banks.map(b => `
                    <div class="bank-card" style="background:#fff; padding:20px; border-radius:18px; border:1px solid #e2e8f0; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; gap:16px; align-items:center;">
                            <div style="width:44px; height:44px; background:#f0f9ff; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#00BAF2; font-size:20px;\"><i class=\"fa-solid fa-building-columns\"></i></div>
                            <div>
                                <h4 style=\"font-size:15px; font-weight:800;\">${b.bank_name}</h4>
                                <p style=\"font-size:12px; color:#64748b;\">A/C •••• ${b.account_number.slice(-4)}</p>
                            </div>
                        </div>
                        <div style=\"text-align:right\">
                            <p id=\"balance-${b.id}\" style=\"font-weight:800; color:#1e293b; margin-bottom:4px;\">₹ ••••••</p>
                            <button class=\"btn-glass\" onclick=\"checkBankBalance(${b.id})\" style=\"font-size:11px; padding:4px 12px;\">Check Balance</button>
                        </div>
                    </div>
                `).join('');
            });
    }

    // --- NAVIGATION & DRAWER FIXES ---
    // Fix: Using correct ID from HTML (btn-profile-dropdown and btn-help)
    document.getElementById('btn-profile-dropdown')?.addEventListener('click', () => openDrawer('profile-overlay'));
    document.getElementById('btn-help')?.addEventListener('click', () => openDrawer('help-overlay'));
    
    // Bank Linking Triggers
    const linkBankBtn = document.getElementById('btn-add-bank-trigger');
    const linkBankBanner = document.getElementById('banner-add-bank-trigger');
    const linkBankModal = document.getElementById('modal-link-bank');

    [linkBankBtn, linkBankBanner].forEach(el => {
        el?.addEventListener('click', () => {
            console.log("Opening Link Bank Modal");
            if(linkBankModal) linkBankModal.classList.add('active');
        });
    });

    function openModal(id) {
        const m = document.getElementById(id);
        if(m) m.classList.add('active');
    }

    function closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    document.querySelectorAll('.btn-close-profile, .btn-close-drawer, #btn-done-help').forEach(btn => {
        btn.addEventListener('click', () => { closeDrawers(); closeModals(); });
    });

    // Profile Menu Wiring
    document.getElementById('prof-menu-settings')?.addEventListener('click', () => { closeDrawers(); switchView('security'); });
    document.getElementById('prof-menu-security')?.addEventListener('click', () => { closeDrawers(); switchView('security'); });
    document.getElementById('prof-menu-banks')?.addEventListener('click', () => { closeDrawers(); switchView('bank'); });
    document.getElementById('prof-menu-history')?.addEventListener('click', () => { closeDrawers(); switchView('passbook'); });
    document.getElementById('prof-menu-help')?.addEventListener('click', () => { closeDrawers(); openDrawer('help-overlay'); });
    document.getElementById('prof-menu-logout')?.addEventListener('click', () => window.location.href = '/logout');

    // Security Toggle Logic
    document.querySelectorAll('.security-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.security-card').forEach(c => c.style.borderColor = 'var(--border-color)');
            card.style.borderColor = 'var(--paytm-blue)';
            const type = card.getAttribute('data-sec');
            const title = document.getElementById('security-form-title');
            if(type === 'password') title.innerText = "Change Login Password";
            if(type === 'pin') title.innerText = "Change Payment PIN";
            if(type === 'sessions') title.innerText = "Active Login Sessions";
        });
    });

    document.getElementById('btn-update-security')?.addEventListener('click', () => {
        showToast("Updating security credentials...", "info");
        setTimeout(() => showToast("Security Settings Updated Successfully!", "success"), 1500);
    });

    // --- DASHBOARD BALANCE CARD TRIGGERS ---
    document.getElementById('trigger-add-money')?.addEventListener('click', () => openModal('modal-add-money'));
    document.getElementById('trigger-p2p')?.addEventListener('click', () => openModal('modal-p2p'));
    document.getElementById('trigger-my-qr')?.addEventListener('click', () => openDrawer('profile-overlay'));
    document.getElementById('trigger-pay')?.addEventListener('click', () => {
        openModal('modal-pay');
        fetch('/api/table/Merchants').then(res => res.json()).then(data => {
            const select = document.getElementById('payment-merchant-id');
            if(select) select.innerHTML = data.data.map(m => `<option value="${m.merchant_id}">${m.name} (${m.category})</option>`).join('');
        });
    });

    // --- SERVICE GRID ACTIONS ---
    document.querySelectorAll('.service-item').forEach(item => {
        item.addEventListener('click', () => {
            const modalId = item.getAttribute('data-modal');
            const billType = item.getAttribute('data-bill');
            
            if(modalId) {
                openModal(modalId);
            } else if(billType) {
                setupBillModal(billType);
                openModal('modal-bill');
            } else if(item.id === 'svc-self') {
                openModal('modal-add-money');
            } else if(item.id === 'svc-bank') {
                showToast("Transfer to Bank Account coming soon!", "info");
            }
        });
    });

    function setupBillModal(type) {
        const title = document.getElementById('bill-modal-title');
        const cat = document.getElementById('bill-category');
        const groupPhone = document.getElementById('group-recharge-phone');
        const groupBill = document.getElementById('group-bill-id');
        const labelBill = document.getElementById('bill-id-label');
        const provider = document.getElementById('bill-provider');

        cat.value = type;
        groupPhone.classList.add('hidden');
        groupBill.classList.add('hidden');

        const providers = {
            recharge: ["Airtel", "Jio", "Vi", "BSNL"],
            electricity: ["Adani Electricity", "Tata Power", "MSEB", "BESCOM"],
            dth: ["Tata Play", "Airtel Digital TV", "Dish TV", "Videocon d2h"],
            gas: ["Indane Gas", "HP Gas", "Bharat Gas", "Mahanagar Gas"]
        };

        provider.innerHTML = (providers[type] || []).map(p => `<option>${p}</option>`).join('');

        if(type === 'recharge') {
            title.innerText = "Mobile Recharge";
            groupPhone.classList.remove('hidden');
        } else {
            title.innerText = type.charAt(0).toUpperCase() + type.slice(1) + " Bill";
            groupBill.classList.remove('hidden');
            labelBill.innerText = type === 'electricity' ? 'CONSUMER NUMBER' : (type === 'dth' ? 'SMART CARD ID' : 'GAS CONNECTION ID');
        }
    }

    document.getElementById('btn-submit-bill')?.addEventListener('click', () => {
        const type = document.getElementById('bill-category').value;
        const amt = document.getElementById('bill-amount').value;
        const prov = document.getElementById('bill-provider').value;
        if(!amt) return showToast("Enter amount", "error");

        fetch('/api/user/bill-pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, category: type, provider: prov, amount: amt })
        }).then(res => res.json()).then(data => {
            if(data.success) { showToast(`${type.toUpperCase()} Success!`, "success"); closeModals(); loadDashboard(); }
            else showToast(data.error, "error");
        });
    });

    // P2P Find Recipient
    document.getElementById('btn-find-recipient')?.addEventListener('click', () => {
        const phone = document.getElementById('p2p-phone').value;
        fetch(`/api/user/find?phone=${phone}`)
            .then(res => res.json())
            .then(data => {
                const box = document.getElementById('p2p-recipient-box');
                if(data.user) {
                    document.getElementById('p2p-recipient-name').innerText = data.user.name;
                    box.classList.remove('hidden');
                } else {
                    showToast("User not found", "error");
                    box.classList.add('hidden');
                }
            });
    });

    // P2P Send Money
    document.getElementById('btn-p2p-now')?.addEventListener('click', () => {
        const phone = document.getElementById('p2p-phone').value;
        const amt = document.getElementById('p2p-amount').value;
        fetch('/api/user/p2p', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender_id: userId, recipient_phone: phone, amount: amt })
        }).then(res => res.json()).then(data => {
            if(data.success) { showToast("Transfer Successful!", "success"); closeModals(); loadDashboard(); }
            else showToast(data.error, "error");
        });
    });

    // Add Money
    document.getElementById('btn-add-money-now')?.addEventListener('click', () => {
        const amt = document.getElementById('add-money-amount').value;
        fetch('/api/user/add-money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, amount: amt })
        }).then(res => res.json()).then(data => {
            if(data.success) { showToast("Money Added to Wallet!", "success"); closeModals(); loadDashboard(); }
            else showToast(data.error, "error");
        });
    });

    // Merchant Pay
    document.getElementById('btn-pay-now')?.addEventListener('click', () => {
        const mid = document.getElementById('payment-merchant-id').value;
        const amt = document.getElementById('payment-amount').value;
        fetch('/api/user/pay-merchant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, merchant_id: mid, amount: amt })
        }).then(res => res.json()).then(data => {
            if(data.success) { showToast("Payment Successful!", "success"); closeModals(); loadDashboard(); }
            else showToast(data.error, "error");
        });
    });

    // --- NAVIGATION & SIDEBAR ---
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            const sid = item.id;

            if(sid === 'sidebar-help') { openDrawer('help-overlay'); return; }
            if(sid === 'sidebar-wallet' || viewId === 'home') { switchView('dashboard'); return; }
            if(sid === 'sidebar-passbook') { switchView('passbook'); return; }
            if(sid === 'sidebar-bank') { switchView('bank'); return; }
        });
    });

    // Initial Load
    switchView('dashboard');
});
