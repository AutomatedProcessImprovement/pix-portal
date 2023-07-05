import math
import random
import secrets
import string


# function to generate OTP
def generateOTP():
    # Declare a string variable
    # which stores all string
    string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    OTP = ""
    length = len(string)
    for i in range(6):
        OTP += string[math.floor(random.random() * length)]

    return OTP


def generateAlphaNumericUUID():
    # Returns a 16 character alphanumeric string, used as random ID generator.
    alphabet = string.ascii_letters + string.digits
    new_id = ''.join(secrets.choice(alphabet) for i in range(16))

    return new_id
