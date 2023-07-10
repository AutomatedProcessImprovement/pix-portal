import json
import os

import requests

from src.helpers.generators import generateOTP


def send_registration_request(username, firstname, lastname, email):
    """
    :return OK
        {
            "userId": "222302878121852931",
            "details": {
                "sequence": "366",
                "creationDate": "2023-07-10T14:20:42.406554Z",
                "resourceOwner": "221858039668408323"
            }
        }
    :return ERROR
    {
        "code": 6,
        "message": "User already exists (SQL-M0dsf)",
        "details": [
            {
                "@type": "type.googleapis.com/zitadel.v1.ErrorDetail",
                "id": "SQL-M0dsf",
                "message": "User already exists"
            }
        ]
    }
    """
    otp = generateOTP()
    # TODO REMOVE BEARER TOKEN AND MOVE TO ENV, REGENERATE TOKEN IN ZITADEL FOR PROD
    url = os.getenv("ZITADEL_REGISTER_API")
    payload = json.dumps({
        "userName": username,
        "profile": {
            "firstName": firstname,
            "lastName": lastname,
            "nickName": firstname,
            "displayName": firstname + " " + lastname,
            "preferredLanguage": "en"
        },
        "email": {
            "email": email,
            "isEmailVerified": True
        },
        "password": otp,
        "passwordChangeRequired": True
    })
    print(payload)
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + os.getenv("SERVICE_USER_BEARER")
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)
    # TODO What if request fails.

    return response, otp
