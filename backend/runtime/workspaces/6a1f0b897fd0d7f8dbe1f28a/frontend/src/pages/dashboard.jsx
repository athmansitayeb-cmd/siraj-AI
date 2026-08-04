import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard')
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
      <h1>Dashboard</h1>
      <p>Users: {users.length}</p>
      <p>Customers: {customers.length}</p>
      <p>Leads: {leads.length}</p>
      <p>Accounts: {accounts.length}</p>
    </div>
  );
}

export default Dashboard;