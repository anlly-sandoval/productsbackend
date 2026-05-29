import { application } from "express";

const API_URL = 'http://localhost:4001';

async function testLogin(payLoad, testName) {
    console.log('\n ${testName}');
    console.log('PayLoad: ', JSON.stringify(payLoad));

    const response = await fetch('${API_URL}/api/login', {
        method: 'POST',
        headers: {'Content-Type' : application/json},
        body: JSON.stringify(payLoad)
    });

    const data = await response.json();
    console.log(data);
    const result = response.ok ? 'Exito (Vulnerable)' : 'Fallo (Seguro)';
    console.log('${result} - Status: ${response.status}');
    return response.ok;
}

async function main() {
    //Test 1: login normal
    await testLogin(
        {email: 'test@gmail.com', password: 'test'},
        '1. Login normal'
    )

    //Test 2: Intento de password con $ne (debe fallar)
    await testLogin(
        {email: 'test@gmail.com', password: { '$ne': null }},
        '2. Ataque $ne en passowrd'
    )

    //Test 3: Intento de email con $ne (debe fallar)
    await testLogin(
        {email: {'$ne': null }, password: { '$ne': null }},
        '3. Ataque $ne en email'
    )
};

main().catch(console.error);