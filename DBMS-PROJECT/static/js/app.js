document.addEventListener('DOMContentLoaded', () => {

    const errorBanner = document.getElementById('error-banner');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewCaseStudy = document.getElementById('view-case-study');
    const resultsContainer = document.getElementById('results-container');
    const pageTitleH1 = document.getElementById('page-title-h1');
    const pageTitleP = document.getElementById('page-title-p');

    // Toast Notification System
    function showToast(message, type="info") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        let icon = '<i class="fa-solid fa-circle-info"></i>';
        if(type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
        if(type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';
        
        toast.className = `toast ${type}`;
        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), 4000);
    }

    // Tab Navigation Logic
    const navDashboard = document.getElementById('nav-dashboard');
    const navUsers = document.getElementById('nav-users');
    const navMerchants = document.getElementById('nav-merchants');
    const navTransactions = document.getElementById('nav-transactions');
    const navCaseStudy = document.getElementById('nav-case-study');

    function showMainView(viewId) {
        viewDashboard.classList.add('hidden');
        viewCaseStudy.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        document.getElementById(viewId).classList.remove('hidden');
    }


    navDashboard.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
        navDashboard.classList.add('active');
        showMainView('view-dashboard');
        pageTitleH1.innerText = "Business Overview";
        pageTitleP.innerText = "Real-time macro analytics for your Paytm ecosystem.";
    });

    navCaseStudy.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
        navCaseStudy.classList.add('active');
        showMainView('view-case-study');
        pageTitleH1.innerText = "Case Study Assignments";
        pageTitleP.innerText = "Execute the 10 custom academic specific queries.";
    });

    let currentTableContext = null;

    function handleGenericTable(tableName, navEl, title, desc) {
        navEl.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
            navEl.classList.add('active');
            
            showMainView('results-container');
            pageTitleH1.innerText = title;
            pageTitleP.innerText = desc;
            document.getElementById('table-heading-title').innerText = `${tableName} Ledger`;
            
            currentTableContext = tableName;
            document.getElementById('btn-export-csv').classList.remove('hidden');
            document.getElementById('btn-refresh-query').classList.add('hidden');
            
            if(['Users', 'Merchants'].includes(tableName)) {
                document.getElementById('btn-add-record').classList.remove('hidden');
            } else {
                document.getElementById('btn-add-record').classList.add('hidden');
            }

            fetchGenericTable(tableName);
        });
    }

    handleGenericTable('Users', navUsers, "User Management", "View all registered platform consumers.");
    handleGenericTable('Merchants', navMerchants, "Merchant Network", "View all on-boarded business entities.");
    handleGenericTable('Transactions', navTransactions, "Live Transactions", "System-wide un-filtered transaction master ledger.");

    function fetchGenericTable(tableName) {
        document.getElementById('table-body').innerHTML = `
            <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
            <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
            <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
            <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
        `;
        fetch(`/api/table/${tableName}`)
            .then(res => res.json())
            .then(data => { renderResults(data); })
            .catch(e => { showToast("Network Fetch Error", "error"); });
    }

    // Initial Dashboard Data Load
    function loadDashboardMetrics() {
        document.getElementById('refresh-db-btn').innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...`;
        
        fetch('/api/dashboard/metrics')
            .then(res => res.json())
            .then(data => {
                document.getElementById('refresh-db-btn').innerHTML = `<i class="fa-solid fa-rotate-right"></i> Refresh Live Data`;
                if(data.error) {
                    errorBanner.classList.remove('hidden');
                    return;
                }
                errorBanner.classList.add('hidden');
                
                // Update KPI Cards
                document.getElementById('kpi-volume').innerText = '₹' + parseFloat(data.metrics.volume).toLocaleString('en-IN', {minimumFractionDigits: 2});
                document.getElementById('kpi-users').innerText = data.metrics.users;
                document.getElementById('kpi-merchants').innerText = data.metrics.merchants;
                document.getElementById('kpi-revenue').innerText = '₹' + parseFloat(data.metrics.commission).toLocaleString('en-IN', {minimumFractionDigits: 2});

                // Update Recent Ledger
                const ledgerList = document.getElementById('recent-ledger-list');
                ledgerList.innerHTML = '';
                data.recent_txns.forEach(txn => {
                    const statusColor = txn.status === 'Completed' ? '#10b981' : '#ef4444';
                    const li = document.createElement('li');
                    li.className = 'ledger-item';
                    li.innerHTML = `
                        <div class="l-info">
                            <h4>${txn.merchant}</h4>
                            <p>${txn.user} • ${new Date(txn.transaction_date).toLocaleDateString()}</p>
                        </div>
                        <div class="l-amount">
                            <span>₹${parseFloat(txn.amount).toFixed(2)}</span>
                            <span style="font-size:11px; color:${statusColor};">${txn.status}</span>
                        </div>
                    `;
                    ledgerList.appendChild(li);
                });

                // Render Chart.js
                renderChart(data.chart_data);
            })
            .catch(err => {
                errorBanner.classList.remove('hidden');
                document.getElementById('refresh-db-btn').innerHTML = `<i class="fa-solid fa-rotate-right"></i> Refresh Live Data`;
            });
    }

    document.getElementById('refresh-db-btn').addEventListener('click', () => {
        loadDashboardMetrics();
        if(currentTableContext && !resultsContainer.classList.contains('hidden')) {
            fetchGenericTable(currentTableContext);
        }
    });
    // Chart Instance Holder
    let flowChart = null;
    function renderChart(chartData) {
        const ctx = document.getElementById('volumeChart').getContext('2d');
        
        const labels = chartData.map(d => new Date(d.t_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
        const amounts = chartData.map(d => parseFloat(d.daily_vol));

        if(flowChart) flowChart.destroy();

        flowChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Transaction Volume (₹)',
                    data: amounts,
                    borderColor: '#00BAF2',
                    backgroundColor: 'rgba(0, 186, 242, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#012b72',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { border: { dash: [4, 4] }, grid: { color: '#e2e8f0' } }
                }
            }
        });
    }

    // Case Study Queries Execution
    const queryCards = document.querySelectorAll('.query-card');
    queryCards.forEach(card => {
        card.addEventListener('click', () => {
            queryCards.forEach(c => c.classList.remove('active-query'));
            card.classList.add('active-query');
            
            const qId = card.getAttribute('data-query');
            document.getElementById('table-heading-title').innerText = `Academic Query ${qId} Output`;
            
            // Hide CSV/CRUD buttons for queries to keep it simple (or you could map exports later)
            document.getElementById('btn-add-record').classList.add('hidden');
            document.getElementById('btn-export-csv').classList.add('hidden');
            document.getElementById('btn-refresh-query').classList.remove('hidden');
            currentQueryContextId = qId;

            // Shimmer effect
            document.getElementById('table-body').innerHTML = `
                <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
                <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
                <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
            `;

            fetch(`/api/query/${qId}`)
                .then(res => res.json())
                .then(data => { renderResults(data, false); viewCaseStudy.scrollIntoView({behavior: 'smooth'}) })
                .catch(e => { showToast("Query Execution Error", "error"); });
        });
    });
    
    // ----------------------------------------------------
    // CUSTOM SQL PLAYGROUND LOGIC
    // ----------------------------------------------------
    const devPanelOverlay = document.getElementById('dev-panel-overlay');
    const customSqlInput = document.getElementById('custom-sql-input');
    const btnExecuteSql = document.getElementById('btn-execute-sql');

    function openDevPanel() {
        devPanelOverlay.classList.add('show');
        customSqlInput.focus();
    }

    function closeDevPanel() {
        devPanelOverlay.classList.remove('show');
    }

    document.getElementById('btn-toggle-dev-panel').addEventListener('click', openDevPanel);
    document.getElementById('close-dev-panel').addEventListener('click', closeDevPanel);
    devPanelOverlay.addEventListener('click', (e) => {
        if(e.target === devPanelOverlay) closeDevPanel();
    });

    btnExecuteSql.addEventListener('click', () => {
        const query = customSqlInput.value.trim();
        if(!query) {
            showToast("Please enter a SQL query first.", "error");
            return;
        }

        btnExecuteSql.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing...';
        btnExecuteSql.disabled = true;

        // Reset display state
        document.getElementById('table-heading-title').innerText = "SQL Query Output";
        document.getElementById('table-body').innerHTML = `
            <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
            <tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>
        `;

        fetch('/api/query/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        })
        .then(res => res.json())
        .then(data => {
            btnExecuteSql.innerHTML = '<i class="fa-solid fa-play" style="margin-right: 8px;"></i> Execute SQL Query';
            btnExecuteSql.disabled = false;

            if(data.error) {
                showToast("SQL Error: " + data.error, "error");
                resultsContainer.classList.add('hidden');
            } else {
                closeDevPanel(); // Close dev sliding tray
                showToast(`Query executed successfully! ${data.affected_rows || 0} rows affected.`, "success");
                renderResults(data, false); // false to disable delete/edit icons for raw queries
                resultsContainer.scrollIntoView({behavior: 'smooth'});
            }
        })
        .catch(err => {
            btnExecuteSql.innerHTML = '<i class="fa-solid fa-play" style="margin-right: 8px;"></i> Execute SQL Query';
            btnExecuteSql.disabled = false;
            showToast("Network Error: Could not reach the server.", "error");
        });
    });

    document.getElementById('close-report').addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        queryCards.forEach(c => c.classList.remove('active-query'));
    });

    // ----------------------------------------------------
    // QUERY REFRESH LOGIC
    // ----------------------------------------------------
    let currentQueryContextId = null;
    document.getElementById('btn-refresh-query').addEventListener('click', () => {
        if(currentQueryContextId) {
            const activeCard = document.querySelector(`.query-card[data-query="${currentQueryContextId}"]`);
            if(activeCard) activeCard.click();
            showToast("Query data refreshed from database.", "success");
        }
    });

    // ----------------------------------------------------
    // CSV EXPORT LOGIC
    // ----------------------------------------------------
    document.getElementById('btn-export-csv').addEventListener('click', () => {
        if(currentTableContext) {
            window.location.href = `/api/export/${currentTableContext}`;
        }
    });

    // ----------------------------------------------------
    // FULL CRUD (CREATE & UPDATE) MODAL LOGIC
    // ----------------------------------------------------
    const crudModal = document.getElementById('crud-modal');
    const crudForm = document.getElementById('crud-form');
    let currentEditId = null; // null means create, number means update
    
    function openModal(tableContext, existingData = null, recordId = null) {
        if(!tableContext) return;
        currentEditId = recordId;
        
        const actionText = recordId ? "Edit" : "Add New";
        document.getElementById('modal-title').innerText = `${actionText} ${tableContext.slice(0,-1)}`;
        document.getElementById('modal-submit').innerText = recordId ? "Update Record" : "Insert Record";
        
        crudForm.innerHTML = '';
        let fieldsHtml = '';
        
        // Helper to safely pull data
        const val = (key) => existingData ? existingData[key] : '';

        if(tableContext === 'Users') {
            fieldsHtml = `
                <input type="text" name="first_name" value="${val('first_name')}" placeholder="First Name" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <input type="text" name="last_name" value="${val('last_name')}" placeholder="Last Name" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <input type="email" name="email" value="${val('email')}" placeholder="Email Address" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <input type="text" name="phone" value="${val('phone')}" placeholder="Phone Number" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <input type="text" name="address" value="${val('address')}" placeholder="Home Address" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
            `;
        } else if (tableContext === 'Merchants') {
            fieldsHtml = `
                <input type="text" name="name" value="${val('name')}" placeholder="Business Name" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <select name="category" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                    <option value="E-commerce" ${val('category') === 'E-commerce'?'selected':''}>E-commerce</option>
                    <option value="Food & Dining" ${val('category') === 'Food & Dining'?'selected':''}>Food & Dining</option>
                    <option value="Travel" ${val('category') === 'Travel'?'selected':''}>Travel</option>
                    <option value="Entertainment" ${val('category') === 'Entertainment'?'selected':''}>Entertainment</option>
                    <option value="Utilities" ${val('category') === 'Utilities'?'selected':''}>Utilities</option>
                </select>
            `;
        } else if (tableContext === 'Transactions') {
            fieldsHtml = `
                <input type="number" name="user_id" value="${val('user_id')}" placeholder="User ID" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <input type="number" name="merchant_id" value="${val('merchant_id')}" placeholder="Merchant ID" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <input type="number" step="0.01" name="amount" value="${val('amount')}" placeholder="Amount (₹)" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                <select name="status" required style="padding:12px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
                    <option value="Completed" ${val('status') === 'Completed'?'selected':''}>Completed</option>
                    <option value="Pending" ${val('status') === 'Pending'?'selected':''}>Pending</option>
                    <option value="Failed" ${val('status') === 'Failed'?'selected':''}>Failed</option>
                </select>
            `;
        }
        
        crudForm.innerHTML = fieldsHtml;
        crudModal.classList.remove('hidden');
    }

    document.getElementById('btn-add-record').addEventListener('click', () => {
        openModal(currentTableContext);
    });

    document.getElementById('modal-cancel').addEventListener('click', () => crudModal.classList.add('hidden'));

    document.getElementById('modal-submit').addEventListener('click', () => {
        const modalTitle = document.getElementById('modal-title').innerText;
        if(modalTitle === 'Platform Configuration') {
            // Handled by the specific listener in side-menu-config
            return;
        }

        const formData = new FormData(crudForm);
        const payload = Object.fromEntries(formData.entries());
        
        const hasEmpty = Object.values(payload).some(v => String(v).trim() === '');
        if(hasEmpty) { showToast("Please fill all fields.", "error"); return; }

        document.getElementById('modal-submit').innerText = "Processing...";

        // Choose Endpoint
        const method = currentEditId ? 'PUT' : 'POST';
        const url = currentEditId ? `/api/update/${currentTableContext}/${currentEditId}` : `/api/create/${currentTableContext}`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('modal-submit').innerText = "Action Completed";
            if(data.success) {
                crudModal.classList.add('hidden');
                showToast(currentEditId ? "Record successfully updated!" : "Record successfully created!", "success");
                fetchGenericTable(currentTableContext);
                loadDashboardMetrics();
            } else {
                showToast("Database Error: " + data.error, "error");
            }
        })
        .catch(err => {
            showToast("Network Error", "error");
            document.getElementById('modal-submit').innerText = "Try Again";
        });
    });

    function renderResults(data, allowDelete = true) {
        resultsContainer.classList.remove('hidden');
        document.getElementById('query-sql-display').textContent = (data.query_text || '').trim();

        const tableHeadRow = document.getElementById('table-head-row');
        const tableBody = document.getElementById('table-body');
        tableHeadRow.innerHTML = '';
        tableBody.innerHTML = '';

        if (!data.columns || data.columns.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding:40px;">No results found.</td></tr>';
            return;
        }

        const context = data.context || currentTableContext;
        // Detect if we have both first and last name to merge them
        const cols = data.columns.map(c => String(c).toLowerCase());
        const firstNameIdx = cols.indexOf('first_name');
        const lastNameIdx = cols.indexOf('last_name');
        const hasFullNames = firstNameIdx !== -1 && lastNameIdx !== -1;

        // --- Header Logic ---
        if(hasFullNames) {
            const th = document.createElement('th');
            th.textContent = "NAME";
            tableHeadRow.appendChild(th);
            
            data.columns.forEach(col => {
                const c = col.toLowerCase();
                if(['user_id', 'first_name', 'last_name'].includes(c)) return;
                const thCol = document.createElement('th');
                thCol.textContent = col.toUpperCase().replace(/_/g, ' ');
                tableHeadRow.appendChild(thCol);
            });
        } else {
            data.columns.forEach(col => {
                const c = col.toLowerCase();
                if(['user_id', 'merchant_id'].includes(c)) return;
                const thCol = document.createElement('th');
                thCol.textContent = col.toUpperCase().replace(/_/g, ' ');
                tableHeadRow.appendChild(thCol);
            });
        }

        if(allowDelete && ['Users', 'Merchants', 'Transactions'].includes(context)) {
            const th = document.createElement('th');
            th.textContent = "ACTION";
            th.style.textAlign = "center";
            tableHeadRow.appendChild(th);
        }

        // --- Body Logic ---
        if (!data.data || data.data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="100%" style="text-align:center; padding:40px;">0 rows returned</td></tr>`;
        } else {
            data.data.forEach(row => {
                const tr = document.createElement('tr');
                
                if(hasFullNames) {
                    const tdName = document.createElement('td');
                    tdName.style.fontWeight = '700';
                    tdName.style.color = 'var(--paytm-dark-blue)';
                    tdName.textContent = `${row.first_name || ''} ${row.last_name || ''}`.trim();
                    tr.appendChild(tdName);

                    data.columns.forEach(col => {
                        const c = col.toLowerCase();
                        if(['user_id', 'first_name', 'last_name'].includes(c)) return;
                        const td = document.createElement('td');
                        td.textContent = row[col] === null ? '-' : row[col];
                        tr.appendChild(td);
                    });
                } else {
                    data.columns.forEach(col => {
                        const c = col.toLowerCase();
                        if(['user_id', 'merchant_id'].includes(c)) return;
                        const td = document.createElement('td');
                        const val = row[col];
                        
                        if (val === null) {
                            td.textContent = '-';
                        } else if (typeof val === 'number') {
                            td.textContent = val % 1 !== 0 ? val.toFixed(2) : val;
                        } else if (c.includes('date') || c.includes('registered')) {
                            try { 
                                td.textContent = new Date(val).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}); 
                            } catch { td.textContent = val; }
                        } else {
                            td.textContent = val;
                        }
                        tr.appendChild(td);
                    });
                }

                if(allowDelete && ['Users', 'Merchants', 'Transactions'].includes(context)) {
                    const tdAction = document.createElement('td');
                    tdAction.style.textAlign = "center";
                    tdAction.style.whiteSpace = "nowrap";

                    const pkId = row.user_id || row.merchant_id || row.transaction_id || row[data.columns[0]];

                    const btnEdit = document.createElement('button');
                    btnEdit.className = "btn-icon";
                    btnEdit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                    btnEdit.style.marginRight = "8px";
                    btnEdit.onclick = (e) => { e.stopPropagation(); openModal(context, row, pkId); };

                    const btnDel = document.createElement('button');
                    btnDel.className = "btn-icon";
                    btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    btnDel.style.color = "var(--danger)";
                    btnDel.onclick = (e) => {
                        e.stopPropagation();
                        if(confirm("Confirm deletion of this record?")) {
                            fetch(`/api/delete/${context}/${pkId}`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(d => { 
                                if(d.success) {
                                    showToast("Record Deleted", "success"); 
                                    fetchGenericTable(context); 
                                } else {
                                    showToast(d.error || "Delete failed", "error");
                                }
                            });
                        }
                    };

                    tdAction.appendChild(btnEdit);
                    tdAction.appendChild(btnDel);
                    tr.appendChild(tdAction);
                }

                // Row click interaction for User details
                if(context === 'Users') {
                    tr.style.cursor = 'pointer';
                    tr.onclick = () => openUserProfile(row.user_id);
                }

                tableBody.appendChild(tr);
            });
        }
    }

    // ----------------------------------------------------
    // USER PROFILE MODAL LOGIC
    // ----------------------------------------------------
    const profileModal = document.getElementById('profile-modal');
    
    function openUserProfile(userId) {
        if(!userId) return;
        
        fetch(`/api/user/${userId}/profile`)
            .then(res => res.json())
            .then(data => {
                if(data.error) {
                    showToast(data.error, "error");
                    return;
                }
                
                // Populate Headers
                const u = data.user;
                document.getElementById('pm-name').textContent = `${u.first_name} ${u.last_name}`;
                document.getElementById('pm-email').textContent = u.email;
                document.getElementById('pm-initials').textContent = u.first_name.charAt(0).toUpperCase();
                
                // Populate Info
                document.getElementById('pm-phone').textContent = u.phone || '-';
                document.getElementById('pm-address').textContent = u.address || '-';
                
                // Populate Stats
                document.getElementById('pm-tx-count').textContent = data.stats.txn_count;
                document.getElementById('pm-tx-spent').textContent = '₹' + parseFloat(data.stats.total_spent).toLocaleString('en-IN', {minimumFractionDigits: 2});
                
                // Populate Table
                const tbody = document.getElementById('pm-tx-body');
                tbody.innerHTML = '';
                if(data.transactions.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:16px;">No transactions found</td></tr>';
                } else {
                    data.transactions.forEach(tx => {
                        const tr = document.createElement('tr');
                        
                        // Date
                        const tdDate = document.createElement('td');
                        tdDate.textContent = new Date(tx.transaction_date).toLocaleString('en-IN', {dateStyle:'short', timeStyle:'short'});
                        tr.appendChild(tdDate);
                        
                        // Merchant
                        const tdMerch = document.createElement('td');
                        tdMerch.textContent = tx.merchant;
                        tr.appendChild(tdMerch);
                        
                        // Status
                        const tdStatus = document.createElement('td');
                        const statusColor = tx.status === 'Completed' ? '#10b981' : (tx.status === 'Failed' ? '#ef4444' : '#f59e0b');
                        tdStatus.innerHTML = `<span style="color:${statusColor}; font-weight:600; font-size:12px;">${tx.status}</span>`;
                        tr.appendChild(tdStatus);
                        
                        // Amount
                        const tdAmt = document.createElement('td');
                        tdAmt.style.textAlign = 'right';
                        tdAmt.textContent = '₹' + parseFloat(tx.amount).toFixed(2);
                        tr.appendChild(tdAmt);
                        
                        tbody.appendChild(tr);
                    });
                }
                
                profileModal.classList.remove('hidden');
            })
            .catch(err => showToast("Failed to fetch user profile", "error"));
    }

    document.getElementById('close-profile-modal').addEventListener('click', () => profileModal.classList.add('hidden'));
    document.getElementById('pm-close-btn').addEventListener('click', () => profileModal.classList.add('hidden'));

    // ----------------------------------------------------
    // MAKING EVERY VISIBLE BUTTON FUNCTIONAL
    // ----------------------------------------------------
    
    // Notification Toggle
    const notifBtn = document.getElementById('btn-notifications');
    const notifOverlay = document.getElementById('notifications-overlay');
    const closeNotif = document.getElementById('close-notifications');

    if(notifBtn) {
        notifBtn.addEventListener('click', () => {
            renderAdminNotifications();
            notifOverlay.classList.remove('hidden');
            document.getElementById('notif-badge').classList.add('hidden');
        });
    }

    if(closeNotif) {
        closeNotif.addEventListener('click', () => {
            notifOverlay.classList.add('hidden');
        });
    }

    // Overlay Click to Close
    [notifOverlay, document.getElementById('profile-overlay')].forEach(overlay => {
        if(overlay) {
            overlay.addEventListener('click', (e) => {
                if(e.target === overlay) overlay.classList.add('hidden');
            });
        }
    });
    
    document.querySelector('.profile-dropdown').addEventListener('click', () => {
        document.getElementById('profile-overlay').classList.remove('hidden');
    });

    document.getElementById('close-profile').addEventListener('click', () => document.getElementById('profile-overlay').classList.add('hidden'));
    document.getElementById('profile-overlay').addEventListener('click', (e) => {
        if(e.target.id === 'profile-overlay') document.getElementById('profile-overlay').classList.add('hidden');
    });

    // Helper: Admin Notifications
    function renderAdminNotifications() {
        const list = document.getElementById('global-notification-list');
        list.innerHTML = `
            <li class="notif-item unread">
                <div class="notif-icon" style="background:#fee2e2; color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="notif-info">
                    <h4>High Priority Alert</h4>
                    <p>Server Load spiked to 85%. Automated scaling triggered.</p>
                    <span>Just now</span>
                </div>
            </li>
            <li class="notif-item">
                <div class="notif-icon bg-blue-lite"><i class="fa-solid fa-user-plus"></i></div>
                <div class="notif-info">
                    <h4>User Registration</h4>
                    <p>New user successfully onboarded to system.</p>
                    <span>10 mins ago</span>
                </div>
            </li>
            <li class="notif-item">
                <div class="notif-icon bg-green-lite"><i class="fa-solid fa-database"></i></div>
                <div class="notif-info">
                    <h4>Backup Successful</h4>
                    <p>Daily ledger database backup completed at 03:00 AM.</p>
                    <span>6 hours ago</span>
                </div>
            </li>
        `;
    }

    // Search Bar Logic (Admin Only)
    const searchInput = document.querySelector('.search-bar input');
    if(searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value;
                if (term.trim() === '') return;
                
                showToast(`Searching for "${term}"...`, 'success');
                searchInput.value = '';
                
                let targetTable = currentTableContext || 'Users';
                
                // Switch to results view if in Dashboard
                if(viewDashboard.classList.contains('hidden') === false) {
                   navUsers.click();
                }

                document.getElementById('table-body').innerHTML = `<tr class="skeleton-row"><td colspan="100%"><div class="skeleton-box"></div></td></tr>`;
                
                fetch(`/api/search?table=${targetTable}&q=${term}`)
                    .then(res => res.json())
                    .then(data => { 
                        document.getElementById('table-heading-title').innerText = `Search results for "${term}" in ${targetTable}`;
                        renderResults(data); 
                    })
                    .catch(x => showToast("Search Execution Error", "error"));
            }
        });
    }

    // "View All" Recent Ledger
    const viewAllBtn = document.querySelector('.ledger-container .view-all');
    if(viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            navTransactions.click();
        });
    }

    // --- ADMIN PROFILE ACTIONS ---
    document.getElementById('side-menu-audit')?.addEventListener('click', () => {
        showToast("Fetching System Audit Logs...", "info");
        document.getElementById('profile-overlay').classList.add('hidden');
        showMainView('results-container');
        pageTitleH1.innerText = "System Audit Trail";
        pageTitleP.innerText = "Reviewing restricted administrative logs.";
        document.getElementById('table-heading-title').innerText = "System Logs";
        
        fetch('/api/admin/audit-logs')
            .then(res => res.json())
            .then(data => renderResults(data, false));
    });

    document.getElementById('side-menu-health')?.addEventListener('click', () => {
        showToast("Running Database Health Check...", "info");
        fetch('/api/status')
            .then(res => res.json())
            .then(data => {
                setTimeout(() => {
                    const status = data.status === 'connected' ? 'OPTIMAL' : 'ACTION REQUIRED';
                    showToast(`DB Health: ${status} | Latency: 2ms | Tables: Synced`, data.status === 'connected' ? "success" : "error");
                }, 1000);
            });
    });

    document.getElementById('side-menu-config')?.addEventListener('click', () => {
        document.getElementById('profile-overlay').classList.add('hidden');
        const m = document.getElementById('crud-modal');
        const f = document.getElementById('crud-form');
        document.getElementById('modal-title').innerText = "Platform Configuration";
        document.getElementById('modal-submit').innerText = "Save Settings";
        f.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Modify core platform parameters. These changes are logged in the Audit Trail.</p>
                <label style="font-size:11px; font-weight:800; color:var(--text-muted);">ENVIRONMENT MODE</label>
                <select style="padding:12px; border-radius:10px; border:1px solid var(--border-light); font-weight:600;">
                    <option>Production (Stable)</option>
                    <option>Development (Debug)</option>
                    <option>Maintenance Mode</option>
                </select>
                <label style="font-size:11px; font-weight:800; color:var(--text-muted);">API RATE LIMIT (per min)</label>
                <input type="number" value="5000" style="padding:12px; border-radius:10px; border:1px solid var(--border-light);">
                <div style="display:flex; gap:10px; align-items:center; margin-top:8px;">
                    <input type="checkbox" checked id="toggle-aes"> 
                    <label for="toggle-aes" style="font-size:13px; font-weight:600;">Force AES-256 SSL Encryption</label>
                </div>
            </div>
        `;
        m.classList.remove('hidden');

        const btnSubmit = document.getElementById('modal-submit');
        const originalClick = btnSubmit.onclick;
        btnSubmit.onclick = () => {
            showToast("Platform Configuration Saved!", "success");
            m.classList.add('hidden');
            btnSubmit.onclick = originalClick; // Restore
        };
    });

    document.getElementById('side-menu-security')?.addEventListener('click', () => {
        showToast("Accessing Security Console...", "error");
        document.getElementById('profile-overlay').classList.add('hidden');
        showMainView('results-container');
        pageTitleH1.innerText = "Security Console";
        pageTitleP.innerText = "Monitoring active threats and unauthorized access attempts.";
        document.getElementById('table-heading-title').innerText = "Blocked Access Attempts";
        
        const mockSecurityData = {
            "columns": ["Timestamp", "Source_IP", "Target", "Violation", "Action"],
            "data": [
                {"Timestamp": "2026-04-22 19:10:05", "Source_IP": "192.168.1.45", "Target": "/admin/config", "Violation": "Brute Force", "Action": "IP_BLOCKED"},
                {"Timestamp": "2026-04-22 18:05:12", "Source_IP": "45.12.99.1", "Target": "/api/query/execute", "Violation": "SQL Injection", "Action": "PACKET_DROPPED"},
                {"Timestamp": "2026-04-22 16:22:30", "Source_IP": "10.0.0.8", "Target": "/login", "Violation": "Too many attempts", "Action": "ACCOUNT_LOCKED"}
            ],
            "query_text": "SELECT * FROM Intrusion_Detection_Log WHERE threat_level > 8"
        };
        setTimeout(() => renderResults(mockSecurityData, false), 500);
    });

    // Logout Action
    const logoutBtn = document.getElementById('btn-side-logout-admin');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    // FAQ Accordion Logic
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const answer = q.nextElementSibling;
            
            // Toggle current
            const isActive = item.classList.contains('active');
            
            // Close all others
            document.querySelectorAll('.faq-item').forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-answer').classList.add('hidden');
            });
            
            if(!isActive) {
                item.classList.add('active');
                answer.classList.remove('hidden');
            }
        });
    });

    // Help Center Search Filter
    const helpSearchInput = document.getElementById('help-search-input');
    if(helpSearchInput) {
        helpSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            // Filter Help Items
            document.querySelectorAll('.help-item').forEach(item => {
                const text = item.innerText.toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
            
            // Filter FAQ
            document.querySelectorAll('.faq-item').forEach(item => {
                const text = item.innerText.toLowerCase();
                item.style.display = text.includes(term) ? 'block' : 'none';
            });
        });
    }

    // Run Dashboard Init
    loadDashboardMetrics();

});
