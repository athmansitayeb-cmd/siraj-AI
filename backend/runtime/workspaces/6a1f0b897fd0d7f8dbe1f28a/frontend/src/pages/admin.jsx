import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/admin')
      .then(response => response.json())
      .then(data => {
        setUsers(data.users);
        setCustomers(data.customers);
        setLeads(data.leads);
        setAccounts(data.accounts);
      });
  }, []);

  return (
    <div>
      <h1>Admin Panel</h1>
      <nav>
        <ul>
          <li><Link to="/admin/users">Users</Link></li>
          <li><Link to="/admin/customers">Customers</Link></li>
          <li><Link to="/admin/leads">Leads</Link></li>
          <li><Link to="/admin/accounts">Accounts</Link></li>
        </ul>
      </nav>
      <Route path="/admin/users">
        <Users users={users} />
      </Route>
      <Route path="/admin/customers">
        <Customers customers={customers} />
      </Route>
      <Route path="/admin/leads">
        <Leads leads={leads} />
      </Route>
      <Route path="/admin/accounts">
        <Accounts accounts={accounts} />
      </Route>
    </div>
  );
}

function Users({ users }) {
  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

function Customers({ customers }) {
  return (
    <div>
      <h2>Customers</h2>
      <ul>
        {customers.map(customer => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </div>
  );
}

function Leads({ leads }) {
  return (
    <div>
      <h2>Leads</h2>
      <ul>
        {leads.map(lead => (
          <li key={lead.id}>{lead.name}</li>
        ))}
      </ul>
    </div>
  );
}

function Accounts({ accounts }) {
  return (
    <div>
      <h2>Accounts</h2>
      <ul>
        {accounts.map(account => (
          <li key={account.id}>{account.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;