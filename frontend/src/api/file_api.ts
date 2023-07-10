import {API_instance} from "../axios";

export const getProjectFileForDownload = async (fileId: number) => {
  return await API_instance.get(
    `/api/files/`, {
      params: {
        fileId: fileId
      }
    }
  )
}
export const editExistingFileTitle = async (fileId: string, name: string) => {
  const formData = new FormData()
  formData.append('file_id', fileId)
  formData.append('name', name)
  return await API_instance.put(
    `/api/files/`,
    formData
  )
}
export const removeProjectFile = async (fid: number) => {
  return await API_instance.delete(
    `/api/files/${fid}`,
  )
}
export const uploadFile = async (file: File, tag: string, projectId: string) => {
  const formData = new FormData()
  formData.append('tag', tag)
  formData.append('project_id', projectId)
  formData.append('file', file)
  return await API_instance.post(
    `/api/files/`,
    formData
  )
}