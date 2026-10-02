#!/usr/bin/env bash
# Smoke test for the REAL backend, including the User A / User B isolation checks.
# Usage: start the backend, then run:   bash docs/api-test.sh   (needs curl)
BASE="${BASE:-http://localhost:8080/api}"
STAMP=$(date +%s)
A="usera_$STAMP@example.com"; B="userb_$STAMP@example.com"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "PASS  $1"; pass=$((pass+1)); else echo "FAIL  $1 (expected $2, got $3)"; fail=$((fail+1)); fi; }
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
json() { curl -s "$@"; }
field() { sed -E "s/.*\"$1\":\"?([^\",}]*)\"?.*/\1/"; }

echo "== register / login =="
check "register A -> 201" 201 "$(code -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"User A\",\"email\":\"$A\",\"password\":\"password123\"}")"
check "register A again -> 409" 409 "$(code -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"User A\",\"email\":\"$A\",\"password\":\"password123\"}")"
check "register bad email -> 400" 400 "$(code -X POST $BASE/auth/register -H 'Content-Type: application/json' -d '{"name":"X","email":"nope","password":"password123"}')"
check "register short password -> 400" 400 "$(code -X POST $BASE/auth/register -H 'Content-Type: application/json' -d '{"name":"X","email":"x@example.com","password":"123"}')"
check "register B -> 201" 201 "$(code -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"User B\",\"email\":\"$B\",\"password\":\"password456\"}")"
check "login wrong password -> 401" 401 "$(code -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$A\",\"password\":\"wrong\"}")"
TA=$(json -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$A\",\"password\":\"password123\"}" | field token)
TB=$(json -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$B\",\"password\":\"password456\"}" | field token)
check "JWT issued for A (3 parts)" 3 "$(echo "$TA" | tr '.' '\n' | wc -l | tr -d ' ')"

echo "== protected endpoints reject anonymous / bad tokens =="
check "GET /expenses without token -> 401" 401 "$(code $BASE/expenses)"
check "GET /expenses with garbage token -> 401" 401 "$(code $BASE/expenses -H 'Authorization: Bearer abc.def.ghi')"
check "POST /expenses without token -> 401" 401 "$(code -X POST $BASE/expenses -H 'Content-Type: application/json' -d '{}')"

echo "== CRUD as A =="
check "A creates expense -> 201" 201 "$(code -X POST $BASE/expenses -H "Authorization: Bearer $TA" -H 'Content-Type: application/json' -d '{"amount":250,"date":"2026-10-01","category":"Food","note":"Lunch"}')"
ID=$(json $BASE/expenses -H "Authorization: Bearer $TA" | field id)
check "A lists 1 expense" 1 "$(json $BASE/expenses -H "Authorization: Bearer $TA" | grep -o '"id"' | wc -l | tr -d ' ')"
check "amount 0 -> 400" 400 "$(code -X POST $BASE/expenses -H "Authorization: Bearer $TA" -H 'Content-Type: application/json' -d '{"amount":0,"date":"2026-10-01","category":"Food"}')"
check "bad date -> 400" 400 "$(code -X POST $BASE/expenses -H "Authorization: Bearer $TA" -H 'Content-Type: application/json' -d '{"amount":5,"date":"2026-13-45","category":"Food"}')"
check "empty category -> 400" 400 "$(code -X POST $BASE/expenses -H "Authorization: Bearer $TA" -H 'Content-Type: application/json' -d '{"amount":5,"date":"2026-10-01","category":""}')"
check "A updates own expense -> 200" 200 "$(code -X PUT $BASE/expenses/$ID -H "Authorization: Bearer $TA" -H 'Content-Type: application/json' -d '{"amount":300,"date":"2026-10-01","category":"Transport","note":"Cab"}')"

echo "== isolation: B must not see or touch A's expense (id=$ID) =="
check "B lists -> empty" 0 "$(json $BASE/expenses -H "Authorization: Bearer $TB" | grep -o '"id"' | wc -l | tr -d ' ')"
check "B PUT A's expense -> 404" 404 "$(code -X PUT $BASE/expenses/$ID -H "Authorization: Bearer $TB" -H 'Content-Type: application/json' -d '{"amount":1,"date":"2026-10-01","category":"Food","note":"hacked"}')"
check "B DELETE A's expense -> 404" 404 "$(code -X DELETE $BASE/expenses/$ID -H "Authorization: Bearer $TB")"
check "A's expense still there, unchanged" 1 "$(json $BASE/expenses -H "Authorization: Bearer $TA" | grep -c '"note":"Cab"')"
check "client-supplied userId is ignored (B creates own)" 201 "$(code -X POST $BASE/expenses -H "Authorization: Bearer $TB" -H 'Content-Type: application/json' -d '{"amount":9,"date":"2026-10-01","category":"Food","note":"mine","userId":1}')"
check "A still has exactly 1 expense" 1 "$(json $BASE/expenses -H "Authorization: Bearer $TA" | grep -o '"id"' | wc -l | tr -d ' ')"

echo "== delete =="
check "A deletes own -> 200" 200 "$(code -X DELETE $BASE/expenses/$ID -H "Authorization: Bearer $TA")"
check "A deletes again -> 404" 404 "$(code -X DELETE $BASE/expenses/$ID -H "Authorization: Bearer $TA")"

echo; echo "$pass passed, $fail failed"; [ $fail -eq 0 ]
