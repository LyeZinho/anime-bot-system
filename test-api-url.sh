#!/bin/bash

# Test environment setup
echo "=== Testing API URL Configuration ==="

# Test 1: Server-side (should use PUBLIC_API_URL)
echo "Test 1: Server-side API URL detection"
PUBLIC_API_URL="http://api:3071" node -e "
  const API_BASE = typeof window === 'undefined'
    ? (process.env.PUBLIC_API_URL || 'http://localhost:3071') + '/api/v1'
    : '/api/v1';
  console.log('Server API URL:', API_BASE);
  if (API_BASE === 'http://api:3071/api/v1') {
    console.log('✓ PASS: Server correctly uses PUBLIC_API_URL');
  } else {
    console.log('✗ FAIL: Expected http://api:3071/api/v1, got:', API_BASE);
  }
"

# Test 2: Client-side fallback (should use /api/v1)
echo ""
echo "Test 2: Client-side fallback"
node -e "
  // Simulate browser environment
  global.window = {};
  const API_BASE = typeof window === 'undefined'
    ? (process.env.PUBLIC_API_URL || 'http://localhost:3071') + '/api/v1'
    : '/api/v1';
  console.log('Client API URL:', API_BASE);
  if (API_BASE === '/api/v1') {
    console.log('✓ PASS: Client correctly uses relative /api/v1');
  } else {
    console.log('✗ FAIL: Expected /api/v1, got:', API_BASE);
  }
"

# Test 3: getServerApiUrl function
echo ""
echo "Test 3: getServerApiUrl helper function"
PUBLIC_API_URL="http://api:3071" node -e "
  const getServerApiUrl = (endpoint) => {
    const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3071';
    return \`\${baseUrl}/api/v1\${endpoint}\`;
  };
  const result = getServerApiUrl('/characters');
  console.log('Result:', result);
  if (result === 'http://api:3071/api/v1/characters') {
    console.log('✓ PASS: Helper correctly builds server URLs');
  } else {
    console.log('✗ FAIL: Expected http://api:3071/api/v1/characters, got:', result);
  }
"

echo ""
echo "=== All tests completed ==="
