$ curl -c cookies.txt -X POST http://localhost:5000/customer/login -H 'Content-Type: application/json' -d '{"username":"rutuja","password":"pass123"}'
{"message":"Customer successfully logged in","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoicnV0dWphIiwiaWF0IjoxNzkzMTE4MTgzLCJleHAiOjE3OTMxMjE3ODN9.6YrM-eRIiYDVBYkTBuE_wJgfh6Ce5tgE1Ol3SIkIrsE"}
