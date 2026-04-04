#!/bin/bash

# Тест GET запроса к timeline API

PAGE_ID="2b3f197e-6cee-41df-b9dd-be95c8bede9c"

echo "=== Тест Timeline GET API ==="
echo ""

echo "1. Тест backend напрямую (должен работать без авторизации):"
echo "GET http://localhost:3001/api/memorial-pages/$PAGE_ID/timeline"
curl -v "http://localhost:3001/api/memorial-pages/$PAGE_ID/timeline" 2>&1 | grep -E "(HTTP|success|error)"
echo ""
echo ""

echo "2. Тест через frontend API route:"
echo "GET http://localhost:3000/api/memorial-pages/$PAGE_ID/timeline"
curl -v "http://localhost:3000/api/memorial-pages/$PAGE_ID/timeline" 2>&1 | grep -E "(HTTP|success|error)"
echo ""
echo ""

echo "=== Конец теста ==="
