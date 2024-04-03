# Sample Request Payloads

## Users

### Internal

#### System Admin

    {
        "username": "sysadmin",
        "email": "sysadmin@easybank.com",
        "password": "verySecureAdminPass123!",
        "first_name": "Alice",
        "middle_name": "Helen",
        "last_name": "Green",
        "date_of_birth": "1984-05-21",
        "gender": "Female",
        "ssn": "293486301",
        "address": "492 N. College Ave, Bloomington, IN 47406",
        "phone_number": "+18124379634",
        "role": "SYSTEM_ADMIN"
    }

#### System Manager

    {
        "username": "sysmanager",
        "email": "sysmanager@easybank.com",
        "password": "verySecureMgrPass123!",
        "first_name": "Blake",
        "middle_name": "Earl",
        "last_name": "Johnson",
        "date_of_birth": "1987-01-29",
        "gender": "Male",
        "ssn": "734298386",
        "address": "834 E. Hill Dr, Bloomington, IN 47403",
        "phone_number": "+18129673241",
        "role": "SYSTEM_MANAGER"
    }

#### Employee

    {
        "username": "employee",
        "email": "employee@easybank.com",
        "password": "verySecureEmpPass123!",
        "first_name": "Bob",
        "middle_name": "Bailey",
        "last_name": "Harold",
        "date_of_birth": "1991-07-13",
        "gender": "Male",
        "ssn": "49634809",
        "address": "101 John Lane, Bloomington, IN 47408",
        "phone_number": "+18129983746",
        "role": "EMPLOYEE"
    }

---

### External

#### Customer

    {
        "username": "customer1",
        "email": "customer1@gmail.com",
        "password": "verySecureCustPass123!",
        "first_name": "Jennifer",
        "middle_name": "",
        "last_name": "Hayes",
        "date_of_birth": "1995-04-01",
        "gender": "Female",
        "ssn": "798326013",
        "address": "037 Harold Dr, Bloomington, IN 47402",
        "phone_number": "+18123645342",
        "role": "CUSTOMER"
    }

#### Merchant

    {
        "username": "merchant1",
        "email": "merchant1@business.org",
        "password": "verySecureMerchPass123!",
        "business_name": "Bloom Merch",
        "business_phone": "+18123456789",
        "business_doi": "2009-01-02",
        "ein": "538967342",
        "address": "1293 S. Walnut St, Bloomington, IN 47403",
        "owner_name": "Danielle Andre Lynch",
        "owner_dob": "1992-11-14",
        "owner_gender": "Female",
        "owner_ssn": "104329837",
        "owner_phone": "+18124967382",
        "role": "MERCHANT"
    }

---

## OTP

### Verify / validate

    {
        "token": <GENERATED_OTP> // e.g. 12345678
    }

---

## Transaction

### New transaction

    {
        "from": <SENDER_AC_NUMBER>,
        "to": <BENEFICIARY_AC_NUMBER>,
        "amount": <TXN_AMOUNT> // e.g. 1000.0
    }

---

## Review

### Request Review

    {
        "reviewObject": "", // Transaction ID or Profile ID or Account ID
        "type": <REVIEW_TYPE> // "TRANSACTION" or "PROFILE" or "ACCOUNT"
    }
