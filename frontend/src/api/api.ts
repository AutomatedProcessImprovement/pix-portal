import {API_instance} from "../axios";
export const getProjects = async (userId: string) => {
  return await API_instance.get(
    `/projects/`, {
      params: {
        uuid: userId
      }
    }
  )
}

export const getProjectFileForDownload = async (fileId: number) => {
  return await API_instance.get(
    `/file/`, {
      params: {
        fileId: fileId
      }
    }
  )
}

export const getProjectFiles = async (project_id: number) => {
  // TODO verify if user is project owner
  return await API_instance.get(
    `/projects/${project_id}`
  )
}

export const createNewProject = async (userId: number, name: string) => {
  const formData = new FormData()
  formData.append('uuid', userId)
  formData.append('name', name)
  return await API_instance.post(
    `/projects/`,
    formData
  )
}

export const editExistingProjectTitle = async (userId: number, projectId: number ,name: string) => {
  const formData = new FormData()
  formData.append('uuid', userId)
  formData.append('pid', projectId)
  formData.append('name', name)
  return await API_instance.put(
    `/projects/`,
    formData
  )
}

export const editExistingFileTitle = async (fileId: number ,name: string) => {
  const formData = new FormData()
  formData.append('fid', fileId)
  formData.append('name', name)
  return await API_instance.put(
    `/files/`,
    formData
  )
}

export const removeProject = async (pid: number) => {
  return await API_instance.delete(
    `/projects/remove/${pid}`,
  )
}

export const removeProjectFile = async (fid: number) => {
  return await API_instance.delete(
    `/files/remove/${fid}`,
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
}