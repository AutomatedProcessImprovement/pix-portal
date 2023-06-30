import {API_instance} from "../axios";

export const getProjectFileForDownload = async (fileId: number) => {
  return await API_instance.get(
    `/file/`, {
      params: {
        fileId: fileId
      }
    }
  )
}
export const editExistingFileTitle = async (fileId: number, name: string) => {
  const formData = new FormData()
  formData.append('fid', fileId)
  formData.append('name', name)
  return await API_instance.put(
    `/files/`,
    formData
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
  formData.append('file', file)

  console.log(projectId)
  // console.log(formData)
  return await API_instance.post(
    `/upload/`,
    formData
  )
}