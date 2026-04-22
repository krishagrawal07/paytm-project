document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const statusBadge = document.getElementById('db-status-badge');
    const errorBanner = document.getElementById('error-banner');
    const errorMessage = document.getElementById('error-message');
    const queryCards = document.querySelectorAll('.query-card');
    const resultsContainer = document.getElementById('results-container');
    const querySqlDisplay = document.getElementById('query-sql-display');
    const tableHeadRow = document.getElementById('table-head-row');
    const tableBody = document.getElementById('table-body');

    // 1. Check DB Status on load
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'connected') {
                statusBadge.className = 'badge status-connected';
                statusBadge.innerHTML = `<i class="fa-solid fa-check"></i> DB Connected`;
            } else if (data.status === 'setup_required') {
                showError("Setup Required: " + data.message);
                statusBadge.className = 'badge status-error';
                statusBadge.innerHTML = `<i class="fa-solid fa-xmark"></i> Missing Tables`;
            } else {
                showError(data.message);
                statusBadge.className = 'badge status-error';
                statusBadge.innerHTML = `<i class="fa-solid fa-xmark"></i> DB Disconnected`;
            }
        })
        .catch(err => {
            showError("Network Error. Is the Flask server running?");
            statusBadge.className = 'badge status-error';
            statusBadge.innerHTML = `<i class="fa-solid fa-xmark"></i> Offline`;
        });

    function showError(msg) {
        errorMessage.innerText = msg;
        errorBanner.classList.remove('hidden');
    }

    // 2. Add Event Listeners to Query Cards
    queryCards.forEach(card => {
        card.addEventListener('click', () => {
            const queryId = card.getAttribute('data-query');
            
            // UI Update
            queryCards.forEach(c => c.classList.remove('active-query'));
            card.classList.add('active-query');

            // Fetch Data
            fetch(`/api/query/${queryId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert("Error executing query: " + data.error);
                        return;
                    }

                    renderResults(data);
                })
                .catch(err => console.error(err));
        });
    });
    // 3. Add Event Listeners to Sidebar Nav
    const navAnalytics = document.getElementById('nav-analytics');
    const navUsers = document.getElementById('nav-users');
    const navMerchants = document.getElementById('nav-merchants');
    const navTransactions = document.getElementById('nav-transactions');
    const navSecurity = document.getElementById('nav-security');
    const navPayments = document.getElementById('nav-payments');
    const queriesGrid = document.querySelector('.queries-grid');
    const pageTitleH1 = document.querySelector('.page-title h1');
    const pageTitleP = document.querySelector('.page-title p');

    function setActiveNav(navElement) {
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        navElement.classList.add('active');
    }

    navAnalytics.addEventListener('click', () => {
        setActiveNav(navAnalytics);
        queriesGrid.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        pageTitleH1.innerText = "Decision Support Analytics";
        pageTitleP.innerText = "Execute Case Study Requirements dynamically.";
    });

    function fetchTable(tableName, navElement, customTitle=null) {
        setActiveNav(navElement);
        queriesGrid.classList.add('hidden'); // Hide the grid buttons
        pageTitleH1.innerText = customTitle ? customTitle : (tableName + " Management");
        pageTitleP.innerText = customTitle ? "Viewing confidential data with Superuser access." : ("Viewing raw data for " + tableName + " table.");

        fetch(`/api/table/${tableName}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("Error fetching table: " + data.error);
                    return;
                }
                renderResults(data);
            })
            .catch(err => console.error(err));
    }

    navUsers.addEventListener('click', () => fetchTable('Users', navUsers));
    navMerchants.addEventListener('click', () => fetchTable('Merchants', navMerchants));
    navTransactions.addEventListener('click', () => fetchTable('Transactions', navTransactions));
    navPayments.addEventListener('click', () => fetchTable('Payments', navPayments));
    navSecurity.addEventListener('click', () => fetchTable('Accounts', navSecurity, 'Security: User Account Balances'));

    function renderResults(data) {
        resultsContainer.classList.remove('hidden');
        querySqlDisplay.textContent = data.query_text.trim();

        // Clear Table
        tableHeadRow.innerHTML = '';
        tableBody.innerHTML = '';

        if (!data.columns || data.columns.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="100%" style="text-align:center;">No results found.</td></tr>';
            return;
        }

        // Render Headers
        data.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            tableHeadRow.appendChild(th);
        });

        // Render Rows
        if (data.data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = data.columns.length;
            td.style.textAlign = 'center';
            td.textContent = '0 rows returned';
            tr.appendChild(td);
            tableBody.appendChild(tr);
        } else {
            data.data.forEach(row => {
                const tr = document.createElement('tr');
                data.columns.forEach(col => {
                    const td = document.createElement('td');
                    // Format decimals
                    if(typeof row[col] === 'number') {
                        td.textContent = row[col] % 1 !== 0 ? row[col].toFixed(2) : row[col];
                    } else {
                        td.textContent = row[col];
                    }
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        }
    }
});
