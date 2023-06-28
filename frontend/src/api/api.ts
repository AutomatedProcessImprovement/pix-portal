import {API_instance, ZITADEL_instance} from "../axios";
import axios from "axios";
export const getProjects = async (userId: string) => {
  return await API_instance.get(
    `/projects/`, {
      params: {
        uuid: userId
      }
    }
  )
}

export const getProjectFiles = async (project_id: number) => {
  // TODO verify if user is project owner
  console.log(project_id)
  return await API_instance.get(
    `/projects/${project_id}`
  )
}

export const createNewProject = async (userId: number, name: string) => {
  const formData = new FormData()
  formData.append('uuid', userId)
  formData.append('name', name)
  return await API_instance.post(
    `/create/`,
    formData
  )
}

export const removeProjectFile = async (fid: number) => {
  return await API_instance.delete(
    `/remove/${fid}`,
  )
}

export const uploadFile = async (file: File, tags: string[], projectId: number) => {
  const formData = new FormData()
  formData.append('name', file.name)
  formData.append('tags', tags)
  formData.append('projectId', projectId)
  formData.append('file',file)
  // console.log(formData)
  return await API_instance.post(
    `/upload/`,
    formData
  )
}


export const handleRegister = async (uName: string, fName:string, lName: string, email:string) => {

  const formData = new FormData()
  formData.append('username', uName)
  formData.append('firstname', fName)
  formData.append('lastname', lName)
  formData.append('email',email)

  return await API_instance.post(
    `/register/`,
    formData
  )


  // let data = JSON.stringify({
  //   "username": "minnie-mouse2",
  //   "profile": {
  //     "firstName": "Minnie",
  //     "lastName": "Mouse",
  //     "nickName": "Mini2",
  //     "displayName": "Minnie Mouse",
  //     "preferredLanguage": "en",
  //     "gender": "GENDER_FEMALE"
  //   },
  //   "email": {
  //     "email": "mini@mouse.com",
  //     "isVerified": true
  //   },
  //   "password": {
  //     "password": "Secr3tP4ssw0rd!",
  //     "changeRequired": true
  //   }
  // });
  //
  // let config = {
  //   method: 'post',
  //   url: 'http://localhost:8080/v2alpha/users/human',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json',
  //     'Authorization': 'Bearer dGdrLUC2RyTxLiz3ICKJgZqa7RVrpS50MfPGZzOWQE1O-MzODSa-q9P0hO9630UGCk1aokc'
  //   },
  //   data : data
  // };
  //
  // axios(config)
  //   .then((response) => {
  //     console.log(JSON.stringify(response.data));
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
  //
  // console.log(data)
  // return await ZITADEL_instance.post(
  //   `/v2alpha/users/human`,
  //   data
  // )



  // return axios({
  //   method: 'POST',
  //   url: 'http://localhost:8080/v2alpha/users/human',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json',
  //     'Authorization': 'Bearer dGdrLUC2RyTxLiz3ICKJgZqa7RVrpS50MfPGZzOWQE1O-MzODSa-q9P0hO9630UGCk1aokc',
  //   },
  //   data: data
  // })

  // ZITADEL_instance.request(config)
  //   .then((response) => {
  //     console.log(JSON.stringify(response.data));
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
}