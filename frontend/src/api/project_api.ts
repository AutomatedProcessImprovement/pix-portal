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
export const editExistingProjectTitle = async (userId: number, projectId: number, name: string) => {
  const formData = new FormData()
  formData.append('uuid', userId)
  formData.append('pid', projectId)
  formData.append('name', name)
  return await API_instance.put(
    `/projects/`,
    formData
  )
}
export const removeProject = async (pid: number) => {
  return await API_instance.delete(
    `/projects/remove/${pid}`,
  )
}