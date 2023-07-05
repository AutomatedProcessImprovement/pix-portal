import {REGISTER_API_INSTANCE} from "../axios";


export const handleRegister = async (uName: string, fName:string, lName: string, email:string) => {

  const formData = new FormData()
  formData.append('username', uName)
  formData.append('firstname', fName)
  formData.append('lastname', lName)
  formData.append('email', email)

  return await REGISTER_API_INSTANCE.post(
    `/api/users/`,
    formData
  )
}