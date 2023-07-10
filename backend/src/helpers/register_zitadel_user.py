import json

import requests

from src.helpers.generators import generateOTP


def send_registration_request(username, firstname, lastname, email):
    otp = generateOTP()
    # TODO REMOVE BEARER TOKEN AND MOVE TO ENV, REGENERATE TOKEN IN ZITADEL FOR PROD
    url = "http://zitadel.cloud.ut.ee/management/v1/users/human/_import"
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
        'Authorization': 'Bearer RBfFXOSR4mkSf9EDmw8fvE_qLeJX0DFIGn3gm4HP7ivMZa2YEyzMOToOrvpDSxANvY8Jtiw'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)
    # TODO What if request fails.

    return response, otp
