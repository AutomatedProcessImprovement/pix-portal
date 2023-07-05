import json

import requests

from app.helpers.generators import generateOTP


def send_registration_request(username, firstname, lastname, email):
    otp = generateOTP()
    # TODO REMOVE BEARER TOKEN AND MOVE TO ENV, REGENERATE TOKEN IN ZITADEL FOR PROD
    url = "http://localhost:8080/v2alpha/users/human"
    payload = json.dumps({
        "username": username,
        "profile": {
            "firstName": firstname,
            "lastName": lastname,
            "nickName": firstname,
            "displayName": firstname + " " + lastname,
            "preferredLanguage": "en"
        },
        "email": {
            "email": email,
            "isVerified": True
        },
        "password": {
            "password": otp,
            "changeRequired": True
        }
    })
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer dGdrLUC2RyTxLiz3ICKJgZqa7RVrpS50MfPGZzOWQE1O-MzODSa-q9P0hO9630UGCk1aokc'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    print(response)
    # TODO What if request fails.

    return response, otp
