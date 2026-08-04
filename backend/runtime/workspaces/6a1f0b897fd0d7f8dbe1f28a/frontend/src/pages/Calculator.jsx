import React, { useState } from 'react';

const Calculator = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [result, setResult] = useState(0);
  const [operation, setOperation] = useState('');

  const handleNum1Change = (e) => {
    setNum1(parseInt(e.target.value));
  };

  const handleNum2Change = (e) => {
    setNum2(parseInt(e.target.value));
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
  };

  const calculateResult = () => {
    switch (operation) {
      case 'add':
        setResult(num1 + num2);
        break;
      case 'subtract':
        setResult(num1 - num2);
        break;
      case 'multiply':
        setResult(num1 * num2);
        break;
      case 'divide':
        if (num2 !== 0) {
          setResult(num1 / num2);
        } else {
          setResult('Error: Division by zero');
        }
        break;
      default:
        setResult(0);
    }
  };

  return (
    <div>
      <h1>Calculator</h1>
      <input type="number" value={num1} onChange={handleNum1Change} />
      <select value={operation} onChange={handleOperationChange}>
        <option value="">Select operation</option>
        <option value="add">Add</option>
        <option value="subtract">Subtract</option>
        <option value="multiply">Multiply</option>
        <option value="divide">Divide</option>
      </select>
      <input type="number" value={num2} onChange={handleNum2Change} />
      <button onClick={calculateResult}>Calculate</button>
      <p>Result: {result}</p>
    </div>
  );
};

export default Calculator;